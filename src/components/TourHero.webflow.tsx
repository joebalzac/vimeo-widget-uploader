import TourHero from "./TourHero";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(TourHero, {
  name: "Tour Intelligence — Hero",
  description:
    "Full-bleed hero over an animated floor plan. The plan draws in, three timestamps pin to their rooms, then one room card at a time plays its update. Place outside any Container.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "Tour Intelligence" }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue:
        "Records and scores tours, automates follow-up tasks, and surfaces coaching and property insights to turn more tours into leases.",
    }),
    ctaLabel: props.Text({ name: "CTA Label", defaultValue: "Get A Demo" }),
    ctaHref: props.Text({ name: "CTA URL", defaultValue: "#" }),
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the hero section, e.g. tour-hero, so links like #tour-hero jump here.",
    }),
  },
});
