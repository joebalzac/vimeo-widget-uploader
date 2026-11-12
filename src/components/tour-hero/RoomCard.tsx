import { Fragment, useEffect, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";

import type { RoomKey } from "./roomTimeline";

const ease = [0.22, 1, 0.36, 1] as const;


function Spinner({ s = 16 }: { s?: number }) {
  return (
    <motion.svg
      width={s}
      height={s}
      viewBox="0 0 16 16"
      fill="none"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    >
      <rect x=".75" y=".75" width="14" height="14" rx="7" stroke="#DFDBFF" strokeWidth="1.5" />
      <path d="M14.75 7.75a7 7 0 1 1-7-7" stroke="#6B4FFF" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <motion.path
        d="M11.67 3.5L5.25 9.92 2.33 7"
        stroke="#3F3E3C"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      />
    </svg>
  );
}

function Swap({ id, children }: { id: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.4, ease }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Kitchen: strike through $2,000, loader pops in, then ✓ $2,200 + Complete. */
function KitchenBody({ phase }: { phase: number }) {
  return (
    <div className="trc__kitchen">
      <Swap id={phase < 3 ? "old" : "new"}>
        {phase < 3 ? (
          <div className="trc__row">
            <motion.span
              animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.4 }}
              transition={{ duration: 0.35, ease }}
              style={{ display: "flex" }}
            >
              <Spinner />
            </motion.span>
            <span className="trc__price" style={{ color: phase >= 1 ? "#A9A8A6" : "#3F3E3C" }}>
              $2,000
              <motion.i
                className="trc__strike"
                initial={false}
                animate={{ scaleX: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
              />
            </span>
          </div>
        ) : (
          <div className="trc__row">
            <Check />
            $2,200
            <motion.span
              className="trc__complete"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22, delay: 0.18 }}
            >
              Complete
            </motion.span>
          </div>
        )}
      </Swap>
    </div>
  );
}

/** Living Room: skeleton shimmer, then Dog / Corgi / Biscuit fade in 100ms apart. */
function LivingBody({ phase }: { phase: number }) {
  const cols = [
    ["Pet", "Dog"],
    ["Breed", "Corgi"],
    ["Name", "Biscuit"],
  ];
  return (
    <div className="trc__cols">
      {cols.map(([k, v], i) => (
        <Fragment key={k}>
          {i > 0 && <i className="trc__col-divider" />}
          <div className="trc__col">
            <span className="trc__mono">{k}</span>
            <span className="trc__col-value">
              <motion.i
                className="trc__skeleton"
                animate={phase ? { opacity: 0 } : { opacity: 1, backgroundPosition: ["100% 0", "0% 0"] }}
                transition={
                  phase
                    ? { duration: 0.25 }
                    : { backgroundPosition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } }
                }
              />
              <motion.span
                className="trc__col-text"
                initial={false}
                animate={phase ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 5, filter: "blur(3px)" }}
                transition={{ duration: 0.4, ease, delay: phase ? i * 0.1 : 0 }}
              >
                {v}
              </motion.span>
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function Seg({ p, i }: { p: MotionValue<number>; i: number }) {
  const sx = useTransform(p, (v) => Math.min(Math.max(v - i, 0), 1));
  return (
    <span className="trc__seg">
      <motion.span className="trc__seg-fill" style={{ scaleX: sx }} />
    </span>
  );
}

/** Guest Room: the yellow score sweeps across 2 of 7 segments, then swaps to Coaching. */
function GuestBody({ phase }: { phase: number }) {
  const p = useMotionValue(0);
  const started = phase >= 1;
  useEffect(() => {
    if (started) {
      const c = animate(p, 2, { duration: 1.1, ease: [0.33, 0, 0.2, 1] });
      return () => c.stop();
    }
    p.set(0);
  }, [started, p]);
  return (
    <Swap id={phase < 3 ? "score" : "coach"}>
      {phase < 3 ? (
        <div className="trc__score">
          <div className="trc__score-head">
            <span>Providing Solutions</span>
            <span className="trc__muted">5/15pts</span>
          </div>
          <div className="trc__segs">
            {Array.from({ length: 7 }).map((_, i) => (
              <Seg key={i} p={p} i={i} />
            ))}
          </div>
        </div>
      ) : (
        <div className="trc__coaching">
          <Spinner s={14} />
          Coaching
        </div>
      )}
    </Swap>
  );
}

const COPY: Record<RoomKey, [string, string, (p: { phase: number }) => ReactNode]> = {
  kitchen: ["Kitchen", "Steven updated his budget to a max of $2,200 per month.", KitchenBody],
  living: ["Living Room", "Steven asked about the pet policy for Biscuit, his corgi.", LivingBody],
  guest: ["Guest Room", "Agent failed to address the objection about no in-unit laundry.", GuestBody],
};

export default function RoomCard({
  room,
  phase,
  style,
  origin,
}: {
  room: RoomKey;
  phase: number;
  style: CSSProperties & { x?: string };
  origin: string;
}) {
  const [title, desc, Body] = COPY[room];
  return (
    <motion.div
      className="trc"
      style={{ ...style, transformOrigin: origin }}
      initial={{ opacity: 0, scale: 0.94, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.97, filter: "blur(2px)", transition: { duration: 0.35, ease } }}
      transition={{ duration: 0.55, ease }}
    >
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.4, ease }}>
        <p className="trc__title">{title}</p>
        <p className="trc__desc">{desc}</p>
      </motion.div>
      <div className="trc__rule" />
      <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.4, ease }}>
        <Body phase={phase} />
      </motion.div>
    </motion.div>
  );
}
