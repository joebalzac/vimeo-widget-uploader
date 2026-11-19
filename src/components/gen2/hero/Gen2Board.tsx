import { useRef, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import BoardColumn from "./BoardColumn";
import { CardFace } from "./BoardCard";
import { useHeroBoard } from "./useHeroBoard";
import type { ColumnKey } from "./boardData";

const MOBILE_MQ = "(max-width: 761px)";
/** Figma order: Calendar | Prospects (raised 51px) | Residents. */
const COLUMNS: ColumnKey[] = ["calendar", "prospects", "residents"];

function subscribeMobile(cb: () => void) {
  const m = window.matchMedia(MOBILE_MQ);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function useIsMobile() {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_MQ).matches,
    () => false,
  );
}

/**
 * Gen2 hero board (Figma 761:1949): Prospects / Calendar / Residents with the one-pass "Elise acting" sequence.
 * Layout and styling live in Gen2Hero.css (`g2h-board`, `g2h-col`, `g2h-card`).
 */
export default function Gen2Board() {
  const ref = useRef<HTMLDivElement>(null);
  const { board, started, reduced, flyer } = useHeroBoard(ref);
  const chipSize = useIsMobile() ? "sm" : "md";

  const lists = { prospects: board.prospects, calendar: board.calendar, residents: board.residents };

  return (
    <div ref={ref} className="g2h-board" aria-hidden>
      <div className="g2h-board__cols">
        {COLUMNS.map((col) => (
          <BoardColumn
            key={col}
            col={col}
            cards={lists[col]}
            slotId={col === "prospects" ? board.slotId : null}
            started={started}
            reduced={reduced}
            chipSize={chipSize}
          />
        ))}
      </div>
      {board.flight && (
        <motion.div
          className="g2h-card g2h-card--prospects g2h-flyer"
          style={{
            width: board.flight.w,
            height: board.flight.h,
            x: flyer.x,
            y: flyer.y,
            scale: flyer.scale,
            rotate: flyer.rotate,
          }}
        >
          <CardFace card={board.flight.card} col="prospects" chipSize={chipSize} animateChip={false} />
        </motion.div>
      )}
    </div>
  );
}
