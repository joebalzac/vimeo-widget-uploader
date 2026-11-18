import { useRef, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import "../../../../utils/interVariableFont";
import { E, SPRING_FLY, SPRING_POP, SPRING_TILT, useLoop } from "../../shared";
import dotRenewing from "../../../../assets/gen2/features/renewals/dot-renewing.svg";
import dotNotice from "../../../../assets/gen2/features/renewals/dot-notice.svg";
import sepDot from "../../../../assets/gen2/features/renewals/sep-dot.svg";
import iconPerson from "../../../../assets/gen2/features/renewals/person.svg";
import iconPencil from "../../../../assets/gen2/features/renewals/pencil.svg";
import iconCheck from "../../../../assets/gen2/features/renewals/check.svg";
import "./VisRenewals.css";

/**
 * Renewals (VRenew) — Figma 697:175419 → 697:175462 → 697:176180.
 * A two-column board (Renewing / On Notice / Not Renewing) that bleeds off the right and
 * bottom edges. Unit 4C lifts and tilts, flies across to the top of On Notice (whose cards
 * shift down to make room) and leaves a dashed ghost slot that the Renewing cards then
 * close up; once it lands its status crossfades Awaiting Signatures → Notice Given + NTV SAVE.
 */

/** Board geometry (px in the 660×460 design). Columns 344.5 wide, 4 apart. */
const BOARD = 40;
const COL_STEP = 348.5;
const BODY_TOP = 47; // column header height
const SLOT = 117; // card 111 + gap 6
const slotY = (i: number) => 16 + i * SLOT;
/** Unit 4C flies from Renewing slot 0 to On Notice slot 0. */
const FLY_X = BOARD + 4 + 16;
const FLY_Y = BOARD + BODY_TOP + 16;
const DX = COL_STEP;
const MAX_TILT = 10;

interface Unit {
  unit: string;
  who: string;
  place: string;
  days: string;
}

const C4: Unit = { unit: "Unit 4C", who: "Jane Shaw", place: "Caladan Lofts", days: "12d" };
const RENEWING: Unit[] = [
  { unit: "Unit 6D", who: "Priya Desai", place: "Oakview", days: "15d" },
  { unit: "Unit 1F", who: "Daniel Nguyen", place: "Caladan Lofts", days: "21d" },
];
const ON_NOTICE: Unit[] = [
  { unit: "Unit 1B", who: "Owen Sullivan", place: "Oakview", days: "12d" },
  { unit: "Unit 5C", who: "Julian Reyes", place: "Oakview", days: "15d" },
  { unit: "Unit 1E", who: "Naomi Kim", place: "Aura Estates", days: "21d" },
];

function Awaiting() {
  return (
    <span className="g2v-renew-st g2v-renew-st--await">
      <img src={iconPencil} width={14} height={14} alt="" />
      Awaiting Signatures
    </span>
  );
}

function NoticeGiven({ ntv = true, reduced }: { ntv?: boolean; reduced?: boolean }) {
  return (
    <span className="g2v-renew-st g2v-renew-st--notice">
      <img src={iconCheck} width={14} height={14} alt="" />
      Notice Given
      <AnimatePresence initial={false}>
        {ntv && (
          <motion.span
            className="g2v-renew-tag g2v-renew-tag--ntv"
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1, transition: SPRING_POP }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            NTV Save
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function CardTop({ u }: { u: Unit }) {
  return (
    <div className="g2v-renew-card__top">
      <div className="g2v-renew-card__id">
        <div className="g2v-renew-card__line">
          <span>{u.unit}</span>
          <img src={sepDot} width={2} height={2} alt="" />
          <span className="g2v-renew-card__who">
            <img src={iconPerson} width={14} height={14} alt="" />
            {u.who}
          </span>
        </div>
        <div className="g2v-renew-card__place">{u.place}</div>
      </div>
      <span className="g2v-renew-tag">{u.days}</span>
    </div>
  );
}

function Column({ x, dot, title }: { x: number; dot: string; title: string }) {
  return (
    <div className="g2v-renew-col" style={{ left: x }}>
      <div className="g2v-renew-col__head">
        <img src={dot} width={10} height={10} alt="" />
        {title}
      </div>
      <div className="g2v-renew-col__body" />
    </div>
  );
}

const SHIFT_T = { duration: 0.55, ease: E };

export default function VisRenewals() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  const [lifted, setLifted] = useState(false);
  const [moved, setMoved] = useState(false);
  const [landed, setLanded] = useState(false);
  const [closed, setClosed] = useState(false);
  const [ntv, setNtv] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xVel = useVelocity(x);
  /** Figma's mid-flight frame tilts the card -10° (leading edge up). */
  const tilt = useSpring(
    useTransform(xVel, (v) => -Math.max(-MAX_TILT, Math.min(MAX_TILT, v / 70))),
    SPRING_TILT,
  );

  const { reduced } = useLoop(ref, async ({ wait, alive }) => {
    while (alive()) {
      setShown(false);
      if (!(await wait(400))) return;
      x.jump(0);
      y.jump(0);
      tilt.jump(0);
      setLifted(false);
      setMoved(false);
      setLanded(false);
      setClosed(false);
      setNtv(false);
      setShown(true);
      if (!(await wait(1100))) return;
      // Lift: elevated shadow, ghost slot appears behind.
      setLifted(true);
      if (!(await wait(320))) return;
      // Fly across in a shallow downward arc; On Notice makes room at the top.
      setMoved(true);
      animate(x, DX, SPRING_FLY);
      animate(y, [0, 44, 0], { duration: 0.95, ease: [0.45, 0, 0.35, 1], times: [0, 0.45, 1] });
      if (!(await wait(820))) return;
      setLifted(false);
      if (!(await wait(380))) return;
      setLanded(true);
      setClosed(true);
      if (!(await wait(450))) return;
      setNtv(true);
      if (!(await wait(3000))) return;
    }
  });

  const isMoved = reduced || moved;
  const isLanded = reduced || landed;
  const isClosed = reduced || closed;
  const showNtv = reduced || ntv;
  const shiftT = reduced ? { duration: 0 } : SHIFT_T;

  return (
    <div ref={ref} className="g2v-renew" aria-hidden>
      <motion.div
        className="g2v-renew-stage"
        animate={{ opacity: shown || reduced ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <Column x={BOARD} dot={dotRenewing} title="Renewing" />
        <Column x={BOARD + COL_STEP} dot={dotNotice} title="On Notice / Not Renewing" />

        {/* Card layers clip to each column body (white panel), like Figma's overflow-clip. */}
        <div className="g2v-renew-clip" style={{ left: BOARD + 4, top: BOARD + BODY_TOP }}>
          {/* Dashed ghost slot left behind by Unit 4C; Renewing cards close up over it. */}
          <motion.div
            className="g2v-renew-ghost"
            style={{ top: slotY(0) }}
            initial={false}
            animate={{ opacity: !isClosed && (lifted || moved) ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
          {RENEWING.map((u, i) => (
            <motion.div
              key={u.unit}
              className="g2v-renew-card"
              style={{ top: slotY(i + 1) }}
              initial={false}
              animate={{ y: isClosed ? -SLOT : 0 }}
              transition={shiftT}
            >
              <CardTop u={u} />
              <div className="g2v-renew-rule" />
              <div className="g2v-renew-card__foot">
                <Awaiting />
              </div>
            </motion.div>
          ))}
        </div>
        <div className="g2v-renew-clip" style={{ left: BOARD + COL_STEP + 4, top: BOARD + BODY_TOP }}>
          {ON_NOTICE.map((u, i) => (
            <motion.div
              key={u.unit}
              className="g2v-renew-card"
              style={{ top: slotY(i) }}
              initial={false}
              animate={{ y: isMoved ? SLOT : 0 }}
              transition={reduced ? { duration: 0 } : { ...SHIFT_T, delay: 0.25 }}
            >
              <CardTop u={u} />
              <div className="g2v-renew-rule" />
              <div className="g2v-renew-card__foot">
                <NoticeGiven />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Unit 4C: the flying card (stage level so it can cross the columns). */}
        <motion.div
          className="g2v-renew-card g2v-renew-card--fly"
          style={{
            left: FLY_X,
            top: FLY_Y,
            x: reduced ? DX : x,
            y: reduced ? 0 : y,
            rotate: reduced ? 0 : tilt,
          }}
          initial={false}
          animate={{
            boxShadow:
              lifted || isMoved
                ? "0px 32px 40px -20px rgba(0,0,0,0.1), 0px 2px 4px 0px rgba(0,0,0,0.04), 0px 1px 2px 0px rgba(0,0,0,0.04), 0px 0px 0px 0.5px rgba(0,0,0,0.05)"
                : "0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0px rgba(0,0,0,0), 0px 0px 0px 0.5px rgba(221,220,218,1)",
          }}
          transition={{ duration: 0.3, ease: E }}
        >
          <CardTop u={C4} />
          <div className="g2v-renew-rule" />
          <div className="g2v-renew-card__foot">
            <span className="g2v-renew-swap">
              <AnimatePresence initial={false}>
                <motion.span
                  key={isLanded ? "notice" : "await"}
                  className="g2v-renew-swap__layer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {isLanded ? <NoticeGiven ntv={showNtv} reduced={reduced} /> : <Awaiting />}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
