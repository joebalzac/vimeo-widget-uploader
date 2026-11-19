import { useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import StatusChip from "../../shared/StatusChip";
import { E } from "../../shared/motion";
import { useLoop } from "../../shared/useLoop";
import avatarAva from "../../../../assets/gen2/features/leasing/avatar-ava.jpg";
import iconBed from "../../../../assets/gen2/features/leasing/icon-bed.svg";
import iconDollar from "../../../../assets/gen2/features/leasing/icon-dollar.svg";
import iconText from "../../../../assets/gen2/features/leasing/icon-text.svg";
import iconLink from "../../../../assets/gen2/features/leasing/icon-link.svg";
import iconAttach from "../../../../assets/gen2/features/leasing/icon-attach.svg";
import cursorSvg from "../../../../assets/gen2/features/leasing/cursor.svg";
import "./VisLeasing.css";

/**
 * Leasing visual (Figma 876:180249, handoff 04 v112 + v113 timing). One white container
 * morphs the whole way: lead card (320×132.5, TOUR SCHEDULED → TOURED) → composer
 * (400×140, r8) that types out a follow-up → cursor clicks Send → the container
 * converges into the mint "Follow-up Sent" pill (220×55.4, r28). Hold, out, loop.
 */

/** 0 reset · 1 card in · 2 toured · 3 composer · 4 typing · 5 cursor glide · 6 hover ·
 *  7 click · 8 converged (pill) · 9 out */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const MESSAGE =
  "Hi Ava! Thanks for touring Caladan Lofts. Here’s the application link for the one-bedroom you saw.";
/** Type-out: 14ms per letter, 20ms on spaces; each letter runs `lfch` for .55s. */
const LETTER_MS = 14;
const SPACE_MS = 20;
const LFCH_MS = 550;

/** Container sizes per state (Figma 872:179876 / 872:180193 / 872:180219). */
const BOX = {
  card: { width: 320, height: 132.5, borderRadius: 8, backgroundColor: "#ffffff" },
  composer: { width: 400, height: 140, borderRadius: 8, backgroundColor: "#ffffff" },
  pill: { width: 220.22, height: 55.44, borderRadius: 28, backgroundColor: "#00b080" },
} as const;
const SHADOW_CARD =
  "0px 2px 4px 0px rgba(0,0,0,0.04), 0px 1px 2px 0px rgba(0,0,0,0.04), 0px 0px 0px 0.5px rgba(0,0,0,0.05)";
const SHADOW_PILL =
  "0px 26.4px 22px -22px rgba(0,0,0,0.2), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0)";
/** v113: the container morphs on one spring; the fill change is a quick tween. */
const MORPH = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

/** Cursor (48×48): Figma parks it at x490 y264.75 so its tip sits on Send. */
const CURSOR_ON = { x: 490, y: 264.75 };
const CURSOR_OFF = { x: 590, y: 420 };

/** The type-out, one span per letter (spaces stay plain so lines wrap normally). */
function TypeOut({ on, still }: { on: boolean; still: boolean }) {
  const letters = useMemo(() => {
    let t = 0;
    return Array.from(MESSAGE).map((ch) => {
      const d = t;
      t += ch === " " ? SPACE_MS : LETTER_MS;
      return { ch, d };
    });
  }, []);
  return (
    <p
      className={
        "g2v-lease-msg" + (still ? " g2v-lease-msg--still" : on ? " g2v-lease-msg--on" : "")
      }
      aria-label={MESSAGE}
    >
      {letters.map(({ ch, d }, i) =>
        ch === " " ? (
          " "
        ) : (
          <span key={i} aria-hidden style={{ "--d": `${d}ms` } as CSSProperties}>
            {ch}
          </span>
        ),
      )}
    </p>
  );
}

/** Total type-out time, including the last letter settling. */
const TYPE_MS =
  Array.from(MESSAGE).reduce((t, ch) => t + (ch === " " ? SPACE_MS : LETTER_MS), 0) + LFCH_MS;

export default function VisLeasing() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<Step>(0);

  const { reduced } = useLoop(ref, async ({ wait }) => {
    const seq: [Step, number][] = [
      [1, 1200], // card in → Toured 1.2s
      [2, 1050], // Toured → composer 1.05s
      [3, 420], // morph; composer fades in (.35s after .3s)
      [4, TYPE_MS], // type-out ~1.5s
      [5, 500], // cursor glide .5s
      [6, 140], // hover .14s
      [7, 110], // click .11s
      [8, 2200 + 450], // converge (+ check draw) then hold 2.2s
      [9, 500], // out .5s
    ];
    for (;;) {
      setS(0);
      if (!(await wait(250))) return;
      for (const [step, ms] of seq) {
        setS(step);
        if (!(await wait(ms))) return;
      }
    }
  });

  // Reduced motion: the static composer with the full message.
  const step: Step = reduced ? 4 : s;
  const instant = reduced || step === 0;
  const box = step >= 8 ? BOX.pill : step >= 3 ? BOX.composer : BOX.card;
  const cardOn = step >= 1 && step <= 2;
  const composerOn = step >= 3 && step <= 7;
  const pillOn = step >= 8;
  const cursorOn = step >= 5 && step <= 7;

  return (
    <div ref={ref} className="g2v-lease">
      <motion.div
        className="g2v-lease-stage"
        initial={false}
        animate={
          step === 0
            ? { opacity: 0, y: 24 }
            : step === 9
            ? { opacity: 0, y: -16 }
            : { opacity: 1, y: 0 }
        }
        transition={
          instant ? { duration: 0 } : { duration: step === 9 ? 0.5 : 0.6, ease: E }
        }
      >
        <motion.div
          className="g2v-lease-box"
          initial={false}
          animate={{ ...box, boxShadow: pillOn ? SHADOW_PILL : SHADOW_CARD }}
          transition={
            instant
              ? { duration: 0 }
              : {
                  default: MORPH,
                  backgroundColor: { duration: 0.22, ease: "easeOut" },
                  boxShadow: { duration: 0.3, ease: "easeOut" },
                }
          }
        >
          {/* 1 · Lead card (Figma 872:179879) */}
          <motion.div
            className="g2v-lease-card"
            initial={false}
            animate={{ opacity: cardOn || step === 0 ? 1 : 0 }}
            transition={instant ? { duration: 0 } : { duration: 0.2 }}
            aria-hidden={!cardOn}
          >
            <div className="g2v-lease-card__head">
              <img className="g2v-lease-card__avatar" src={avatarAva} alt="" width={40} height={40} />
              <div className="g2v-lease-card__top">
                <div className="g2v-lease-card__who">
                  <span className="g2v-lease-card__name">Ava Mitchell</span>
                  <span className="g2v-lease-card__prop">Caladan Lofts</span>
                </div>
                <StatusChip
                  className="g2v-lease-chip"
                  label={step >= 2 ? "TOURED" : "TOUR SCHEDULED"}
                  tone={step >= 2 ? "green" : "blue"}
                />
              </div>
            </div>
            <i className="g2v-lease-card__rule" />
            <div className="g2v-lease-card__prefs">
              <span className="g2v-lease-card__label">Preferences</span>
              <span className="g2v-lease-card__pref-row">
                <span className="g2v-lease-card__pref">
                  <img src={iconBed} alt="" width={14} height={14} />
                  1bd/1ba
                </span>
                <i className="g2v-lease-card__dot" />
                <span className="g2v-lease-card__pref">
                  <img src={iconDollar} alt="" width={14} height={14} />
                  $2,000
                </span>
              </span>
            </div>
          </motion.div>

          {/* 2 · Composer (Figma 872:180193) */}
          <motion.div
            className="g2v-lease-composer"
            initial={false}
            animate={{ opacity: composerOn ? 1 : 0 }}
            transition={
              instant
                ? { duration: 0 }
                : composerOn
                ? { duration: 0.35, delay: 0.3 }
                : { duration: 0.15 }
            }
            aria-hidden={!composerOn}
          >
            <TypeOut on={step >= 4} still={reduced} />
            <div className="g2v-lease-toolbar">
              <div className="g2v-lease-tools">
                <img src={iconText} alt="" width={20} height={20} />
                <img src={iconLink} alt="" width={20} height={20} />
                <img src={iconAttach} alt="" width={20} height={20} />
              </div>
              <motion.span
                className={"g2v-lease-send" + (step === 6 || step === 7 ? " is-hover" : "")}
                initial={false}
                animate={{ scale: step === 7 ? 0.95 : 1 }}
                transition={instant ? { duration: 0 } : { duration: 0.11 }}
              >
                Send
              </motion.span>
            </div>
          </motion.div>

          {/* 3 · Success pill (Figma 872:180219) */}
          <motion.div
            className="g2v-lease-pill"
            initial={false}
            animate={{ opacity: pillOn ? 1 : 0 }}
            transition={instant ? { duration: 0 } : { duration: 0.2, delay: pillOn ? 0.12 : 0 }}
            aria-hidden={!pillOn}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <motion.path
                d="M20 6L8.99998 17L3.99998 12"
                stroke="#fff"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: pillOn ? 1 : 0 }}
                transition={
                  instant || !pillOn
                    ? { duration: 0 }
                    : { duration: 0.32, delay: 0.22, ease: "easeOut" }
                }
              />
            </svg>
            <span>Follow-up Sent</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.img
        className="g2v-lease-cursor"
        src={cursorSvg}
        alt=""
        width={48}
        height={48}
        initial={false}
        animate={
          cursorOn
            ? { opacity: 1, ...CURSOR_ON, scale: step === 7 ? 0.88 : 1 }
            : step >= 8
            ? { opacity: 0, ...CURSOR_ON, scale: 1 }
            : { opacity: 0, ...CURSOR_OFF, scale: 1 }
        }
        transition={
          instant
            ? { duration: 0 }
            : step === 5
            ? { duration: 0.5, ease: E }
            : step === 7
            ? { duration: 0.11 }
            : { duration: 0.2 }
        }
      />
    </div>
  );
}
