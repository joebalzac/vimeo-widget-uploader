import CustomerStoriesLogo from "./CustomerStoriesLogo";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";
import {
  buildLogoGrid,
  slotLabel,
} from "../data/customerStoriesLogoConfig";

interface AdapterProps {
  theme?: string;
  hoverBgUrl?: string;
  l1CaseStudyUrl?: string;
  l2CaseStudyUrl?: string;
  l3CaseStudyUrl?: string;
  l4CaseStudyUrl?: string;
  l5CaseStudyUrl?: string;
  l6CaseStudyUrl?: string;
  l7CaseStudyUrl?: string;
  l8CaseStudyUrl?: string;
  l9CaseStudyUrl?: string;
  l10CaseStudyUrl?: string;
}

function CustomerStoriesLogoAdapter({
  theme,
  hoverBgUrl,
  l1CaseStudyUrl,
  l2CaseStudyUrl,
  l3CaseStudyUrl,
  l4CaseStudyUrl,
  l5CaseStudyUrl,
  l6CaseStudyUrl,
  l7CaseStudyUrl,
  l8CaseStudyUrl,
  l9CaseStudyUrl,
  l10CaseStudyUrl,
}: AdapterProps) {
  const logos = buildLogoGrid(
    [
      l1CaseStudyUrl,
      l2CaseStudyUrl,
      l3CaseStudyUrl,
      l4CaseStudyUrl,
      l5CaseStudyUrl,
      l6CaseStudyUrl,
      l7CaseStudyUrl,
      l8CaseStudyUrl,
      l9CaseStudyUrl,
      l10CaseStudyUrl,
    ],
    hoverBgUrl,
  );

  return (
    <CustomerStoriesLogo
      theme={theme === "dark" ? "dark" : "light"}
      logos={logos}
    />
  );
}

function caseStudyUrlProp(n: number) {
  return props.Text({
    name: `${slotLabel(n)} — Case Study URL`,
    defaultValue: "",
      tooltip: `Optional. Links this cell on click. Arrows show on preset case-study slots automatically; add a URL here to enable the link.`,
  });
}

export default declareComponent(CustomerStoriesLogoAdapter, {
  name: "Customer Stories — Logo Grid",
  description:
    "Trusted-by logo grid with bundled company SVGs (GoldOller, RPM, Scion, Greystar). Only add case study URLs for cells that should be clickable — logos are preset in code.",
  group: "Media",

  props: {
    theme: props.Text({
      name: "Theme",
      defaultValue: "light",
      tooltip:
        '"light" = white background, dark logos. "dark" = black background, white logos.',
    }),
    hoverBgUrl: props.Text({
      name: "Hover Background Image URL",
      defaultValue: "",
      tooltip:
        "Optional for arrow-only cells. Required for hover image preview. Upload a hero image to Webflow Assets and paste the URL.",
    }),
    l1CaseStudyUrl: caseStudyUrlProp(1),
    l2CaseStudyUrl: caseStudyUrlProp(2),
    l3CaseStudyUrl: caseStudyUrlProp(3),
    l4CaseStudyUrl: caseStudyUrlProp(4),
    l5CaseStudyUrl: caseStudyUrlProp(5),
    l6CaseStudyUrl: caseStudyUrlProp(6),
    l7CaseStudyUrl: caseStudyUrlProp(7),
    l8CaseStudyUrl: caseStudyUrlProp(8),
    l9CaseStudyUrl: caseStudyUrlProp(9),
    l10CaseStudyUrl: caseStudyUrlProp(10),
  },
});
