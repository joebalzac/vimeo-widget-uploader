import Gen2Routing from "./Gen2Routing";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Routing, {
  name: "Gen2 — Enabling New Operating Models",
  description:
    "Heading + subtitle over an email thread whose messages route through a ROUTED pill into team task cards. Builds once at 50% in view, then lilac pulses loop along both routes.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "Enabling New Operating Models" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "Automatically route tasks to the right teams." }),
  },
});
