import { useEffect, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Runs an async animation sequence while `ref` is in view. Restarts from the top on
 * every re-entry; `alive()` turns false when the element leaves view or unmounts, so
 * sequences should bail out after each await. Under reduced motion the sequence never
 * runs and `reduced` is true, so components render their final frame.
 *
 *   const { inView, reduced } = useLoop(ref, async ({ wait, alive }) => {
 *     while (alive()) { setStep(0); await wait(800); setStep(1); await wait(1200); }
 *   });
 */
export function useLoop(
  ref: RefObject<Element | null>,
  run: (api: { wait: (ms: number) => Promise<boolean>; alive: () => boolean }) => Promise<void>,
  opts: { amount?: number; once?: boolean } = {},
) {
  const inView = useInView(ref, { amount: opts.amount ?? 0.3, once: opts.once });
  const reduced = !!useReducedMotion();
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let on = true;
    const alive = () => on;
    const wait = (ms: number) =>
      new Promise<boolean>((r) => setTimeout(() => r(on), ms));
    setRunId((n) => n + 1);
    run({ wait, alive }).catch(() => {});
    return () => {
      on = false;
    };
    // `run` is intentionally not a dependency: sequences are restarted by visibility only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  return { inView, reduced, runId };
}
