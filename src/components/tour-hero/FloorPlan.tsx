import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import FloorPlanFurniture from "./FloorPlanFurniture";
import walls from "../../assets/tour-hero/walls.svg";
import windows from "../../assets/tour-hero/windows.svg";
import livingRug from "../../assets/tour-hero/living-rug.svg";
import doorSwingTop from "../../assets/tour-hero/door-swing-top.svg";
import doorSwingBottom from "../../assets/tour-hero/door-swing-bottom.svg";

/** Room labels, Figma node 421:12829 (positions in the 1440 x 880 frame). */
const LABELS: { text: string; x: number; y: number; chip?: boolean }[] = [
  { text: "Guest Room", x: 320.01, y: 188.5 },
  { text: "Bedroom", x: 167.5, y: 763.42 },
  { text: "Bath", x: 500, y: 223, chip: true },
  { text: "Ensuite", x: 536, y: 758.42, chip: true },
  { text: "Cloak", x: 609, y: 119 },
  { text: "Kitchen", x: 897.06, y: 141 },
  { text: "Pantry", x: 1240, y: 89 },
  { text: "Fridge", x: 1316, y: 89 },
  { text: "Living", x: 785, y: 671 },
  { text: "Dining", x: 1154, y: 743.42 },
  { text: "Entry", x: 717, y: 82.5 },
];

const EASE_IO = [0.65, 0, 0.35, 1] as const;

/**
 * The 1440 x 880 floor-plan illustration from Figma frame 421:12169.
 * Layer order matches Figma: living rug, furniture & fixtures, walls, windows, labels.
 *
 * Intro (replays whenever `run` changes): the walls open out from the centre of the
 * plan (1.3s), each furniture piece fades/settles in staggered outward from the
 * centre over ~0.9s, then windows and labels fade in.
 */
export default function FloorPlan({ run }: { run: number }) {
  const reduce = useReducedMotion();
  const furnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = furnRef.current?.firstElementChild;
    if (!root || reduce) return;
    // Every image piece, plus the tile/hatch grids (containers with no images).
    const pieces = [
      ...root.querySelectorAll<HTMLElement>("img"),
      ...[...root.children].filter((el) => !el.querySelector("img")),
    ] as HTMLElement[];
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
    <div className="tih-plan" aria-hidden="true">
      <img className="tih-plan__rug" src={livingRug} alt="" />
      <div className="tih-plan__furniture" ref={furnRef}>
        <FloorPlanFurniture />
      </div>
      <motion.img
        key={`walls-${run}`}
        className="tih-plan__walls"
        src={walls}
        alt=""
        initial={reduce ? false : { clipPath: "circle(0% at 50% 50%)" }}
        animate={{ clipPath: "circle(75% at 50% 50%)" }}
        transition={{ duration: 1.3, ease: EASE_IO }}
      />
      <motion.img key={`win-${run}`} className="tih-plan__windows" src={windows} alt="" {...fadeLate} />
      <motion.div key={`lbl-${run}`} className="tih-plan__labels" {...fadeLate}>
        {LABELS.map((l) => (
          <span
            key={l.text}
            className={l.chip ? "tih-plan__label tih-plan__label--chip" : "tih-plan__label"}
            style={{ left: l.x, top: l.y }}
          >
            {l.text}
          </span>
        ))}
        <img className="tih-plan__door tih-plan__door--top" src={doorSwingTop} alt="" />
        <img className="tih-plan__door tih-plan__door--bottom" src={doorSwingBottom} alt="" />
      </motion.div>
      {/* Figma inner shadows (421:12849 / 421:12850): one at full strength, one at 50% */}
      <div className="tih-plan__vignette" />
      <div className="tih-plan__vignette tih-plan__vignette--half" />
    </div>
  );
}
