import Gen2Features from "./features/Gen2Features";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Features, {
  name: "Gen2 — Features",
  description:
    "Six products (Leasing → Renewals). ≥1001px: the section is 5.6 screens tall and pins while the ruler, text and animated visual step through the products; it pulls itself up/in with negative margins so the card starts 195px below the section top and ends 60px above the next section (add the next section's top padding on top of that). It pins with position: sticky and falls back to position: fixed automatically if a parent's overflow breaks sticky (leaving overflow visible on parents is still best). ≤1000px: stacked card + text pairs. Fills its container; set section padding in Webflow.",
  group: "Gen2",

  props: {
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the section, e.g. products, so links like #products jump here.",
    }),
    leasingHref: props.Text({ name: "Leasing URL", defaultValue: "#" }),
    tourHref: props.Text({ name: "Tour Intelligence URL", defaultValue: "#" }),
    aigtHref: props.Text({ name: "AI Guided Tours URL", defaultValue: "#" }),
    maintenanceHref: props.Text({ name: "Maintenance URL", defaultValue: "#" }),
    delinquencyHref: props.Text({ name: "Delinquency URL", defaultValue: "#" }),
    renewalsHref: props.Text({ name: "Renewals URL", defaultValue: "#" }),
    learnMoreLabel: props.Text({ name: "Learn More Label", defaultValue: "Learn More" }),
  },
});
