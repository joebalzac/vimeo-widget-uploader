import "../../utils/interVariableFont";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { DRAW, E, Reveal, useLoop } from "./shared";
import avatarElise from "../../assets/gen2/routing/avatar-elise.svg";
import avatarMaya from "../../assets/gen2/routing/avatar-maya.jpg";
import iconCaret from "../../assets/gen2/routing/icon-caret.svg";
import iconReply from "../../assets/gen2/routing/icon-reply.svg";
import iconMore from "../../assets/gen2/routing/icon-more.svg";
import iconTaskCreated from "../../assets/gen2/routing/icon-task-created.svg";
import iconTeamBranch from "../../assets/gen2/routing/icon-team-branch.svg";
import iconRouting from "../../assets/gen2/routing/icon-routing.svg";
import "./Gen2Routing.css";

export interface Gen2RoutingProps {
  heading?: string;
  subtitle?: string;
}

/* ── Data (handoff 08-enabling: `EN_MSG`; Figma 642:139428) ── */

interface EnMsg {
  from: "Elise" | "Maya";
  name: string;
  to: string;
  /** Body text; `link` is appended as an underlined link followed by `after`. */
  text: string;
  link?: string;
  after?: string;
}
const EN_MSG: EnMsg[] = [
  {
    from: "Elise",
    name: "Elise",
    to: "to Maya Bennett",
    text: "Maya, your $2,840 balance is 11 days past due. Please pay ",
    link: "here",
    after: ".",
  },
  {
    from: "Maya",
    name: "Maya Bennett",
    to: "to Elise",
    text: "So sorry, I was traveling for work. My bonus pays on the 15th. Can I pay then?",
  },
  {
    from: "Elise",
    name: "Elise",
    to: "to Maya Bennett",
    text: "The 15th works! While I have you, your lease ends January 31. We’d love for you to renew for 12 months at $2,995/month.",
  },
];

interface EnTask {
  title: string;
  person: string;
  team: string;
}
const EN_TASKS: EnTask[] = [
  { title: "Promise To Pay", person: "Maya Bennett", team: "Delinquency Team" },
  { title: "Prepare Renewal Offer", person: "Maya Bennett", team: "Onsite Team" },
];

/* ── Desktop geometry (Figma 642:129547): a fixed 1160×600 space scaled to the stage ── */

const W = 1160;
const H = 600;
/** Group slide (gx 0 → −320): the email card starts centred and ends at Figma x 80. */
const GX = -320;
/** Group coordinates = Figma final coordinates + 320. */
const CARD_X = 400;
const CARD_W = 360;
const CARD_Y = 106;
const PILL_CX = 900;
const PILL_CY = 300.5;
/** ROUTING pill is 83 wide; the lines meet its edges. */
const PILL_HALF = 41.5;
const TASK_X = 1040;
/** Line anchor heights from Figma (642:139501 / 642:139506 / 642:139548). */
const MSG_Y = [344, 438];
const TASK_Y = [180, 420];
/** Elbow x on each side: equal 49px arms around the pill. */
const ELBOW_L = CARD_X + CARD_W + 49.3;
const ELBOW_R = PILL_CX + PILL_HALF + 49;
const SLIDE_EASE = [0.55, 0, 0.25, 1] as const;

/**
 * Build steps (ms from first ≥50% in view):
 *  1 card opens · 2 skeleton → text · 3 slide + left lines · 4 pill arrives
 *  5 route-1 pulse · 6 route-1 line · 7 route-2 pulse · 8 task 1 · 9 route-2 line
 *  10 task 2 · 11 ROUTED. Pulses then keep looping (CSS).
 */
const STEPS: [number, number][] = [
  [1, 0],
  [2, 1900],
  [3, 2500],
  [4, 3300],
  [5, 3600],
  [6, 4700],
  [7, 4900],
  [8, 5800],
  [9, 6000],
  [10, 7100],
  [11, 7500],
];
const FINAL = 11;

