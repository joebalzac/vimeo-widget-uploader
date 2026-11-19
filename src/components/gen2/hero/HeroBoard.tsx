import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { HB_BAR, HB_CH, type ChipKey, type Flight, type PersonRow } from "./heroBoardData";
import { CSS_EASE, EZ, HB_E, useFit, useMedia } from "./protoHooks";
import { useHeroBoard } from "./useHeroBoard";

/*
 * Hero board — port of the Final prototype's Hero3Board + HBCol / HBCard / HBGhost / HBPerson /
 * HBChip / HBFly / HBIcon, entrance mode 4 (the default "rise" entrance), "Elise acting" story.
 * Styles: Gen2Hero.css (`g2h-bd`, `g2h-bst`, `g2h-col`, `g2h-card`, …).
 */

const ICON = {
  fill: "none",
  stroke: "#0E0D0C",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;
const HBIcon = {
  cal: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" {...ICON}>
      <path d="M6 1.5V4.5" />
      <path d="M12 1.5V4.5" />
      <rect x="2.25" y="3" width="13.5" height="12.75" rx="1.5" />
      <path d="M2.25 7.5H15.75" />
    </svg>
  ),
  per: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" {...ICON}>
      <path d="M14.25 15.75V14.25a3 3 0 0 0-3-3h-4.5a3 3 0 0 0-3 3v1.5" />
      <circle cx="9" cy="5.25" r="3" />
    </svg>
  ),
  home: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" {...ICON}>
      <path d="M2.25 7.5 9 2.25l6.75 5.25v7.5a.75.75 0 0 1-.75.75H3a.75.75 0 0 1-.75-.75Z" />
    </svg>
  ),
  drag: () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="#A9A8A6">
      {[3.75, 9, 14.25].flatMap((y) => [6.2, 11.8].map((x) => <circle key={x + "-" + y} cx={x} cy={y} r=".9" />))}
    </svg>
  ),
};

function HBChip({ k, ref }: { k: ChipKey; ref?: Ref<HTMLSpanElement> }) {
  const [t, c, prog] = HB_CH[k];
  return (
    <motion.span
      ref={ref}
      layout="position"
      className={`g2h-chip ${c}${prog ? " prog" : ""}`}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.28, ease: CSS_EASE } }}
      transition={{
        opacity: { duration: 0.25, ease: CSS_EASE },
        y: { type: "spring", stiffness: 520, damping: 24 },
        scale: { type: "spring", stiffness: 520, damping: 20 },
        layout: { duration: 0.35, ease: EZ },
      }}
    >
      {prog && <i className="g2h-spin" aria-hidden="true" />}
      <em>{t}</em>
    </motion.span>
  );
}

interface HBCardProps {
  id: string;
  lift?: boolean;
  fresh?: boolean;
  chg?: boolean;
  hid?: boolean;
  ri?: number;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}
function HBCard({ id, lift, fresh, chg, hid, ri = 0, children, ref }: HBCardProps) {
  return (
    <motion.div
      ref={ref}
      data-hb={id}
      layout="position"
      className={`g2h-card${lift ? " lift" : ""}${fresh ? " fresh" : ""}${chg ? " chg" : ""}${hid ? " hid" : ""}`}
      initial={{ opacity: 0, scale: 0.94, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.3, ease: CSS_EASE } }}
      transition={{
        layout: { duration: 0.75, ease: HB_E },
        opacity: { duration: 0.35, ease: CSS_EASE },
        scale: { type: "spring", stiffness: 420, damping: 28 },
        y: { type: "spring", stiffness: 420, damping: 28 },
      }}
      style={{ zIndex: lift ? 6 : 1, ["--r" as string]: ri }}
    >
      <motion.div
        className="g2h-in"
        animate={{ rotate: lift ? -6 : 0, scale: lift ? 1.04 : 1, y: lift ? -6 : 0 }}
        transition={{ duration: 0.45, ease: EZ }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function HBGhost({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <motion.div
      ref={ref}
      layout="position"
      className="g2h-ghost"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25, ease: CSS_EASE } }}
      transition={{ duration: 0.2, ease: CSS_EASE }}
    />
  );
}

