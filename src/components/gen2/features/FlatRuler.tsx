import { useLayoutEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type MotionStyle } from "framer-motion";
import NewTag from "../shared/NewTag";
import { EZ } from "../shared/motion";
import { FEATURES } from "./featuresData";

export interface FlatRulerProps {
  active: number;
  goTo: (i: number) => void;
  /** Hide from pointer / AT while faded out (Flatten choreography). */
  hidden?: boolean;
  className?: string;
  style?: MotionStyle;
}

/** Snap: .55s cubic-bezier(.22,.8,.24,1) (handoff 03). */
const SNAP = { duration: 0.55, ease: EZ } as const;

/**
 * Flat product ruler (handoff 03 "Flatten", desktop ≥1001). Six Plex Mono caps names spread
 * across the row (first flush left with the feature copy, last flush right, equal gaps);
 * the active one turns #0E0D0C. Under them an Attio-style tick track (1×8 #DDDCDA every
 * 13px, bottom-aligned, ends masked 4%) carries a 1×12 purple tick; on every product change
 * the track snaps so that tick sits under the centre of the active name. It never follows
 * scroll continuously. Names smooth-scroll to their product.
 */
export default function FlatRuler({ active, goTo, hidden = false, className, style }: FlatRulerProps) {
  const reduced = !!useReducedMotion();
  const rowRef = useRef<HTMLElement>(null);
  const nameRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const centres = useRef<number[]>([]);
  const x = useMotionValue(0);
  const placed = useRef(false);
  const activeRef = useRef(active);

  /* Measure each name's text centre relative to the row; re-place on resize (no animation). */
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const r = row.getBoundingClientRect();
      centres.current = nameRefs.current.map((el) => {
        if (!el) return 0;
        const b = el.getBoundingClientRect();
        return b.left - r.left + b.width / 2;
      });
      x.set(Math.round(centres.current[activeRef.current] ?? 0));
      placed.current = true;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(row);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [x]);

  useLayoutEffect(() => {
    activeRef.current = active;
    if (!placed.current) return;
    const to = Math.round(centres.current[active] ?? 0);
    if (reduced) {
      x.set(to);
      return;
    }
    const c = animate(x, to, SNAP);
    return () => c.stop();
  }, [active, reduced, x]);

  return (
    <motion.div
      className={["g2f-flat", className].filter(Boolean).join(" ")}
      style={style}
      aria-hidden={hidden || undefined}
      inert={hidden}
    >
      <nav ref={rowRef} className="g2f-flat__names" aria-label="Products">
        {FEATURES.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className={i === active ? "g2f-flat__name is-on" : "g2f-flat__name"}
            aria-current={i === active ? "step" : undefined}
            onClick={() => goTo(i)}
          >
            <span ref={(el) => void (nameRefs.current[i] = el)}>{f.name}</span>
            {f.isNew && <NewTag />}
          </button>
        ))}
      </nav>
      <div className="g2f-flat__ticks" aria-hidden>
        <div className="g2f-flat__band">
          <motion.div className="g2f-flat__track" style={{ x }} />
        </div>
        <motion.i className="g2f-flat__active" style={{ x }} />
      </div>
    </motion.div>
  );
}
