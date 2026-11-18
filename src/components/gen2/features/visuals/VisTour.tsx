import { useRef, useState, type CSSProperties } from "react";
import { useLoop } from "../../shared/useLoop";
import chevronDown from "../../../../assets/gen2/features/tour/icon-chevron-down.svg";
import dots from "../../../../assets/gen2/features/tour/icon-dots.svg";
import iconCalendar from "../../../../assets/gen2/features/tour/icon-calendar.svg";
import iconUser from "../../../../assets/gen2/features/tour/icon-user.svg";
import iconBulb from "../../../../assets/gen2/features/tour/icon-bulb.svg";
import iconFileText from "../../../../assets/gen2/features/tour/icon-file-text.svg";
import glow from "../../../../assets/gen2/features/tour/glow.svg";
import iconStop from "../../../../assets/gen2/features/tour/icon-stop.svg";
import "./VisTour.css";

/**
 * Tour Intelligence visual (Figma 636:53954). Phone 309 wide (incl. side buttons) at
 * x176 y40, running off the card's bottom edge. "Tour with Lia T.", chips, a transcript
 * typed at 34ms per character, lilac waveform bars oscillating behind a red stop button
 * with a white glow. All geometry is Figma's px in the 660×460 card space.
 */

/** Bar heights (px) from the Figma waveform (636:53989), left to right. */
const WAVE = [
  10.4, 21.83, 16.94, 31.55, 22.33, 58.5, 45.38, 60.07, 73.14, 43.13, 52.13,
  36.92, 22.33, 65.35, 27.79, 35.3, 45.38, 21.83, 11.99, 8.48, 8.48, 4.37, 6.13,
  8.48, 19.5, 35.3, 45.38, 22.82, 27.79, 10.4, 13.38, 45.38, 31.55, 22.33,
  22.33, 22.33, 27.79, 31.55, 35.3, 22.33, 45.38, 58.5, 21.83, 45.38, 11.99,
  60.07, 8.48, 73.14, 8.48, 43.13, 52.13, 36.92, 22.33, 65.35, 27.79, 35.3,
  45.38, 21.83,
];

const CHIPS = [
  { icon: iconCalendar, label: "12:00 PM" },
  { icon: iconUser, label: "Lia T." },
  { icon: iconBulb, label: "Tips" },
  { icon: iconFileText, label: "Transcript", muted: true },
];

const LINES = [
  "Loved the kitchen, worried about storage",
  "Prefers a higher floor",
] as const;
const FINAL = { a: LINES[0], b: LINES[1], at: 2 };

export default function VisTour() {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<{ a: string; b: string; at: number }>(FINAL);

  const { inView, reduced } = useLoop(ref, async ({ wait }) => {
    const [a, b] = LINES;
    setT({ a: "", b: "", at: 1 });
    if (!(await wait(500))) return;
    for (let i = 1; i <= a.length; i++) {
      setT({ a: a.slice(0, i), b: "", at: 1 });
      if (!(await wait(34))) return;
    }
    for (let i = 1; i <= b.length; i++) {
      setT({ a, b: b.slice(0, i), at: 2 });
      if (!(await wait(34))) return;
    }
  });

  const text = reduced ? FINAL : t;
  const playState = inView && !reduced ? "running" : "paused";

  return (
    <div ref={ref} className="g2v-tour">
      <div className="g2v-tour__device">
        <div className="g2v-tour__side g2v-tour__side--l" aria-hidden>
          <span style={{ height: 20.19 }} />
          <span style={{ height: 36.34 }} />
          <span style={{ height: 36.34 }} />
        </div>
        <div className="g2v-tour__bezel">
          <div className="g2v-tour__screen">
            <div className="g2v-tour__notchrow">
              <span className="g2v-tour__notch" />
            </div>
            <div className="g2v-tour__bar">
              <span className="g2v-tour__btn g2v-tour__btn--min">
                <img src={chevronDown} alt="" width={16.23} height={16.23} />
              </span>
              <span className="g2v-tour__btn g2v-tour__btn--more">
                <img src={dots} alt="" width={15.68} height={15.68} />
              </span>
            </div>
            <div className="g2v-tour__head">
              <p className="g2v-tour__title">Tour with Lia T.</p>
              <div className="g2v-tour__chips">
                {CHIPS.map((c) => (
                  <span
                    key={c.label}
                    className={
                      "g2v-tour__chip" +
                      (c.muted ? " g2v-tour__chip--muted" : "")
                    }
                  >
                    <img src={c.icon} alt="" width={13.68} height={13.68} />
                    <span>{c.label}</span>
                  </span>
                ))}
              </div>
            </div>
            <div className="g2v-tour__transcript">
              <p>
                {text.a}
                {text.at === 1 && <span className="g2v-tour__caret">|</span>}
              </p>
              <p>
                {text.b}
                {text.at === 2 && (
                  <>
                    {" "}
                    <span className="g2v-tour__caret">|</span>
                  </>
                )}
              </p>
            </div>
            <div className="g2v-tour__rec">
              <div className="g2v-tour__wavebox">
                <div className="g2v-tour__wave">
                  {WAVE.map((h, i) => (
                    <span
                      key={i}
                      style={
                        {
                          height: h,
                          animationDuration: `${(
                            0.7 +
                            ((i * 37) % 10) / 14
                          ).toFixed(2)}s`,
                          animationDelay: `-${((i * 53) % 17) / 10}s`,
                          animationPlayState: playState,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
                <div className="g2v-tour__fade" />
              </div>
              <span className="g2v-tour__glow">
                <img src={glow} alt="" width={174.18} height={174.18} />
              </span>
              <span className="g2v-tour__stop">
                <img src={iconStop} alt="" width={15.79} height={15.79} />
              </span>
            </div>
          </div>
        </div>
        <div className="g2v-tour__side g2v-tour__side--r" aria-hidden>
          <span style={{ height: 60.5 }} />
        </div>
      </div>
    </div>
  );
}
