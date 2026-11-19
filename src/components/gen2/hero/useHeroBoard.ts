import { useEffect, useRef, useState, type RefObject } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { E, SPRING_FLY, SPRING_TILT } from "../shared";
import {
  BOOKED_TOUR,
  COLUMN_SIZE,
  FINAL_BOARD,
  INITIAL_BOARD,
  MAYA_RESIDENT_ID,
  NEW_LEAD,
  RESCHEDULED_TIME,
  type BoardCardData,
  type BoardState,
  type ColumnKey,
} from "./boardData";

/** Flyer tilt: degrees per px/s of horizontal speed, clamped to ±6°. */
const TILT_PER_SPEED = 1 / 160;
const MAX_TILT = 6;

/** Sequence starts this long after the board comes into view (the load-in wave ends ~1.5s). */
const INTRO_MS = 2200;
/** Visibility poll for the pausable clock. */
const TICK_MS = 50;

type Patch = Partial<BoardCardData>;
type Step = { at: number; run: () => void | Promise<void> };

function patchCard(list: BoardCardData[], id: string, patch: Patch) {
  return list.map((c) => (c.id === id ? { ...c, ...patch } : c));
}

/**
 * Hero board state + the one-pass "Elise acting" sequence (handoff 02-hero, v108 progress
 * rules + v120 wording). The board plays ONCE, only while in view (the clock pauses when it
 * scrolls away), then holds FINAL_BOARD. Reduced motion shows FINAL_BOARD straight away.
 *
 * Rules the timeline keeps: at most two progress states on screen; every progress start/end
 * is ≥700ms from any other; two progress cards are never adjacent in a column; one progress
 * per prospect step; every progress state plays in a column's top three rows (above the
 * bottom fade). Times (ms, from the sequence start, 2.2s after the board is in view):
 *
 *     0  + Calendar  Camille (row 1)   "Rescheduling Tour"
 *   700  + Residents Clara (row 1)     "Assigning Work Order"
 *  1500  - Camille → 4:30 PM, change pop
 *  2200  + Prospects Jordan (row 1)    "Scheduling Tour"
 *  2900  - Clara → CURRENT (work order cleared, before the lease is signed)
 *  3600  - Jordan → SCHEDULED TOUR
 *  4300  + Calendar  Jordan's tour pops in at the top, "Confirming" (Ethan exits)
 *  5000  + Residents Malcolm (row 0)   "Collecting Rent"
 *  5700  - Jordan's tour: 1:30 PM fades in
 *  6400  + Residents Clara 2 (row 2)   "Sending Offer"
 *  7400  - Malcolm → CURRENT · RENT PAID
 *  8100  - Clara 2 → CURRENT · RENEWED   (700ms after rent)
 *  8800  + Prospects Maya (row 2)      "Processing Application"
 * 10300  - Maya → LEASE SIGNED; Residents makes room (invisible twin, Grace exits)
 * 11300    flyer lifts; 11580 glides to Residents; 11680 Prospects closes up and
 *        + Prospects Aisha (new lead pops in at the top) "Responding"
 * 12400  + Residents Clara (now row 2) "Predicting Renewal"   (≈12.6 flyer lands)
 * 13000    Maya (Residents) LEASE SIGNED → FUTURE
 * 13400  - Aisha → INQUIRY
 * 14400  - Clara → CURRENT · RENEWAL OFFER  → holds FINAL_BOARD
 */
