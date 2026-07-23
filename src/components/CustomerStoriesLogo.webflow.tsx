import CustomerStoriesLogo from "./CustomerStoriesLogo";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";
import {
  buildLogoGrid,
  slotLabel,
  type LogoSlotConfig,
} from "../data/customerStoriesLogoConfig";

const SLOT_COUNT = 10;

interface AdapterProps {
  theme?: string;
  hoverBgUrl?: string;
  [slotProp: string]: string | undefined;
}

function CustomerStoriesLogoAdapter({
  theme,
  hoverBgUrl,
  ...rest
}: AdapterProps) {
  const slots: LogoSlotConfig[] = Array.from({ length: SLOT_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      href: rest[`l${n}CaseStudyUrl`],
      logoUrl: rest[`l${n}LogoUrl`],
      hoverBgUrl: rest[`l${n}HoverBgUrl`],
    };
  });

  const logos = buildLogoGrid(slots, hoverBgUrl);

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

function logoUrlProp(n: number) {
  return props.Text({
    name: `${slotLabel(n)} — Logo URL (override)`,
    defaultValue: "",
    tooltip:
      "Optional. Replaces the bundled brand logo for this cell. Upload an SVG/PNG to Webflow Assets and paste the URL.",
  });
}

function hoverBgProp(n: number) {
  return props.Text({
    name: `${slotLabel(n)} — Hover Background URL`,
    defaultValue: "",
    tooltip:
      "Optional. Hover image for this specific cell (requires a Case Study URL). Overrides the shared hover background.",
  });
}

// Build the flat per-slot prop map: logo URL, hover bg URL, and case study URL
// for each of the 10 grid cells.
const slotProps = Array.from({ length: SLOT_COUNT }).reduce<
  Record<string, ReturnType<typeof props.Text>>
>((acc, _, i) => {
  const n = i + 1;
  acc[`l${n}LogoUrl`] = logoUrlProp(n);
  acc[`l${n}HoverBgUrl`] = hoverBgProp(n);
  acc[`l${n}CaseStudyUrl`] = caseStudyUrlProp(n);
  return acc;
}, {});

export default declareComponent(CustomerStoriesLogoAdapter, {
  name: "Customer Stories — Logo Grid",
  description:
    "Trusted-by logo grid with bundled company SVGs (GoldOller, RPM, Scion, Greystar). Per cell you can add a custom logo, a hover background image, and a case study link.",
  group: "Media",

  props: {
    theme: props.Text({
      name: "Theme",
      defaultValue: "light",
      tooltip:
        '"light" = white background, dark logos. "dark" = black background, white logos.',
    }),
    hoverBgUrl: props.Text({
      name: "Shared Hover Background Image URL",
      defaultValue: "",
      tooltip:
        "Optional fallback hover image for linked cells. Upload a hero image to Webflow Assets and paste the URL. Per-cell hover URLs override this.",
    }),
    ...slotProps,
  },
});
