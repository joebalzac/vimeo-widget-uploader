import { useState, type RefObject } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { FEATURES } from "./featuresData";

const N = FEATURES.length;

/**
 * Scroll progress through the pinned track → active product, plus a `goTo(i)` that smooth
 * scrolls to product i. `rounding`:
 *  - "floor": each product owns an equal 1/N slice of the track (vertical-ruler layout).
 *  - "round": active = round(progress × (N−1)) (Flatten, handoff 03).
 */
export function useFeatureSteps(track: RefObject<HTMLDivElement | null>, rounding: "floor" | "round" = "floor") {
  const [active, setActive] = useState(0);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  const pick = (p: number) =>
    Math.max(0, Math.min(N - 1, rounding === "round" ? Math.round(p * (N - 1)) : Math.floor(p * N)));
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = pick(p);
    setActive((prev) => (prev === i ? prev : i));
  });

  /** Scroll the window to product `i` (the middle of its slice, or its exact stop when rounding). */
  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const f = rounding === "round" ? i / (N - 1) : (i + 0.5) / N;
    window.scrollTo({ top: top + f * travel, behavior: reduced ? "auto" : "smooth" });
  };

  return { active, goTo };
}
