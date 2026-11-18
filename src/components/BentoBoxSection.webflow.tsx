import BentoBoxSection from "./BentoBoxSection";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(BentoBoxSection, {
  name: "Tour Intelligence — Bento Box Section",
  description:
    "Animated bento showcase of four Elise tour-intelligence features. Each card loops its own live preview animation; card headlines and subtitles are editable.",
  group: "Media",

  props: {
    recordTitle: props.Text({
      name: "Record — Headline",
      defaultValue: "Record The Tour",
    }),
    recordSubtitle: props.Text({
      name: "Record — Subtitle",
      defaultValue:
        "Elise records so agents can focus on the prospect, with points for recording tours and following up promptly.",
    }),
    automateTitle: props.Text({
      name: "Automate — Headline",
      defaultValue: "Automate Post-Tour Admin",
    }),
    automateSubtitle: props.Text({
      name: "Automate — Subtitle",
      defaultValue:
        "Elise updates tour status and guest cards in EliseCRM, and drafts personalized follow-ups agents can send in one tap.",
    }),
    insightsTitle: props.Text({
      name: "Insights — Headline",
      defaultValue: "See Portfolio-Level Insights",
    }),
    insightsSubtitle: props.Text({
      name: "Insights — Subtitle",
      defaultValue:
        "Elise surfaces agent performance, property insights, and top objections so leaders know where to invest.",
    }),
    coachTitle: props.Text({
      name: "Coach — Headline",
      defaultValue: "Coach Every Tour",
    }),
    coachSubtitle: props.Text({
      name: "Coach — Subtitle",
      defaultValue:
        "Elise scores each tour against a customizable rubric and flags areas for improvement.",
    }),
  },
});
