import Gen2Apollo from "./Gen2Apollo";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Apollo, {
  name: "Gen2 — Apollo",
  description:
    "More Power, More Simplicity with Apollo: heading, scenario tabs and an animated Apollo phone chat over a scroll-linked ring. Tabs auto-advance until one is clicked. Full-bleed: place outside any Container. The ring bleeds into the section padding (120px above on desktop; 48 above / 40 below on mobile) and fades there; change with the CSS variables --g2a-ring-bleed-top / --g2a-ring-bleed-bottom on the section. Chat copy lives in gen2/apollo/gen2ApolloData.ts.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "More Power, More Simplicity with Apollo" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "One agent to control the whole platform, making Elise radically easy to implement, learn, and use." }),
    headingMaxWidth: props.Number({ name: "Heading Max Width (px)", defaultValue: 418, min: 200, max: 1200 }),
    startTab: props.Variant({
      name: "Start Tab",
      options: ["Site Team", "Onboarding", "Regionals", "Portfolio Leaders"],
      defaultValue: "Site Team",
    }),
    autoAdvance: props.Boolean({
      name: "Auto-advance Tabs",
      defaultValue: true,
      trueLabel: "On",
      falseLabel: "Off",
    }),
    holdMs: props.Number({
      name: "Hold Before Next Tab (ms)",
      defaultValue: 7000,
      min: 1000,
      max: 30000,
    }),
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the section, e.g. apollo, so links like #apollo jump here.",
    }),
  },
});
