import "../utils/interVariableFont";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import "./TourHero.css";
import FloorPlan from "./tour-hero/FloorPlan";
import RoomCard from "./tour-hero/RoomCard";
import { TIMELINE, type RoomKey } from "./tour-hero/roomTimeline";
import stepperDot from "../assets/tour-hero/stepper-dot.svg";
import playTriangle from "../assets/tour-hero/play-triangle.svg";

export interface TourHeroProps {
  eyebrow?: string;
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

type Place = "above" | "below";

/**
 * Timestamp chips, in play order. `dot` is the dot centre in the 1440 x 880 Figma frame
 * (512:29156): chip frames 512:29785 (8:47), 512:29762 (2:20), 512:29768 (4:17), dot = the
 * frame's right 32px. The order (Guest -> Kitchen -> Living) reproduces the Figma frame while
 * the Kitchen card is open: Guest already played (light chip), Living still to come.
 * `place` is where the room card opens: left-aligned with the chip, 16px above or below.
 */
const STEPS: { k: RoomKey; time: string; dot: [number, number]; w: number; place: Place }[] = [
  { k: "guest", time: "8:47", dot: [390.06, 190.2], w: 300, place: "below" },
  { k: "kitchen", time: "2:20", dot: [1113.66, 357.93], w: 300, place: "above" },
  { k: "living", time: "4:17", dot: [881.54, 721.65], w: 300, place: "above" },
];

const PLACE: Record<Place, { style: Record<string, string | number>; origin: string }> = {
  above: { style: { left: 0, bottom: "calc(100% + 16px)" }, origin: "0% 100%" },
  below: { style: { left: 0, top: "calc(100% + 16px)" }, origin: "0% 0%" },
};

const ease = [0.22, 1, 0.36, 1] as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/**
 * Width of the hero element. Starts at 1440 on BOTH the server and the client so hydration
 * matches Webflow's server render (React does not patch mismatched attributes when hydrating,
 * which left the hero sized for 1440 until the window was resized). The real width is then
 * measured before the first paint and on every resize; a 0px reading (host not laid out yet)
 * is ignored until the ResizeObserver reports a real size.
 */
function useWidth(ref: RefObject<HTMLElement | null>) {
  const [w, setW] = useState(1440);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const cw = el.clientWidth;
      if (cw > 0) setW(cw);
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** Timestamp chip + dot (Figma 512:29762). Positioned so the dot centre sits on (x, y). */
function Clicker({
  time,
  i,
  shown,
  live,
  played,
  x,
  y,
  scale,
  card,
}: {
  time: string;
  i: number;
  shown: boolean;
  live: boolean;
  played: boolean;
  x: number;
  y: number;
  scale: number;
  card?: React.ReactNode;
}) {
  return (
    <div
      className="tih-clicker"
      style={{ left: x, top: y, transform: `translate(calc(-100% + ${16 * scale}px), ${-16 * scale}px)` }}
    >
      <motion.div
        className="tih-clicker__inner"
        style={{ scale, transformOrigin: "100% 50%" }}
        initial={false}
        animate={shown ? "on" : "off"}
      >
        <motion.span
          className="tih-clicker__dot"
          variants={{ off: { opacity: 0, scale: 0.85 }, on: { opacity: 1, scale: 1 } }}
          transition={{ duration: 0.6, ease }}
        >
          <motion.span
            className="tih-clicker__halo"
            initial={false}
            animate={{ opacity: live ? 1 : 0, scale: live ? 1 : 0.8 }}
            transition={{ duration: 0.5, ease }}
          />
          {shown && (
            <motion.span
              className="tih-clicker__ring"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.15, 1.9] }}
              transition={{ duration: 2.8, times: [0, 0.12, 1], repeat: Infinity, delay: 0.6 + i * 0.9, ease: [0.2, 0.6, 0.35, 1] }}
            />
          )}
          <img className="tih-clicker__dot-img" src={stepperDot} alt="" />
        </motion.span>
        <motion.span
          className={played ? "tih-clicker__chip tih-clicker__chip--played" : "tih-clicker__chip"}
          variants={{ off: { opacity: 0, x: 6 }, on: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.6, ease, delay: 0.1 }}
        >
          <img className="tih-clicker__play" src={playTriangle} alt="" />
          {time}
        </motion.span>
        {card}
      </motion.div>
    </div>
  );
}

/**
 * TourHero — Tour Intelligence hero. Figma: node 512:29156 (.com_2027).
 *
 * The floor plan draws itself in, then one room card at a time opens from its timestamp
 * chip, plays its sequence, and closes. Replays whenever the hero re-enters the viewport.
 * Desktop (>=768px): the 1440x880 plan is scaled and centred. Mobile: the plan stays at a
 * readable scale and a camera pans to the active room below the copy.
 */