const MOBILE_MQ = "(max-width: 767px)";
function subscribeMq(cb: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const useIsMobile = () =>
  useSyncExternalStore(
    subscribeMq,
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );

/**
 * Gen2 · 08 Enabling New Operating Models (Figma 642:129543). An email thread whose
 * messages 2 and 3 route through a ROUTING → ROUTED pill into two team task cards. Builds
 * once at ≥50% in view, then gradient pulses keep travelling both routes.
 */
export default function Gen2Routing({
  heading = "Enabling New Operating Models",
  subtitle = "Automatically route tasks to the right teams.",
}: Gen2RoutingProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const mobile = useIsMobile();

  const { reduced } = useLoop(
    stageRef,
    async ({ wait }) => {
      let t = 0;
      for (const [n, at] of STEPS) {
        if (!(await wait(at - t))) return;
        t = at;
        setStep(n);
      }
    },
    { amount: 0.5, once: true },
  );
  const s = reduced ? FINAL : step;

  return (
    <MotionConfig reducedMotion="user">
      <section className="g2r">
        <SectionHeading heading={heading} subtitle={subtitle} maxWidth={418} />
        <Reveal>
          <div ref={stageRef} className="g2r__stage">
            {mobile ? <MobileColumn s={s} reduced={reduced} /> : <DesktopCanvas s={s} reduced={reduced} />}
          </div>
        </Reveal>
      </section>
    </MotionConfig>
  );
}

/* ── Desktop ──────────────────────────────────────────────── */

/** Square-cornered elbow: horizontal → vertical → horizontal. */
const elbow = (x0: number, y0: number, xe: number, y1: number, x1: number) =>
  `M ${x0} ${y0} H ${xe} V ${y1} H ${x1}`;

function DesktopCanvas({ s, reduced }: { s: number; reduced: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const fit = () => setScale(Math.min(1, box.clientWidth / W));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  const cardR = CARD_X + CARD_W;
  const pillL = PILL_CX - PILL_HALF;
  const pillR = PILL_CX + PILL_HALF;
  const left = MSG_Y.map((y) => elbow(cardR, y, ELBOW_L, PILL_CY, pillL));
  const right = TASK_Y.map((y) => elbow(pillR, PILL_CY, ELBOW_R, y, TASK_X));
  const routes = [0, 1].map((i) => `${left[i]} H ${pillR} ${right[i].replace(/^M [^H]+/, "")}`);

  const inst = reduced ? { duration: 0 } : undefined;
  const leftDraw = inst ?? { duration: 1, ease: SLIDE_EASE };
  const rightDraw = inst ?? { duration: 0.9, ease: DRAW };

  return (
    <div ref={boxRef} className="g2r__box" style={{ height: H * scale }}>
      <div className="g2r__canvas" style={{ width: W, height: H, transform: `scale(${scale})` }}>
        <motion.div
          className="g2r__group"
          initial={false}
          animate={{ x: s >= 3 ? GX : 0 }}
          transition={inst ?? { duration: 1, ease: SLIDE_EASE }}
        >
          <svg className="g2r__svg" width={TASK_X + CARD_W} height={H} aria-hidden>
            {left.map((d, i) => (
              <g key={`l${i}`}>
                <motion.path
                  d={d}
                  className="g2r__line"
                  initial={false}
                  animate={{ pathLength: s >= 3 ? 1 : 0, opacity: s >= 3 ? 1 : 0 }}
                  transition={{ pathLength: leftDraw, opacity: { duration: 0 } }}
                />
                <circle className={s >= 3 ? "g2r__dot is-on" : "g2r__dot"} cx={cardR} cy={MSG_Y[i]} r={2.667} />
              </g>
            ))}
            {right.map((d, i) => {
              const on = s >= (i === 0 ? 6 : 9);
              return (
                <g key={`r${i}`}>
                  <motion.path
                    d={d}
                    className="g2r__line"
                    initial={false}
                    animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                    transition={{ pathLength: rightDraw, opacity: { duration: 0 } }}
                  />
                  <circle
                    className={s >= (i === 0 ? 8 : 10) ? "g2r__dot is-on" : "g2r__dot"}
                    cx={TASK_X}
                    cy={TASK_Y[i]}
                    r={2.667}
                  />
                </g>
              );
            })}
            {!reduced && routes.map((d, i) => <Pulse key={`p${i}`} d={d} on={s >= (i === 0 ? 5 : 7)} />)}
          </svg>

          <div className="g2r__cardwrap" style={{ left: CARD_X, top: CARD_Y, width: CARD_W }}>
            <EmailCard s={s} reduced={reduced} />
          </div>

          <div className="g2r__pillwrap" style={{ left: PILL_CX, top: PILL_CY }}>
            <RoutedPill s={s} reduced={reduced} />
          </div>

          <div className="g2r__tasks" style={{ left: TASK_X, top: CARD_Y, width: CARD_W }}>
            {EN_TASKS.map((t, i) => (
              <TaskCard key={t.title} task={t} on={s >= (i === 0 ? 8 : 10)} reduced={reduced} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Lilac gradient pulse (handoff 08: #C1BAFE → #A093FD, crisp 1px): dash segments, tail → head. */
const SEG = 0.035;
const PULSE_COLORS: [string, number][] = [
  ["#C1BAFE", 0.35],
  ["#C1BAFE", 1],
  ["#B0A6FE", 1],
  ["#A093FD", 1],
  ["#A093FD", 0.35],
];
function Pulse({ d, on }: { d: string; on: boolean }) {
  if (!on) return null;
  return (
    <g className="g2r__pulse">
      {PULSE_COLORS.map(([c, o], k) => (
        <path key={k} d={d} pathLength={1} stroke={c} strokeOpacity={o} strokeDasharray={`0 ${k * SEG} ${SEG} 3`} />
      ))}
    </g>
  );
}

/* ── Mobile ───────────────────────────────────────────────── */

function MobileColumn({ s, reduced }: { s: number; reduced: boolean }) {
  return (
    <div className="g2r__mcol">
      <EmailCard s={s} reduced={reduced} />
      <Connector on={s >= 3} loop={s >= FINAL && !reduced} reduced={reduced} />
      <RoutedPill s={s} reduced={reduced} />
      <Connector on={s >= 6} loop={s >= FINAL && !reduced} reduced={reduced} />
      <TaskCard task={EN_TASKS[0]} on={s >= 8} reduced={reduced} />
      <Connector on={s >= 9} loop={s >= FINAL && !reduced} reduced={reduced} />
      <TaskCard task={EN_TASKS[1]} on={s >= 10} reduced={reduced} />
    </div>
  );
}

function Connector({ on, loop, reduced }: { on: boolean; loop: boolean; reduced: boolean }) {
  return (
    <div className={loop ? "g2r__conn is-loop" : "g2r__conn"} aria-hidden>
      <motion.i
        initial={false}
        animate={{ scaleY: on ? 1 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: DRAW }}
      />
    </div>
  );
}

/* ── Pieces ───────────────────────────────────────────────── */

function EmailCard({ s, reduced }: { s: number; reduced: boolean }) {
  const open = s >= 1;
  const text = s >= 2;
  const routing = s >= 3;
  return (
    <motion.div
      className={routing ? "g2r__card is-routing" : "g2r__card"}
      initial={false}
      /* unrolls with an outset clip (−24px) so the shadow isn't cut; its box is laid out at
         final size from the start, so the (mobile) column never grows (handoff v123) */
      animate={{
        clipPath: open ? "inset(-24px -24px -24px -24px)" : "inset(-24px -24px 100% -24px)",
        opacity: open ? 1 : 0,
      }}
      transition={reduced ? { duration: 0 } : { clipPath: { duration: 0.8, ease: E }, opacity: { duration: 0.3 } }}
    >
      {EN_MSG.map((m, i) => (
        <div key={i} className={i === 0 ? "g2r__msg g2r__msg--first" : "g2r__msg g2r__msg--routed"}>
          <div className={text ? "g2r__msg-in is-on" : "g2r__msg-in"}>
            <div className="g2r__from">
              <img
                className="g2r__av"
                src={m.from === "Elise" ? avatarElise : avatarMaya}
                width={40}
                height={40}
                alt=""
              />
              <div className="g2r__who">
                <span className="g2r__from-name">{m.name}</span>
                <span className="g2r__from-to">
                  {m.to}
                  <img src={iconCaret} width={12} height={12} alt="" />
                </span>
              </div>
              <span className="g2r__msg-actions" aria-hidden>
                <img src={iconReply} width={16} height={16} alt="" />
                <img src={iconMore} width={16} height={16} alt="" />
              </span>
            </div>
            <p className="g2r__body">
              {i === 0 ? (
                <>
                  {m.text}
                  <span className="g2r__link">{m.link}</span>
                  {m.after}
                </>
              ) : (
                <span className="g2r__hl">{m.text}</span>
              )}
            </p>
          </div>
          <div className={text ? "g2r__skel is-off" : "g2r__skel"} aria-hidden>
            <i style={{ width: "42%" }} />
            <i style={{ width: "92%" }} />
            <i style={{ width: "68%" }} />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function RoutedPill({ s, reduced }: { s: number; reduced: boolean }) {
  const routed = s >= FINAL;
  return (
    <motion.div
      className={routed ? "g2r__pill is-routed" : "g2r__pill"}
      initial={false}
      animate={s >= 4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={reduced ? { duration: 0 } : { duration: 0.45, ease: E }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={routed ? "routed" : "routing"}
          className="g2r__pill-label"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: E }}
        >
          {routed ? (
            <CheckIcon />
          ) : (
            <span className="g2r__pill-icon">
              <img src={iconRouting} width={11.25} height={11.25} alt="" />
            </span>
          )}
          {routed ? "Routed" : "Routing"}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}

function TaskCard({ task, on, reduced }: { task: EnTask; on: boolean; reduced: boolean }) {
  return (
    <motion.div
      className="g2r__task"
      initial={false}
      animate={on ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 12, scale: 0.97 }}
      transition={reduced ? { duration: 0 } : { duration: 0.6, ease: E }}
    >
      <div className="g2r__created">
        <img src={iconTaskCreated} width={16} height={16} alt="" />
        Task Created
      </div>
      <div className="g2r__task-body">
        <div className="g2r__task-head">
          <div className="g2r__task-row">
            <span className="g2r__task-title">{task.title}</span>
            <i className="g2r__task-bar" />
          </div>
          <span className="g2r__task-person">{task.person}</span>
        </div>
        <div className="g2r__team">
          <span className="g2r__branch">
            <img src={iconTeamBranch} width={18.6667} height={21.5534} alt="" />
          </span>
          <span className="g2r__team-chip">{task.team}</span>
        </div>
      </div>
    </motion.div>
  );
}

/** ROUTED end state (handoff 08: mint pill with a check). */
function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
      <path d="M2 5.2 4.1 7.3 8 3" fill="none" stroke="#fff" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
