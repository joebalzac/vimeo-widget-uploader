import Gen2Features from "./features/Gen2Features";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Features, {
  name: "Gen2 — Features",
  description:
    "Six products (LeasingAI → Renewals). ≥1001px: the section is 6 screens tall and pins (position: sticky) while the ruler, text and animated visual step through the products. ≤1000px: stacked card + text pairs. Sticky only works if no ancestor (Section, Container, wrapper divs, body) sets overflow: hidden/auto/clip — leave overflow visible on every parent. Fills its container; set section padding in Webflow.",
  group: "Gen2",

  props: {
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the section, e.g. products, so links like #products jump here.",
    }),
    leasingHref: props.Text({ name: "LeasingAI URL", defaultValue: "#" }),
    tourHref: props.Text({ name: "Tour Intelligence URL", defaultValue: "#" }),
    aigtHref: props.Text({ name: "AI-Guided Tours URL", defaultValue: "#" }),
    maintenanceHref: props.Text({ name: "Maintenance URL", defaultValue: "#" }),
    delinquencyHref: props.Text({ name: "Delinquency URL", defaultValue: "#" }),
    renewalsHref: props.Text({ name: "Renewals URL", defaultValue: "#" }),
    learnMoreLabel: props.Text({ name: "Learn More Label", defaultValue: "Learn More" }),
  },
});
