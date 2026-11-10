import "../utils/interVariableFont";
import { useEffect, useRef, useState } from "react";
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

const ROW_DELAY_MS = 90;
const GROW_MS = 1100;
const HOLD_MS = 1800;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * Drives each row's progress (0..1) so its bar fill and point counter climb
 * together and land on their final values at the same instant, then holds
 * and loops.
 */
function useScoreReveal(rows: ScoreRow[]) {
  const [progress, setProgress] = useState<number[]>(() => rows.map(() => 0));

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const rowDelay = reduceMotion ? 0 : ROW_DELAY_MS;
    const growMs = reduceMotion ? 1 : GROW_MS;

    let raf = 0;
    let cancelled = false;
    let start: number | null = null;
    let holding = false;
    let holdStart = 0;

    const tick = (t: number) => {
      if (cancelled) return;
      if (start === null) start = t;
      const elapsed = t - start;

      if (!holding) {
        setProgress(
          rows.map((_, i) => {
            const rowElapsed = elapsed - i * rowDelay;
            const p = Math.min(Math.max(rowElapsed / growMs, 0), 1);
            return easeOutCubic(p);
          })
        );

        const totalNeeded = (rows.length - 1) * rowDelay + growMs;
        if (elapsed >= totalNeeded) {
          holding = true;
          holdStart = t;
        }
      } else if (t - holdStart >= HOLD_MS) {
        start = null;
        holding = false;
        setProgress(rows.map(() => 0));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [rows]);

  return progress;
}

/**
 * CoachEveryTour — scoring rubric preview for the "Coach Every Tour" bento
 * card. Figma: node 330:29043 (.com_2027).
 *
 * Loops: each bar fills left to right while its point total counts up, both
 * finishing together — then holds and resets.
 */
export default function CoachEveryTour() {
  const progress = useScoreReveal(ROWS);

  return (
    <div className="cet">
      <div className="cet__rows">
        {ROWS.map((row, i) => (
          <div className="cet__row" key={row.label}>
            <div className="cet__labels">
              <span className="cet__label">{row.label}</span>
              <span className="cet__points">
                {Math.round(row.points * progress[i])}pts
              </span>
            </div>
            <div className="cet__track">
              <img className="cet__track-line" src={trackLine} alt="" />
              <div
                className={`cet__bar cet__bar--${row.color}`}
                style={{
                  width: `${(row.points / MAX_POINTS) * 100 * progress[i]}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
