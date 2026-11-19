import type { CSSProperties } from "react";
import NewTag from "../shared/NewTag";
import arrow from "../../../assets/gen2/features/arrow-up-right.svg";
import check from "../../../assets/gen2/features/check.svg";
import type { Feature } from "./featuresData";

export interface FTextProps {
  feature: Feature;
  href?: string;
  learnMoreLabel?: string;
}

const ARROW = { "--g2f-arrow": `url("${arrow}")` } as CSSProperties;

/**
 * Text for one product (handoff 04 v109/v120): a Plex Mono caps name tag (+ NEW) above
 * the H3 headline, then the What's New list (14px checks) with Learn More ↗ under it.
 * Sizes come from the parent (`.g2f-pinned` 36/16, `.g2f-stack` 20/14).
 */
export default function FText({ feature, href, learnMoreLabel = "Learn More" }: FTextProps) {
  return (
    <div className="g2f-text">
      <div className="g2f-text__top">
        <p className="g2f-text__name">
          {feature.name}
          {feature.isNew && <NewTag />}
        </p>
        <h3 className="g2f-text__title">{feature.title}</h3>
      </div>
      <div className="g2f-text__bottom">
        <div className="g2f-new-list">
          <p className="g2f-new-list__label">What’s New</p>
          <ul className="g2f-new-list__items">
            {feature.whatsNew.map((item) => (
              <li key={item}>
                <img src={check} alt="" width={14} height={14} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <a className="g2f-text__more" href={href || "#"}>
          {learnMoreLabel}
          <span className="g2f-text__more-icon" style={ARROW} aria-hidden />
        </a>
      </div>
    </div>
  );
}
