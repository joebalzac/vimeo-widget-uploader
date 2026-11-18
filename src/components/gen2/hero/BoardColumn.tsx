import { AnimatePresence, motion } from "framer-motion";
import iconProspects from "../../../assets/gen2/hero/icon-prospects.svg";
import iconCalendar from "../../../assets/gen2/hero/icon-calendar.svg";
import iconResidents from "../../../assets/gen2/hero/icon-residents.svg";
import dragDots from "../../../assets/gen2/hero/drag-dots.svg";
import { E } from "../shared";
import BoardCard from "./BoardCard";
import type { BoardCardData, ColumnKey } from "./boardData";

/** Column header icons (Figma 763:2045 / 761:1953 / 763:2101), 18×18. */
const ICONS: Record<ColumnKey, string> = {
  prospects: iconProspects,
  calendar: iconCalendar,
  residents: iconResidents,
};

const TITLES: Record<ColumnKey, string> = {
  prospects: "Prospects",
  calendar: "Calendar",
  residents: "Residents",
};

/** Load-in: Prospects rises first, the side columns 0.1s later. */
const COL_DELAY: Record<ColumnKey, number> = { prospects: 0, calendar: 0.1, residents: 0.1 };
/** Card wave column offsets (handoff: 0.22 / 0.30 / 0.38s). */
const CARD_OFFSET: Record<ColumnKey, number> = { prospects: 0.22, calendar: 0.3, residents: 0.38 };
const ROW_STEP = 0.075;

const COL_FROM = { opacity: 0, y: 36, scale: 0.97 };
const COL_REST = { opacity: 1, y: 0, scale: 1 };

/** 18px drag handle (Figma 761:1957): two 3-dot rows, each turned upright, 7.09px apart. */
function DragHandle() {
  return (
    <span className="g2h-col__handle" aria-hidden>
      <img src={dragDots} width={13.5} height={3} alt="" />
      <img src={dragDots} width={13.5} height={3} alt="" />
    </span>
  );
}

export interface BoardColumnProps {
  col: ColumnKey;
  cards: BoardCardData[];
  slotId: string | null;
  started: boolean;
  reduced: boolean;
  chipSize: "md" | "sm";
}

export default function BoardColumn({ col, cards, slotId, started, reduced, chipSize }: BoardColumnProps) {
  return (
    <motion.div
      className={`g2h-col g2h-col--${col}`}
      initial={reduced ? false : COL_FROM}
      animate={started ? COL_REST : COL_FROM}
      transition={{ duration: 1, ease: E, delay: COL_DELAY[col] }}
    >
      <div className="g2h-col__head">
        <img className="g2h-col__icon" src={ICONS[col]} width={18} height={18} alt="" />
        <span className="g2h-col__title">{TITLES[col]}</span>
        <DragHandle />
      </div>
      <div className="g2h-col__list">
        <AnimatePresence mode="popLayout" initial={false}>
          {cards.map((card, row) => (
            <BoardCard
              key={card.id}
              card={card}
              col={col}
              delay={row * ROW_STEP + CARD_OFFSET[col]}
              started={started}
              reduced={reduced}
              slot={card.id === slotId}
              chipSize={chipSize}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
