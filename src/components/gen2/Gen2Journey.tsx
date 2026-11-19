import "../../utils/interVariableFont";
import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { CSS_EASE, DRAW, EZ, sleep, useSeq } from "./hero/protoHooks";
import "./Gen2Journey.css";

export interface Gen2JourneyProps {
  heading?: string;
  subtitle?: string;
  className?: string;
}

export const DEFAULT_JOURNEY_HEADING = "The Ideal Renter Journey";
export const DEFAULT_JOURNEY_SUBTITLE =
  "From first inquiry to lease renewal, Elise handles it all, across text, voice, email, and web chat.";

/* Prototype J3 / J3RK / J3P: six products clockwise from the top, label side t / r / b / l. */
const J3 = [
  ["Leasing", "t"],
  ["Tour Intelligence", "r"],
  ["AI Guided Tours", "r"],
  ["Maintenance", "b"],
  ["Delinquency", "l"],
  ["Renewals", "l"],
] as const;
const J3RK = [0, 1, 2, 3, 4, 5];
const J3P = J3.map((_, i) => {
  const a = (i * Math.PI) / 3;
  return [320 + 200 * Math.sin(a), 300 - 200 * Math.cos(a)] as const;
});
const J3_LOGO =
  '<path d="M53.8779 20.9648C56.3037 24.6934 57.7139 29.1431 57.7139 33.9229C57.7139 47.0641 47.0611 57.7177 33.9199 57.7178C29.1399 57.7178 24.6896 56.3069 20.9609 53.8809L22.1768 52.96C25.5901 55.07 29.6123 56.29 33.9199 56.29C46.2727 56.29 56.2861 46.2756 56.2861 33.9229C56.2861 29.6154 55.0679 25.5929 52.958 22.1797L53.8779 20.9648ZM33.9199 10.1289C38.0931 10.1289 42.015 11.2036 45.4248 13.0908L44.2139 14.0615C41.1325 12.4612 37.632 11.5567 33.9199 11.5566C21.5671 11.5566 11.5528 21.5701 11.5527 33.9229C11.5527 37.6349 12.4583 41.1354 14.0586 44.2168L13.0879 45.4277C11.2007 42.0179 10.125 38.0961 10.125 33.9229C10.125 20.7816 20.7787 10.1289 33.9199 10.1289Z" fill="white"/><path d="M54.6207 12.3454L41.4132 29.7866C39.4981 32.3155 39.3967 35.7804 41.1604 38.417L46.7051 46.7057L38.4164 41.1611C35.7798 39.3973 32.3149 39.4988 29.786 41.4138L12.3447 54.6214L25.8928 37.7115C27.9119 35.1913 28.0753 31.6565 26.2973 28.9608L21.1374 21.138L28.9602 26.2979C31.6559 28.0759 35.1907 27.9126 37.7109 25.8934L54.6207 12.3454Z" fill="white"/>';

const CIRC = 1256.64; // 2πr, r = 200

/** Prototype Reveal: fade + 18px rise once in view. */
function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "h2" | "p";
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const C = motion[as];
  return (
    <C
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -6% 0px" }}
      transition={{ opacity: { duration: 0.8, ease: CSS_EASE, delay }, y: { duration: 1, ease: EZ, delay } }}
    >
      {children}
    </C>
  );
}

/**
 * The Ideal Renter Journey — port of the Final prototype's `Journey3` (looping ring path; the
 * "Flatten" option is not used). No background and no section padding of its own: rendered
 * inside Gen2Hero, where the hero haze sits behind it.
 *
 * Loop while ≥30% in view: arc sweeps 0→1 over 3.4s lighting each product, holds 3s, rewinds
 * 1s, pauses 0.4s (plus 0.5s at the start of each pass).
 */
