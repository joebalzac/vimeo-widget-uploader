import type { CSSProperties } from "react";
import NewTag from "../shared/NewTag";
import arrow from "../../../assets/gen2/features/arrow-up-right.svg";
import type { Feature } from "./featuresData";

export interface FTextProps {
  feature: Feature;
  href?: string;
  learnMoreLabel?: string;
}

const ARROW = { "--g2f-arrow": `url("${arrow}")` } as CSSProperties;

/**
 * Text for one product (Figma 618:6983 / 642:140236): title (+ NEW tag) and description,
 * then the What's New list with Learn More ↗ under it. Sizes come from the parent
 * (`.g2f-pinned` 36/18/16, `.g2f-stack` 20/16/14).
 */
export default function FText({ feature, href, learnMoreLabel = "Learn More" }: FTextProps) {
  return (
    <div className="g2f-text">
      <div className="g2f-text__top">
        <h3 className="g2f-text__title">
          {feature.title}
          {feature.isNew && <NewTag />}
        </h3>
        <p className="g2f-text__desc">{feature.description}</p>
      </div>
      <div className="g2f-text__bottom">
        <div className="g2f-new-list">
          <p className="g2f-new-list__label">What’s New</p>
          <ul className="g2f-new-list__items">
            {feature.whatsNew.map((item) => (
              <li key={item}>{item}</li>
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
