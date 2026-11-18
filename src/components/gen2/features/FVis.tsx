import type { ComponentType } from "react";
import type { FeatureId } from "./featuresData";
import VisLeasing from "./visuals/VisLeasing";
import VisTour from "./visuals/VisTour";
import VisAigt from "./visuals/VisAigt";
import VisMaint from "./visuals/VisMaint";
import VisDelinquency from "./visuals/VisDelinquency";
import VisRenewals from "./visuals/VisRenewals";

const VISUALS: Record<FeatureId, ComponentType> = {
  leasing: VisLeasing,
  tour: VisTour,
  aigt: VisAigt,
  maint: VisMaint,
  delinquency: VisDelinquency,
  renewals: VisRenewals,
};

/** The product visual for `id`, drawn in the 660×460 card space. */
export default function FVis({ id }: { id: FeatureId }) {
  const V = VISUALS[id];
  return <V />;
}
