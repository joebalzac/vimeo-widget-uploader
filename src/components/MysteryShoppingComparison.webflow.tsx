import MysteryShoppingComparison from "./MysteryShoppingComparison";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(MysteryShoppingComparison, {
  name: "Tour Intelligence — Mystery Shopping Comparison",
  description:
    "Full dark section: heading + Tour Intelligence vs Mystery Shopping table. Paints its own #131115 background and padding — drop it straight on the page (no Section/Container needed). Stacks into two tables on phones.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({
      name: "Heading",
      defaultValue: "Mystery Shopping With Visibility Into Every Tour",
      tooltip: "Leave empty to hide the heading.",
    }),
    background: props.Text({
      name: "Background color",
      defaultValue: "#131115",
      tooltip: "Section background (CSS color). Keep it dark — the text is white.",
    }),
  },
});
