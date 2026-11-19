import { useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import "../../../../utils/interVariableFont";
import { CSS_EASE, DRAW, useLoop } from "../../shared";
import "./VisMaint.css";

/**
 * Maintenance — straight port of the Final prototype's `VMaint` / `TurnCard` / `SegI`.
 * Three turn cards (side ones at 10%). Loop: the centre card's 7-segment bar rewinds,
 * re-fills to part-way through segment 6 (azure + shimmer while in progress), a blue
 * CLEANING tag drops in under the fill head, then the bar completes in mint with the tag
 * riding along, the tag turns into a mint COMPLETE (check draws) and the chip VACANT → READY.
 */

/** Prototype's `E` (differs from the shared token). */
const E = [0.22, 1, 0.36, 1] as const;

const UNITS = [
  ["Unit 1C Turn", "Building 1", "November 15", "November 10"],
  ["Unit 3A Turn", "Building 1", "November 28", "November 20"],
  ["Unit 2B Turn", "Building 2", "November 28", "November 20"],
] as const;
type U = (typeof UNITS)[number];

const SEGW = 39.4;
const SEGG = 1.7;
/** x (card content space) of the fill head for progress p ∈ [0, 7]. */
const segX = (p: number) => {
  const k = Math.min(6, Math.floor(p));
  return k * (SEGW + SEGG) + Math.min(1, p - k) * SEGW;
};
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function TurnIcon({ s }: { s: number }) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#fff"
      strokeWidth={s === 20 ? 1.67 : 1.66}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.33 10a6.67 6.67 0 1 0 2-4.76L3.33 7.22" />
      <path d="M3.33 3.33v3.89h3.89" />
    </svg>
  );
}

function Seg({ p, i, az }: { p: MotionValue<number>; i: number; az: boolean }) {
  const sx = useTransform(p, (v) => clamp(v - i, 0, 1));
  const c = useTransform(p, (v) => (az && i === 5 && v < 6 ? "#2e95ff" : "#00b080"));
  return (
    <span>
      <motion.i style={{ scaleX: sx, backgroundColor: c }} />
      {az && i === 5 && <i className="g2v-maint-shim" />}
    </span>
  );
}

function TurnCard({
  u,
  center,
  p,
  az = false,
  ready = false,
  done,
}: {
  u: U;
  center?: boolean;
  p?: MotionValue<number> | null;
  az?: boolean;
  ready?: boolean;
  done?: boolean;
}) {
  return (
    <div className="g2v-maint-c">
      <div className="g2v-maint-c__top">
        <span className="g2v-maint-c__ic">
          <TurnIcon s={center ? 20 : 16} />
        </span>
        <div className="g2v-maint-c__nm">
          <b>{u[0]}</b>
          <span>
            {u[1]}
            <i className="g2v-maint-dot" />
            Aura Estates
          </span>
        </div>
        <span className="g2v-maint-chip">
          <motion.span
            className="g2v-maint-chip3 is-grey"
            initial={false}
            animate={{ opacity: ready ? 0 : 1 }}
            transition={{ duration: 0.3, ease: CSS_EASE }}
          >
            Vacant
          </motion.span>
          <motion.span
            className="g2v-maint-chip3 is-mint"
            initial={false}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 0.3, ease: CSS_EASE }}
          >
            Ready
          </motion.span>
        </span>
      </div>
      <div className="g2v-maint-c__rows">
        <i className="g2v-maint-hr" />
        <div className="g2v-maint-c__r">
          <span>Due Date</span>
          <em>{u[2]}</em>
        </div>
        <i className="g2v-maint-hr" />
        <div className="g2v-maint-c__r">
          <span>Move-Out</span>
          <em>{u[3]}</em>
        </div>
      </div>
      <div className="g2v-maint-seg">
        {p
          ? Array.from({ length: 7 }, (_, i) => <Seg key={i} p={p} i={i} az={az} />)
          : Array.from({ length: 7 }, (_, i) => (
              <span key={i}>
                <i
                  style={{
                    transform: `scaleX(${done ? 1 : i === 0 ? 1 : 0})`,
                    background: done ? "#00b080" : "#1475e8",
                  }}
                />
              </span>
            ))}
      </div>
    </div>
  );
}

