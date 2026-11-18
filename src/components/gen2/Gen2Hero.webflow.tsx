import Gen2Hero from "./Gen2Hero";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Hero, {
  name: "Gen2 — Hero",
  description:
    "Gen 2 hero: centred copy above an animated Calendar / Prospects / Residents board with a ~13s story loop, on a soft lilac haze that fades the board into the bottom of the hero. Place outside any Container.",
  group: "Gen2",

  props: {
    eyebrow: props.Text({ name: "Eyebrow", defaultValue: "GEN 2" }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "The #1 AI Platform to Transform Multifamily Operations",
    }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "The next generation of asset performance." }),
    ctaLabel: props.Text({ name: "CTA Label", defaultValue: "Get A Demo" }),
    ctaHref: props.Text({ name: "CTA URL", defaultValue: "#" }),
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the hero section, e.g. gen2-hero, so links like #gen2-hero jump here.",
    }),
  },
});
