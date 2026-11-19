import { useRef, useState, type RefObject } from "react";
import { HB_NEW, HB_TIME, initialBoard, type BoardState, type CalRow, type ChipKey, type PersonRow } from "./heroBoardData";
import { sleep, useSeq } from "./protoHooks";

/**
 * Port of the Final prototype's `useHeroBoard(ref, act)` with `act = true` ("Elise acting",
 * the only variant shipped). Plays the story once while the board is ≥30% in view, then holds
 * the final state. If the board leaves view mid-way it stops and replays from the start on return.
 *
 * `ref` is the scaled board stage (`.g2h-bst`); the flyer's from/to are measured inside it and
 * divided by its CSS scale.
 */
export function useHeroBoard(ref: RefObject<HTMLDivElement | null>): [BoardState, boolean] {
  const [st, setSt] = useState<BoardState>(initialBoard);
  /** Mirror of the latest state so the sequence can read it synchronously (prototype `get()`). */
  const cur = useRef<BoardState>(st);
  const played = useRef(false);

  const [, reduce] = useSeq(
    ref,
    async (ok) => {
      if (played.current) return;
      const S = (f: (x: BoardState) => Partial<BoardState>) => {
        const next = { ...cur.current, ...f(cur.current) };
        cur.current = next;
        setSt(next);
      };
      const reset = initialBoard();
      cur.current = reset;
      setSt(reset);
      const W = async (ms: number) => {
        await sleep(ms);
        return ok();
      };
      const get = () => cur.current;
      const chip = (col: "p" | "r", id: string, ks: ChipKey[]) =>
        S((x) => ({ [col]: x[col].map((r) => (r.id === id ? { ...r, chips: ks } : r)), chg: id }));
      const calSet = (id: string, f: (r: CalRow) => CalRow) => S((x) => ({ c: x.c.map((r) => (r.id === id ? f(r) : r)) }));
      const live = (r: PersonRow) => !r.hid && !r.ghost;

      let n = 0;
      let cn = 0;
      let uid = 0;

      if (!(await W(900))) return;
      /* Opener: Camille's tour is rescheduled 2:15 → 4:30 PM ("Rescheduling Tour" for 1.5s). */
      calSet("c2", (r) => ({ ...r, st: "resch" }));
      if (!(await W(1500))) return;
      calSet("c2", (r) => ({ ...r, time: "4:30 PM", st: 0 }));
      S(() => ({ chg: "c2" }));
      if (!(await W(1100))) return;
      S(() => ({ chg: null }));

      /* 1 · Toured prospect → Processing Application → Lease Signed → flies to Residents. */
      let x = get();
      const t = x.p.slice(0, 3).find((r) => live(r) && ["tour", "sched"].includes(r.chips[0])) || x.p[1];
      if (t.chips[0] !== "tour") {
        chip("p", t.id, ["tour"]);
        if (!(await W(1300))) return;
      }
      x = get();
      const w0 = x.r.find((r) => live(r) && r.chips.includes("wo"));
      if (w0) {
        chip("r", w0.id, ["disp"]);
        if (!(await W(900))) return;
      }
      chip("p", t.id, ["sig"]);
      if (!(await W(w0 ? 800 : 1500))) return;
      if (w0) {
        chip("r", w0.id, ["cur"]);
        if (!(await W(700))) return;
      }
      chip("p", t.id, ["ls"]);
      if (!(await W(1200))) return;

      const stg = ref.current;
      const src = stg?.querySelector(`[data-hb="${t.id}"]`);
      const dst = stg?.querySelector(".g2h-c3 .g2h-list");
      if (stg && src && dst) {
        const B = stg.getBoundingClientRect();
        const k = B.width / stg.offsetWidth || 1;
        const R = (e: Element) => {
          const r = e.getBoundingClientRect();
          return { x: (r.left - B.left) / k, y: (r.top - B.top) / k, w: r.width / k };
        };
        const from = R(src);
        const to = R(dst);
        S((x) => {
          const row = x.p.find((r) => r.id === t.id)!;
          return {
            fly: { row, from, to },
            chg: null,
            p: x.p.map((r) => (r.id === t.id ? { id: "gh" + t.id, name: "", prop: "", chips: [], ghost: true } : r)),
            r: [{ ...row, hid: true }, ...x.r.slice(0, 5)],
          };
        });
        if (!(await W(380))) return;
        S((x) => ({ p: x.p.filter((r) => !r.ghost) }));
        if (!(await W(1120))) return;
        S((x) => ({ fly: null, r: x.r.map((r) => (r.id === t.id ? { ...r, hid: false } : r)) }));
        if (!(await W(250))) return;
      } else {
        S((x) => {
          const m = x.p.find((r) => r.id === t.id)!;
          return { p: x.p.filter((r) => r.id !== t.id), r: [m, ...x.r.slice(0, 5)] };
        });
        if (!(await W(600))) return;
      }
      S((x) => ({ p: x.p.filter((r) => !r.ghost) }));
      if (!(await W(300))) return;
      chip("r", t.id, ["fut"]);
      if (!(await W(1500))) return;

      /* 2 · New lead pops in: Responding → Inquiry; a resident starts Collecting Rent. */
      const nw = HB_NEW[n++ % HB_NEW.length];
      const pid = "n" + uid++;
      S((x) => ({ p: [{ id: pid, name: nw[0], prop: nw[1], chips: ["resp"] }, ...x.p.slice(0, 5)], fresh: pid, chg: null }));
      if (!(await W(1400))) return;
      x = get();
      {
        const vis = x.r.filter((r) => !r.hid);
        const ri = vis.findIndex((r) => r.chips.includes("ren"));
        const cr = vis.find(
          (r, i) => r.id !== t.id && r.chips.length === 1 && r.chips[0] === "cur" && (ri < 0 || Math.abs(i - ri) > 1),
        );
        if (cr) S((y) => ({ r: y.r.map((r) => (r.id === cr.id ? { ...r, chips: ["crent"] } : r)) }));
      }
      chip("p", pid, ["inq"]);
      if (!(await W(900))) return;

      /* 3 · Book a tour (Scheduling → Scheduled → pops into Calendar as "Confirming"); renewal offer sent. */
      x = get();
      const b = x.p.slice(1).find((r) => live(r) && r.chips[0] === "inq") || x.p[0];
      x = get();
      const rn = x.r.find((r) => live(r) && r.chips.includes("ren"));
      if (rn) {
        chip("r", rn.id, ["soff"]);
        if (!(await W(1300))) return;
      }
      chip("p", b.id, ["sing"]);
      if (!(await W(1500))) return;
      chip("p", b.id, ["sched"]);
      if (!(await W(700))) return;
      const ty = (["s", "v", "p"] as const)[cn % 3];
      const cid = "c" + uid++;
      /* The prototype reads `cn` inside a lazy setState updater that runs after `cn++`, so the
         booked tour shows HB_TIME[cn + 1] ("11:30 AM"); matched here. */
      const time = HB_TIME[(cn + 1) % HB_TIME.length];
      S((x) => ({
        c: [{ id: cid, name: b.name, ty, prop: b.prop, time, st: 1 }, ...x.c.slice(0, 5)],
        fresh: cid,
      }));
      cn++;
      if (!(await W(1300))) return;
      S((x) => ({ c: x.c.map((r) => (r.id === cid ? { ...r, st: undefined } : r)) }));
      x = get();
      const cp = x.r.find((r) => r.chips.includes("crent"));
      if (cp) {
        S((y) => ({ r: y.r.map((r) => (r.id === cp.id ? { ...r, chips: ["cur", "paid"] } : r)) }));
        if (!(await W(700))) return;
      }
      const so = x.r.find((r) => r.chips.includes("soff"));
      if (so) chip("r", so.id, ["cur", "renewed"]);
      if (!(await W(1200))) return;

      /* 4 · Another inquiry tours. */
      x = get();
      const c = x.p.slice(2).find((r) => live(r) && r.chips[0] === "inq");
      if (c) {
        chip("p", c.id, ["tour"]);
        if (!(await W(1600))) return;
      }
      /* 5 · Residents: work order clears, new resident becomes Current, a renewal is predicted. */
      x = get();
      const w = x.r.find((r) => live(r) && (r.chips.includes("wo") || r.chips.includes("disp")));
      if (w) {
        const nk = w.chips.filter((k) => k !== "wo" && k !== "disp");
        chip("r", w.id, nk.length ? nk : ["cur"]);
        if (!(await W(1400))) return;
      }
      chip("r", t.id, ["cur"]);
      if (!(await W(1600))) return;
      x = get();
      const pr = x.r.find((r) => live(r) && r.id !== t.id && r.chips.length === 1 && r.chips[0] === "cur");
      if (pr) {
        chip("r", pr.id, ["pren"]);
        if (!(await W(1400))) return;
        chip("r", pr.id, ["cur", "ren"]);
        if (!(await W(1200))) return;
      }
      S((y) => ({
        r: y.r.map((r) => (r.chips.includes("paid") || r.chips.includes("renewed") ? { ...r, chips: ["cur"] } : r)),
      }));
      if (!(await W(600))) return;
      S(() => ({ chg: null, fresh: null }));
      played.current = true;
    },
    [],
    0.3,
  );

  return [st, reduce];
}
