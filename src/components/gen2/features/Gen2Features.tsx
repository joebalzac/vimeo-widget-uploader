import "../../../utils/interVariableFont";
import { useSyncExternalStore } from "react";
import FeaturesPinned from "./FeaturesPinned";
import FeaturesStack from "./FeaturesStack";
import "./Gen2Features.css";

export interface Gen2FeaturesProps {
  /** HTML id on the section, for anchor links. */
  id?: string;
  leasingHref?: string;
  tourHref?: string;
  aigtHref?: string;
  maintenanceHref?: string;
  delinquencyHref?: string;
  renewalsHref?: string;
  learnMoreLabel?: string;
  className?: string;
}

const DESKTOP = "(min-width: 1001px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = () => window.matchMedia(DESKTOP).matches;
const getServerDesktop = () => true;

/**
 * Gen2 Features: six products. ≥1001px pins the section and steps through the products
 * on scroll (ruler | text | visual); ≤1000px stacks card + text pairs. Handoff 04 /
 * Final prototype `Features3`.
 */
export default function Gen2Features({
  id,
  leasingHref,
  tourHref,
  aigtHref,
  maintenanceHref,
  delinquencyHref,
  renewalsHref,
  learnMoreLabel = "Learn More",
  className,
}: Gen2FeaturesProps) {
  const desktop = useSyncExternalStore(subscribe, getDesktop, getServerDesktop);
  const hrefs = {
    leasing: leasingHref,
    tour: tourHref,
    aigt: aigtHref,
    maint: maintenanceHref,
    delinquency: delinquencyHref,
    renewals: renewalsHref,
  };
  return (
    <section id={id || undefined} className={["g2f", className].filter(Boolean).join(" ")} aria-label="Products">
      {desktop ? (
        <FeaturesPinned hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
      ) : (
        <FeaturesStack hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
      )}
    </section>
  );
}
