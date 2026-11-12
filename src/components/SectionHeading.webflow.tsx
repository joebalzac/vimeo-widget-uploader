import SectionHeading from "./SectionHeading";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(SectionHeading, {
  name: "Section Heading",
  description:
    "48px section headline with an optional eyebrow. Use above Bento, Apollo and Mystery Shopping sections. Fades up once on scroll.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "See & Improve Every Tour at Scale" }),
    eyebrow: props.Text({ name: "Eyebrow", defaultValue: "" }),
    align: props.Variant({ name: "Align", options: ["center", "left"], defaultValue: "center" }),
    theme: props.Variant({ name: "Theme", options: ["light", "dark"], defaultValue: "light" }),
    maxWidth: props.Number({ name: "Max Width (px)", defaultValue: 501, min: 200, max: 1200 }),
  },
});
