import { useRef, useState } from "react";
import { motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { CSS_EASE, DRAW, EZ } from "../../shared/motion";
import { useLoop } from "../../shared/useLoop";
import avatarAva from "../../../../assets/gen2/features/leasing/avatar-ava.jpg";
import "./VisLeasing.css";

/**
 * Leasing visual — port of the designer's Final prototype `VLease` (Figma 876:180249).
 * One white box, centred in the 660×460 stage, morphs on a single spring:
 * lead card (320×132.5, TOUR SCHEDULED → TOURED) → composer (400×140) that types a
 * follow-up → cursor clicks Send → mint "Follow-up Sent" pill (220.2×55.4, r28).
 * Hold, drift up and fade, then the box remounts and the lead card plays in again.
 * Reduced motion: the composer with the full message.
 */

/** Prototype `E` (strong ease-out). Not the shared `E`, which is a slightly different curve. */
const E_PROTO = [0.22, 1, 0.36, 1] as const;

const MSG =
  "Hi Ava! Thanks for touring Caladan Lofts. Here’s the application link for the one-bedroom you saw.";

const BOX = {
  card: { width: 320, height: 132.5, borderRadius: 8, backgroundColor: "#ffffff" },
  comp: { width: 400, height: 140, borderRadius: 8, backgroundColor: "#ffffff" },
  pill: { width: 220.2, height: 55.4, borderRadius: 28, backgroundColor: "#00b080" },
} as const;
type St = keyof typeof BOX;

const SNAP = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

interface S {
  st: St;
  tr: boolean;
  typed: number;
  cur: boolean;
  hov: boolean;
  click: boolean;
  out: boolean;
}
const Z: S = { st: "card", tr: false, typed: 0, cur: false, hov: false, click: false, out: false };
const REDUCED: S = { ...Z, st: "comp", tr: true, typed: MSG.length };

/** Layer cross-fade inside the box. */
const lay = (on: boolean, d = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0, scale: on ? 1 : 0.98 },
  transition: { duration: on ? 0.24 : 0.12, ease: CSS_EASE, delay: on ? d : 0 },
});

const BedI = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3F3E3C" strokeWidth="1.17" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.75 11.08V6.42c0-.6.5-1.09 1.1-1.09h8.3c.6 0 1.1.49 1.1 1.09v4.66M2.92 5.33V3.5c0-.6.5-1.08 1.1-1.08h5.96c.6 0 1.1.48 1.1 1.08v1.83M1.75 9.33h10.5" />
  </svg>
);
const DolI = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#3F3E3C" strokeWidth="1.17" strokeLinecap="round">
    <circle cx="7" cy="7" r="5.83" />
    <path d="M8.75 5.25c-.3-.6-1-.9-1.75-.9-1 0-1.75.5-1.75 1.25 0 1.8 3.5.9 3.5 2.7 0 .8-.8 1.3-1.75 1.3-.8 0-1.5-.3-1.8-.9M7 3.5v7" />
  </svg>
);
const IcProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "#7a7977",
  strokeWidth: 1.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Lead card (prototype `Lead`): plays its own entrance on mount; `tr` swaps the chip to TOURED. */
function Lead({ tr, d }: { tr: boolean; d: number }) {
  const f = (dl: number) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: {
      opacity: { duration: 0.4, ease: CSS_EASE, delay: d + dl },
      y: { duration: 0.5, ease: EZ, delay: d + dl },
    },
  });
  return (
    <div className="g2v-lease-c">
      <div className="g2v-lease-top">
        <motion.img
          src={avatarAva}
          alt=""
          width={40}
          height={40}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: E_PROTO, delay: d + 0.18 }}
        />
        <motion.div className="g2v-lease-nm" {...f(0.24)}>
          <b>Ava Mitchell</b>
          <span>Caladan Lofts</span>
        </motion.div>
        <motion.span
          className="g2v-lease-chipw"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: EZ, delay: d + 0.5 }}
        >
          <motion.span
            className="g2v-lease-chip g2v-lease-chip--az"
            initial={false}
            animate={{ opacity: tr ? 0 : 1, scale: tr ? 0.92 : 1 }}
            transition={{ duration: 0.3, ease: CSS_EASE }}
          >
            Tour Scheduled
          </motion.span>
          <motion.span
            className="g2v-lease-chip g2v-lease-chip--mint"
            initial={false}
            animate={{ opacity: tr ? 1 : 0, scale: tr ? [0.9, 1.08, 1] : 0.9 }}
            transition={{
              opacity: { duration: 0.3, ease: CSS_EASE, delay: tr ? 0.08 : 0 },
              scale: { duration: 0.5, ease: EZ, delay: tr ? 0.08 : 0 },
            }}
          >
            Toured
          </motion.span>
        </motion.span>
      </div>
      <motion.i
        className="g2v-lease-hr"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        style={{ originX: 0 }}
        transition={{ duration: 0.7, ease: DRAW, delay: d + 0.32 }}
      />
      <motion.div className="g2v-lease-pf" {...f(0.42)}>
        <span>Preferences</span>
        <div className="g2v-lease-row">
          <BedI />
          1bd/1ba
          <i className="g2v-lease-dot" />
          <DolI />
          $2,000
        </div>
      </motion.div>
    </div>
  );
}

