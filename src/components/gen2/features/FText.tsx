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

/** Prototype `ChkI`: 14px check, #3F3E3C. */
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path d="M2.9 7.3 5.6 10 11.1 4.2" stroke="#3f3e3c" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Text for one product (prototype `FText`): a Plex Mono caps eyebrow (name + NEW) above
 * the H3, then the What's New list with Learn More ↗ under it. Sizes come from the parent
 * (`.g2f-pin` 36, `.g2f-stack` 20).
 */
export default function FText({ feature, href, learnMoreLabel = "Learn More" }: FTextProps) {
  return (
    <div className="g2f-text">
      <div className="g2f-text__hd">
        <p className="g2f-text__eb">
          {feature.name}
          {feature.isNew && <NewTag />}
        </p>
        <h3 className="g2f-text__title">{feature.title}</h3>
      </div>
      <div className="g2f-text__wn">
        <div className="g2f-ch">
          <p className="g2f-ch__lb">What’s New</p>
          <ul className="g2f-ch__ls">
            {feature.whatsNew.map((item) => (
              <li key={item}>
                <Check />
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
