import "../../utils/interVariableFont";
import "./shared/shared.css";
import "./Gen2Hero.css";
import { Reveal } from "./shared";
import Gen2Board from "./hero/Gen2Board";
import heroBg from "../../assets/gen2/hero/hero-bg.webp";

export interface Gen2HeroProps {
  heading?: string;
  subtitle?: string;
  eyebrow?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** HTML id on the hero <section>, for anchor links. */
  id?: string;
  className?: string;
}

/**
 * Gen2Hero — Gen 2 page hero (handoff 02-hero; Figma 590:45184, mobile 642:139554).
 *
 * Centred copy (eyebrow, H1, subtitle, CTA) above the Calendar / Prospects / Residents board,
 * which loads in as a diagonal wave and then plays the one-pass "Elise acting" sequence (~17s,
 * once, while in view) before holding its final state. Behind it sits Figma's
 * blurred, colour-adjusted haze image (697:176882, exported with its effects baked in); a
 * blurred azure field (697:176884) rises over the lower board so the columns fade out into
 * the bottom of the hero.
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
    <section id={id || undefined} className={["g2h", className].filter(Boolean).join(" ")} aria-label={heading}>
      <div className="g2h-copy">
        {eyebrow && (
          <Reveal className="g2h-eyebrow" y={12}>
            <span className="g2h-eyebrow__marker" aria-hidden />
            {eyebrow}
          </Reveal>
        )}
        <Reveal delay={0.06}>
          <h1 className="g2h-title">{heading}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={0.12}>
            <p className="g2h-sub">{subtitle}</p>
          </Reveal>
        )}
        {ctaLabel && (
          <Reveal delay={0.18} className="g2h-cta">
            <a href={ctaHref} className="g2-btn">
              {ctaLabel}
            </a>
          </Reveal>
        )}
      </div>
      <div className="g2h-stage">
        <img className="g2h-haze" src={heroBg} alt="" aria-hidden />
        <Gen2Board />
        <div className="g2h-fade" aria-hidden />
      </div>
    </section>
  );
}
