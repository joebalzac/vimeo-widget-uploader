import { useRef, useState } from "react";
import { motion } from "framer-motion";
import StatusChip from "../../shared/StatusChip";
import { E } from "../../shared/motion";
import { useLoop } from "../../shared/useLoop";
import avatarAva from "../../../../assets/gen2/features/leasing/avatar-ava.jpg";
import avatarMateo from "../../../../assets/gen2/features/leasing/avatar-mateo.jpg";
import iconBed from "../../../../assets/gen2/features/leasing/icon-bed.svg";
import iconDollar from "../../../../assets/gen2/features/leasing/icon-dollar.svg";
import cursorSvg from "../../../../assets/gen2/features/leasing/cursor.svg";
import "./VisLeasing.css";

/**
 * LeasingAI visual (Figma 632:53306 → 632:53308 → 636:53665, + 692:175157). Two stacked
 * lead cards rise in, their chips flip TOUR SCHEDULED → TOURED, they converge while the
 * Generate Lease pill grows in, a cursor clicks it, the lease document replaces the pill
 * and a scan band turns its skeleton into text. Hold, fade, loop.
 */

/** 0 empty · 1 cards in · 2 toured · 3 converge + button · 4 cursor hover · 5 click ·
 *  6 lease in · 7 scanning · 8 scanned (final frame) · 9 fade out */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
const FINAL: Step = 8;

const LEADS = [
  {
    name: "Ava Mitchell",
    property: "Caladan Lofts",
    unit: "1bd/1ba",
    rent: "$2,000",
    photo: avatarAva,
  },
  {
    name: "Mateo Alvarez",
    property: "Oakview",
    unit: "2bd/1ba",
    rent: "$2,500",
    photo: avatarMateo,
  },
];
/** Cards are stacked (320 wide at x170, 6 apart, centred vertically); each is 131.2 tall. */
const CONVERGE_Y = [68.6, -68.6];
const ENTER = [
  { y: 60, rotate: 6 },
  { y: 60, rotate: -6 },
]; // counter-rotation on the way in

/** Scan band: 330 wide at x165, its bottom edge (the line) sweeps the 360-tall lease. */
const DOC_TOP = 50;
const DOC_H = 360;
const BAND_H = 180;
/** Where the line sits in Figma's final frame (636:53665). */
const FIGMA_LINE_Y = 230;

const FIELDS = [
  ["Tenant", "Ava Mitchell", "Unit", "2A"],
  [
    "Property",
    "1847 Alder Row,\nBrooklyn, NY 11201",
    "Bedrooms",
    "1bd/1ba, 925 sq ft",
  ],
  ["Monthly rent", "$2,000.00", "Lease term", "12 mo"],
  ["Due date", "1st of Each Month", "Sec. deposit", "$2,000.00"],
];

const CLAUSES: [string, string][] = [
  [
    "Premises",
    "Landlord leases Unit 2A to Tenant for residential use. Tenant will keep the apartment clean, care for its fixtures, and promptly report needed repairs.",
  ],
  [
    "Rent",
    "Monthly rent is $2,000, due on the first of each month. Tenant may pay through the resident portal or by check. A $50 late fee may apply if rent is more than five days overdue.",
  ],
  [
    "Security Deposit",
    "Landlord will return the balance of the $2,000 deposit within 14 days after move-out and provide an itemized statement of any lawful deductions.",
  ],
  [
    "Utilities",
    "Water, sewer, trash, and internet are included. Tenant pays for electricity and gas and carries $100,000 in renters liability coverage, with Landlord listed as an interested party.",
  ],
  [
    "Occupants",
    "Tenant may share the apartment as permitted by New York law. Subletting and short-term rentals are subject to applicable law and required approvals.",
  ],
  [
    "Pets",
    "Up to two pets require written approval and an addendum covering fees and restrictions. Assistance animal requests follow applicable fair housing law.",
  ],
  [
    "Maintenance",
    "Tenant keeps drains clear, replaces bulbs, and requests repairs through the portal. Landlord makes legally required repairs. Alterations require written approval.",
  ],
  [
    "Community Rules",
    "Quiet hours are 10 p.m. to 8 a.m. Residents follow the posted guidelines. Landlord gives 30 days’ written notice of changes, subject to law.",
  ],
  [
    "Entry",
    "Landlord may enter at reasonable times for inspections or repairs with notice under NYC rules. Qualifying emergency repairs may proceed without advance notice.",
  ],
  [
    "Early Termination",
    "Tenant may request early release with 60 days’ written notice. Any agreement must be in writing. Statutory termination rights apply.",
  ],
  [
    "Move-Out",
    "Tenant will remove belongings, return keys and access cards, and leave the apartment in its move-in condition, allowing for ordinary wear and tear.",
  ],
  [
    "Governing Law",
    "New York State law and applicable New York City laws and regulations govern this lease and the rights and obligations of both parties.",
  ],
];

