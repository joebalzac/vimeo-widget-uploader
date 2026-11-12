import TourCta from "./TourCta";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(TourCta, {
  name: "Tour Intelligence — Closing CTA",
  description:
    "Centred 48px headline + Get A Demo button (last section before the footer). Fills its container; set section padding in Webflow.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({
      name: "Heading",
      defaultValue: "Take Control of Your Leasing Journey with Tour Intelligence",
    }),
    ctaLabel: props.Text({ name: "CTA Label", defaultValue: "Get A Demo" }),
    ctaHref: props.Text({ name: "CTA URL", defaultValue: "#" }),
  },
});
