import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { E, SPRING_CHIP, SPRING_POP, StatusChip } from "../shared";
import type { BoardCardData, ColumnKey } from "./boardData";

const REST = { opacity: 1, y: 0, rotate: 0, scale: 1 };
/** Load-in wave start (handoff: opacity 0, y 22, rotate −2°, scale .96). */
const WAVE_FROM = { opacity: 0, y: 22, rotate: -2, scale: 0.96 };
/** Loop pop-in start (scale .94 → 1, y −10 → 0, spring). */
const POP_FROM = { opacity: 0, y: -10, rotate: 0, scale: 0.94 };
const LAYOUT = { type: "spring", stiffness: 380, damping: 36 } as const;
/** Second chip leaving (WORK ORDER clears): same slide-up exit as a chip swap. */
const TAG_EXIT = { opacity: 0, y: -12, transition: { duration: 0.28, ease: E } };

export interface CardFaceProps {
  card: BoardCardData;
  col: ColumnKey;
  chipSize: "md" | "sm";
  /** Animate chip label swaps (off for the static flyer copy). */
  animateChip?: boolean;
}

/** The visible content of a card. Shared by the in-column card and the flyer. */
export function CardFace({ card, col, chipSize, animateChip = true }: CardFaceProps) {
  if (col === "calendar") {
    const kind = card.kind ?? "person";
    return (
      <>
        {/* Self Guided tours are a filled azure card (Figma 763:2062); the others carry a bar. */}
        {kind !== "self" && <span className={`g2h-card__bar g2h-card__bar--${kind}`} aria-hidden />}
        <span className="g2h-card__text">
          <span className="g2h-card__name">{card.name}</span>
          <span className="g2h-card__sub">{card.sub}</span>
        </span>
        <span className="g2h-card__time">{card.time}</span>
      </>
    );
  }
  return (
    <>
      <span className="g2h-card__text">
        <span className="g2h-card__name">{card.name}</span>
        <span className="g2h-card__sub">{card.sub}</span>
      </span>
      {(card.chip || card.tag) && (
        <span className="g2h-card__chips">
          {card.chip && (
            <motion.span layout={animateChip ? "position" : false} className="g2h-card__chipslot">
              <StatusChip label={card.chip} size={chipSize} animate={animateChip} />
            </motion.span>
          )}
          <AnimatePresence mode="popLayout" initial={false}>
            {card.tag && (
              <motion.span
                key={card.tag}
                className="g2h-card__chipslot"
                initial={animateChip ? { opacity: 0, y: 12, scale: 0.9 } : false}
                animate={{ opacity: 1, y: 0, scale: 1, transition: SPRING_CHIP }}
                exit={TAG_EXIT}
              >
                <StatusChip label={card.tag} size={chipSize} animate={false} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      )}
    </>
  );
}

export interface BoardCardProps {
  card: BoardCardData;
  col: ColumnKey;
  /** Load-in wave delay in seconds. */
  delay: number;
  /** The load-in has been triggered (board in view, or reduced motion). */
  started: boolean;
  reduced: boolean;
  /** Render as the dashed lilac slot left behind by the flyer. */
  slot?: boolean;
  chipSize: "md" | "sm";
}

/**
 * One board card. forwardRef so AnimatePresence `mode="popLayout"` can measure exiting cards.
 * Cards from the initial data join the load-in wave; cards added by the loop pop in.
 */
const BoardCard = forwardRef<HTMLDivElement, BoardCardProps>(function BoardCard(
  { card, col, delay, started, reduced, slot, chipSize },
  ref,
) {
  const from = card.pop ? POP_FROM : WAVE_FROM;
  const cls = [
    "g2h-card",
    `g2h-card--${col}`,
    col === "calendar" && (card.kind ?? "person") === "self" && "g2h-card--self",
    slot && "g2h-card--slot",
    card.twin && "g2h-card--twin",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <motion.div
      ref={ref}
      layout={reduced ? false : "position"}
      className={cls}
      data-card-id={card.id}
      initial={reduced || card.twin ? false : from}
      animate={started || card.pop ? REST : WAVE_FROM}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: slot ? 0.2 : 0.3, ease: E } }}
      transition={{
        ...(card.pop ? SPRING_POP : { duration: 0.75, ease: E, delay }),
        layout: LAYOUT,
      }}
    >
      <CardFace card={card} col={col} chipSize={chipSize} />
    </motion.div>
  );
});

export default BoardCard;
