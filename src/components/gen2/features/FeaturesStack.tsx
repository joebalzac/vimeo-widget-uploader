import Reveal from "../shared/Reveal";
import FCard from "./FCard";
import FText from "./FText";
import FVis from "./FVis";
import { FEATURES } from "./featuresData";
import type { FeaturesSectionProps } from "./FeaturesPinned";

/** Mobile / tablet (≤1000): each product is a card + text pair revealed on scroll. */
export default function FeaturesStack({ hrefs = {}, learnMoreLabel }: FeaturesSectionProps) {
  return (
    <div className="g2f-stack">
      {FEATURES.map((f) => (
        <Reveal key={f.id} className="g2f-stack__item">
          <FCard>
            <div className="g2f-vis">
              <FVis id={f.id} />
            </div>
          </FCard>
          <FText feature={f} href={hrefs[f.id]} learnMoreLabel={learnMoreLabel} />
        </Reveal>
      ))}
    </div>
  );
}
