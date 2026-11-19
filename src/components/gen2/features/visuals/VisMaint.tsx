import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "../../../../utils/interVariableFont";
import { E, useLoop } from "../../shared";
import turnSvg from "../../../../assets/gen2/features/maint/icon-turn.svg";
import turnLgSvg from "../../../../assets/gen2/features/maint/icon-turn-lg.svg";
import dotSvg from "../../../../assets/gen2/features/maint/dot.svg";
import dividerSvg from "../../../../assets/gen2/features/maint/divider.svg";
import caretMintSvg from "../../../../assets/gen2/features/maint/pill-caret.svg";
import caretBlueSvg from "../../../../assets/gen2/features/maint/pill-caret-blue.svg";
import checkSvg from "../../../../assets/gen2/features/maint/icon-check.svg";
import spinnerSvg from "../../../../assets/gen2/features/maint/icon-spinner.svg";
import "./VisMaint.css";

/**
 * Maintenance (Figma 636:54214 → 642:88989 → 636:56292): three turn cards, the centre one
 * "Unit 3A Turn" (the side cards are faded to 10%). Its 7-segment progress bar sweeps in
 * mint and stops on segment 6, which fills part-way in azure with a blue CLEANING pill
 * hanging under it; then the bar completes in mint, the pill becomes a mint COMPLETE pill
 * (check draws in) and the chip changes VACANT → READY. Handoff 04: pill and chip are
 * fixed size (pill 96 wide) and their contents crossfade in place; nothing moves.
 */

const SEGS = 7;
/** Index of the segment the sweep stops on (segment 6). */
const STOP = 5;
/** Partial fill of the active segment (Figma 18.2 of 39.4). */
const ACTIVE_FRAC = 18.215 / 39.43;

type Phase = "none" | "cleaning" | "complete";

/** Pill geometry in card space: 96 wide, centred under segment 6 (Figma CLEANING
 *  centre x420.6), caret top y301. Fixed for both states. */
const PILL = { left: 420.63 - 48, width: 96 } as const;

function TurnCard({
  className,
  unit,
  building,
  due,
  moveOut,
  children,
  icon = "sm",
  ready,
}: {
  className: string;
  unit: string;
  building: string;
  due: string;
  moveOut: string;
  children: ReactNode;
  icon?: "sm" | "lg";
  /** Animated chip (main card): crossfades VACANT → READY in a fixed-size chip. */
  ready?: boolean;
}) {
  return (
    <div className={`g2v-maint-card ${className}`}>
      <div className="g2v-maint-card__head">
        <span className="g2v-maint-card__icon">
          {icon === "lg" ? (
            <img src={turnLgSvg} alt="" width={20} height={20} />
          ) : (
            <img src={turnSvg} alt="" width={16} height={16} />
          )}
        </span>
        <div className="g2v-maint-card__headmain">
          <div>
            <p className="g2v-maint-card__title">{unit}</p>
            <p className="g2v-maint-card__sub">
              {building}
              <img src={dotSvg} alt="" width={2} height={2} />
              Aura Estates
            </p>
          </div>
          {ready === undefined ? (
            <span className="g2v-maint-chip">Vacant</span>
          ) : (
            <span className={`g2v-maint-chip g2v-maint-chip--swap${ready ? " is-ready" : ""}`}>
              <span className="g2v-maint-chip__l g2v-maint-chip__l--vacant">Vacant</span>
              <span className="g2v-maint-chip__l g2v-maint-chip__l--ready">Ready</span>
            </span>
          )}
        </div>
      </div>
      <div className="g2v-maint-rows">
        <img className="g2v-maint-divider" src={dividerSvg} alt="" width={288} height={0.5} />
        <div className="g2v-maint-row">
          <span>Due Date</span>
          <span>{due}</span>
        </div>
        <img className="g2v-maint-divider" src={dividerSvg} alt="" width={288} height={0.5} />
        <div className="g2v-maint-row">
          <span>Move-Out</span>
          <span>{moveOut}</span>
        </div>
      </div>
      <div className="g2v-maint-bar">{children}</div>
    </div>
  );
}