export function useHeroBoard(boardRef: RefObject<HTMLDivElement | null>) {
  const reduced = !!useReducedMotion();
  const seen = useInView(boardRef, { once: true, amount: 0.15 });
  const inView = useInView(boardRef, { amount: 0.3 });
  const started = seen || reduced;

  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const stateRef = useRef<BoardState>(INITIAL_BOARD);
  const visibleRef = useRef(false);
  visibleRef.current = inView;
  const [go, setGo] = useState(false);
  useEffect(() => {
    if (inView) setGo(true);
  }, [inView]);

  /* Flyer motion: position + lift scale, and a tilt that follows horizontal speed. */
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fscale = useMotionValue(1);
  const vx = useVelocity(fx);
  const tiltTarget = useTransform(vx, (v) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v * TILT_PER_SPEED)));
  const tilt = useSpring(tiltTarget, SPRING_TILT);

  useEffect(() => {
    if (!go || reduced) return;
    let alive = true;

    const update = (fn: (s: BoardState) => BoardState) => {
      if (!alive) return;
      stateRef.current = fn(stateRef.current);
      setBoard(stateRef.current);
    };
    const patch = (col: ColumnKey, id: string, p: Patch) =>
      update((s) => ({ ...s, [col]: patchCard(s[col], id, p) }));
    const pushTop = (col: ColumnKey, card: BoardCardData) =>
      update((s) => ({ ...s, [col]: [card, ...s[col]].slice(0, COLUMN_SIZE) }));

    /* Pausable clock: only counts time while the board is in view. */
    let clock = 0;
    let last = performance.now();
    const until = (t: number) =>
      new Promise<boolean>((resolve) => {
        const tick = () => {
          const now = performance.now();
          if (visibleRef.current) clock += now - last;
          last = now;
          if (!alive) return resolve(false);
          if (clock >= t) return resolve(true);
          setTimeout(tick, Math.min(TICK_MS, Math.max(1, t - clock)));
        };
        tick();
      });
    /* Plain delays inside a beat (the flyer's motion is already committed). */
    const delay = (ms: number) => new Promise<boolean>((r) => setTimeout(() => r(alive), ms));

    /** Maya: LEASE SIGNED card lifts off Prospects and glides to the top of Residents. */
    const flyMaya = async () => {
      const p = stateRef.current.prospects.find((c) => c.id === "p-maya");
      const root = boardRef.current;
      const src = root?.querySelector<HTMLElement>('[data-card-id="p-maya"]');
      const dst = root?.querySelector<HTMLElement>(`[data-card-id="${MAYA_RESIDENT_ID}"]`);
      const closeUp = () =>
        update((s) => ({
          ...s,
          slotId: null,
          // Prospects closes up and the new lead pops in at the top, "Responding".
          prospects: [{ ...NEW_LEAD, chip: undefined, progress: "Responding" }, ...s.prospects.filter((c) => c.id !== "p-maya")],
        }));
      if (!p || !root || !src || !dst) {
        closeUp();
        patch("residents", MAYA_RESIDENT_ID, { twin: false });
        return;
      }
      const rb = root.getBoundingClientRect();
      const a = src.getBoundingClientRect();
      const ax = a.left - rb.left;
      const ay = a.top - rb.top;
      fx.jump(ax);
      fy.jump(ay);
      fscale.jump(1);
      tilt.jump(0);
      // The real card becomes a dashed slot; an identical flyer lifts off it.
      update((s) => ({ ...s, slotId: p.id, flight: { card: { ...p }, w: a.width, h: a.height } }));
      animate(fscale, 1.035, { duration: 0.28, ease: E });
      animate(fy, ay - 6, { duration: 0.28, ease: E });
      if (!(await delay(280))) return;

      const b = dst.getBoundingClientRect();
      const glide = Promise.all([
        animate(fx, b.left - rb.left, SPRING_FLY),
        animate(fy, b.top - rb.top, SPRING_FLY),
        animate(fscale, 1, SPRING_FLY),
      ]);
      // Prospects closes up 0.38s after the lift.
      if (!(await delay(100))) return;
      closeUp();
      await glide;
      // Set down exactly on the twin, then swap: no blink.
      update((s) => ({
        ...s,
        flight: null,
        residents: patchCard(s.residents, MAYA_RESIDENT_ID, { twin: false }),
      }));
    };

    const steps: Step[] = [
      // Opener: Camille's tour is rescheduled 2:15 PM → 4:30 PM.
      { at: 0, run: () => patch("calendar", "c-camille", { progress: "Rescheduling Tour" }) },
      { at: 700, run: () => patch("residents", "r-clara", { progress: "Assigning Work Order" }) },
      {
        at: 1500,
        run: () => patch("calendar", "c-camille", { progress: undefined, time: RESCHEDULED_TIME, flash: 1 }),
      },
      // Booking: INQUIRY → "Scheduling Tour" → SCHEDULED TOUR → the tour lands in Calendar.
      { at: 2200, run: () => patch("prospects", "p-jordan", { progress: "Scheduling Tour" }) },
      { at: 2900, run: () => patch("residents", "r-clara", { progress: undefined, tag: undefined }) },
      { at: 3600, run: () => patch("prospects", "p-jordan", { progress: undefined, chip: "SCHEDULED TOUR" }) },
      { at: 4300, run: () => pushTop("calendar", { ...BOOKED_TOUR, progress: "Confirming" }) },
      { at: 5000, run: () => patch("residents", "r-malcolm", { progress: "Collecting Rent" }) },
      { at: 5700, run: () => patch("calendar", BOOKED_TOUR.id, { progress: undefined }) },
      { at: 6400, run: () => patch("residents", "r-clara-2", { progress: "Sending Offer" }) },
      { at: 7400, run: () => patch("residents", "r-malcolm", { progress: undefined, tag: "RENT PAID" }) },
      { at: 8100, run: () => patch("residents", "r-clara-2", { progress: undefined, tag: "RENEWED" }) },
      // Lease: TOURED → "Processing Application" → LEASE SIGNED → moves to Residents.
      { at: 8800, run: () => patch("prospects", "p-maya", { progress: "Processing Application" }) },
      {
        at: 10300,
        run: () => {
          patch("prospects", "p-maya", { progress: undefined, chip: "LEASE SIGNED" });
          // Residents makes room first: an invisible twin at the top (the bottom card exits).
          pushTop("residents", {
            id: MAYA_RESIDENT_ID,
            name: "Maya Patel",
            sub: "Aura Estates",
            chip: "LEASE SIGNED",
            pop: true,
            twin: true,
          });
        },
      },
      // Lift at 11300, glide 11580, close-up + Aisha "Responding" at 11680, lands ≈12.6s.
      { at: 11300, run: () => void flyMaya() },
      { at: 12400, run: () => patch("residents", "r-clara", { progress: "Predicting Renewal" }) },
      { at: 13000, run: () => patch("residents", MAYA_RESIDENT_ID, { chip: "FUTURE" }) },
      { at: 13400, run: () => patch("prospects", NEW_LEAD.id, { progress: undefined, chip: "INQUIRY" }) },
      { at: 14400, run: () => patch("residents", "r-clara", { progress: undefined, tag: "RENEWAL OFFER" }) },
    ];

    (async () => {
      // Fresh start (also covers StrictMode's mount → unmount → mount in dev).
      stateRef.current = INITIAL_BOARD;
      setBoard(INITIAL_BOARD);
      if (!(await until(INTRO_MS))) return;
      clock = 0;
      for (const step of steps) {
        if (!(await until(step.at))) return;
        await step.run();
      }
    })();

    return () => {
      alive = false;
    };
    // The flyer motion values are stable; the sequence runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, reduced]);

  return {
    board: reduced ? FINAL_BOARD : board,
    started,
    reduced,
    flyer: { x: fx, y: fy, scale: fscale, rotate: tilt },
  };
}
