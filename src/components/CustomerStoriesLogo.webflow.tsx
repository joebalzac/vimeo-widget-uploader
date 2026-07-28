import CustomerStoriesLogo from "./CustomerStoriesLogo";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";
import {
  buildLogoGrid,
  slotLabel,
  slotLogoDefaults,
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
      logoHoverUrl: rest[`l${n}LogoHoverUrl`],
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

function logoUrlProp(n: number) {
  const { logoUrl, label } = slotLogoDefaults(n);
  return props.Text({
    name: `${slotLabel(n)} — Logo URL (black)`,
    defaultValue: logoUrl,
    tooltip: `Black ${label} logo for the light theme. Replace with any Webflow Asset URL to swap this cell.`,
  });
}

function logoHoverUrlProp(n: number) {
  const { logoHoverUrl, label } = slotLogoDefaults(n);
  return props.Text({
    name: `${slotLabel(n)} — Logo URL (white)`,
    defaultValue: logoHoverUrl,
    tooltip: `White ${label} logo for the dark theme and hover state. Replace with any Webflow Asset URL to swap this cell.`,
  });
}

function hoverBgProp(n: number) {
  const { hoverBgUrl, label } = slotLogoDefaults(n);
  return props.Text({
    name: `${slotLabel(n)} — Hover Background URL`,
    defaultValue: hoverBgUrl,
    tooltip: hoverBgUrl
      ? `Hover background for ${label}. Shown when a Case Study URL is set. Clear or replace as needed.`
      : `Optional hover background for ${label}. Paste a Webflow Asset URL. Requires a Case Study URL to appear on hover.`,
  });
}

function caseStudyUrlProp(n: number) {
  const { caseStudyUrl, label, hoverBgUrl } = slotLogoDefaults(n);
  return props.Text({
    name: `${slotLabel(n)} — Case Study URL`,
    defaultValue: caseStudyUrl,
    tooltip: hoverBgUrl
      ? `Paste the ${label} case study page URL. Required for click + hover expand with the background image.`
      : `Optional. Links this cell on click and enables the hover expand.`,
  });
}

const slotProps = Array.from({ length: SLOT_COUNT }).reduce<
  Record<string, ReturnType<typeof props.Text>>
>((acc, _, i) => {
  const n = i + 1;
  acc[`l${n}LogoUrl`] = logoUrlProp(n);
  acc[`l${n}LogoHoverUrl`] = logoHoverUrlProp(n);
  acc[`l${n}HoverBgUrl`] = hoverBgProp(n);
  acc[`l${n}CaseStudyUrl`] = caseStudyUrlProp(n);
  return acc;
}, {});

export default declareComponent(CustomerStoriesLogoAdapter, {
  name: "Customer Stories — Logo Grid",
  description:
    "Trusted-by logo grid. Each cell has editable black/white logos, a case study URL, and a hover background — all prefilled where available. Paste case study page URLs to enable click + hover.",
  group: "Media",

  props: {
    theme: props.Text({
      name: "Theme",
      defaultValue: "light",
      tooltip:
        '"light" = white background, black logos. "dark" = black background, white logos.',
    }),
    hoverBgUrl: props.Text({
      name: "Shared Hover Background Image URL",
      defaultValue: "",
      tooltip:
        "Optional fallback hover image for linked cells that don't have a per-cell background. Per-cell hover URLs override this.",
    }),
    ...slotProps,
  },
});