function StaticSegs({ done, tone }: { done: number; tone: "mint" | "azure" }) {
  return (
    <>
      {Array.from({ length: SEGS }, (_, i) => (
        <span key={i} className={`g2v-maint-seg${i < done ? ` is-${tone}` : ""}`} />
      ))}
    </>
  );
}

export default function VisMaint() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  const [filled, setFilled] = useState(4.5);
  const [phase, setPhase] = useState<Phase>("none");

  const { reduced } = useLoop(ref, async ({ wait, alive }) => {
    while (alive()) {
      // Reset while hidden so nothing visibly un-fills. Frame 1: 4½ segments done.
      setShown(false);
      if (!(await wait(400))) return;
      setFilled(4.5);
      setPhase("none");
      setShown(true);
      if (!(await wait(1100))) return;
      // Finish segment 5, then stop on 6.
      setFilled(STOP);
      if (!(await wait(260))) return;
      setPhase("cleaning");
      if (!(await wait(2000))) return;
      setFilled(SEGS);
      setPhase("complete");
      if (!(await wait(3500))) return;
    }
  });

  const f = reduced ? SEGS : filled;
  const ph: Phase = reduced ? "complete" : phase;

  return (
    <div ref={ref} className="g2v-maint" aria-hidden>
      <motion.div
        className="g2v-maint-stage"
        animate={{ opacity: shown || reduced ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <TurnCard className="g2v-maint-card--l" unit="Unit 1C Turn" building="Building 1" due="November 15" moveOut="November 10">
          <StaticSegs done={SEGS} tone="mint" />
        </TurnCard>
        <TurnCard className="g2v-maint-card--r" unit="Unit 2B Turn" building="Building 1" due="November 28" moveOut="November 20">
          <StaticSegs done={1} tone="azure" />
        </TurnCard>

        <TurnCard
          className="g2v-maint-card--main"
          unit="Unit 3A Turn"
          building="Building 1"
          due="November 28"
          moveOut="November 20"
          icon={ph === "complete" ? "sm" : "lg"}
          ready={ph === "complete"}
        >
          {Array.from({ length: SEGS }, (_, i) => {
            const active = ph === "cleaning" && i === STOP;
            const frac = Math.max(0, Math.min(1, f - i));
            return (
              <span key={i} className="g2v-maint-seg">
                <motion.span
                  className={`g2v-maint-seg__fill${active ? " is-active" : ""}`}
                  initial={false}
                  animate={{ scaleX: active ? ACTIVE_FRAC : frac }}
                  transition={reduced ? { duration: 0 } : { duration: 0.26, ease: E, delay: ph === "complete" ? (i - STOP) * 0.08 : 0 }}
                />
              </span>
            );
          })}
        </TurnCard>

        {/* Status pill: hangs under segment 6; CLEANING → COMPLETE crossfades in place. */}
        <AnimatePresence>
          {ph !== "none" && (
            <motion.div
              className={`g2v-maint-pill is-${ph}`}
              style={{ left: PILL.left, width: PILL.width }}
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={reduced ? { duration: 0 } : { duration: 0.45, ease: E }}
            >
              <span className="g2v-maint-pill__caret">
                <img className="g2v-maint-pill__c g2v-maint-pill__c--blue" src={caretBlueSvg} alt="" width={9.75} height={4.5} />
                <img className="g2v-maint-pill__c g2v-maint-pill__c--mint" src={caretMintSvg} alt="" width={9.75} height={4.5} />
              </span>
              <span className="g2v-maint-pill__body">
                <span className="g2v-maint-pill__label g2v-maint-pill__label--cleaning">
                  <img className="g2v-maint-spin" src={spinnerSvg} alt="" width={11.25} height={11.25} />
                  Cleaning
                </span>
                <span className="g2v-maint-pill__label g2v-maint-pill__label--complete">
                  <img src={checkSvg} alt="" width={12} height={12} />
                  Complete
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
