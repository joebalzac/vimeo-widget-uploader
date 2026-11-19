import Gen2Hero from "./Gen2Hero";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Hero, {
  name: "Gen2 — Hero",
  description:
    "Hero in its own container (90% / max 90rem, 100rem ≥1440, 120rem ≥1920; full width on mobile) with the soft lilac/blue haze behind it. Centred copy above the Calendar / Prospects / Residents board, which plays Elise's actions once when scrolled into view. No background colour or vertical padding: set those on the Webflow section. Place it directly in the section, not inside a Container.",
  group: "Gen2",

  props: {
    eyebrow: props.Text({ name: "Eyebrow", defaultValue: "EliseAI Gen 2" }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "The #1 AI Platform Transforming Multifamily Operations",
    }),
    subtitle: props.Text({
      name: "Subtitle",
      defaultValue: "The next generation of team experience, resident experience, and asset performance.",
    }),
    ctaLabel: props.Text({ name: "CTA Label", defaultValue: "Get A Demo" }),
    ctaHref: props.Text({ name: "CTA URL", defaultValue: "#" }),
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the component root, e.g. gen2-hero, so links like #gen2-hero jump here.",
    }),
  },
});
