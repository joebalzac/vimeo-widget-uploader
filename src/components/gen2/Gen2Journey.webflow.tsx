import Gen2Journey, { DEFAULT_JOURNEY_HEADING, DEFAULT_JOURNEY_SUBTITLE } from "./Gen2Journey";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Journey, {
  name: "Gen2 — Renter Journey",
  description:
    "“The Ideal Renter Journey”: heading + subtitle above a ring of six products around the Apollo mark. A clockwise sweep lights each product, holds, rewinds and loops while in view. A faint grid/spoke pattern sits behind the ring and spans the full page width. Scales to fit on mobile. No background colour or vertical padding of its own: set those on the Webflow section (flat #FDFCFB).",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: DEFAULT_JOURNEY_HEADING }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: DEFAULT_JOURNEY_SUBTITLE }),
  },
});
