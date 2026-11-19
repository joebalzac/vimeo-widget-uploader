import "../../utils/interVariableFont";
import "./Gen2Hero.css";
import { MotionConfig, motion } from "framer-motion";
import { E } from "./hero/protoHooks";
import HeroBoard from "./hero/HeroBoard";

export interface Gen2HeroProps {
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** HTML id on the component root, for anchor links. */
  id?: string;
  className?: string;
}

/** Prototype HIN: on-load rise (+ optional blur) for the hero copy. */
const HIN = (d: number, blur?: boolean) => ({
  initial: { opacity: 0, y: 14, ...(blur ? { filter: "blur(4px)" } : {}) },
  animate: { opacity: 1, y: 0, ...(blur ? { filter: "blur(0px)" } : {}) },
  transition: { duration: 1, ease: E, delay: d },
});

/**
 * Gen2Hero — the Gen 2 hero in a Webflow-style container
 * (90% / max 90rem → 100rem ≥1440 → 120rem ≥1920; full width ≤767).
 *
 * Port of the designer's Final prototype: `Hero3` (copy) and `Hero3Board` + `useHeroBoard`
 * ("Elise acting" story, plays once in view). Paints no background: the hero's lilac/blue light is
 * a background image on the Webflow hero section (hero-bg-desktop.jpg, bottom center, 100% × 920px;
 * ≤767 hero-bg-mobile.jpg, 100% × 680px), which also supplies the vertical padding.
 * The Renter Journey is a separate component (Gen2Journey).
 */
export default function Gen2Hero({
  heading = "The #1 AI Platform Transforming Multifamily Operations",
  subtitle = "The next generation of team experience, resident experience, and asset performance.",
  eyebrow = "EliseAI Gen 2",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  id,
  className,
}: Gen2HeroProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div id={id || undefined} className={["g2h", className].filter(Boolean).join(" ")}>
        <div className="g2h-container">
          <section className="g2h-hero" aria-label={heading}>
            <div className="g2h-gut">
              <div className="g2h-copy">
                {eyebrow && (
                  <motion.span className="g2h-eb" {...HIN(0.38)}>
                    <i />
                    {eyebrow}
                  </motion.span>
                )}
                <div className="g2h-hd">
                  <motion.h1 className="g2h-t" {...HIN(0.45, true)}>
                    {heading}
                  </motion.h1>
                  {subtitle && (
                    <motion.p className="g2h-sub" {...HIN(0.58)}>
                      {subtitle}
                    </motion.p>
                  )}
                </div>
                {ctaLabel && (
                  <motion.a className="g2h-btn" href={ctaHref} {...HIN(0.7)} whileTap={{ scale: 0.98 }}>
                    {ctaLabel}
                  </motion.a>
                )}
              </div>
            </div>
            <HeroBoard />
          </section>
        </div>
      </div>
    </MotionConfig>
  );
}