export default function TourHero({
  eyebrow = "",
  heading = "Tour Intelligence",
  subtitle = "Records and scores tours, automates follow-up tasks, and surfaces coaching and property insights to turn more tours into leases.",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  className,
}: TourHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const W = useWidth(ref);
  const mobile = W < 768;
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState([false, false, false]);
  const [active, setActive] = useState(-1);
  const [played, setPlayed] = useState([false, false, false]);
  const [cardOn, setCardOn] = useState(false);
  const [phase, setPhase] = useState(0);
  const [copyBottom, setCopyBottom] = useState(420);
  const mobileRef = useRef(mobile);
  useEffect(() => {
    mobileRef.current = mobile;
  }, [mobile]);

  useLayoutEffect(() => {
    const el = copyRef.current;
    const sec = ref.current;
    if (!el || !sec) return;
    const f = () => setCopyBottom(Math.round(el.getBoundingClientRect().bottom - sec.getBoundingClientRect().top));
    const ro = new ResizeObserver(f);
    ro.observe(el);
    f();
    return () => ro.disconnect();
  }, [mobile]);

  useEffect(() => {
    if (!inView) return;
    let alive = true;
    const ok = () => alive;
    // Re-entering the viewport restarts the whole sequence from its zero state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRun((r) => r + 1);
    setShown([false, false, false]);
    setPlayed([false, false, false]);
    setActive(-1);
    setCardOn(false);
    setPhase(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    (async () => {
      await sleep(350);
      if (!ok()) return;
      setActive(0);
      setShown([true, false, false]);
      timers.push(setTimeout(() => ok() && setShown((s) => [s[0], true, s[2]]), 450));
      timers.push(setTimeout(() => ok() && setShown((s) => [s[0], s[1], true]), 600));
      if (reduce) return;
      let i = 0;
      let first = true;
      while (ok()) {
        setActive(i);
        setPhase(0);
        if (mobileRef.current && !first) {
          await sleep(1150); // camera pans to the room first
          if (!ok()) return;
        }
        await sleep(first ? 120 : 200);
        if (!ok()) return;
        first = false;
        setCardOn(true);
        for (const [ms, p] of TIMELINE[STEPS[i].k]) {
          await sleep(ms);
          if (!ok()) return;
          if (p !== null) setPhase(p);
        }
        setCardOn(false);
        const done = i;
        setPlayed((p) => p.map((v, j) => v || j === done));
        await sleep(500);
        if (!ok()) return;
        i = (i + 1) % STEPS.length;
        if (i === 0) setPlayed([false, false, false]); // new loop: every chip is fresh again
      }
    })();
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [inView, reduce]);

  /* ---- geometry ---- */
  let S: number, OX: number, OY: number, H: number;
  let ty = 0;
  const focus = active >= 0 ? STEPS[active].dot : [720, 330];
  if (!mobile) {
    H = Math.max(640, Math.round((W * 880) / 1440)); // same 1440 x 880 proportion as Figma
    S = Math.min(W / 1440, H / 880);
    OX = (W - 1440 * S) / 2;
    OY = (H - 880 * S) / 2;
  } else {
    S = clamp(W / 620, 0.55, 0.8);
    ty = copyBottom + 96; // where the active dot sits
    OX = clamp(W / 2 - S * focus[0], W - 1440 * S, 0);
    OY = ty - S * focus[1];
    H = Math.max(780, ty + 32 + 170 + 44);
  }
  const cam = { duration: mobile && run > 0 ? 1.1 : 0, ease: [0.65, 0, 0.35, 1] as const };
  const step = active >= 0 ? STEPS[active] : null;

  return (
    <section ref={ref} className={["tih", mobile ? "tih--mobile" : "", className].filter(Boolean).join(" ")} style={{ height: H }}>
      {/* camera: fixed + centred on desktop; pans to the active room on mobile */}
      <motion.div className="tih-layer" initial={false} animate={{ x: OX, y: OY }} transition={cam}>
        <div className="tih-stage" style={{ transform: `scale(${S})` }}>
          <FloorPlan run={run} />
        </div>
      </motion.div>

      {/* timestamps ride the same camera, in their own layer above the copy backdrop */}
      <motion.div className="tih-layer tih-layer--chips" initial={false} animate={{ x: OX, y: OY }} transition={cam}>
        {STEPS.map((s, i) => (
          <Clicker
            key={s.k}
            time={s.time}
            i={i}
            shown={shown[i]}
            live={active === i}
            played={played[i]}
            x={S * s.dot[0]}
            y={S * s.dot[1]}
            scale={mobile ? 0.8 : 1}
            card={
              !mobile && (
                <AnimatePresence>
                  {cardOn && active === i && (
                    <RoomCard
                      key={s.k + run}
                      room={s.k}
                      phase={phase}
                      style={{ ...PLACE[s.place].style, width: s.w }}
                      origin={PLACE[s.place].origin}
                    />
                  )}
                </AnimatePresence>
              )
            }
          />
        ))}
      </motion.div>

      {mobile && (
        <div className="tih-mobile-card" style={{ top: ty + 16 * 0.8 + 16 }}>
          <AnimatePresence>
            {cardOn && step && (
              <RoomCard
                key={step.k + run}
                room={step.k}
                phase={phase}
                style={{ left: "50%", top: 0, width: W - 48, x: "-50%" }}
                origin="50% 0%"
              />
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="tih-copy-wrap">
        <div ref={copyRef} className="tih-copy">
          <div className="tih-copy__header">
            {eyebrow && (
              <motion.div
                className="tih-eyebrow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.35 }}
              >
                <i className="tih-eyebrow__marker" />
                <span>{eyebrow}</span>
              </motion.div>
            )}
            <motion.h1
              className="tih-copy__title"
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease, delay: 0.45 }}
            >
              {heading}
            </motion.h1>
            <motion.p
              className="tih-copy__subtitle"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.58 }}
            >
              {subtitle}
            </motion.p>
          </div>
          {ctaLabel && (
            <motion.a
              href={ctaHref}
              className="tih-copy__cta"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease, delay: 0.7 }}
            >
              {ctaLabel}
            </motion.a>
          )}
        </div>
      </div>

      {mobile && <div className="tih-mobile-vignette" />}
      {mobile && <div className="tih-mobile-backdrop" style={{ top: (96 + copyBottom) / 2 }} />}
    </section>
  );
}