const SIGN = [
  ["Tenant", "Ava Mitchell"],
  ["Landlord / authorized agent", "Mike Lopez, Leasing Manager"],
];

/** Multi-line text as one span per line (so the skeleton draws one bar per line). */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((l) => (
        <span key={l} className="g2v-lease-doc__ln">
          <span>{l}</span>
        </span>
      ))}
    </>
  );
}

/** The lease page, laid out at 2× Figma (556×720) and scaled ×0.5 so 3–5px type stays crisp. */
function LeaseBody({ skeleton }: { skeleton?: boolean }) {
  return (
    <div
      className={
        "g2v-lease-doc__body" + (skeleton ? " g2v-lease-doc__body--skel" : "")
      }
      aria-hidden={skeleton}
    >
      <div className="g2v-lease-doc__head">
        <p className="g2v-lease-doc__name">
          <span>Caladan Lofts</span>
        </p>
        <div className="g2v-lease-doc__contact">
          <p>
            <Lines text={"1847 Alder Row,\nBrooklyn, NY 11201"} />
          </p>
          <i className="g2v-lease-doc__vr" />
          <p>
            <Lines text={"(718) 555-0142\nleasing@caladanlofts.com"} />
          </p>
        </div>
      </div>

      <div className="g2v-lease-doc__table">
        {FIELDS.map(([k1, v1, k2, v2]) => (
          <div key={k1} className="g2v-lease-doc__row">
            <span className="g2v-lease-doc__k">
              <span>{k1}</span>
            </span>
            <span className="g2v-lease-doc__v">
              <Lines text={v1} />
            </span>
            <span className="g2v-lease-doc__k">
              <span>{k2}</span>
            </span>
            <span className="g2v-lease-doc__v">
              <Lines text={v2} />
            </span>
          </div>
        ))}
      </div>

      <div className="g2v-lease-doc__clauses">
        {CLAUSES.slice(0, 6).map((left, i) => {
          const right = CLAUSES[i + 6];
          return (
            <div key={left[0]} className="g2v-lease-doc__crow">
              {[left, right].map(([title, body], j) => (
                <ol key={title} start={i + 1 + j * 6}>
                  <li>
                    <span>
                      <b>{title}</b>. {body}
                    </span>
                  </li>
                </ol>
              ))}
            </div>
          );
        })}
      </div>

      <div className="g2v-lease-doc__signs">
        {SIGN.map(([who, name]) => (
          <div key={who} className="g2v-lease-doc__sign">
            <div className="g2v-lease-doc__sighead">
              <span className="g2v-lease-doc__k">
                <span>{who}</span>
              </span>
              <span className="g2v-lease-doc__k">
                <span>Date</span>
              </span>
            </div>
            <div className="g2v-lease-doc__sigbody">
              {[name, "mm/dd/yyyy"].map((v) => (
                <div key={v} className="g2v-lease-doc__sigcell">
                  <i className="g2v-lease-doc__sigline" />
                  <span className="g2v-lease-doc__sigval">
                    <span>{v}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VisLeasing() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<Step>(0);

  const { reduced } = useLoop(ref, async ({ wait }) => {
    const seq: [Step, number][] = [
      [1, 1400],
      [2, 1200],
      [3, 900],
      [4, 1000],
      [5, 220],
      [6, 700],
      [7, 2700],
      [8, 1900],
      [9, 500],
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

  const step: Step = reduced ? FINAL : s;
  const cardsOn = step >= 1 && step <= 2;
  const btnOn = step >= 3 && step <= 5;
  const docOn = step >= 6 && step <= 9;
  const scanned = step >= 7;
  const instant = reduced || step === 0;

  // Band bottom edge = the scan line. It sweeps the page top → bottom while scanning;
  // the reduced-motion final frame shows Figma's frame (line part-way down).
  const lineY = reduced ? FIGMA_LINE_Y : step >= 7 ? DOC_TOP + DOC_H : DOC_TOP;
  const bandOn = reduced || step === 7;

  return (
    <motion.div
      ref={ref}
      className="g2v-lease"
      animate={{ opacity: step === 9 ? 0 : 1 }}
      transition={{ duration: step === 9 ? 0.5 : 0 }}
    >
      <div className="g2v-lease-stack">
        {LEADS.map((lead, i) => (
          <motion.div
            key={lead.name}
            className="g2v-lease-card"
            style={{ zIndex: i === 0 ? 2 : 1 }}
            initial={false}
            animate={
              cardsOn
                ? { opacity: 1, y: 0, rotate: 0, scale: 1 }
                : step === 0
                ? {
                    opacity: 0,
                    y: ENTER[i].y,
                    rotate: ENTER[i].rotate,
                    scale: 1,
                  }
                : { opacity: 0, y: CONVERGE_Y[i], rotate: 0, scale: 0.9 }
            }
            transition={
              instant
                ? { duration: 0 }
                : step >= 3
                ? { duration: 0.6, ease: "easeInOut" }
                : { duration: 0.8, ease: E, delay: i * 0.12 }
            }
          >
            <div className="g2v-lease-card__head">
              <img
                className="g2v-lease-card__avatar"
                src={lead.photo}
                alt=""
                width={40}
                height={40}
              />
              <div className="g2v-lease-card__top">
                <div className="g2v-lease-card__who">
                  <span className="g2v-lease-card__name">{lead.name}</span>
                  <span className="g2v-lease-card__prop">{lead.property}</span>
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
                  {lead.unit}
                </span>
                <i className="g2v-lease-card__dot" />
                <span className="g2v-lease-card__pref">
                  <img src={iconDollar} alt="" width={14} height={14} />
                  {lead.rent}
                </span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="g2v-lease-btn"
        initial={false}
        animate={
          btnOn
            ? { opacity: 1, scale: step === 5 ? 0.96 : 1, y: 0 }
            : {
                opacity: 0,
                scale: step >= 6 ? 0.92 : 0.82,
                y: step >= 6 ? -12 : 0,
              }
        }
        transition={
          instant
            ? { duration: 0 }
            : step === 5
            ? { duration: 0.12 }
            : step >= 6
            ? { duration: 0.35, ease: E }
            : { duration: 0.6, ease: E }
        }
      >
        Generate Lease
      </motion.div>

      <motion.img
        className="g2v-lease-cursor"
        src={cursorSvg}
        alt=""
        width={48}
        height={48}
        initial={false}
        animate={
          step >= 4 && step <= 5
            ? { opacity: 1, x: 383, y: 237, scale: step === 5 ? 0.88 : 1 }
            : step >= 6
            ? { opacity: 0, x: 391, y: 253, scale: 1 }
            : { opacity: 0, x: 560, y: 470, scale: 1 }
        }
        transition={
          instant
            ? { duration: 0 }
            : step === 4
            ? { duration: 0.8, ease: E }
            : { duration: step === 5 ? 0.12 : 0.3 }
        }
      />

      <motion.div
        className="g2v-lease-doc"
        initial={false}
        animate={
          docOn
            ? { opacity: 1, y: 0, scale: 1 }
            : { opacity: 0, y: 40, scale: 0.96 }
        }
        transition={instant ? { duration: 0 } : { duration: 0.6, ease: E }}
      >
        <div className="g2v-lease-doc__sheet g2v-lease-doc__sheet--back" />
        <div className="g2v-lease-doc__sheet">
          <div className="g2v-lease-doc__page">
            <LeaseBody skeleton />
            <motion.div
              className="g2v-lease-doc__text"
              initial={false}
              animate={{
                clipPath: scanned ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
              }}
              transition={
                instant || !scanned
                  ? { duration: 0 }
                  : { duration: 2.7, ease: "linear" }
              }
            >
              <LeaseBody />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="g2v-lease-scan" aria-hidden>
        <motion.span
          className="g2v-lease-band"
          initial={false}
          animate={{
            y: lineY - DOC_TOP - BAND_H,
            opacity: bandOn ? (step === 7 ? [0, 1, 1, 0] : 1) : 0,
          }}
          transition={
            step === 7 && !reduced
              ? {
                  y: { duration: 2.7, ease: "linear" },
                  opacity: { duration: 2.7, times: [0, 0.08, 0.9, 1] },
                }
              : { duration: 0 }
          }
        />
      </div>
    </motion.div>
  );
}
