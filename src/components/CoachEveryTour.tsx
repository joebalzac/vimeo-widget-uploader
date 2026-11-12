import "../utils/interVariableFont";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import "./CoachEveryTour.css";
import trackLine from "../assets/bento/track-line.svg";

interface ScoreRow {
  label: string;
  points: number;
  color: "mint" | "coral" | "amber";
}

const ROWS: ScoreRow[] = [
  { label: "Establishing Rapport", points: 14, color: "mint" },
  { label: "Identifying Needs", points: 3, color: "coral" },
  { label: "Providing Solutions", points: 7, color: "amber" },
  { label: "Closing", points: 12, color: "mint" },
];

/** The design's bars scale at 24.4px per point against a 366px track. */
const MAX_POINTS = 15;
const GROW_S = 1.8;
const START_DELAY_MS = 350;
const outCubic = (k: number) => 1 - Math.pow(1 - k, 3);

/** zero = empty, grow = animating in, rest = final values (static). */
type Phase = "zero" | "grow" | "rest";

function CoachRow({ row, ph }: { row: ScoreRow; ph: Phase }) {
  const mv = useMotionValue(ph === "rest" ? row.points : 0);
  const txt = useTransform(mv, (v) => `${Math.round(v)}pts`);
  useEffect(() => {
    if (ph === "zero") {
      mv.stop();
      mv.set(0);
    } else if (ph === "grow") {
      const c = animate(mv, row.points, { duration: GROW_S, ease: outCubic });
      return () => c.stop();
    } else if (!mv.isAnimating()) {
      mv.set(row.points);
    }
  }, [ph, mv, row.points]);
  const width = `${(row.points / MAX_POINTS) * 100}%`;
  return (
    <div className="cet__row">
      <div className="cet__labels">
        <span className="cet__label">{row.label}</span>
        <motion.span className="cet__points">{txt}</motion.span>
      </div>
      <div className="cet__track">
        <img className="cet__track-line" src={trackLine} alt="" />
        <motion.div
          className={`cet__bar cet__bar--${row.color}`}
          initial={false}
          animate={{ width: ph === "zero" ? "0%" : width }}
          transition={ph === "grow" ? { duration: GROW_S, ease: outCubic } : { duration: 0 }}
        />
      </div>
    </div>
  );
}

/**
 * CoachEveryTour — scoring rubric preview for the "Coach Every Tour" bento
 * card. Figma: node 408:10883 (.com_2027).
 *
 * Plays when 35% visible and replays on every re-entry: after 350ms each bar
 * grows from zero over 1.8s while its points count up over the same duration.
 */
export default function CoachEveryTour() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [seq, setSeq] = useState<{ run: number; grown: boolean }>({ run: 0, grown: false });
  /* Server/static render shows the final scores (14 / 3 / 7 / 12). On the client the bars
     empty before the first paint, so the grow-in still plays from zero. */
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!play || reduce) return;
    const t0 = setTimeout(() => setSeq((s) => ({ run: s.run + 1, grown: false })), 0);
    const t1 = setTimeout(() => setSeq((s) => ({ ...s, grown: true })), START_DELAY_MS);
    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
    };
  }, [play, reduce]);

  /* static render: rest; before the first play: empty; in view: zero -> grow; once played and out of view: rest */
  const ph: Phase = reduce || !mounted
    ? "rest"
    : play
      ? seq.grown
        ? "grow"
        : "zero"
      : seq.run > 0
        ? "rest"
        : "zero";

  return (
    <div className="cet" ref={ref}>
      <div className="cet__rows">
        {ROWS.map((row) => (
          <CoachRow key={row.label} row={row} ph={ph} />
        ))}
      </div>
    </div>
  );
}
