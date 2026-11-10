import "../utils/interVariableFont";
import { useEffect, useState, type CSSProperties } from "react";
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

/** Live-transcript lines, typed out one at a time, then looped. */
const TRANSCRIPT_LINES = [
  "Loved the kitchen, worried about storage",
  "Prefers a higher floor",
];

/** Deterministic pseudo-random 0..1, so each bar's timing is stable across renders. */
function seeded(i: number) {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Types TRANSCRIPT_LINES out one at a time, then pauses and loops. */
function useTypedTranscript(lines: string[]) {
  const [revealed, setRevealed] = useState<number[]>(() => lines.map(() => 0));
  const [activeLine, setActiveLine] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => !cancelled && fn(), ms));
    };

    const run = () => {
      setRevealed(lines.map(() => 0));
      setActiveLine(0);

      const typeLine = (lineIndex: number) => {
        const text = lines[lineIndex];
        const step = (charIndex: number) => {
          if (cancelled) return;
          setRevealed((prev) => {
            const next = [...prev];
            next[lineIndex] = charIndex;
            return next;
          });
          if (charIndex < text.length) {
            after(() => step(charIndex + 1), 32);
          } else if (lineIndex < lines.length - 1) {
            after(() => {
              setActiveLine(lineIndex + 1);
              typeLine(lineIndex + 1);
            }, 500);
          } else {
            after(run, 2200);
          }
        };
        step(0);
      };
      typeLine(0);
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [lines]);

  return { revealed, activeLine };
}

/**
 * RecordTheTour — recording-in-progress phone mock for the "Record The
 * Tour" bento card. Figma: node 335:1629 (.com_2027).
 */
export default function RecordTheTour() {
  const { revealed, activeLine } = useTypedTranscript(TRANSCRIPT_LINES);

  return (
    <div className="rtt__wrap">
      <div className="rtt">
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
                {TRANSCRIPT_LINES.map((line, i) => (
                  <p key={i}>
                    {line.slice(0, revealed[i])}
                    {activeLine === i && (
                      <span className="rtt__cursor-blink">|</span>
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
                            animationDuration: `${0.7 + seeded(i) * 0.6}s`,
                            animationDelay: `${-seeded(i * 7 + 1) * 1.3}s`,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                </div>
                <img className="rtt__glow" src={glowEllipse} alt="" />
                <div className="rtt__stop">
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
