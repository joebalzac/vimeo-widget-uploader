import "../utils/interVariableFont";
import { Fragment, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import "./MysteryShoppingComparison.css";
import check from "../assets/mystery/check.svg";
import check16 from "../assets/mystery/check-16.svg";

export interface MysteryShoppingComparisonProps {
  className?: string;
}

interface Row {
  label: string;
  tourIntelligence: ReactNode;
  mysteryShopping: string;
  tall?: boolean;
}

const COL_TI = "Tour Intelligence";
const COL_MS = "Mystery Shopping";

const ROWS: Row[] = [
  { label: "Tour Coverage", tourIntelligence: "Every tour, recorded with consent", mysteryShopping: "A few staged visits" },
  { label: "Prospect Conversation", tourIntelligence: "Real prospect needs and objections", mysteryShopping: "Paid shoppers posing as prospects" },
  { label: "Leasing Standards", tourIntelligence: "Custom rubrics by community type", mysteryShopping: "One rubric for all tours" },
  {
    label: "Property Insights",
    tourIntelligence: (
      <>
        Community Objections, Preferences,{" "}
        <br className="msc__br" />& Competitor Mentions
      </>
    ),
    mysteryShopping: "Limited property coverage",
    tall: true,
  },
  { label: "Agent Coaching", tourIntelligence: "Personalized coaching with timestamps", mysteryShopping: "Notes from one visit" },
];

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;
const VIEWPORT = { once: true, amount: 0.18, margin: "0px 0px -6% 0px" };

const cellV = (d: number): Variants => ({
  pre: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0, transition: { opacity: { duration: 0.5, delay: d, ease: CSS_EASE }, y: { duration: 0.6, delay: d, ease: EZ } } },
});
/* the tick "draws" left to right */
const tickV = (d: number): Variants => ({
  pre: { clipPath: "inset(0 100% 0 0)" },
  in: { clipPath: "inset(0 0% 0 0)", transition: { duration: 0.5, delay: d + 0.15, ease: CSS_EASE } },
});

function Tick({ delay, small }: { delay: number; small?: boolean }) {
  return (
    <motion.img
      className={small ? "msc__tick msc__tick--small" : "msc__tick"}
      src={small ? check16 : check}
      alt=""
      variants={tickV(delay)}
    />
  );
}

/** Stagger: down each column 70ms per row, 40ms per column. */
const delay = (col: number, row: number) => (row * 70 + col * 40) / 1000;

/**
 * MysteryShoppingComparison — Tour Intelligence vs Mystery Shopping comparison table.
 * Figma: node 204:8277 (.com_2027). White text: place on a dark section (#131115) and pair
 * with SectionHeading (theme "dark"). Desktop: 3-column grid. <=480px: two stacked tables.
 */
export default function MysteryShoppingComparison({ className }: MysteryShoppingComparisonProps) {
  return (
    <div className={["msc", className].filter(Boolean).join(" ")}>
      {/* desktop / tablet */}
      <motion.div className="msc__grid" role="table" initial="pre" whileInView="in" viewport={VIEWPORT}>
        <div className="msc__row msc__row--head" role="row">
          <div className="msc__cell msc__cell--label" role="columnheader" aria-hidden="true" />
          <motion.div className="msc__cell msc__cell--ti msc__head" role="columnheader" variants={cellV(delay(1, 0))}>
            {COL_TI}
          </motion.div>
          <motion.div className="msc__cell msc__head" role="columnheader" variants={cellV(delay(2, 0))}>
            {COL_MS}
          </motion.div>
        </div>
        {ROWS.map((r, i) => (
          <div key={r.label} className={["msc__row", r.tall ? "msc__row--tall" : ""].join(" ")} role="row">
            <motion.div className="msc__cell msc__cell--label msc__label" role="rowheader" variants={cellV(delay(0, i + 1))}>
              {r.label}
            </motion.div>
            <motion.div className="msc__cell msc__cell--ti msc__value" role="cell" variants={cellV(delay(1, i + 1))}>
              <Tick delay={delay(1, i + 1)} />
              <span className="msc__value-text">{r.tourIntelligence}</span>
            </motion.div>
            <motion.div className="msc__cell msc__value" role="cell" variants={cellV(delay(2, i + 1))}>
              <span className="msc__value-text">{r.mysteryShopping}</span>
            </motion.div>
          </div>
        ))}
      </motion.div>

      {/* phone: the comparison as two stacked tables */}
      <div className="msc__stack">
        {[
          { key: "ti", title: COL_TI, ti: true },
          { key: "ms", title: COL_MS, ti: false },
        ].map((col) => (
          <motion.div key={col.key} className="msc__table" initial="pre" whileInView="in" viewport={VIEWPORT}>
            <motion.p className="msc__table-title" variants={cellV(0)}>
              {col.title}
            </motion.p>
            {ROWS.map((r, i) => (
              <Fragment key={r.label}>
                <motion.div className={col.ti ? "msc__table-row" : "msc__table-row msc__table-row--ms"} variants={cellV(0.06 + i * 0.06)}>
                  <span className="msc__label msc__table-label">{r.label}</span>
                  <span className="msc__table-value">
                    {col.ti && <Tick small delay={0.06 + i * 0.06} />}
                    <span className="msc__value-text">{col.ti ? r.tourIntelligence : r.mysteryShopping}</span>
                  </span>
                </motion.div>
              </Fragment>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
