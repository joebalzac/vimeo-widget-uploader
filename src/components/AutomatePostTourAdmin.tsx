import "../utils/interVariableFont";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, type TargetAndTransition } from "framer-motion";
import "./AutomatePostTourAdmin.css";
import iconCheck from "../assets/bento/icon-check.svg";
import iconPlay from "../assets/bento/icon-play-triangle.svg";
import cursorArrow from "../assets/bento/cursor.svg";

interface AdminRow {
  label: string;
  value: string;
  time: string;
}

const ROWS: AdminRow[] = [
  { label: "Move-in", value: "Dec 1 – Dec 15, 2026", time: "2:20" },
  { label: "Budget", value: "Up to $2,200", time: "8:35" },
  { label: "Lease Length", value: "12 Months", time: "2:07" },
  { label: "Pets", value: "Dog (1), Corgi named Biscuit", time: "7:05" },
];

/** Pointer tip inside the 48x48 cursor.svg, so the tip (not the box corner) lands on target. */
const CURSOR_TIP = { x: 16.5, y: 14.7 };
const EZ = [0.22, 0.8, 0.24, 1] as const;
const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const RING_E = [0.16, 0.84, 0.3, 1] as const;
const MOVE = { duration: 0.6, ease: [0.65, 0, 0.35, 1] as const };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Phase = "list" | "converge" | "fade" | "emit" | "settled";

function Ring({ size, dur, delay }: { size: number; dur: number; delay: number }) {
  return (
    <motion.div
      className="apa__ring"
      style={{ width: size, height: size, x: "-50%", y: "-50%" }}
      initial={{ opacity: 0, scale: 0.15 }}
      animate={{ opacity: [0, 0.45, 0], scale: 1.9 }}
      transition={{
        scale: { duration: dur, delay, ease: RING_E },
        opacity: { duration: dur, delay, times: [0, 0.22, 1], ease: [RING_E, RING_E] },
      }}
    />
  );
}

/**
 * AutomatePostTourAdmin — guest-card checklist preview for the "Automate
 * Post-Tour Admin" bento card. Figma: node 408:10588 (.com_2027).
 *
 * Plays when 35% visible and replays on every re-entry: rows animate in, the cursor
 * ticks each checkbox, the rows converge into the green success card, and two
 * rings emit from it and fade out.
 */