type Tag = "c" | "d" | null;

export default function VisMaint() {
  const ref = useRef<HTMLDivElement>(null);
  const p = useMotionValue(7);
  const [st, setSt] = useState<{ tag: Tag; az: boolean; ready: boolean }>({ tag: "d", az: false, ready: true });
  const tagX = useTransform(p, (v) => 20 + segX(Math.min(v, 7)) - 44);

  const { reduced } = useLoop(
    ref,
    async ({ wait, alive }) => {
      const S = (x: Partial<typeof st>) => setSt((y) => ({ ...y, ...x }));
      while (alive()) {
        S({ tag: null, az: true, ready: false });
        await animate(p, 0, { duration: 0.55, ease: DRAW });
        if (!alive()) return;
        if (!(await wait(500))) return;
        await animate(p, 5 + 18.2 / 39.4, { duration: 2.1, ease: [0.3, 0, 0.25, 1] });
        if (!alive()) return;
        S({ tag: "c" });
        if (!(await wait(2000))) return;
        await animate(p, 7, { duration: 1.1, ease: [0.5, 0, 0.2, 1] });
        if (!alive()) return;
        S({ az: false, tag: "d", ready: true });
        if (!(await wait(2800))) return;
        S({ tag: null });
        if (!(await wait(250))) return;
      }
    },
    { amount: 0.35 },
  );

  const v = reduced ? { tag: "d" as Tag, az: false, ready: true } : st;
  const cleaning = v.tag === "c";

  return (
    <div ref={ref} className="g2v-maint" aria-hidden>
      <div className="g2v-maint-slot" style={{ left: -194, opacity: 0.1 }}>
        <TurnCard u={UNITS[0]} done />
      </div>
      <div className="g2v-maint-slot" style={{ left: 526, opacity: 0.1 }}>
        <TurnCard u={UNITS[2]} center={false} />
      </div>
      <div className="g2v-maint-slot" style={{ left: 166 }}>
        <TurnCard u={UNITS[1]} center p={reduced ? null : p} az={v.az} ready={v.ready} done={reduced} />
        <AnimatePresence>
          {v.tag && (
            <motion.span
              key="tag"
              className={`g2v-maint-tag ${cleaning ? "is-az" : "is-ok"}`}
              style={{ x: reduced ? 264 : tagX, left: 0 }}
              initial={{ opacity: 0, y: -6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.4, ease: E }}
            >
              <svg className="g2v-maint-tag__tip" width="10" height="5" viewBox="0 0 9.7 4.5">
                <path d="M4.85 0 9.7 4.5H0Z" fill="currentColor" />
              </svg>
              <span className="g2v-maint-tag__pill">
                <span className="g2v-maint-tag__ic">
                  <motion.svg
                    className="g2v-maint-spin"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    initial={false}
                    animate={{ opacity: cleaning ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: CSS_EASE }}
                  >
                    <circle cx="5" cy="5" r="4.4" stroke="rgba(255,255,255,.5)" strokeWidth="1.25" />
                    <path d="M9.4 5A4.4 4.4 0 0 0 5 .6" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" />
                  </motion.svg>
                  <motion.svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    initial={false}
                    animate={{ opacity: cleaning ? 0 : 1 }}
                    transition={{ duration: 0.25, ease: CSS_EASE }}
                  >
                    <motion.path
                      d="M2.5 6.2 4.9 8.5 9.5 3.5"
                      stroke="#fff"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={false}
                      animate={{ pathLength: cleaning ? 0 : 1 }}
                      transition={{ duration: 0.4, ease: DRAW, delay: 0.1 }}
                    />
                  </motion.svg>
                </span>
                <span className="g2v-maint-tag__lb">
                  <motion.span
                    initial={false}
                    animate={{ opacity: cleaning ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: CSS_EASE }}
                  >
                    Cleaning
                  </motion.span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: cleaning ? 0 : 1 }}
                    transition={{ duration: 0.25, ease: CSS_EASE }}
                  >
                    Complete
                  </motion.span>
                </span>
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
