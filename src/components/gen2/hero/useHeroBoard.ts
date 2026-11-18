import { useRef, useState, type RefObject } from "react";
import {
  animate,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { E, SPRING_FLY, SPRING_TILT, useLoop } from "../shared";
import {
  BACKFILL,
  COLUMN_SIZE,
  INITIAL_BOARD,
  KIND_LABEL,
  NEW_LEADS,
  TOUR_KINDS,
  TOUR_TIMES,
  type BoardCardData,
  type BoardState,
} from "./boardData";

/** Flyer tilt: degrees per px/s of horizontal speed, clamped to ±6°. */
const TILT_PER_SPEED = 1 / 160;
const MAX_TILT = 6;

type Wait = (ms: number) => Promise<boolean>;

const residentId = (prospectId: string) => `res-${prospectId}`;

function setChip(list: BoardCardData[], id: string, chip: string) {
  return list.map((c) => (c.id === id ? { ...c, chip } : c));
}

/** Residents' second chip (WORK ORDER / RENEWAL OFFER); undefined clears it. */
function setTag(list: BoardCardData[], id: string, tag: string | undefined) {
  return list.map((c) => (c.id === id ? { ...c, tag } : c));
}

/**
 * Hero board state + the ~13s story loop (handoff 02-hero):
 *   1. Lease → Residents (chip swaps, then the flyer glides from Prospects to Residents)
 *   2. New inquiry pops in at the top of Prospects
 *   3. Book a tour: INQUIRY → SCHEDULING TOUR → SCHEDULED TOUR, tour pops into Calendar
 *   4. Tour completes → TOURED
 *   5. Residents: a WORK ORDER chip clears, the new resident goes FUTURE → CURRENT
 *
 * The loop never resets: each cycle picks its actors from the current board, so the
 * story keeps rolling. It pauses off-screen (useLoop) and settles any half-finished
 * beat when it resumes. Reduced motion: the initial board, static.
 */
export function useHeroBoard(boardRef: RefObject<HTMLDivElement | null>) {
  const reducedPref = !!useReducedMotion();
  const seen = useInView(boardRef, { once: true, amount: 0.15 });
  const started = seen || reducedPref;

  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const stateRef = useRef<BoardState>(INITIAL_BOARD);
  const seq = useRef(0);
  const introDone = useRef(false);

  /* Flyer motion: position + lift scale, and a tilt that follows horizontal speed. */
  const fx = useMotionValue(0);
  const fy = useMotionValue(0);
  const fscale = useMotionValue(1);
  const vx = useVelocity(fx);
  const tiltTarget = useTransform(vx, (v) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v * TILT_PER_SPEED)));
  const tilt = useSpring(tiltTarget, SPRING_TILT);

  const update = (fn: (s: BoardState) => BoardState) => {
    stateRef.current = fn(stateRef.current);
    setBoard(stateRef.current);
  };
  const next = () => seq.current++;
  const backfill = (): BoardCardData => {
    const n = next();
    return { id: `bf-${n}`, ...BACKFILL[n % BACKFILL.length], chip: "INQUIRY", pop: true };
  };

  /** Finish any beat interrupted by leaving the viewport, so a restart starts clean. */
  const settle = () => {
    update((s) => {
      const moved = new Set(s.residents.filter((c) => c.twin).map((c) => c.id));
      let prospects = s.prospects.filter((c) => !moved.has(residentId(c.id)) && c.id !== s.slotId);
      while (prospects.length < COLUMN_SIZE) prospects = [...prospects, backfill()];
      prospects = prospects.map((c) =>
        c.chip === "SIGNING LEASE" || c.chip === "LEASE SIGNED"
          ? { ...c, chip: "TOURED" }
          : c.chip === "SCHEDULING TOUR"
            ? { ...c, chip: "SCHEDULED TOUR" }
            : c,
      );
      const residents = s.residents.map((c) =>
        c.twin || c.chip === "LEASE SIGNED" ? { ...c, twin: false, chip: c.chip === "LEASE SIGNED" ? "FUTURE" : c.chip } : c,
      );
      return { ...s, prospects, residents, slotId: null, flight: null };
    });
    tilt.jump(0);
  };

  /* ── Beats. Each returns false when the loop should stop (off-screen / unmounted). ── */

  const leaseBeat = async (wait: Wait): Promise<string | null> => {
    const s = stateRef.current;
    const p =
      s.prospects.find((c, i) => i < 3 && c.chip === "TOURED") ?? s.prospects.find((c) => c.chip === "TOURED");
    if (!p) return null;

    update((st) => ({ ...st, prospects: setChip(st.prospects, p.id, "SIGNING LEASE") }));
    if (!(await wait(1500))) return "";
    update((st) => ({ ...st, prospects: setChip(st.prospects, p.id, "LEASE SIGNED") }));

    // Residents makes room first: an invisible twin at the top (bottom card exits).
    const rid = residentId(p.id);
    const twin: BoardCardData = { id: rid, name: p.name, sub: p.sub, chip: "LEASE SIGNED", pop: true, twin: true };
    update((st) => ({ ...st, residents: [twin, ...st.residents].slice(0, COLUMN_SIZE) }));
    if (!(await wait(1200))) return "";

    const root = boardRef.current;
    const src = root?.querySelector<HTMLElement>(`[data-card-id="${p.id}"]`);
    const dst = root?.querySelector<HTMLElement>(`[data-card-id="${rid}"]`);
    if (root && src && dst) {
      const rb = root.getBoundingClientRect();
      const a = src.getBoundingClientRect();
      const ax = a.left - rb.left;
      const ay = a.top - rb.top;
      fx.jump(ax);
      fy.jump(ay);
      fscale.jump(1);
      tilt.jump(0);
      // The real card becomes a dashed slot; an identical flyer lifts off it.
      update((st) => ({
        ...st,
        slotId: p.id,
        flight: { card: { ...p, chip: "LEASE SIGNED" }, w: a.width, h: a.height },
      }));
      animate(fscale, 1.035, { duration: 0.28, ease: E });
      animate(fy, ay - 6, { duration: 0.28, ease: E });
      if (!(await wait(280))) return "";

      const b = dst.getBoundingClientRect();
      const glide = Promise.all([
        animate(fx, b.left - rb.left, SPRING_FLY),
        animate(fy, b.top - rb.top, SPRING_FLY),
        animate(fscale, 1, SPRING_FLY),
      ]);
      // Prospects closes up 0.38s after the lift.
      if (!(await wait(100))) return "";
      update((st) => ({
        ...st,
        slotId: null,
        prospects: [...st.prospects.filter((c) => c.id !== p.id), backfill()],
      }));
      await glide;
    } else {
      update((st) => ({ ...st, prospects: [...st.prospects.filter((c) => c.id !== p.id), backfill()] }));
    }
    // Set down exactly on the twin, then swap: no blink.
    update((st) => ({
      ...st,
      flight: null,
      residents: st.residents.map((c) => (c.id === rid ? { ...c, twin: false } : c)),
    }));
    return rid;
  };

  const run = async ({ wait, alive }: { wait: Wait; alive: () => boolean }) => {
    settle();
    if (!(await wait(introDone.current ? 700 : 2300))) return;
    introDone.current = true;

    while (alive()) {
      /* 1 · Lease → Residents */
      const rid = await leaseBeat(wait);
      if (rid === "") return;
      if (rid) {
        if (!(await wait(400))) return;
        update((st) => ({ ...st, residents: setChip(st.residents, rid, "FUTURE") }));
        if (!(await wait(800))) return;
      }

      /* 2 · New inquiry pops in at the top of Prospects (the bottom card exits) */
      const n = next();
      const lead: BoardCardData = { id: `lead-${n}`, ...NEW_LEADS[n % NEW_LEADS.length], chip: "INQUIRY", pop: true };
      update((st) => ({ ...st, prospects: [lead, ...st.prospects].slice(0, COLUMN_SIZE) }));
      if (!(await wait(600))) return;
      // Keep the Residents story supplied: a fresh work order lands lower in the column.
      if (!stateRef.current.residents.some((c, i) => i >= 1 && i <= 4 && c.tag === "WORK ORDER")) {
        const r = stateRef.current.residents.find((c, i) => i >= 2 && i <= 4 && c.chip === "CURRENT" && !c.tag);
        if (r) update((st) => ({ ...st, residents: setTag(st.residents, r.id, "WORK ORDER") }));
      }
      if (!(await wait(600))) return;

      /* 3 · Book a tour */
      const ps = stateRef.current.prospects;
      const booker =
        ps.find((c, i) => i >= 1 && i <= 4 && c.chip === "INQUIRY") ?? ps.find((c) => c.chip === "INQUIRY");
      if (booker) {
        update((st) => ({ ...st, prospects: setChip(st.prospects, booker.id, "SCHEDULING TOUR") }));
        if (!(await wait(1400))) return;
        update((st) => ({ ...st, prospects: setChip(st.prospects, booker.id, "SCHEDULED TOUR") }));
        if (!(await wait(300))) return;
        const kind = TOUR_KINDS[n % TOUR_KINDS.length];
        const tour: BoardCardData = {
          id: `tour-${n}`,
          name: booker.name,
          sub: `${KIND_LABEL[kind]} @ ${booker.sub}`,
          time: TOUR_TIMES[n % TOUR_TIMES.length],
          kind,
          pop: true,
        };
        update((st) => ({ ...st, calendar: [tour, ...st.calendar].slice(0, COLUMN_SIZE) }));
        if (!(await wait(1300))) return;
      }

      /* 4 · Tour completes: a scheduled prospect in the top 3 → TOURED (feeds the next lease) */
      const ps2 = stateRef.current.prospects;
      const toured =
        ps2.find((c, i) => i <= 2 && c.chip === "SCHEDULED TOUR" && c.id !== booker?.id) ??
        ps2.find((c) => c.chip === "SCHEDULED TOUR" && c.id !== booker?.id);
      if (toured) {
        update((st) => ({ ...st, prospects: setChip(st.prospects, toured.id, "TOURED") }));
        if (!(await wait(1200))) return;
      }

      /* 5 · Residents: a work order clears, the new resident moves in */
      const wo = stateRef.current.residents.find((c) => c.tag === "WORK ORDER");
      if (wo) {
        update((st) => ({ ...st, residents: setTag(st.residents, wo.id, undefined) }));
        if (!(await wait(700))) return;
      }
      if (rid && stateRef.current.residents.some((c) => c.id === rid)) {
        update((st) => ({ ...st, residents: setChip(st.residents, rid, "CURRENT") }));
      }
      if (!(await wait(1400))) return;
    }
  };

  const { reduced } = useLoop(boardRef, run, { amount: 0.3 });

  return {
    board,
    started,
    reduced: reduced || reducedPref,
    flyer: { x: fx, y: fy, scale: fscale, rotate: tilt },
  };
}
