import { motion } from "framer-motion";
import { E } from "../shared/motion";
import type { ApBlock as Block } from "./gen2ApolloData";
import iconWorked from "../../../assets/apollo/worked.svg";
import iconDownload from "../../../assets/apollo/download.svg";
import pdfTop from "../../../assets/apollo/pdf-top.svg";
import pdfLabel from "../../../assets/apollo/pdf-label.svg";

/** PDF glyph, mirrored from ApolloViews (pdf-icon 368:7547). */
function PdfIcon() {
  return (
    <span className="g2a-pdf" aria-hidden>
      <span className="g2a-pdf__top">
        <img src={pdfTop} alt="" />
      </span>
      <img className="g2a-pdf__label" src={pdfLabel} alt="" />
    </span>
  );
}

function SheetIcon() {
  return (
    <svg className="g2a-sheet" viewBox="0 0 16 18" fill="none" aria-hidden>
      <path d="M2 1.5h8l4 4V16a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 2 16V2a.5.5 0 0 1 .5-.5Z" fill="#EEFDF8" stroke="#00B080" />
      <path d="M10 1.5V5.5h4" stroke="#00B080" />
      <path d="M4.5 9h7M4.5 11.5h7M4.5 14h7M8 8v7" stroke="#00B080" strokeWidth=".9" />
    </svg>
  );
}

/**
 * One chat block. `thinking` only applies to `w`: true shows the shimmering
 * "Thinking" line, false shows "Worked for a few seconds".
 */
export default function ApBlock({ b, thinking, reduced }: { b: Block; thinking?: boolean; reduced?: boolean }) {
  return (
    <motion.div
      className={`g2a-blk g2a-blk--${b.k}`}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ opacity: { duration: 0.45 }, y: { duration: 0.7, ease: E } }}
    >
      {render(b, thinking)}
    </motion.div>
  );
}

function render(b: Block, thinking?: boolean) {
  switch (b.k) {
    case "u":
      return <div className="g2a-bubble">{b.text}</div>;
    case "w":
      return thinking ? (
        <div className="g2a-thinking">Thinking</div>
      ) : (
        <motion.div
          className="g2a-worked"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <img className="g2a-icon g2a-worked__icon" src={iconWorked} alt="" />
          {b.label ?? "Worked for a few seconds"}
        </motion.div>
      );
    case "p":
    case "b":
      return <p className="g2a-para">{b.text}</p>;
    case "l":
      return (
        <div className="g2a-listwrap">
          {b.lead && <p className="g2a-para">{b.lead}</p>}
          <ul className="g2a-list">
            {b.items.map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        </div>
      );
    case "a":
      return (
        <span className="g2a-action">
          {b.label}
        </span>
      );
    case "f":
      return (
        <div className="g2a-file">
          {b.ext === "xlsx" ? <SheetIcon /> : <PdfIcon />}
          <span className="g2a-file__name">{b.name}</span>
          <img className="g2a-icon g2a-file__dl" src={iconDownload} alt="" />
        </div>
      );
    case "t": {
      const cols = b.cols?.length === b.head.length ? b.cols : b.head.map(() => 1);
      const grid = { gridTemplateColumns: cols.map((c) => `minmax(0, ${c}fr)`).join(" ") };
      return (
        <div className="g2a-table" role="table">
          <div className="g2a-table__row g2a-table__row--head" role="row" style={grid}>
            {b.head.map((c, i) => (
              <span key={i} className="g2a-table__cell" role="columnheader">
                {c}
              </span>
            ))}
          </div>
          {b.rows.map((r, i) => (
            <div key={i} className="g2a-table__row" role="row" style={grid}>
              {r.map((c, j) => (
                <span key={j} className="g2a-table__cell" role="cell">
                  {c}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    }
  }
}