export default function AutomatePostTourAdmin() {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const play = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [st, setSt] = useState<{ phase: Phase; run: number; checked: number; dy: number[] }>({
    phase: "settled",
    run: 0,
    checked: 0,
    dy: [0, 0, 0, 0],
  });
  const [cur, setCur] = useState({ on: false, click: false });
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  useEffect(() => {
    if (!play || reduce) {
      setCur({ on: false, click: false });
      setSt((s) => ({ ...s, phase: "settled" }));
      return;
    }
    let alive = true;
    const ok = () => alive;
    (async () => {
      const vis = ref.current;
      if (!vis) return;
      /* 1. rows animate in, cursor parked below the card */
      setSt((s) => ({ phase: "list", run: s.run + 1, checked: 0, dy: [0, 0, 0, 0] }));
      cx.set(vis.clientWidth * 0.7 - CURSOR_TIP.x);
      cy.set(vis.clientHeight + 30 - CURSOR_TIP.y);
      await sleep(700);
      if (!ok()) return;
      setCur({ on: true, click: false });
      /* 2. cursor ticks each checkbox */
      const CE = { duration: 0.4, ease: [0.45, 0, 0.2, 1] as const };
      for (let i = 0; i < ROWS.length; i++) {
        const box = boxRefs.current[i];
        if (!box) return;
        const vr = vis.getBoundingClientRect();
        const b = box.getBoundingClientRect();
        animate(cx, b.left - vr.left + b.width / 2 - CURSOR_TIP.x, CE);
        animate(cy, b.top - vr.top + b.height / 2 - CURSOR_TIP.y, CE);
        await sleep(420);
        if (!ok()) return;
        setCur({ on: true, click: true });
        await sleep(90);
        if (!ok()) return;
        setSt((s) => ({ ...s, checked: i + 1 }));
        setCur({ on: true, click: false });
        await sleep(140);
        if (!ok()) return;
      }
      await sleep(350);
      if (!ok()) return;
      setCur({ on: false, click: false });
      /* 3. rows converge into the success card */
      const list = listRef.current;
      if (!list) return;
      const lr = list.getBoundingClientRect();
      const mid = lr.top + lr.height / 2;
      const dy = rowRefs.current.map((r) => {
        if (!r) return 0;
        const rr = r.getBoundingClientRect();
        return mid - (rr.top + rr.height / 2);
      });
      setSt((s) => ({ ...s, phase: "converge", dy }));
      await sleep(300);
      if (!ok()) return;
      setSt((s) => ({ ...s, phase: "fade" }));
      /* 4. success: rings emit from the centre, then disappear */
      await sleep(220);
      if (!ok()) return;
      setSt((s) => ({ ...s, phase: "emit" }));
      await sleep(2000);
      if (!ok()) return;
      setSt((s) => ({ ...s, phase: "settled" }));
    })();
    return () => {
      alive = false;
    };
  }, [play, reduce, cx, cy]);

  const listShown = st.phase === "list" || st.phase === "converge";
  const rowAnim = (i: number): TargetAndTransition => {
    if (st.phase === "list")
      return {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          opacity: { duration: 0.4, ease: CSS_EASE, delay: i * 0.08 },
          y: { duration: 0.55, ease: EZ, delay: i * 0.08 },
        },
      };
    if (st.phase === "converge") return { opacity: 1, y: st.dy[i], scale: 0.94, transition: { y: MOVE, scale: MOVE } };
    if (st.phase === "settled") return { opacity: 0, transition: { duration: 0 } };
    return {
      opacity: 0,
      y: st.dy[i],
      scale: 0.94,
      transition: { y: MOVE, scale: MOVE, opacity: { duration: 0.3, ease: CSS_EASE } },
    };
  };

  return (
    <div className="apa" ref={ref}>
      {/* success state */}
      <motion.div
        className="apa__layer"
        initial={false}
        animate={{ opacity: listShown ? 0 : 1 }}
        transition={{ duration: 0.45, ease: CSS_EASE }}
      >
        {st.phase === "emit" && (
          <div key={st.run}>
            <Ring size={603.5} dur={1.9} delay={0.18} />
            <Ring size={269.7} dur={1.5} delay={0} />
          </div>
        )}
        <motion.div
          className="apa__success"
          style={{ x: "-50%", y: "-50%" }}
          initial={false}
          animate={{ scale: listShown ? 0.86 : 1 }}
          transition={{ duration: 0.8, ease: EZ }}
        >
          <span className="apa__success-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <motion.path
                key={st.run}
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: listShown ? 0 : 1 }}
                transition={{ duration: 0.6, delay: listShown ? 0 : 0.5, ease: CSS_EASE }}
              />
            </svg>
          </span>
          <span className="apa__success-text">
            <span className="apa__success-title">Guest Card Updates</span>
            <span className="apa__success-subtitle">4 fields written to Lia’s guest card</span>
          </span>
        </motion.div>
      </motion.div>

      {/* checklist state */}
      <motion.div
        className="apa__layer apa__layer--list"
        style={{ y: listShown ? 0 : 14 }}
        initial={false}
        animate={{ opacity: listShown ? 1 : 0 }}
        transition={{ duration: 0.45, ease: CSS_EASE }}
      >
        <div className="apa__cards" ref={listRef} key={st.run}>
          {ROWS.map((row, i) => {
            const on = st.checked > i;
            return (
              <motion.div
                className="apa__card"
                key={row.label}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                initial={{ opacity: 0, y: 14, scale: 1 }}
                animate={rowAnim(i)}
              >
                <div className="apa__card-left">
                  <motion.span
                    className="apa__checkbox"
                    ref={(el) => {
                      boxRefs.current[i] = el;
                    }}
                    initial={false}
                    animate={{
                      backgroundColor: on ? "#6b4fff" : "#ffffff",
                      boxShadow: on ? "inset 0 0 0 0px rgba(214,212,210,0)" : "inset 0 0 0 1px rgba(214,212,210,1)",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.img
                      src={iconCheck}
                      alt=""
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
                      transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.25, ease: EZ } }}
                    />
                  </motion.span>
                  <span className="apa__card-text">
                    <span className="apa__card-label">{row.label}</span>
                    <span className="apa__card-value">{row.value}</span>
                  </span>
                </div>
                <span className="apa__chip">
                  <img className="apa__chip-icon" src={iconPlay} alt="" />
                  {row.time}
                </span>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          className="apa__cursor"
          style={{ x: cx, y: cy }}
          initial={false}
          animate={{ opacity: cur.on ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.img
            src={cursorArrow}
            alt=""
            style={{ transformOrigin: `${CURSOR_TIP.x}px ${CURSOR_TIP.y}px` }}
            initial={false}
            animate={{ scale: cur.click ? 0.86 : 1 }}
            transition={{ duration: 0.12 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