export default function VisLeasing() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<S>(Z);
  const [run, setRun] = useState(0);

  const { reduced } = useLoop(
    ref,
    async ({ wait }) => {
      const P = (p: Partial<S>) => setS((x) => ({ ...x, ...p }));
      for (;;) {
        setRun((r) => r + 1);
        setS(Z);
        if (!(await wait(1200))) return;
        P({ tr: true });
        if (!(await wait(1050))) return;
        P({ st: "comp" });
        if (!(await wait(380))) return;
        for (let i = 1; i <= MSG.length; i++) {
          P({ typed: i });
          if (!(await wait(MSG[i - 1] === " " ? 20 : 14))) return;
        }
        if (!(await wait(380))) return;
        P({ cur: true });
        if (!(await wait(520))) return;
        P({ hov: true });
        if (!(await wait(140))) return;
        P({ click: true });
        if (!(await wait(110))) return;
        P({ click: false });
        if (!(await wait(60))) return;
        P({ st: "pill", cur: false, hov: false });
        if (!(await wait(2200))) return;
        P({ out: true });
        if (!(await wait(500))) return;
      }
    },
    { amount: 0.35 },
  );

  const v = reduced ? REDUCED : s;
  const pill = v.st === "pill";

  return (
    <div ref={ref} className="g2v-lease" aria-hidden>
      <motion.div
        key={"b" + run}
        className="g2v-lease-box"
        style={{ x: "-50%", y: "-50%" }}
        initial={{ opacity: 0, y: "-46%", ...BOX.card }}
        animate={{
          opacity: v.out ? 0 : 1,
          y: v.out ? "-54%" : "-50%",
          ...BOX[v.st],
          boxShadow: pill
            ? "0 26.4px 22px -22px rgba(0,0,0,.2), 0 0 0 0 rgba(0,0,0,0)"
            : "0 2px 4px 0 rgba(0,0,0,.04), 0 0 0 .5px rgba(0,0,0,.05)",
        }}
        transition={{
          default: SNAP,
          backgroundColor: { duration: 0.22, ease: CSS_EASE, delay: pill ? 0.06 : 0 },
          opacity: { duration: 0.35, ease: CSS_EASE },
          y: { duration: 0.5, ease: EZ },
          boxShadow: { duration: 0.3, ease: CSS_EASE },
        }}
      >
        <motion.div className="g2v-lease-l g2v-lease-lead" {...lay(v.st === "card")}>
          <Lead d={0.15} tr={v.tr} />
        </motion.div>

        <motion.div className="g2v-lease-l g2v-lease-comp" {...lay(v.st === "comp", 0.16)}>
          <p>
            {Array.from(MSG).map((c, i) => (
              <span key={i} className={i < v.typed ? "on" : undefined}>
                {c}
              </span>
            ))}
          </p>
          <div className="g2v-lease-bar">
            <span className="g2v-lease-ic">
              <svg {...IcProps}>
                <path d="M4.5 16 10 4l5.5 12M6.6 11.5h6.8" />
              </svg>
              <svg {...IcProps}>
                <path d="M8.5 11.5a3.2 3.2 0 0 0 4.6 0l2.6-2.6a3.2 3.2 0 0 0-4.6-4.6l-.9.9" />
                <path d="M11.5 8.5a3.2 3.2 0 0 0-4.6 0l-2.6 2.6a3.2 3.2 0 0 0 4.6 4.6l.9-.9" />
              </svg>
              <svg {...IcProps}>
                <path d="m15.6 9.4-5.9 5.9a3.9 3.9 0 0 1-5.5-5.5l6.3-6.3a2.6 2.6 0 0 1 3.7 3.7l-6.3 6.3a1.3 1.3 0 0 1-1.8-1.8l5.9-5.9" />
              </svg>
            </span>
            <motion.span
              className={"g2v-lease-send" + (v.hov ? " is-hov" : "")}
              animate={{ scale: v.click ? 0.94 : 1 }}
              transition={{ duration: 0.1, ease: CSS_EASE }}
            >
              Send
            </motion.span>
          </div>
        </motion.div>

        <motion.div className="g2v-lease-l g2v-lease-pill" {...lay(pill, 0.1)}>
          {pill && (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 12.5 9.8 17 19 7.5"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.32, ease: DRAW, delay: 0.16 }}
              />
            </svg>
          )}
          <span>Follow-up Sent</span>
        </motion.div>
      </motion.div>

      <motion.div
        className="g2v-lease-cur"
        initial={false}
        animate={{
          opacity: v.cur ? 1 : 0,
          x: v.cur ? 0 : 110,
          y: v.cur ? 0 : 80,
          scale: v.click ? 0.86 : 1,
        }}
        transition={
          v.click
            ? { duration: 0.09 }
            : {
                x: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
                y: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.18, ease: CSS_EASE },
                scale: { duration: 0.12 },
              }
        }
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <g filter="url(#g2v-lease-cuf)">
            <path
              d="M17 15v21.3l5.2-5 3.3 7.6 3.5-1.5-3.2-7.4h7.2Z"
              fill="#000"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <filter id="g2v-lease-cuf" x="13" y="12.5" width="25" height="31" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodOpacity=".4" />
            </filter>
          </defs>
        </svg>
      </motion.div>
    </div>
  );
}
