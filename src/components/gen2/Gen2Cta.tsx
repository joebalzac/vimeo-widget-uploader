import "../../utils/interVariableFont";
import { Reveal } from "./shared";
import "./Gen2Cta.css";

export interface Gen2CtaProps {
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

/**
 * Gen2Cta — closing CTA (handoff 10, Figma 590:46502 / content 590:46503).
 * Centred 48px headline + "Get A Demo" button; the button reveals 0.12s after the heading.
 * No section padding or container: drop it into the Webflow Section/Container
 * (120px desktop / 48px mobile vertical padding).
 */
export default function Gen2Cta({
  heading = "Directly Drive Asset Performance with EliseAI",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  className,
}: Gen2CtaProps) {
  return (
    <div className={["g2cta", className].filter(Boolean).join(" ")}>
      {heading.trim() && (
        <Reveal amount={0.35}>
          <h2 className="g2cta__title">{heading}</h2>
        </Reveal>
      )}
      {ctaLabel.trim() && (
        <Reveal delay={0.12} amount={0.35}>
          <a className="g2cta__btn" href={ctaHref}>
            {ctaLabel}
          </a>
        </Reveal>
      )}
    </div>
  );
}
