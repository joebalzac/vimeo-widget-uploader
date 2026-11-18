import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CSS_EASE } from "../shared/motion";
import { CARD_DECK_H, CARD_H, CARD_MAX_SCALE, CARD_W } from "./featuresData";
import bg from "../../../assets/gen2/features/bg.jpg";
import deck1 from "../../../assets/gen2/features/deck-1.jpg";
import deck2 from "../../../assets/gen2/features/deck-2.jpg";

export interface FCardProps {
  children?: ReactNode;
  /** Draw the two "deck" layers peeking out above the card (desktop, Figma 618:7007). */
  deck?: boolean;
  /**
   * When set, changing it swaps the front card (handoff 04 "Deck swap"): the next card
   * eases forward a hair while the current one settles back and fades. The deck layers
   * behind stay put. Leave unset for a static card.
   */
  swapKey?: string;
  className?: string;
}

/**
 * Deck swap (handoff 04-features, `DECK`): a soft, direction-agnostic swap with no
 * vertical travel beyond a 3px settle. Next card: scale .985 → 1, y −3 → 0, fade in
 * (transform 0.9s, opacity 0.6s). Current card: settles back the same amount (0.8s)
 * and fades (0.6s after 0.15s). The incoming card stacks above the outgoing one.
 */
const DECK = {
  initial: { opacity: 0, scale: 0.985, y: -3, zIndex: 3 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    zIndex: 3,
    transition: {
      default: { duration: 0.9, ease: CSS_EASE },
      opacity: { duration: 0.6, ease: CSS_EASE },
    },
  },
  exit: {
    opacity: 0,
    scale: 0.985,
    y: -3,
    zIndex: 2,
    transition: {
      default: { duration: 0.8, ease: CSS_EASE },
      opacity: { duration: 0.6, delay: 0.15, ease: CSS_EASE },
    },
  },
} as const;

/**
 * Feature visual card: a 660×460 stage (radius 12, Figma "image 1" gradient background)
 * drawn at its design size and scaled uniformly to the card's width, up to 1.25×. Visuals
 * render inside the stage in 660×460 coordinates. With `deck`, two faded layers (628 and
 * 596 wide, 8px apart) peek out above it, making a 476 frame.
 */
export default function FCard({ children, deck = false, swapKey, className }: FCardProps) {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const frameH = CARD_H + (deck ? CARD_DECK_H : 0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // ResizeObserver reports once on observe, so no synchronous measurement is needed.
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(Math.min(CARD_MAX_SCALE, w / CARD_W));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={["g2f-card", deck && "g2f-card--deck", className].filter(Boolean).join(" ")}
      style={{ height: frameH * scale, maxWidth: CARD_W * CARD_MAX_SCALE, "--g2f-s": scale } as CSSProperties}
    >
      <div className="g2f-card__frame" style={{ width: CARD_W, height: frameH, transform: `scale(${scale})` }}>
        {deck && (
          <>
            <img className="g2f-card__deck g2f-card__deck--2" src={deck2} alt="" aria-hidden draggable={false} />
            <img className="g2f-card__deck g2f-card__deck--1" src={deck1} alt="" aria-hidden draggable={false} />
          </>
        )}
        {swapKey === undefined ? (
          <div className="g2f-card__stage" style={{ width: CARD_W, height: CARD_H }}>
            <img className="g2f-card__bg" src={bg} alt="" aria-hidden draggable={false} />
            {children}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            <motion.div
              key={swapKey}
              className="g2f-card__stage"
              style={{ width: CARD_W, height: CARD_H }}
              {...(reduced
                ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } }
                : DECK)}
            >
              <img className="g2f-card__bg" src={bg} alt="" aria-hidden draggable={false} />
              {children}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
