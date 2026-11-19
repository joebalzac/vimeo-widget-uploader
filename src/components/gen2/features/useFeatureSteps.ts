import { useEffect, useState, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { FEATURES } from "./featuresData";

const N = FEATURES.length;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Calls `fn` (once per frame) whenever anything on the page scrolls or resizes. Scroll is
 * listened for in the capture phase on `document`, so it fires whether the page scrolls the
 * window or some other element (e.g. a Webflow body set to overflow, which breaks
 * window-based scroll hooks).
 */
export function usePageScroll(fn: () => void) {
  useEffect(() => {
    let raf = 0;
    const run = () => {
      raf = 0;
      fn();
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(run);
    };
    on();
    document.addEventListener("scroll", on, { capture: true, passive: true });
    window.addEventListener("resize", on);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("scroll", on, { capture: true });
      window.removeEventListener("resize", on);
    };
    // `fn` reads refs only; re-subscribing on every render isn't needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/** The element that actually scrolls `el` vertically (crossing shadow roots), or null for the window. */
function scrollerOf(el: Element): HTMLElement | null {
  let node: Node | null = el;
  while (node) {
    const parent: Node | null =
      (node as Element).parentElement ?? ((node.getRootNode() as ShadowRoot).host || null);
    if (!parent || parent === document.documentElement || parent === document.body) {
      // body / html scroll the window unless body itself is the scroller
      const body = document.body;
      return body.scrollHeight > body.clientHeight && /(auto|scroll)/.test(getComputedStyle(body).overflowY)
        ? body
        : null;
    }
    if (parent instanceof HTMLElement) {
      const oy = getComputedStyle(parent).overflowY;
      if (/(auto|scroll)/.test(oy) && parent.scrollHeight > parent.clientHeight) return parent;
    }
    node = parent;
  }
  return null;
}

/**
 * Scroll progress through the pinned track → active product, plus a `goTo(i)` that smooth
 * scrolls to product i. Progress is measured from the track's on-screen position, so it
 * works whichever element scrolls the page. `rounding`:
 *  - "floor": each product owns an equal 1/N slice of the track (vertical-ruler layout).
 *  - "round": active = round(progress × (N−1)).
 */
export function useFeatureSteps(track: RefObject<HTMLDivElement | null>, rounding: "floor" | "round" = "floor") {
  const [active, setActive] = useState(0);
  const reduced = !!useReducedMotion();

  const pick = (p: number) =>
    Math.max(0, Math.min(N - 1, rounding === "round" ? Math.round(p * (N - 1)) : Math.floor(p * N)));

  usePageScroll(() => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    const p = travel > 0 ? clamp01(-r.top / travel) : 0;
    const i = pick(p);
    setActive((prev) => (prev === i ? prev : i));
  });

  /** Scroll to product `i` (the middle of its slice, or its exact stop when rounding). */
  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const travel = r.height - window.innerHeight;
    const f = rounding === "round" ? i / (N - 1) : (i + 0.5) / N;
    const delta = r.top + f * travel;
    const behavior: ScrollBehavior = reduced ? "auto" : "smooth";
    const scroller = scrollerOf(el);
    if (scroller) scroller.scrollBy({ top: delta, behavior });
    else window.scrollBy({ top: delta, behavior });
  };

  return { active, goTo };
}
