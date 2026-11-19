import "../../utils/interVariableFont";
import "./Gen2Hero.css";
import { MotionConfig, motion } from "framer-motion";
import { E } from "./hero/protoHooks";
import HeroBoard from "./hero/HeroBoard";
import Gen2Journey, { DEFAULT_JOURNEY_HEADING, DEFAULT_JOURNEY_SUBTITLE } from "./Gen2Journey";

export interface Gen2HeroProps {
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  journeyHeading?: string;
  journeySubtitle?: string;
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
 * Gen2Hero — the Gen 2 hero AND The Ideal Renter Journey in one Webflow-style container
 * (90% / max 90rem → 100rem ≥1440 → 120rem ≥1920; full width ≤767).
 *
 * Port of the designer's Final prototype: `Hero3` (copy), `Hero3Board` + `useHeroBoard`
 * ("Elise acting" story, plays once in view) and `Journey3` (looping ring). The hero haze
 * (gradients package) is anchored to the bottom of the hero and bleeds 340px (220 on mobile)
 * down behind the journey. No background colour or vertical section padding of its own:
 * the Webflow section supplies those.
 */
export default function Gen2Hero({
  heading = "The #1 AI Platform Transforming Multifamily Operations",
  subtitle = "The next generation of team experience, resident experience, and asset performance.",
  eyebrow = "EliseAI Gen 2",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  journeyHeading = DEFAULT_JOURNEY_HEADING,
  journeySubtitle = DEFAULT_JOURNEY_SUBTITLE,
  id,
  className,
}: Gen2HeroProps) {
  return (
    <MotionConfig reducedMotion="user">
      <div id={id || undefined} className={["g2h", className].filter(Boolean).join(" ")}>
        <div className="g2h-container">
          <section className="g2h-hero" aria-label={heading}>
            <div className="g2h-haze" aria-hidden="true">
              <div className="g2h-haze__glow">
                <i />
              </div>
            </div>
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
          <Gen2Journey className="g2h-journey" heading={journeyHeading} subtitle={journeySubtitle} />
        </div>
      </div>
    </MotionConfig>
  );
}
