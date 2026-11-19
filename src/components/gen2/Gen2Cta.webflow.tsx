import Gen2Cta from "./Gen2Cta";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Cta, {
  name: "Gen2 — Closing CTA",
  description:
    "Closing call-to-action: centred 48px headline and a “Get A Demo” button, both revealing on scroll. Place inside a Section/Container (120px desktop / 48px mobile padding).",
  group: "Gen2",
  props: {
    heading: props.Text({
      name: "Heading",
      defaultValue: "Transform Outcomes for Residents, Teams, and the Business with EliseAI",
      tooltip: "Leave empty to hide.",
    }),
    ctaLabel: props.Text({ name: "Button Label", defaultValue: "Get A Demo", tooltip: "Leave empty to hide." }),
    ctaHref: props.Text({ name: "Button Link", defaultValue: "#" }),
  },
});
