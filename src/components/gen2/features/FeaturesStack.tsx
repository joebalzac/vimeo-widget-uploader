import Reveal from "../shared/Reveal";
import FCard from "./FCard";
import FText from "./FText";
import FVis from "./FVis";
import { FEATURES } from "./featuresData";
import type { FeaturesSectionProps } from "./FeaturesPinned";

/**
 * Mobile / tablet (≤1000, prototype `FeaturesStack`): card + text pairs revealed on scroll,
 * 32 apart (64 and two columns at 768–1000).
 */
export default function FeaturesStack({ hrefs = {}, learnMoreLabel }: FeaturesSectionProps) {
  return (
    <div className="g2f-stack">
      {FEATURES.map((f) => (
        <Reveal key={f.id} className="g2f-stack__item">
          <FCard swapKey={f.id}>
            <FVis id={f.id} />
          </FCard>
          <FText feature={f} href={hrefs[f.id]} learnMoreLabel={learnMoreLabel} />
        </Reveal>
      ))}
    </div>
  );
}
