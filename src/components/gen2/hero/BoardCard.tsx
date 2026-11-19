import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { E, SPRING_CHIP, SPRING_POP, StatusChip, chipTone } from "../shared";
import { HERO_CHIP_TONES, type BoardCardData, type ColumnKey } from "./boardData";
import HeroProgress from "./HeroProgress";

const REST = { opacity: 1, y: 0, rotate: 0, scale: 1 };
/** Load-in wave start (handoff: opacity 0, y 22, rotate −2°, scale .96). */
const WAVE_FROM = { opacity: 0, y: 22, rotate: -2, scale: 0.96 };
/** Sequence pop-in start (scale .94 → 1, y −10 → 0, spring). */
const POP_FROM = { opacity: 0, y: -10, rotate: 0, scale: 0.94 };
/** "Change pop" after a card is updated in place (rescheduled tour). */
const FLASH = { ...REST, scale: [1, 1.04, 1], transition: { duration: 0.5, ease: E } };
const LAYOUT = { type: "spring", stiffness: 380, damping: 36 } as const;

/** Chip-style swap: the old content slides up and out, the new one rises in. */
const SWAP_IN = { opacity: 0, y: 12, scale: 0.9 };
const SWAP_REST = { opacity: 1, y: 0, scale: 1, transition: SPRING_CHIP };
const SWAP_OUT = { opacity: 0, y: -12, transition: { duration: 0.28, ease: E } };
/** Calendar time returning after "Confirming": a soft fade up. */
const TIME_IN = { opacity: 0, y: 6 };
const TIME_REST = { opacity: 1, y: 0, transition: { duration: 0.5, ease: E } };

const tone = (label: string) => HERO_CHIP_TONES[label] ?? chipTone(label);

export interface CardFaceProps {
  card: BoardCardData;
  col: ColumnKey;
  chipSize: "md" | "sm";
  /** Animate chip / progress swaps (off for the static flyer copy). */
  animateChip?: boolean;
}

/** The visible content of a card. Shared by the in-column card and the flyer. */
export function CardFace({ card, col, chipSize, animateChip = true }: CardFaceProps) {
  const swapIn = animateChip ? SWAP_IN : false;
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
        {/* Progress ("Confirming", "Rescheduling Tour") stands in for the time, then the time fades in. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {card.progress ? (
            <motion.span key={`p:${card.progress}`} className="g2h-card__time" initial={swapIn} animate={SWAP_REST} exit={SWAP_OUT}>
              <HeroProgress label={card.progress} />
            </motion.span>
          ) : (
            card.time && (
              <motion.span
                key={`t:${card.time}`}
                className="g2h-card__time"
                initial={animateChip ? TIME_IN : false}
                animate={TIME_REST}
                exit={SWAP_OUT}
              >
                {card.time}
              </motion.span>
            )
          )}
        </AnimatePresence>
      </>
    );
  }
  return (
    <>
      <span className="g2h-card__text">
        <span className="g2h-card__name">{card.name}</span>
        <span className="g2h-card__sub">{card.sub}</span>
      </span>
      {/* A progress state replaces ALL of the card's tags; they return once it completes. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {card.progress ? (
          <motion.span key={`p:${card.progress}`} className="g2h-card__chips" initial={swapIn} animate={SWAP_REST} exit={SWAP_OUT}>
            <HeroProgress label={card.progress} />
          </motion.span>
        ) : (
          (card.chip || card.tag) && (
            <motion.span key="chips" className="g2h-card__chips" initial={swapIn} animate={SWAP_REST} exit={SWAP_OUT}>
              {card.chip && (
                <motion.span layout={animateChip ? "position" : false} className="g2h-card__chipslot">
                  <StatusChip label={card.chip} tone={tone(card.chip)} spinner={false} size={chipSize} animate={animateChip} />
                </motion.span>
              )}
              <AnimatePresence mode="popLayout" initial={false}>
                {card.tag && (
                  <motion.span key={card.tag} className="g2h-card__chipslot" initial={swapIn} animate={SWAP_REST} exit={SWAP_OUT}>
                    <StatusChip label={card.tag} tone={tone(card.tag)} spinner={false} size={chipSize} animate={false} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          )
        )}
      </AnimatePresence>
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
 * Cards from the initial data join the load-in wave; cards added by the sequence pop in.
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
      animate={started || card.pop ? (card.flash ? FLASH : REST) : WAVE_FROM}
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
