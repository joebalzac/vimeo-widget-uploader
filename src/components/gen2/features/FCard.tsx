import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { CSS_EASE, EZ } from "../shared/motion";
import { CARD_DECK_H, CARD_H, CARD_MAX_SCALE, CARD_W } from "./featuresData";
import cardBg from "../../../assets/gen2/features/product-card-bg.webp";

export interface FCardProps {
  children?: ReactNode;
  /**
   * Desktop deck (prototype `.fv`): two faded layers of the card background peek out above
   * the front card (596 / 628 wide, 8px apart → a 660×476 frame), and changing `swapKey`
   * runs the DECK swap on the whole front card. Without it the card is the flat 660×460
   * stacked card, whose content crossfades on a `swapKey` change.
   */
  deck?: boolean;
  swapKey?: string;
  className?: string;
}

/**
 * Deck swap (prototype `DECK`): soft and direction-agnostic. Next card: scale .985 → 1,
 * y −3 → 0 (0.9s), fade in (0.6s). Current card settles back the same way (0.8s) and fades
 * (0.6s after 0.15s). The incoming card stacks above the outgoing one.
 */
const DECK: Variants = {
  enter: { scale: 0.985, y: -3, opacity: 0, zIndex: 2 },
  center: {
    scale: 1,
    y: 0,
    opacity: 1,
    zIndex: 2,
    transition: {
      scale: { duration: 0.9, ease: CSS_EASE },
      y: { duration: 0.9, ease: CSS_EASE },
      opacity: { duration: 0.6, ease: CSS_EASE },
    },
  },
  exit: {
    scale: 0.985,
    y: -3,
    opacity: 0,
    zIndex: 1,
    transition: {
      scale: { duration: 0.8, ease: CSS_EASE },
      y: { duration: 0.8, ease: CSS_EASE },
      opacity: { duration: 0.6, ease: CSS_EASE, delay: 0.15 },
    },
  },
};
/** Stacked card: the content (not the card) crossfades and rises 10px. */
const FLAT = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: { opacity: { duration: 0.45, ease: CSS_EASE }, y: { duration: 0.6, ease: EZ } },
} as const;
const INSTANT = { initial: false, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } } as const;

const LAYER_BG = { backgroundImage: `url("${cardBg}")` } as CSSProperties;

/**
 * Feature visual card: a 660×460 card (radius 12, package background image, inset 0.5px
 * #FDFCFB hairline) drawn at design size and scaled uniformly to the card's width, up to
 * 1.25×. Visuals render inside it in 660×460 coordinates.
 */
export default function FCard({ children, deck = false, swapKey = "card", className }: FCardProps) {
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

  const bg = <img className="g2f-card__bg" src={cardBg} alt="" aria-hidden draggable={false} />;

  return (
    <div
      ref={ref}
      className={["g2f-card", deck ? "g2f-card--deck" : "g2f-card--flat", className].filter(Boolean).join(" ")}
      style={{ height: frameH * scale }}
    >
      <div className="g2f-card__sc" style={{ height: frameH, transform: `scale(${scale})` }}>
        {deck ? (
          <>
            <i className="g2f-card__l3" style={LAYER_BG} aria-hidden />
            <i className="g2f-card__l2" style={LAYER_BG} aria-hidden />
            <AnimatePresence initial={false}>
              <motion.div
                key={swapKey}
                className="g2f-card__f"
                style={{ transformOrigin: "50% 0%" }}
                {...(reduced ? INSTANT : { variants: DECK, initial: "enter", animate: "center", exit: "exit" })}
              >
                {bg}
                <div className="g2f-card__k">{children}</div>
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="g2f-card__f">
            {bg}
            <AnimatePresence initial={false}>
              <motion.div key={swapKey} className="g2f-card__k" {...(reduced ? INSTANT : FLAT)}>
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
