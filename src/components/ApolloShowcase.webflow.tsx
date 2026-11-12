import ApolloShowcase from "./ApolloShowcase";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(ApolloShowcase, {
  name: "Tour Intelligence — Ask Apollo",
  description:
    "Apollo showcase: Leasing Agents / Managers / Executives tabs auto-cycle through animated conversations. Clear the heading to use a separate Section Heading instead.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({
      name: "Heading",
      defaultValue: "Ask Apollo Anything About Your Tours",
      tooltip: "Shown left of the tabs. Leave empty to right-align the tabs and use a separate Section Heading.",
    }),
    startTab: props.Variant({
      name: "Start Tab",
      options: ["Leasing Agents", "Managers", "Executives"],
      defaultValue: "Leasing Agents",
      tooltip: "Which tab shows first. The auto-cycle continues from there.",
    }),
    cardTitle: props.Text({ name: "Card Title", defaultValue: "Tour Preparation" }),
    cardSubtitle: props.Text({
      name: "Card Subtitle",
      defaultValue: "Receive daily prospect brief with full context.",
    }),
  },
});
