import { useEffect, type RefObject } from "react";
import type { Splide } from "@splidejs/react-splide";

/** Accumulated horizontal delta (px) needed before a gesture moves a slide. */
const THRESHOLD = 30;
/** Quiet time (ms) after the last wheel event that ends a gesture. */
const GESTURE_IDLE = 180;

/**
 * Horizontal side-scroll for Splide carousels: a trackpad side-swipe or
 * shift + mouse wheel advances one slide per gesture.
 *
 * Splide's built-in `wheel` option only reads deltaY, which would hijack
 * vertical page scrolling and ignore trackpad side-swipes, so this listens for
 * horizontal-dominant wheel events instead. Vertical scrolling over the
 * carousel passes through to the page untouched.
 */
export function useSplideWheel(splideRef: RefObject<Splide | null>) {
  useEffect(() => {
    const splide = splideRef.current?.splide;
    const root = splide?.root;
    if (!splide || !root) return;

    let accumulated = 0;
    let locked = false;
    let idleTimer: number | undefined;

    const onWheel = (e: WheelEvent) => {
      // Shift + wheel on a mouse reports vertical delta in some browsers.
      const dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
      if (Math.abs(dx) <= Math.abs(e.deltaY) && !e.shiftKey) return;

      // Stop the browser's back/forward swipe and horizontal overscroll.
      e.preventDefault();

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        accumulated = 0;
        locked = false;
      }, GESTURE_IDLE);

      // One slide per gesture: ignore the inertia tail once we've moved.
      if (locked) return;
      accumulated += dx;
      if (Math.abs(accumulated) < THRESHOLD) return;

      splide.go(accumulated > 0 ? ">" : "<");
      accumulated = 0;
      locked = true;
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      root.removeEventListener("wheel", onWheel);
      window.clearTimeout(idleTimer);
    };
  }, [splideRef]);
}
