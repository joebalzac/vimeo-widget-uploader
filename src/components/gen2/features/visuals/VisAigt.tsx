import { useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { E, SPRING_POP } from "../../shared/motion";
import { useLoop } from "../../shared/useLoop";
import mapImg from "../../../../assets/gen2/features/aigt/map.jpg";
import aptImg from "../../../../assets/gen2/features/aigt/apt-6a.jpg";
import pinSvg from "../../../../assets/gen2/features/aigt/pin.svg";
import floorPinSvg from "../../../../assets/gen2/features/aigt/icon-floor-pin.svg";
import floorHomeSvg from "../../../../assets/gen2/features/aigt/icon-floor-home.svg";
import homeIndicatorSvg from "../../../../assets/gen2/features/aigt/home-indicator.svg";
import bedSvg from "../../../../assets/gen2/features/aigt/icon-bed.svg";
import dollarSvg from "../../../../assets/gen2/features/aigt/icon-dollar.svg";
import sqftSvg from "../../../../assets/gen2/features/aigt/icon-sqft.svg";
import dotSvg from "../../../../assets/gen2/features/aigt/dot.svg";
import "./VisAigt.css";

/**
 * AI-Guided Touring visual (Figma 636:54096 → 636:55403). Oakview self-guided tour app in
 * an iPhone frame (drawn 1:1 in card space, x176 y40): header, aerial map with the Floor
 * pill and pins 1 and 2, the Welcome sheet (door code + Tour Itinerary). A touch cursor
 * presses the sheet handle and drags up; the Apt. 6A sheet rises from exactly where the
 * Welcome sheet sits to the top while a scrim fades in. Hold, fade, loop.
 *
 * Screen-space y values below are relative to the screen's padding box (card y = 45 + y).
 */

/** 0 frame 1 · 1 touch appears · 2 press · 3 drag up · 4 released, Apt. 6A on top (final) · 5 fade out */
type Step = 0 | 1 | 2 | 3 | 4 | 5;
const FINAL: Step = 4;

/** Welcome sheet top (Figma: content top 49.48 + 181.13). */
const WELCOME_TOP = 230.6;
/** Apt. 6A sheet resting top (Figma 51.93; 1.4 higher so the Apply button border never peeks above it). */
const SHEET_TOP = 50.5;
/** Where the drag ends, a little below the resting top (spring settles the rest). */
const DRAG_END_TOP = 72;
/** Touch cursor sits on the handle (handle is 10.3 below the sheet top). */
const HANDLE_Y = 11.6;

const AMENITIES = [
  "Spacious Open-Concept Floor Plan",
  "In-Unit Washer and Dryer",
  "Private Outdoor Space",
  "Walk-In Closet",
  "Full-Size Kitchen with Island",
  "Floor-to-Ceiling Windows",
  "10-Foot Ceilings",
  "Landscaped Courtyard Views",
];

function Pin({ n, className }: { n: number; className?: string }) {
  return (
    <span className={["g2v-aigt-pin", className].filter(Boolean).join(" ")}>
      <img src={pinSvg} alt="" width={18.29} height={22.86} className="g2v-aigt-pin__shape" />
      <span className="g2v-aigt-pin__n">{n}</span>
    </span>
  );
}

function Fact({ icon, children }: { icon: string; children: string }) {
  return (
    <span className="g2v-aigt-fact">
      <img src={icon} alt="" width={12} height={12} />
      {children}
    </span>
  );
}

export default function VisAigt() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<Step>(0);

  const { reduced } = useLoop(ref, async ({ wait }) => {
    const seq: [Step, number][] = [[1, 450], [2, 220], [3, 750], [4, 2800], [5, 500]];
    for (;;) {
      setS(0);
      if (!(await wait(1400))) return;
      for (const [step, ms] of seq) {
        setS(step);
        if (!(await wait(ms))) return;
      }
    }
  });

  const step: Step = reduced ? FINAL : s;
  const instant = reduced || step === 0;
  const sheetTop = step <= 2 ? WELCOME_TOP : step === 3 ? DRAG_END_TOP : SHEET_TOP;
  const sheetOn = step >= 3;
  const touchTop = (step === 3 || step >= 4 ? DRAG_END_TOP : WELCOME_TOP) + HANDLE_Y;

  return (
    <motion.div
      ref={ref}
      className="g2v-aigt"
      aria-hidden
      animate={{ opacity: step === 5 ? 0 : 1 }}
      transition={{ duration: step === 5 ? 0.5 : 0 }}
    >
      {/* Side buttons */}
      <span className="g2v-aigt-btn g2v-aigt-btn--l1" />
      <span className="g2v-aigt-btn g2v-aigt-btn--l2" />
      <span className="g2v-aigt-btn g2v-aigt-btn--l3" />
      <span className="g2v-aigt-btn g2v-aigt-btn--r" />

      <div className="g2v-aigt-body">
        <div className="g2v-aigt-screen">
          {/* App content */}
          <div className="g2v-aigt-app">
            <img className="g2v-aigt-map" src={mapImg} alt="" />

            <div className="g2v-aigt-head">
              <div className="g2v-aigt-head__text">
                <p className="g2v-aigt-head__name">Oakview</p>
                <p className="g2v-aigt-head__sub">Self-Guided Tour</p>
              </div>
              <span className="g2v-aigt-head__apply">Apply</span>
            </div>

            <div className="g2v-aigt-maparea">
              <div className="g2v-aigt-floor">
                <span>Floor</span>
                <span className="g2v-aigt-floor__items">
                  <span className="g2v-aigt-floor__item">
                    2
                    <img src={floorPinSvg} alt="" width={10.29} height={10.29} />
                  </span>
                  <span className="g2v-aigt-floor__item">
                    1
                    <img src={floorHomeSvg} alt="" width={10.29} height={10.29} />
                  </span>
                </span>
              </div>
              <Pin n={1} className="g2v-aigt-maparea__pin1" />
              <Pin n={2} className="g2v-aigt-maparea__pin2" />
            </div>

            <div className="g2v-aigt-blank g2v-aigt-blank--cta">
              <span className="g2v-aigt-cta">Start Tour</span>
            </div>
            <div className="g2v-aigt-blank g2v-aigt-blank--home">
              <img src={homeIndicatorSvg} alt="" width={71.82} height={3.06} />
            </div>
          </div>

          {/* Welcome sheet */}
          <div className="g2v-aigt-welcome" style={{ top: WELCOME_TOP }}>
            <span className="g2v-aigt-handle" />
            <div className="g2v-aigt-welcome__group">
              <p className="g2v-aigt-h">Welcome</p>
              <div className="g2v-aigt-code">
                <p className="g2v-aigt-code__num">684020088</p>
                <p className="g2v-aigt-code__hint">Enter the code on the lockbox.</p>
              </div>
            </div>
            <div className="g2v-aigt-itin">
              <p className="g2v-aigt-h">Tour Itinerary</p>
              <div className="g2v-aigt-itin__list">
                <div className="g2v-aigt-itin__row">
                  <Pin n={1} />
                  <div>
                    <p className="g2v-aigt-itin__title">Leasing Office</p>
                    <p className="g2v-aigt-itin__sub">Our leasing office is open Mon-Fri 9AM–9PM</p>
                  </div>
                </div>
                <div className="g2v-aigt-itin__row">
                  <Pin n={2} />
                  <div>
                    <p className="g2v-aigt-itin__title">Apt. 6A</p>
                    <p className="g2v-aigt-itin__sub">2 Bed 1 Bath Unit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="g2v-aigt-scrim"
            initial={false}
            animate={{ opacity: step >= 4 ? 1 : step === 3 ? 0.5 : 0 }}
            transition={instant ? { duration: 0 } : { duration: step === 3 ? 0.75 : 0.4, ease: "easeOut" }}
          />

          {/* Apt. 6A sheet: starts exactly on the Welcome sheet, rises to the top. */}
          <motion.div
            className="g2v-aigt-apt"
            initial={false}
            animate={{ top: sheetTop, opacity: sheetOn ? 1 : 0 }}
            transition={
              instant
                ? { duration: 0 }
                : step === 3
                  ? { top: { duration: 0.75, ease: [0.45, 0, 0.25, 1] }, opacity: { duration: 0.15 } }
                  : { top: SPRING_POP, opacity: { duration: 0.2 } }
            }
          >
            <span className="g2v-aigt-handle g2v-aigt-handle--abs" />
            <motion.div
              className="g2v-aigt-apt__content"
              initial={false}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={instant ? { duration: 0 } : { duration: 0.5, ease: E, delay: 0.15 }}
            >
              <div className="g2v-aigt-apt__top">
                <p className="g2v-aigt-h">Apt. 6A</p>
                <div className="g2v-aigt-apt__media">
                  <img className="g2v-aigt-apt__photo" src={aptImg} alt="" />
                  <div className="g2v-aigt-apt__facts">
                    <Fact icon={bedSvg}>1bd/1ba</Fact>
                    <img src={dotSvg} alt="" width={1.71} height={1.71} />
                    <Fact icon={dollarSvg}>$2,400</Fact>
                    <img src={dotSvg} alt="" width={1.71} height={1.71} />
                    <Fact icon={sqftSvg}>925 sq.ft.</Fact>
                  </div>
                </div>
              </div>
              <ul className="g2v-aigt-apt__amen">
                {AMENITIES.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </motion.div>
            <span className="g2v-aigt-apt__fade" />
          </motion.div>

          {/* Dynamic Island sits above everything */}
          <span className="g2v-aigt-island" />

          {/* Touch cursor */}
          <motion.span
            className="g2v-aigt-touch"
            initial={false}
            animate={
              step === 0
                ? { opacity: 0, top: touchTop + 32, scale: 1.1 }
                : step === 1
                  ? { opacity: 1, top: touchTop, scale: 1 }
                  : step === 2 || step === 3
                    ? { opacity: 1, top: touchTop, scale: 0.82 }
                    : { opacity: 0, top: touchTop, scale: 1.15 }
            }
            transition={
              instant
                ? { duration: 0 }
                : step === 3
                  ? { duration: 0.75, ease: [0.45, 0, 0.25, 1] }
                  : { duration: step === 2 ? 0.15 : 0.35, ease: E }
            }
          />
        </div>
      </div>
    </motion.div>
  );
}
