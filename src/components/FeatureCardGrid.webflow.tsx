import FeatureCardGrid from "./FeatureCardGrid";
import type { FeatureCard } from "./FeatureCardGrid";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

/** Card slots offered in the Webflow panel. Empty slots are skipped. */
const SLOTS = 3;

type ImageValue = { src: string; alt?: string };

const CARD_DEFAULTS: { title: string; subtitle: string }[] = [
  {
    title: "Smarter Workforce",
    subtitle:
      "Apollo gives every employee expert-level operational context from day one.",
  },
  {
    title: "Maximize Product Utilization",
    subtitle:
      "Unlock the full power of products you already have with prompt-based actions.",
  },
  {
    title: "Asset Performance Insights",
    subtitle:
      "Give leaders eyes and ears to spot problems before they happen.",
  },
];

interface AdapterProps {
  columns?: string;
  theme?: string;
  imageFit?: string;
  bordered?: boolean;
  // Per-card props are added dynamically (c1Image, c1Title, c1Subtitle, …).
  [key: string]: ImageValue | string | number | boolean | undefined;
}

function FeatureCardGridAdapter(p: AdapterProps) {
  const cards: FeatureCard[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const image = p[`c${n}Image`] as ImageValue | undefined;
    const title = (p[`c${n}Title`] as string | undefined)?.trim();
    const subtitle = (p[`c${n}Subtitle`] as string | undefined)?.trim();
    if (!image?.src && !title && !subtitle) continue;
    cards.push({
      id: `card-${n}`,
      imageSrc: image?.src,
      imageAlt: image?.alt || title || "",
      title,
      subtitle,
    });
  }

  return (
    <FeatureCardGrid
      cards={cards.length ? cards : undefined}
      columns={Number(p.columns) || 3}
      theme={p.theme === "dark" ? "dark" : "light"}
      imageFit={p.imageFit === "cover" ? "cover" : "contain"}
      bordered={p.bordered !== false}
    />
  );
}

function cardProps(n: number) {
  const d = CARD_DEFAULTS[n - 1] ?? { title: "", subtitle: "" };
  return {
    [`c${n}Image`]: props.Image({
      name: `Card ${n} — Image`,
      tooltip: `Image shown above the text (upload or paste a URL). Transparent PNGs sit directly on the section background.`,
    }),
    [`c${n}Title`]: props.Text({
      name: `Card ${n} — Title`,
      defaultValue: d.title,
      tooltip: `Leave the title, subtitle, and image all empty to hide card ${n}.`,
    }),
    [`c${n}Subtitle`]: props.Text({
      name: `Card ${n} — Subtitle`,
      defaultValue: d.subtitle,
    }),
  };
}

function allCardProps() {
  let acc = {};
  for (let n = 1; n <= SLOTS; n++) acc = { ...acc, ...cardProps(n) };
  return acc;
}

export default declareComponent(FeatureCardGridAdapter, {
  name: "Feature Card Grid",
  description:
    "Transparent grid of 3 cards, each with an image, title, and subtitle, separated by thin dividers. Columns on desktop, stacked on mobile. Clearing a card's image, title, and subtitle hides it. Background stays transparent so it can sit on any section.",
  group: "Media",

  props: {
    columns: props.Variant({
      name: "Columns (desktop)",
      options: ["2", "3"],
      defaultValue: "3",
      tooltip:
        "Columns on desktop. Automatically becomes 2 on tablet and 1 on mobile.",
    }),
    theme: props.Variant({
      name: "Theme",
      options: ["light", "dark"],
      defaultValue: "light",
      tooltip:
        "Light for light sections, dark for dark sections. Only text and divider colors change — the background is always transparent.",
    }),
    imageFit: props.Variant({
      name: "Image Fit",
      options: ["contain", "cover"],
      defaultValue: "contain",
      tooltip:
        "Contain shows the whole image without cropping. Cover fills the media area and crops the overflow.",
    }),
    bordered: props.Boolean({
      name: "Show Borders",
      defaultValue: true,
      trueLabel: "Yes",
      falseLabel: "No",
      tooltip: "Outer frame and dividers between cards.",
    }),

    ...allCardProps(),
  },
});
