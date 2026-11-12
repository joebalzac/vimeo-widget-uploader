import TourHero from "./TourHero";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(TourHero, {
  name: "Tour Intelligence — Hero",
  description:
    "Full-bleed hero over an animated floor plan. The plan draws in, then room cards open from their timestamps one at a time. Place outside any Container.",
  group: "Tour Intelligence",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "",
      tooltip: "Optional mono label above the heading. The Figma design has none.",
    }),
    heading: props.Text({ name: "Heading", defaultValue: "Tour Intelligence" }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue:
        "Records and scores tours, automates follow-up tasks, and surfaces coaching and property insights to turn more tours into leases.",
    }),
    ctaLabel: props.Text({ name: "CTA Label", defaultValue: "Get A Demo" }),
    ctaHref: props.Text({ name: "CTA URL", defaultValue: "#" }),
  },
});
