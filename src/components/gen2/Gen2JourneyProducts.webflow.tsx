import Gen2JourneyProducts from "./Gen2JourneyProducts";
import { DEFAULT_SUBTITLE } from "./Gen2Journey";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2JourneyProducts, {
  name: "Gen2 — Journey + Products",
  description:
    "“The Ideal Renter Journey” ring followed by the six products (Leasing → Renewals). ≥1001px: the ring pins, its arc draws on scroll, then it flattens into a product ruler while the products pin and step through on scroll (the block is ~7.6 screens tall). ≤1000px: looping ring + stacked product cards. Uses position: sticky — no ancestor (Section, Container, wrappers, body) may set overflow: hidden/auto/clip. Fills its container; set section padding in Webflow (no bottom padding needed).",
  group: "Gen2",

  props: {
    id: props.Id({
      name: "ID",
      tooltip: "HTML id for the block, e.g. products, so links like #products jump here.",
    }),
    heading: props.Text({ name: "Heading", defaultValue: "The Ideal Renter Journey" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: DEFAULT_SUBTITLE }),
    leasingHref: props.Text({ name: "Leasing URL", defaultValue: "#" }),
    tourHref: props.Text({ name: "Tour Intelligence URL", defaultValue: "#" }),
    aigtHref: props.Text({ name: "AI Guided Tours URL", defaultValue: "#" }),
    maintenanceHref: props.Text({ name: "Maintenance URL", defaultValue: "#" }),
    delinquencyHref: props.Text({ name: "Delinquency URL", defaultValue: "#" }),
    renewalsHref: props.Text({ name: "Renewals URL", defaultValue: "#" }),
    learnMoreLabel: props.Text({ name: "Learn More Label", defaultValue: "Learn More" }),
  },
});
