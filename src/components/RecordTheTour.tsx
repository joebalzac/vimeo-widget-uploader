import "../utils/interVariableFont";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import "./RecordTheTour.css";
import chevronDown from "../assets/bento/chevron-down.svg";
import dotsFilled from "../assets/bento/dots-filled.svg";
import iconCalendar from "../assets/bento/icon-calendar.svg";
import iconUser from "../assets/bento/icon-user.svg";
import iconBulb from "../assets/bento/icon-bulb.svg";
import iconFileText from "../assets/bento/icon-file-text.svg";
import glowEllipse from "../assets/bento/glow-ellipse.svg";
import iconStop from "../assets/bento/icon-stop.svg";

/** Bar heights (px) sampled from the design's waveform, left to right. */
const WAVEFORM: number[] = [
  10.09, 21.18, 16.44, 30.61, 21.67, 56.75, 44.02, 58.27, 70.96, 41.84, 50.57,
  35.82, 21.67, 63.4, 26.96, 34.24, 44.02, 21.18, 11.63, 8.23, 8.23, 4.24,
  5.95, 8.23, 18.92, 34.24, 44.02, 22.14, 26.96, 10.09, 12.98, 44.02, 30.61,
  21.67, 21.67, 21.67, 26.96, 30.61, 34.24, 21.67, 44.02, 56.75, 21.18, 44.02,
  11.63, 58.27, 8.23, 70.96, 8.23, 41.84, 50.57, 35.82, 21.67, 63.4, 26.96,
  34.24, 44.02, 21.18,
];

const CHIPS = [
  { icon: iconCalendar, label: "12:00 PM" },
  { icon: iconUser, label: "Steven" },
  { icon: iconBulb, label: "Tips" },
  { icon: iconFileText, label: "Transcript", muted: true },
];

/** Live-transcript notes, typed out one at a time. */
const TRANSCRIPT_LINES = [
  "Loved the kitchen, worried about storage",
  "Prefers a higher floor",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const FINAL = { a: TRANSCRIPT_LINES[0], b: TRANSCRIPT_LINES[1], at: 2 };

/**
 * Types the notes in (34ms per character, after 500ms) each time the card becomes
 * 35% visible; replays on re-entry. Reduced motion shows the final text.
 */
function useTypedTranscript(play: boolean, reduce: boolean) {
  const [t, setT] = useState(FINAL);
  useEffect(() => {
    if (!play || reduce) return;
    let alive = true;
    (async () => {
      const [a, b] = TRANSCRIPT_LINES;
      setT({ a: "", b: "", at: 0 });
      await sleep(500);
      for (let i = 0; i <= a.length; i++) {
        if (!alive) return;
        setT({ a: a.slice(0, i), b: "", at: 1 });
        await sleep(34);
      }
      for (let i = 0; i <= b.length; i++) {
        if (!alive) return;
        setT({ a, b: b.slice(0, i), at: 2 });
        await sleep(34);
      }
    })();
    return () => {
      alive = false;
    };
  }, [play, reduce]);
  return play && !reduce ? t : FINAL;
}

/** <=480px: width of the element (0 on wider screens), used to scale the phone down. */
function useMobileWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 480px)");
    const f = () => setW(mq.matches ? el.clientWidth : 0);
    const ro = new ResizeObserver(f);
    ro.observe(el);
    f();
    mq.addEventListener?.("change", f);
    return () => {
      ro.disconnect();
      mq.removeEventListener?.("change", f);
    };
  }, [ref]);
  return w;
}

/**
 * RecordTheTour — recording-in-progress phone mock for the "Record The
 * Tour" bento card. Figma: node 408:10460 (.com_2027).
 *
 * Plays when 35% visible and replays on every re-entry: the notes type in, the
 * waveform loops and the stop button pulses (both paused while off-screen).
 */
export default function RecordTheTour() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { amount: 0.35 });
  const reduce = !!useReducedMotion();
  const t = useTypedTranscript(play, reduce);
  const lines = [t.a, t.b];
  const playState = play && !reduce ? "running" : "paused";
  const mw = useMobileWidth(ref);
  /* phone is 300px + side buttons = 306px; keep 24px side margins on phones */
  const scale = mw ? Math.min(1, (mw - 48) / 306) : 1;

  return (
    <div className="rtt__wrap" ref={ref}>
      <div className="rtt" style={{ transform: `translateX(-50%) scale(${scale})` }}>
        <div className="rtt__row">
          <div className="rtt__strip rtt__strip--left">
            <div className="rtt__gradient-bar" style={{ height: 20 }} />
            <div className="rtt__gradient-bar" style={{ height: 36 }} />
            <div className="rtt__gradient-bar" style={{ height: 36 }} />
          </div>

          <div className="rtt__phone-frame">
            <div className="rtt__phone">
              <div className="rtt__notch-row">
                <div className="rtt__notch" />
              </div>

              <div className="rtt__top-icons">
                <img className="rtt__icon-btn" src={chevronDown} alt="Minimize" />
                <img className="rtt__icon-btn" src={dotsFilled} alt="More" />
              </div>

              <div className="rtt__header">
                <p className="rtt__title">Tour with Lia T.</p>
                <div className="rtt__chips">
                  {CHIPS.map((chip) => (
                    <span
                      className={"rtt__chip" + (chip.muted ? " rtt__chip--muted" : "")}
                      key={chip.label}
                    >
                      <img src={chip.icon} alt="" />
                      {chip.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rtt__transcript">
                {lines.map((line, i) => (
                  <p key={i}>
                    {line}
                    {t.at === i + 1 && (
                      <>
                        {i === 1 && " "}
                        <span className="rtt__cursor-blink">|</span>
                      </>
                    )}
                  </p>
                ))}
              </div>

              <div className="rtt__wave-area">
                <div className="rtt__wave-mask">
                  <div className="rtt__wave">
                    {WAVEFORM.map((h, i) => (
                      <span
                        className="rtt__wave-bar"
                        key={i}
                        style={
                          {
                            height: `${h}px`,
                            animationDuration: `${(0.7 + ((i * 37) % 10) / 14).toFixed(2)}s`,
                            animationDelay: `-${((i * 53) % 17) / 10}s`,
                            animationPlayState: playState,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </div>
                <img className="rtt__glow" src={glowEllipse} alt="" />
                <div className="rtt__stop">
                  <span className="rtt__stop-pulse" style={{ animationPlayState: playState }} />
                  <img src={iconStop} alt="Stop recording" />
                </div>
              </div>
            </div>
          </div>

          <div className="rtt__strip rtt__strip--right">
            <div className="rtt__gradient-bar rtt__gradient-bar--right" style={{ height: 42 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