export default function Gen2Journey({
  heading = DEFAULT_JOURNEY_HEADING,
  subtitle = DEFAULT_JOURNEY_SUBTITLE,
  className,
}: Gen2JourneyProps) {
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const stRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(1440);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const f = () => setVw(el.clientWidth);
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const s = Math.min(1, vw / 687.8);
  const lf = 14;
  const arc = useMotionValue(0);
  const [on, setOn] = useState(1);
  useMotionValueEvent(arc, "change", (v) => setOn(Math.min(6, Math.floor(v * 6 + 0.02) + 1)));

  useSeq(
    stRef,
    async (ok) => {
      while (ok()) {
        arc.set(0);
        await sleep(500);
        if (!ok()) return;
        await animate(arc, 1, { duration: 3.4, ease: [0.45, 0.05, 0.3, 1] });
        if (!ok()) return;
        await sleep(3000);
        if (!ok()) return;
        await animate(arc, 0, { duration: 1, ease: DRAW });
        if (!ok()) return;
        await sleep(400);
      }
    },
    [],
    0.3,
  );

  const reduce = useReducedMotion();
  const n = reduce ? 6 : on;
  const dash = useTransform(arc, (v) => `${v * CIRC} ${CIRC}`);
  const ringRot = useTransform(arc, (v) => (reduce ? 1 : v) * 360);

  return (
    <div ref={box} className={["g2j", className].filter(Boolean).join(" ")}>
      <div className="g2j-gut">
        <div className="g2j-hd">
          <Reveal as="h2" className="g2j-h2">
            {heading}
          </Reveal>
          {subtitle && (
            <Reveal as="p" className="g2j-sub" delay={0.12}>
              {subtitle}
            </Reveal>
          )}
        </div>
      </div>
      <div className="g2j-wrap" style={{ height: 560 * s }} ref={stRef}>
        <Reveal className="g2j-rv" delay={0.2}>
          <div
            className="g2j-st"
            style={{ transform: `translateX(-50%) scale(${s})`, ["--lf" as string]: lf + "px" }}
            aria-hidden="true"
          >
            <svg className="g2j-g" width="640" height="600" viewBox="0 0 640 600" fill="none">
              <circle cx="320" cy="300" r="200" stroke="#DDDCDA" strokeWidth="1.5" />
              <motion.circle
                cx="320"
                cy="300"
                r="200"
                stroke="#6B4FFF"
                strokeWidth="1.5"
                transform="rotate(-90 320 300)"
                style={{ strokeDasharray: reduce ? `${CIRC} ${CIRC}` : dash }}
              />
              {J3P.map(([x, y], i) => {
                const dx = (x - 320) / 200;
                const dy = (y - 300) / 200;
                const lit = J3RK[i] < n;
                const W = 170;
                const dur = 2.2 + (i % 3) * 0.3 + "s";
                const beg = (-(i * 0.61) % 2.2) + "s";
                return (
                  <g key={i} className={`g2j-ray${lit ? " on" : ""}`}>
                    <motion.line
                      x1={320 + dx * 59}
                      y1={300 + dy * 59}
                      x2={320 + dx * 195}
                      y2={300 + dy * 195}
                      stroke="#DDDCDA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                      transition={{ pathLength: { duration: 0.9, ease: DRAW }, opacity: { duration: 0.3, ease: CSS_EASE } }}
                    />
                    {lit && !reduce && (
                      <>
                        <defs>
                          <linearGradient
                            id={`${uid}b${i}`}
                            gradientUnits="userSpaceOnUse"
                            x1={320 + dx * (59 - W)}
                            y1={300 + dy * (59 - W)}
                            x2={320 + dx * 59}
                            y2={300 + dy * 59}
                          >
                            <stop offset="0" stopColor="#8571FC" stopOpacity="0" />
                            <stop offset=".5" stopColor="#8571FC" stopOpacity=".45" />
                            <stop offset=".82" stopColor="#6B4FFF" stopOpacity="1" />
                            <stop offset="1" stopColor="#6B4FFF" stopOpacity="0" />
                            <animateTransform
                              attributeName="gradientTransform"
                              type="translate"
                              from="0 0"
                              to={`${dx * (136 + W)} ${dy * (136 + W)}`}
                              dur={dur}
                              begin={beg}
                              repeatCount="indefinite"
                              calcMode="spline"
                              keyTimes="0;1"
                              keySplines=".45 0 .55 1"
                            />
                          </linearGradient>
                        </defs>
                        <line
                          x1={320 + dx * 59}
                          y1={300 + dy * 59}
                          x2={320 + dx * 195}
                          y2={300 + dy * 195}
                          stroke={`url(#${uid}b${i})`}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </g>
                );
              })}
            </svg>
            {J3.map(([label, side], i) => {
              const [x, y] = J3P[i];
              const a = J3RK[i] < n;
              return (
                <div key={label} className={`g2j-n ${side}${a ? " on" : ""}`} style={{ left: x, top: y }}>
                  <i />
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: a ? 1 : 0,
                      y: a ? 0 : side === "t" ? 6 : side === "b" ? -6 : 0,
                      x: a ? 0 : side === "r" ? -6 : side === "l" ? 6 : 0,
                    }}
                    transition={{ opacity: { duration: 0.4, ease: CSS_EASE }, y: { duration: 0.5, ease: EZ } }}
                  >
                    {label}
                  </motion.span>
                </div>
              );
            })}
            <div className="g2j-ap">
              <motion.i className="g2j-apring" style={{ rotate: ringRot }} />
              <div>
                <svg width="68" height="68" viewBox="0 0 68 68" fill="none" dangerouslySetInnerHTML={{ __html: J3_LOGO }} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
