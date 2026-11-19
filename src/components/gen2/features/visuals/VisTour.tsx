import { Fragment, useRef, useState, type CSSProperties } from "react";
import "../../../../utils/interVariableFont";
import { useLoop } from "../../shared/useLoop";
import "./VisTour.css";

/**
 * Tour Intelligence visual — port of the designer's Final prototype `VTour` (Figma 636:53954).
 * Phone (360×751 shell scaled .8583 at x176 y40, running off the card's bottom edge):
 * "Tour with Lia T.", chips, a transcript typed out once per mount (700ms in, 34ms per
 * letter / 40ms on spaces, purple caret blinking after it) and a lilac waveform that
 * oscillates behind the red stop button while the card is in view.
 * Before it first comes into view, and under reduced motion, the full transcript shows.
 */

/** Bar heights (px, 360-wide phone space), left to right. */
const BARS = [
  12.1, 25.5, 19.8, 36.8, 26.1, 68.2, 52.9, 70.1, 85.3, 50.3, 60.8, 43.1, 26.1, 76.2, 32.4, 41.2, 52.9, 25.5, 14, 9.9,
  9.9, 5.1, 7.1, 9.9, 22.8, 41.2, 52.9, 26.6, 32.4, 12.1, 15.6, 52.9, 36.8, 26.1, 26.1, 26.1, 32.4, 36.8, 41.2, 26.1,
  52.9, 68.2, 25.5, 52.9, 14, 70.1, 9.9, 85.3, 9.9, 50.3, 60.8, 43.1, 26.1, 76.2, 32.4, 41.2, 52.9, 25.5,
];
const TXT = "Loved the kitchen, worried about storage\nPrefers a higher floor";

const CHIP_ICONS = {
  cal: (
    <>
      <rect x="2.67" y="3.33" width="10.67" height="10" rx="1.33" />
      <path d="M10.67 2v2.67M5.33 2v2.67M2.67 7.33h10.66" />
    </>
  ),
  user: (
    <>
      <circle cx="8" cy="4.67" r="2.67" />
      <path d="M4 14v-1.33A2.67 2.67 0 0 1 6.67 10h2.66A2.67 2.67 0 0 1 12 12.67V14" />
    </>
  ),
  bulb: <path d="M5.33 10.67a4.67 4.67 0 1 1 5.34 0c-.4.3-.67.8-.67 1.33v.67H6V12c0-.53-.27-1.03-.67-1.33ZM6.45 14.67h3.1" />,
  file: (
    <>
      <path d="M9.33 2H4.67a1.33 1.33 0 0 0-1.34 1.33v9.34A1.33 1.33 0 0 0 4.67 14h6.66a1.33 1.33 0 0 0 1.34-1.33V5.33Z" />
      <path d="M9.33 2v3.33h3.34M6 9h4M6 11.33h2.67" />
    </>
  ),
};
function ChipIcon({ k }: { k: keyof typeof CHIP_ICONS }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#7A7977" strokeLinecap="round" strokeLinejoin="round">
      {CHIP_ICONS[k]}
    </svg>
  );
}

export default function VisTour() {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(TXT.length);
  const typed = useRef(false);

  const { inView, reduced } = useLoop(
    ref,
    async ({ wait, alive }) => {
      if (typed.current) return;
      setK(0);
      if (!(await wait(700))) return;
      for (let i = 1; i <= TXT.length; i++) {
        if (!alive()) return;
        setK(i);
        if (!(await wait(TXT[i - 1] === " " ? 40 : 34))) return;
      }
      typed.current = true;
    },
    { amount: 0.35 },
  );

  const t = TXT.slice(0, reduced ? TXT.length : k);
  const play = inView && !reduced ? "running" : "paused";

  return (
    <div ref={ref} className="g2v-tour" aria-hidden>
      <div className="g2v-tour-ph">
        <div className="g2v-tour-bl">
          <i style={{ top: 147, height: 23.6 }} />
          <i style={{ top: 182, height: 42.4 }} />
          <i style={{ top: 237, height: 42.4 }} />
        </div>
        <div className="g2v-tour-body">
          <div className="g2v-tour-scr">
            <b className="g2v-tour-isl" />
            <div className="g2v-tour-bar">
              <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                <path d="M4.7 7.1l4.75 4.75 4.75-4.75" stroke="#0E0D0C" strokeWidth="1.18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="#0E0D0C">
                <circle cx="3.7" cy="9" r="1.5" />
                <circle cx="9" cy="9" r="1.5" />
                <circle cx="14.3" cy="9" r="1.5" />
              </svg>
            </div>
            <div className="g2v-tour-hd">
              <h4>Tour with Lia T.</h4>
              <div className="g2v-tour-chips">
                <span>
                  <ChipIcon k="cal" />
                  12:00 PM
                </span>
                <span>
                  <ChipIcon k="user" />
                  Lia T.
                </span>
                <span>
                  <ChipIcon k="bulb" />
                  Tips
                </span>
                <span className="off">
                  <ChipIcon k="file" />
                  Transcript
                </span>
              </div>
            </div>
            <p className="g2v-tour-tx">
              {t.split("\n").map((l, i) => (
                <Fragment key={i}>
                  {i > 0 && <br />}
                  {l}
                </Fragment>
              ))}
              <span className="g2v-tour-car">|</span>
            </p>
            <div className="g2v-tour-wv">
              <div className="g2v-tour-bars">
                {BARS.map((h, i) => (
                  <i
                    key={i}
                    style={
                      {
                        height: h,
                        animationDelay: (-(i * 137) % 900) / 1000 + "s",
                        animationDuration: 700 + ((i * 53) % 600) + "ms",
                        animationPlayState: play,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <i className="g2v-tour-fd" />
              <i className="g2v-tour-gl" />
              <span className="g2v-tour-stop">
                <b />
              </span>
            </div>
          </div>
        </div>
        <div className="g2v-tour-br">
          <i style={{ top: 228, height: 70.6 }} />
        </div>
      </div>
    </div>
  );
}
