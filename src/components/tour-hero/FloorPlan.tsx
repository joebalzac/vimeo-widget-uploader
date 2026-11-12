import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PLAN_PIECES } from "./planPieces";

/** Room labels, Figma 512:29156 text nodes (top-left in the 1440 x 880 frame). */
const LABELS: { text: string; x: number; y: number }[] = [
  { text: "Pantry", x: 1028.28, y: 108.02 },
  { text: "Kitchen", x: 736.35, y: 195.5 },
  { text: "Dining", x: 1226.48, y: 199.7 },
  { text: "Patio", x: 1229.11, y: 406.32 },
  { text: "Bedroom", x: 128.99, y: 566 },
  { text: "Guest Room", x: 180, y: 180.5 },
  { text: "Living", x: 680.4, y: 776.36 },
];

const EASE_IO = [0.65, 0, 0.35, 1] as const;

/**
 * The 1440 x 880 floor-plan illustration from Figma frame 512:29156.
 * Every piece is the SVG Figma exports for that layer, placed at its render-bounds origin,
 * in Figma layer order (the walls sit between the furniture and the last few fixtures).
 *
 * Intro (replays whenever `run` changes): the walls open out from the centre of the
 * plan (1.3s), each other piece fades/settles in staggered outward from the centre over
 * ~0.9s, then the room labels fade in.
 */
export default function FloorPlan({ run }: { run: number }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduce) return;
    const pieces = [...root.querySelectorAll<HTMLElement>(".tih-plan__piece")];
    const box = root.getBoundingClientRect();
    if (!box.width) return;
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    const maxD = Math.hypot(box.width / 2, box.height / 2);
    const anims = pieces.map((el) => {
      const r = el.getBoundingClientRect();
      const k = Math.min(1, Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy) / maxD);
      return el.animate(
        [
          { opacity: 0, transform: "scale(.96)" },
          { opacity: 1, transform: "scale(1)" },
        ],
        { duration: 900, delay: 250 + k * 900, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" }
      );
    });
    return () => anims.forEach((a) => a.cancel());
  }, [run, reduce]);

  const fadeLate = reduce
    ? undefined
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.7, delay: 1.1, ease: "easeOut" as const } };

  return (
    <div className="tih-plan" aria-hidden="true" ref={rootRef}>
      {PLAN_PIECES.map((p, i) =>
        p.kind === "walls" ? (
          <motion.img
            key={`walls-${run}`}
            className="tih-plan__walls"
            src={p.src}
            alt=""
            style={{ left: p.x, top: p.y }}
            initial={reduce ? false : { clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(75% at 50% 50%)" }}
            transition={{ duration: 1.3, ease: EASE_IO }}
          />
        ) : (
          <img key={i} className="tih-plan__piece" src={p.src} alt="" style={{ left: p.x, top: p.y }} />
        )
      )}
      <motion.div key={`lbl-${run}`} className="tih-plan__labels" {...fadeLate}>
        {LABELS.map((l) => (
          <span key={l.text} className="tih-plan__label" style={{ left: l.x, top: l.y }}>
            {l.text}
          </span>
        ))}
      </motion.div>
      {/* Figma inner shadows (512:29761 / 512:29791): one at full strength, one at 50% */}
      <div className="tih-plan__vignette" />
      <div className="tih-plan__vignette tih-plan__vignette--half" />
    </div>
  );
}
