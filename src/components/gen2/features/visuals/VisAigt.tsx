import { useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { CSS_EASE, DRAW, EZ } from "../../shared/motion";
import { useLoop } from "../../shared/useLoop";
import mapImg from "../../../../assets/gen2/features/aigt/map.jpg";
import aptImg from "../../../../assets/gen2/features/aigt/apt-6a.jpg";
import "./VisAigt.css";

/**
 * AI Guided Tours visual — port of the designer's Final prototype `VAigt`
 * (Figma 636:54096 → 636:55403). Oakview self-guided tour app in the phone (360×751
 * shell scaled .8583 at x176 y40): header, aerial map with the Floor pill and pins,
 * the Welcome sheet. Loop: 1.6s rest → a touch dot appears low on the screen and
 * presses (.3s) → it drags up while the Apt. 6A sheet rises (.75s) and a scrim fades in
 * → the dot lifts off → 4s hold → the sheet drops back and the loop restarts.
 * Reduced motion: the resting Welcome screen (no sheet, no touch), as in the prototype.
 */

/** Prototype `E` (strong ease-out). Not the shared `E`, which is a slightly different curve. */
const E_PROTO = [0.22, 1, 0.36, 1] as const;

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

const MAP_PIN = "M11.47 26.4C13.95 24.26 21.33 17.32 21.33 10.67A10.67 10.67 0 0 0 0 10.67C0 17.32 7.39 24.26 9.87 26.4a1 1 0 0 0 1.6 0Z";

function MapPin({ n, left, top, opacity }: { n: string; left: number; top: number; opacity?: number }) {
  return (
    <span className="g2v-aigt-mpin" style={{ left, top, opacity }}>
      <svg viewBox="0 0 22 27" fill="#0E0D0C">
        <path d={MAP_PIN} />
      </svg>
      <b>{n}</b>
    </span>
  );
}

function Pin({ n }: { n: string }) {
  return (
    <span className="g2v-aigt-pin">
      <svg width="22" height="27" viewBox="0 0 21.3 26.7">
        <path
          d="M10.65 0C16.53 0 21.3 4.77 21.3 10.65c0 7.1-10.65 16.05-10.65 16.05S0 17.75 0 10.65C0 4.77 4.77 0 10.65 0Z"
          fill="#0E0D0C"
        />
      </svg>
      <b>{n}</b>
    </span>
  );
}

const Ic = { width: 14, height: 14, viewBox: "0 0 14 14", fill: "none", stroke: "#3F3E3C", strokeWidth: 1.17, strokeLinecap: "round" } as const;

/** Touch dot keyframes per phase: 0 hidden low · 1 press · 2 drag up · 3 lift off. */
const TOUCH = [
  { opacity: 0, y: 267, scale: 1 },
  { opacity: 1, y: 267, scale: 0.86 },
  { opacity: 1, y: 58.5, scale: 0.86 },
  { opacity: 0, y: 50, scale: 1.15 },
] as const;
const TOUCH_T = [
  { duration: 0.35, ease: CSS_EASE },
  { duration: 0.3, ease: EZ },
  { y: { duration: 0.75, ease: E_PROTO }, opacity: { duration: 0.2 } },
  { duration: 0.35, ease: CSS_EASE },
];

export default function VisAigt() {
  const ref = useRef<HTMLDivElement>(null);
  const [up, setUp] = useState(false);
  const [touch, setTouch] = useState(0);

  const { reduced } = useLoop(
    ref,
    async ({ wait }) => {
      for (;;) {
        setUp(false);
        setTouch(0);
        if (!(await wait(1600))) return;
        setTouch(1);
        if (!(await wait(380))) return;
        setTouch(2);
        setUp(true);
        if (!(await wait(760))) return;
        setTouch(3);
        if (!(await wait(4000))) return;
        setTouch(0);
      }
    },
    { amount: 0.35 },
  );

  const u = !reduced && up;
  const tch = reduced ? 0 : touch;

  return (
    <div ref={ref} className="g2v-aigt" aria-hidden>
      <div className="g2v-aigt-ph">
        <div className="g2v-aigt-bl">
          <i style={{ top: 147, height: 23.6 }} />
          <i style={{ top: 182, height: 42.4 }} />
          <i style={{ top: 237, height: 42.4 }} />
        </div>
        <div className="g2v-aigt-body">
          <div className="g2v-aigt-scr">
            <b className="g2v-aigt-isl" />

            <div className="g2v-aigt-app">
              <div className="g2v-aigt-hd">
                <div>
                  <b>Oakview</b>
                  <span>Self-Guided Tour</span>
                </div>
                <span className="g2v-aigt-ap">Apply</span>
              </div>

              <div className="g2v-aigt-map">
                <img className="g2v-aigt-map__img" src={mapImg} alt="" />
                <div className="g2v-aigt-fl">
                  Floor
                  <div className="g2v-aigt-sgs">
                    <span className="g2v-aigt-sg">
                      2
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6.3 10.9C7.23 10.1 10 7.5 10 5a4 4 0 0 0-8 0c0 2.5 2.77 5.1 3.7 5.9a.5.5 0 0 0 .6 0Z" />
                        <circle cx="6" cy="5" r="1.5" />
                      </svg>
                    </span>
                    <span className="g2v-aigt-sg">
                      1
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 5c0-.3.13-.57.35-.76l3.5-3a1 1 0 0 1 1.3 0l3.5 3c.22.19.35.46.35.76v4.5a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1Z" />
                      </svg>
                    </span>
                  </div>
                </div>
                <MapPin n="1" left={176.37} top={72.36} opacity={0.45} />
                <MapPin n="2" left={286.75} top={33.27} />
              </div>

              <div className="g2v-aigt-wel">
                <i className="g2v-aigt-handle" />
                <div className="g2v-aigt-blk">
                  <b>Welcome</b>
                  <div className="g2v-aigt-code">
                    <span>684020088</span>
                    <span className="g2v-aigt-hint">Enter the code on the lockbox.</span>
                  </div>
                </div>
                <div className="g2v-aigt-blk">
                  <b>Tour Itinerary</b>
                  <div className="g2v-aigt-it">
                    <div className="g2v-aigt-row">
                      <Pin n="1" />
                      <div>
                        <span>Leasing Office</span>
                        <small>Our leasing office is open Mon-Fri 9AM–9PM</small>
                      </div>
                    </div>
                    <i className="g2v-aigt-hr" />
                    <div className="g2v-aigt-row">
                      <Pin n="2" />
                      <div>
                        <span>Apt. 6A</span>
                        <small>2 Bed 1 Bath Unit</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.i
              className="g2v-aigt-scrim"
              initial={false}
              animate={{ opacity: u ? 1 : 0 }}
              transition={{ duration: 0.4, ease: CSS_EASE }}
            />
            <motion.i className="g2v-aigt-touch" initial={false} animate={TOUCH[tch]} transition={TOUCH_T[tch]} />

            <motion.div
              className="g2v-aigt-sheet"
              initial={false}
              animate={{ y: u ? 0 : 208.7, opacity: u ? 1 : 0 }}
              transition={{
                y: { duration: u ? 0.75 : 0.55, ease: u ? E_PROTO : DRAW },
                opacity: { duration: u ? 0.12 : 0.35, ease: CSS_EASE, delay: u ? 0 : 0.2 },
              }}
            >
              <i className="g2v-aigt-handle" />
              <div className="g2v-aigt-in">
                <b>Apt. 6A</b>
                <img src={aptImg} alt="" />
                <div className="g2v-aigt-facts">
                  <svg {...Ic} strokeLinejoin="round">
                    <path d="M1.75 11.08V6.42c0-.6.5-1.09 1.1-1.09h8.3c.6 0 1.1.49 1.1 1.09v4.66M2.92 5.33V3.5c0-.6.5-1.08 1.1-1.08h5.96c.6 0 1.1.48 1.1 1.08v1.83M1.75 9.33h10.5" />
                  </svg>
                  1bd/1ba
                  <i className="g2v-aigt-dot" />
                  <svg {...Ic}>
                    <circle cx="7" cy="7" r="5.83" />
                    <path d="M8.75 5.25c-.3-.6-1-.9-1.75-.9-1 0-1.75.5-1.75 1.25 0 1.8 3.5.9 3.5 2.7 0 .8-.8 1.3-1.75 1.3-.8 0-1.5-.3-1.8-.9M7 3.5v7" />
                  </svg>
                  $2,400
                  <i className="g2v-aigt-dot" />
                  <svg {...Ic}>
                    <rect x="1.75" y="4.08" width="10.5" height="5.84" rx=".6" />
                    <path d="M4.08 4.08v1.75M6.42 4.08v1.75M8.75 4.08v1.75M11.08 4.08v1.75" />
                  </svg>
                  925 sq.ft.
                </div>
                <ul>
                  {AMENITIES.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>
              <i className="g2v-aigt-fd" />
            </motion.div>
          </div>
        </div>
        <div className="g2v-aigt-br">
          <i style={{ top: 228, height: 70.6 }} />
        </div>
      </div>
    </div>
  );
}
