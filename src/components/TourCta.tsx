import "../utils/interVariableFont";
import { motion } from "framer-motion";
import "./TourCta.css";

export interface TourCtaProps {
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;
const reveal = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { opacity: { duration: 0.8, delay, ease: CSS_EASE }, y: { duration: 1, delay, ease: EZ } },
});

/**
 * TourCta — closing call-to-action: centred 48px headline + "Get A Demo" button.
 * Figma: 214:14747 (desktop), 204:14499 (mobile), .com_2027. No section padding or
 * container: drop it into the Webflow Section/Container.
 */
export default function TourCta({
  heading = "Take Control of Your Leasing Journey with Tour Intelligence",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  className,
}: TourCtaProps) {
  return (
    <div className={["tcta", className].filter(Boolean).join(" ")}>
      {heading.trim() && (
        <motion.h2 className="tcta__title" {...reveal(0)}>
          {heading}
        </motion.h2>
      )}
      {ctaLabel.trim() && (
        <motion.a className="tcta__btn" href={ctaHref} {...reveal(0.12)}>
          {ctaLabel}
        </motion.a>
      )}
    </div>
  );
}