function HBCol({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="g2h-col">
      <div className="g2h-col-h">
        {icon}
        <span>{title}</span>
        <i className="g2h-drag">{HBIcon.drag()}</i>
      </div>
      <div className="g2h-list">
        <AnimatePresence mode="popLayout" initial={false}>
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface HBPersonProps {
  r: PersonRow;
  ri: number;
  lift: string | null;
  fresh: string | null;
  chg: string | null;
  ref?: Ref<HTMLDivElement>;
}
function HBPerson({ r, ri, lift, fresh, chg, ref }: HBPersonProps) {
  return (
    <HBCard ref={ref} ri={ri} hid={!!r.hid} id={r.id} lift={lift === r.id} fresh={fresh === r.id} chg={chg === r.id}>
      <div className="g2h-tx">
        <b>{r.name}</b>
        <span>{r.prop}</span>
      </div>
      <div className="g2h-chips">
        <AnimatePresence mode="popLayout" initial={false}>
          {r.chips.map((k) => (
            <HBChip key={k} k={k} />
          ))}
        </AnimatePresence>
      </div>
    </HBCard>
  );
}

/** The card that travels Prospects → Residents; leans with its horizontal speed. */
function HBFly({ f }: { f: Flight }) {
  const { row, from, to } = f;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sc = useMotionValue(1);
  const vx = useVelocity(x);
  const tilt = useSpring(useTransform(vx, [-2400, 0, 2400], [-6, 0, 6]), { stiffness: 260, damping: 26 });
  useEffect(() => {
    let live = true;
    (async () => {
      await Promise.all([animate(sc, 1.035, { duration: 0.28, ease: EZ }), animate(y, -6, { duration: 0.28, ease: EZ })]);
      if (!live) return;
      await Promise.all([
        animate(x, dx, { type: "spring", duration: 0.95, bounce: 0.12 }),
        animate(y, dy - 6, { type: "spring", duration: 0.95, bounce: 0.08 }),
      ]);
      if (!live) return;
      animate(sc, 1, { duration: 0.25, ease: EZ });
      animate(y, dy, { duration: 0.25, ease: EZ });
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.div
      className="g2h-card g2h-fly lift"
      style={{ position: "absolute", left: from.x, top: from.y, width: from.w, zIndex: 20, x, y, scale: sc, rotate: tilt }}
    >
      <div className="g2h-in">
        <div className="g2h-tx">
          <b>{row.name}</b>
          <span>{row.prop}</span>
        </div>
        <div className="g2h-chips">
          {row.chips.map((k) => (
            <span key={k} className={`g2h-chip ${HB_CH[k][1]}`}>
              <em>{HB_CH[k][0]}</em>
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* Entrance mode 4 (prototype default): columns rise in, Prospects first, sides 0.1s later. */
const heInit = { opacity: 0, y: 36, scale: 0.97 };
function heAnim(i: number, ph: number) {
  if (ph < 1) return heInit;
  const sp = [0.22, 1, 0.36, 1] as const;
  const d = i === 1 ? 0 : 0.1;
  return {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      opacity: { duration: 0.5, ease: CSS_EASE, delay: d },
      y: { duration: 1, ease: sp, delay: d },
      scale: { duration: 1, ease: sp, delay: d },
    },
  };
}

export default function HeroBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const [st, reduce] = useHeroBoard(ref);
  const box = useRef<HTMLDivElement>(null);
  const mob = useMedia("(max-width:767px)");
  const s0 = useFit(box, 1160);
  const s = mob ? 1 : s0;
  const seen = useInView(box, { once: true, amount: 0.25 });
  const [ph, setPh] = useState(0);
  const [deal, setDeal] = useState(false);

  /* Cards deal in (CSS keyframes) for 2.6s after the columns start rising. */
  useEffect(() => {
    if (ph < 1 || reduce) return;
    setDeal(true);
    const t = setTimeout(() => setDeal(false), 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ph >= 1]);

  useEffect(() => {
    if (reduce) {
      setPh(2);
      return;
    }
    if (!seen) {
      setPh(0);
      return;
    }
    setPh(0);
    const t1 = setTimeout(() => setPh(1), 60);
    const t2 = setTimeout(() => setPh(2), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [seen, reduce]);

  const { lift, fresh, chg } = st;
  const cols = [
    <HBCol key="c" icon={HBIcon.cal()} title="Calendar">
      {st.c.map((r, ri) => (
        <HBCard key={r.id} ri={ri} id={r.id} fresh={fresh === r.id} chg={chg === r.id}>
          <i className="g2h-bar" style={{ background: HB_BAR[r.ty][1] }} />
          <div className="g2h-tx">
            <b>{r.name}</b>
            <span>
              {HB_BAR[r.ty][0]} @ {r.prop}
            </span>
          </div>
          <span className="g2h-tw">
            <motion.em
              className="g2h-time"
              initial={false}
              animate={{ opacity: r.st ? 0 : 1 }}
              transition={{ duration: 0.3, ease: CSS_EASE }}
            >
              {r.time}
            </motion.em>
            <AnimatePresence initial={false}>
              {(r.st === 1 || r.st === "resch") && (
                <HBChip key={r.st === 1 ? "cf" : "rs"} k={r.st === 1 ? "conf" : "resch"} />
              )}
            </AnimatePresence>
          </span>
        </HBCard>
      ))}
    </HBCol>,
    <HBCol key="p" icon={HBIcon.per()} title="Prospects">
      {st.p.map((r, ri) =>
        r.ghost ? (
          <HBGhost key={r.id} />
        ) : (
          <HBPerson key={r.id} ri={ri} r={r} lift={lift} fresh={fresh} chg={chg} />
        ),
      )}
    </HBCol>,
    <HBCol key="r" icon={HBIcon.home()} title="Residents">
      {st.r.map((r, ri) => (
        <HBPerson key={r.id} ri={ri} r={r} lift={lift} fresh={fresh} chg={chg} />
      ))}
    </HBCol>,
  ];

  return (
    <div
      ref={box}
      className={`g2h-bd${ph >= 1 ? " in" : ""}${deal ? " deal" : ""}`}
      style={{ height: mob ? 480 : 540 * s }}
      aria-hidden="true"
    >
      <motion.div ref={ref} className="g2h-bst" style={{ x: "-50%", scale: s }}>
        <LayoutGroup>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={"g2h-c" + (i + 1)}
              style={{ zIndex: i === 2 && lift ? 4 : i === 1 ? 3 : i === 2 ? 2 : 1 }}
              initial={heInit}
              animate={heAnim(i, ph)}
            >
              {cols[i]}
            </motion.div>
          ))}
        </LayoutGroup>
        {st.fly && <HBFly f={st.fly} />}
      </motion.div>
    </div>
  );
}
