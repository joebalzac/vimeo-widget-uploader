import { useRef, useState } from "react";
import { LayoutGroup, motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { CSS_EASE, EXPAND, useLoop } from "../../shared";
import "./VisRenewals.css";

/**
 * Renewals — straight port of the Final prototype's `VRenew` (`useKanban` / `KCol` / `KCard`).
 * Two columns (Renewing / On Notice / Not Renewing) cropped by the card. Loop: Unit 4C lifts
 * (tilt −3.5°, scale 1.03, deeper shadow), flies via a shared-layout move to the top of
 * On Notice while a dashed ghost holds its old slot, settles, the ghost goes and the Renewing
 * cards close up, then 4C's status crossfades to Notice Given + NTV SAVE. Hold, fade, reset.
 */

type Unit = readonly [id: string, name: string, place: string, days: string];
type Status = "r" | "n";
type Item = [Unit, Status];

const KU: { r: Unit[]; n: Unit[] } = {
  r: [
    ["4C", "Jane Shaw", "Caladan Lofts", "12d"],
    ["6D", "Priya Desai", "Oakview", "15d"],
    ["1F", "Daniel Nguyen", "Caladan Lofts", "21d"],
  ],
  n: [
    ["1B", "Owen Sullivan", "Oakview", "12d"],
    ["5C", "Julian Reyes", "Oakview", "15d"],
    ["1E", "Naomi Kim", "Aura Estates", "21d"],
  ],
};
const R0: Item[] = KU.r.map((u) => [u, "r"]);
const N0: Item[] = KU.n.map((u) => [u, "n"]);

function Person() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3F3E3C" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.08 12.25v-1.17a2.33 2.33 0 0 0-2.33-2.33h-3.5a2.33 2.33 0 0 0-2.33 2.33v1.17" />
      <circle cx="7" cy="4.08" r="2.33" />
    </svg>
  );
}
function Pen() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#F25530" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.35 3.97a1.65 1.65 0 0 0-2.33-2.32L2.24 9.43c-.14.14-.24.3-.29.49l-.77 2.54a.29.29 0 0 0 .36.36l2.54-.77c.18-.06.35-.16.48-.29Z" />
    </svg>
  );
}
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#7A7977" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.67 3.5 5.25 9.92 2.33 7" />
    </svg>
  );
}

function KCard({ u, st, lift }: { u: Unit; st: Status; lift: boolean }) {
  return (
    <motion.div
      layout="position"
      layoutId={"g2v-renew-" + u[0]}
      className={`g2v-renew-card${lift ? " is-lift" : ""}`}
      // Only the layout move is tuned; rotate/scale/opacity use framer's defaults, as in the prototype.
      transition={{ layout: { duration: 0.6, ease: EXPAND } }}
      animate={{ rotate: lift ? -3.5 : 0, scale: lift ? 1.03 : 1, opacity: 1 }}
      style={{ zIndex: lift ? 5 : 1 }}
    >
      <div className="g2v-renew-card__t">
        <div>
          <div className="g2v-renew-card__u">
            <span>Unit {u[0]}</span>
            <i className="g2v-renew-dot" />
            <span className="g2v-renew-card__p">
              <Person />
              {u[1]}
            </span>
          </div>
          <span className="g2v-renew-card__pr">{u[2]}</span>
        </div>
        <span className="g2v-renew-card__d">{u[3]}</span>
      </div>
      <i className="g2v-renew-hr" />
      <div className="g2v-renew-ks-w">
        <motion.div
          className="g2v-renew-ks is-r"
          initial={false}
          animate={{ opacity: st === "r" ? 1 : 0 }}
          transition={{ duration: 0.3, ease: CSS_EASE }}
        >
          <Pen />
          Awaiting Signatures
        </motion.div>
        <motion.div
          className="g2v-renew-ks is-n"
          initial={false}
          animate={{ opacity: st === "r" ? 0 : 1 }}
          transition={{ duration: 0.3, ease: CSS_EASE }}
        >
          <Check />
          Notice Given
          <span className="g2v-renew-ntv">NTV Save</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KCol({ title, tone, items, ghost, lift }: { title: string; tone: string; items: Item[]; ghost?: boolean; lift: string | null }) {
  return (
    <div className="g2v-renew-col">
      <div className="g2v-renew-col__h">
        <i style={{ background: tone }} />
        {title}
      </div>
      <div className="g2v-renew-col__list">
        {ghost && (
          <motion.div
            layout="position"
            className="g2v-renew-ghost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
        {items.map(([u, st]) => (
          <KCard key={u[0]} u={u} st={st} lift={lift === u[0]} />
        ))}
      </div>
    </div>
  );
}

interface Board {
  r: Item[];
  n: Item[];
  ghost: boolean;
  lift: string | null;
  fade: boolean;
}
const INIT: Board = { r: R0, n: N0, ghost: false, lift: null, fade: false };
/** Final frame (reduced motion): 4C settled in On Notice with Notice Given. */
const FINAL: Board = { r: R0.slice(1), n: [[KU.r[0], "n"], ...N0], ghost: false, lift: null, fade: false };

const HOLD = 2600;
const LEAD = 1300;

export default function VisRenewals() {
  const ref = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Board>(INIT);

  const { reduced } = useLoop(ref, async ({ wait, alive }) => {
    const P = (p: Partial<Board>) => setBoard((x) => ({ ...x, ...p }));
    while (alive()) {
      setBoard(INIT);
      if (!(await wait(LEAD))) return;
      P({ lift: "4C" });
      if (!(await wait(420))) return;
      setBoard((x) => ({ ...x, r: x.r.slice(1), n: [x.r[0], ...x.n], ghost: true }));
      if (!(await wait(650))) return;
      P({ lift: null });
      if (!(await wait(260))) return;
      P({ ghost: false });
      if (!(await wait(450))) return;
      setBoard((x) => ({ ...x, n: x.n.map(([u, s]) => (u[0] === "4C" ? [u, "n"] : [u, s])) }));
      if (!(await wait(HOLD))) return;
      P({ fade: true });
      if (!(await wait(450))) return;
    }
  });

  const st = reduced ? FINAL : board;

  return (
    <div ref={ref} className="g2v-renew" aria-hidden>
      <motion.div
        className="g2v-renew-st"
        animate={{ opacity: st.fade ? 0 : 1 }}
        transition={{ duration: 0.4, ease: CSS_EASE }}
      >
        <LayoutGroup>
          <div className="g2v-renew-c1">
            <KCol title="Renewing" tone="#00b080" items={st.r} ghost={st.ghost} lift={st.lift} />
          </div>
          <div className="g2v-renew-c2">
            <KCol title="On Notice / Not Renewing" tone="#ff7a4f" items={st.n} lift={st.lift} />
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
