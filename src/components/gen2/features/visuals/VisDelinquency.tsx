import { useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import "../../../../utils/interVariableFont";
import { EXPAND, EZ, useLoop } from "../../shared";
import iconDollar from "../../../../assets/gen2/features/delinquency/dollar.svg";
import iconPerson from "../../../../assets/gen2/features/delinquency/person.svg";
import iconCheck from "../../../../assets/gen2/features/delinquency/check.svg";
import iconDue from "../../../../assets/gen2/features/delinquency/due.svg";
import iconSpinner from "../../../../assets/gen2/features/delinquency/spinner.svg";
import ringEnd from "../../../../assets/gen2/features/delinquency/ring.svg";
import "./VisDelinquency.css";

/**
 * Delinquency (VDq) — Figma 692:175214 → 692:175277 → 692:175339.
 * A Payment Plan card (328 wide, centred). The 2nd installment opens by exactly 52px
 * (Amount Due / Date, rows 26 apart) while the card re-centres (y 135 → 109); its status
 * crossfades Due → Sending Reminder → Paid; then the AI Collected callout counts to
 * $1,250 and a purple ring fills to 72%.
 */

const OPEN_H = 52;
const EXPAND_T = { duration: 0.6, ease: EXPAND };
const TOTAL = 1250;
const RING = 0.72;
/** Ring geometry from the Figma export: 48 disc, inner white r16.5 → 7.5 thick band. */
const RING_R = 20.25;
const RING_W = 7.5;

type Status = "due" | "sending" | "paid";

function Paid() {
  return (
    <span className="g2v-dq-st g2v-dq-st--paid">
      <img src={iconCheck} width={14} height={14} alt="" />
      Paid
    </span>
  );
}

function StatusLabel({ status }: { status: Status }) {
  if (status === "paid") return <Paid />;
  if (status === "due")
    return (
      <span className="g2v-dq-st g2v-dq-st--due">
        <img src={iconDue} width={14} height={14} alt="" />
        Due
      </span>
    );
  return (
    <span className="g2v-dq-st g2v-dq-st--sending">
      <span className="g2v-dq-spin">
        <img src={iconSpinner} width={13.17} height={13.17} alt="" />
      </span>
      <span className="g2v-dq-st__grad">Sending Reminder</span>
    </span>
  );
}

/** Status column (fixed 128 wide, right aligned); states stack and crossfade in place. */
function StatusCell({ status }: { status: Status }) {
  return (
    <span className="g2v-dq-status">
      <AnimatePresence initial={false}>
        <motion.span
          key={status}
          className="g2v-dq-status__layer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <StatusLabel status={status} />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export default function VisDelinquency() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("due");
  const [collected, setCollected] = useState(false);
  const amount = useMotionValue(0);
  const ring = useMotionValue(0);
  const amountText = useTransform(amount, (v) => `$${Math.round(v).toLocaleString("en-US")}`);

  const { reduced } = useLoop(ref, async ({ wait, alive }) => {
    while (alive()) {
      setShown(false);
      if (!(await wait(400))) return;
      setOpen(false);
      setStatus("due");
      setCollected(false);
      amount.jump(0);
      ring.jump(0);
      setShown(true);
      if (!(await wait(1000))) return;
      setOpen(true);
      if (!(await wait(1100))) return;
      setStatus("sending");
      if (!(await wait(1700))) return;
      setStatus("paid");
      if (!(await wait(600))) return;
      setCollected(true);
      if (!(await wait(250))) return;
      animate(amount, TOTAL, { duration: 1.3, ease: EZ });
      animate(ring, RING, { duration: 1.3, ease: EZ });
      if (!(await wait(4000))) return;
    }
  });

  const isOpen = reduced || open;
  const st: Status = reduced ? "paid" : status;
  const showCollected = reduced || collected;

  return (
    <div ref={ref} className="g2v-dq" aria-hidden>
      <motion.div
        className="g2v-dq-stage"
        animate={{ opacity: shown || reduced ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        {/* Centred with translateY(-50%), so the 52px open re-centres it (y 135 → 109). */}
        <div className="g2v-dq-card">
          <div className="g2v-dq-head">
            <div className="g2v-dq-tile">
              <img src={iconDollar} width={20} height={20} alt="" />
            </div>
            <div className="g2v-dq-head__text">
              <div className="g2v-dq-title">Payment Plan</div>
              <div className="g2v-dq-who">
                <img src={iconPerson} width={14} height={14} alt="" />
                Rahul Shah
              </div>
            </div>
          </div>

          <div className="g2v-dq-list">
            <div className="g2v-dq-rule" />
            <div className="g2v-dq-row">
              <span>1st Installment</span>
              <span className="g2v-dq-status">
                <span className="g2v-dq-status__layer">
                  <Paid />
                </span>
              </span>
            </div>
            <div className="g2v-dq-rule" />
            <div>
              <div className="g2v-dq-row">
                <span>2nd Installment</span>
                <StatusCell status={st} />
              </div>
              <motion.div
                className="g2v-dq-detail"
                initial={false}
                animate={{ height: isOpen ? OPEN_H : 0 }}
                transition={reduced ? { duration: 0 } : EXPAND_T}
              >
                <div className="g2v-dq-row">
                  <span>Amount Due</span>
                  <span className="g2v-dq-val g2v-dq-num">$625.00</span>
                </div>
                <div className="g2v-dq-row">
                  <span>Date</span>
                  <span className="g2v-dq-val g2v-dq-num">Nov 15, 2026</span>
                </div>
              </motion.div>
            </div>
            <div className="g2v-dq-rule" />
            <div className="g2v-dq-row">
              <span>3rd Installment</span>
              <span className="g2v-dq-num">Dec 15</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCollected && (
            <motion.div
              className="g2v-dq-ai"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EZ }}
            >
              <div className="g2v-dq-ai__text">
                <div className="g2v-dq-ai__label">AI Collected</div>
                <motion.div className="g2v-dq-ai__amount g2v-dq-num">
                  {reduced ? `$${TOTAL.toLocaleString("en-US")}` : amountText}
                </motion.div>
              </div>
              {reduced ? (
                <img className="g2v-dq-ring" src={ringEnd} width={48} height={48} alt="" />
              ) : (
                <svg className="g2v-dq-ring" width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="24" fill="#DFDBFF" />
                  <motion.circle
                    cx="24"
                    cy="24"
                    r={RING_R}
                    fill="none"
                    stroke="#6B4FFF"
                    strokeWidth={RING_W}
                    transform="rotate(-90 24 24)"
                    style={{ pathLength: ring }}
                  />
                  <circle cx="24" cy="24" r="16.5" fill="#fff" />
                  <circle cx="24" cy="24" r="23.625" fill="none" stroke="#fff" strokeWidth="0.75" />
                </svg>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
