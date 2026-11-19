import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { CSS_EASE, EXPAND, EZ, useLoop } from "../../shared";
import "./VisDelinquency.css";

/**
 * Delinquency — straight port of the Final prototype's `VDq`. A Payment Plan card; loop:
 * 2nd installment Due (1.5s) → row opens (Amount Due / Date) while the status crossfades to
 * a spinning "Sending Reminder" (2s) → Paid (0.45s) → the "AI Collected" card rises in, its
 * number counts to $1,250 and the ring draws to 72% (hold 3.6s) → back to Due.
 */

function Ok() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#00B080" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.67 3.5 5.25 9.92 2.33 7" />
    </svg>
  );
}

function Due() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#F25530" strokeWidth="1.17" strokeLinecap="round">
      <circle cx="7" cy="7" r="5.83" />
      <path d="M7 4.67V7M7 9.33h0" />
    </svg>
  );
}

function Person() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3F3E3C" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.08 12.25v-1.17a2.33 2.33 0 0 0-2.33-2.33h-3.5a2.33 2.33 0 0 0-2.33 2.33v1.17" />
      <circle cx="7" cy="4.08" r="2.33" />
    </svg>
  );
}

/** Counts 0 → `to` over `dur` ms (cubic ease-out) from mount. */
function Num({ to, pre = "", dur = 1000, instant }: { to: number; pre?: string; dur?: number; instant?: boolean }) {
  const [t, setT] = useState(instant ? to : 0);
  useEffect(() => {
    if (instant) return;
    let raf = 0;
    const t0 = performance.now();
    const f = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      setT(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, dur, instant]);
  return (
    <>
      {pre}
      {t.toLocaleString("en-US")}
    </>
  );
}

type St = "due" | "send" | "paid";

export default function VisDelinquency() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(3);

  const { reduced } = useLoop(ref, async ({ wait, alive }) => {
    while (alive()) {
      setPhase(0);
      if (!(await wait(1500))) return;
      setPhase(1);
      if (!(await wait(2000))) return;
      setPhase(2);
      if (!(await wait(450))) return;
      setPhase(3);
      if (!(await wait(3600))) return;
    }
  });

  const ph = reduced ? 3 : phase;
  const st: St = ph === 0 ? "due" : ph === 1 ? "send" : "paid";
  const states: [St, ReactNode][] = [
    ["due", <><Due />Due</>],
    ["send", <><i className="g2v-dq-spin" />Sending Reminder</>],
    ["paid", <><Ok />Paid</>],
  ];

  return (
    <div ref={ref} className="g2v-dq" aria-hidden>
      <div className="g2v-dq-card">
        <div className="g2v-dq-hd">
          <span className="g2v-dq-hd__ic">$</span>
          <div>
            <b>Payment Plan</b>
            <span>
              <Person />
              Rahul Shah
            </span>
          </div>
        </div>
        <div className="g2v-dq-r">
          <span>1st Installment</span>
          <span className="g2v-dq-ok">
            <Ok />
            Paid
          </span>
        </div>
        <div className="g2v-dq-g">
          <div className="g2v-dq-r is-i">
            <span>2nd Installment</span>
            <span className="g2v-dq-st">
              {states.map(([k, c]) => (
                <motion.span
                  key={k}
                  className={`is-${k}`}
                  initial={false}
                  animate={{ opacity: st === k ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: CSS_EASE }}
                >
                  {c}
                </motion.span>
              ))}
            </span>
          </div>
          <motion.div
            className="g2v-dq-x"
            initial={false}
            animate={{ height: ph > 0 ? 52 : 0, opacity: ph > 0 ? 1 : 0 }}
            transition={{
              height: { duration: 0.6, ease: EXPAND },
              opacity: { duration: 0.35, ease: CSS_EASE, delay: ph > 0 ? 0.12 : 0 },
            }}
          >
            <div className="g2v-dq-r is-i">
              <span>Amount Due</span>
              <b>$625.00</b>
            </div>
            <div className="g2v-dq-r is-i">
              <span>Date</span>
              <b>Nov 15, 2026</b>
            </div>
          </motion.div>
        </div>
        <div className="g2v-dq-r is-last">
          <span>3rd Installment</span>
          <span className="g2v-dq-mut">Dec 15</span>
        </div>
      </div>

      <AnimatePresence>
        {ph === 3 && (
          <motion.div
            key="ai"
            className="g2v-dq-ai"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: CSS_EASE } }}
            transition={{ opacity: { duration: 0.4, ease: CSS_EASE }, y: { duration: 0.6, ease: EZ } }}
          >
            <div>
              <span className="g2v-dq-ai__lb">AI Collected</span>
              <b>
                <Num to={1250} pre="$" instant={reduced} />
              </b>
            </div>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="19" fill="none" stroke="#DFDBFF" strokeWidth="7" />
              <motion.circle
                cx="24"
                cy="24"
                r="19"
                fill="none"
                stroke="#6B4FFF"
                strokeWidth="7"
                transform="rotate(-90 24 24)"
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 0.72 }}
                transition={{ duration: 1.1, ease: EZ, delay: 0.15 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
