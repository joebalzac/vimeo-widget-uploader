import TeamCarousel from "./TeamCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(TeamCarousel, {
  name: "Team Carousel",
  description:
    "Hear From Our Team carousel. Each card shows a thumbnail; clicking opens a Vimeo modal that auto-plays the video.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "people behind the product",
      tooltip: "Small label above the heading.",
    }),

    heading: props.Text({
      name: "Heading",
      defaultValue: "Hear From Our Team",
      tooltip: "Main section heading.",
    }),

    ctaLabel: props.Text({
      name: "CTA Label",
      defaultValue: "Meet Our Team",
      tooltip: "Text for the CTA link.",
    }),

    ctaHref: props.Text({
      name: "CTA URL",
      defaultValue: "#",
      tooltip: "Destination URL for the CTA link.",
    }),

    fixedWidth: props.Text({
      name: "Card Width",
      defaultValue: "444px",
      tooltip:
        'Fixed width per card — the next card peeks past the edge. Use a CSS value like "444px" or "85%".',
    }),

    perPage: props.Number({
      name: "Cards per page",
      defaultValue: 0,
      min: 0,
      max: 6,
      tooltip:
        "Override the fixed-width layout with a set number of cards per page. Set to 0 to use the Card Width peek layout.",
    }),
  },
});
