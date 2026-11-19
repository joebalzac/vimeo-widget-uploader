import { useEffect, useLayoutEffect, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/* Motion tokens exactly as the Final prototype defines them (E differs from shared/motion's E). */
export const EZ = [0.22, 0.8, 0.24, 1] as const;
export const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
export const E = [0.22, 1, 0.36, 1] as const;
export const DRAW = [0.65, 0, 0.35, 1] as const;
/** Hero card layout ease (prototype HB_E). */
export const HB_E = [0.32, 0.72, 0, 1] as const;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Prototype useMedia: live matchMedia boolean. */
export function useMedia(q: string) {
  const [m, set] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const f = () => set(window.matchMedia(q).matches);
    f();
    mq.addEventListener("change", f);
    window.addEventListener("resize", f);
    return () => {
      mq.removeEventListener("change", f);
      window.removeEventListener("resize", f);
    };
  }, [q]);
  return m;
}

/** Prototype useFit: scale so `base` px fits the element's width (≤ max). */
export function useFit(ref: RefObject<HTMLElement | null>, base: number, pad = 0, max = 1) {
  const [s, setS] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const f = () => setS(Math.min(max, Math.max(0.1, (el.clientWidth - pad) / base)));
    f();
    const ro = new ResizeObserver(f);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, base, pad, max]);
  return s;
}

/**
 * Prototype useSeq: runs `run(ok)` while `ref` is in view (≥ amount). `ok()` turns false when
 * the element leaves view or the component unmounts, so the async sequence stops.
 */
export function useSeq(
  ref: RefObject<Element | null>,
  run: (ok: () => boolean) => void,
  deps: unknown[] = [],
  amount = 0.35,
): [boolean, boolean] {
  const inV = useInView(ref, { amount });
  const reduce = !!useReducedMotion();
  useEffect(() => {
    if (!inV || reduce) return;
    const tok = { alive: true };
    run(() => tok.alive);
    return () => {
      tok.alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inV, reduce, ...deps]);
  return [inV, reduce];
}
