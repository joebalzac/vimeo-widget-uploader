import FlexGridSection from "./FlexGridSection";
import type { FlexGridItem } from "./FlexGridSection";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

/** Item slots offered in the Webflow panel. Empty slots are skipped. */
const SLOTS = 6;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  columns?: string;
  // Per-item props are added dynamically (i1Image, i1Headline, …).
  [key: string]: ImageValue | string | undefined;
}

function FlexGridSectionAdapter(p: AdapterProps) {
  const items: FlexGridItem[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const image = p[`i${n}Image`] as ImageValue | undefined;
    const headline = (p[`i${n}Headline`] as string | undefined)?.trim();
    items.push({
      id: `item-${n}`,
      imageSrc: image?.src,
      imageAlt: image?.alt || headline || "",
      headline,
    });
  }

  return <FlexGridSection items={items} columns={Number(p.columns) || 3} />;
}

function itemProps(n: number) {
  return {
    [`i${n}Image`]: props.Image({
      name: `Item ${n} — Image`,
      tooltip: "Image shown above the headline (upload or paste a URL).",
    }),
    [`i${n}Headline`]: props.Text({
      name: `Item ${n} — Headline`,
      defaultValue: `Headline ${n}`,
      tooltip: `Leave the headline and image both empty to hide item ${n}.`,
    }),
  };
}

function allItemProps() {
  let acc = {};
  for (let n = 1; n <= SLOTS; n++) acc = { ...acc, ...itemProps(n) };
  return acc;
}

export default declareComponent(FlexGridSectionAdapter, {
  name: "Flex Grid Section",
  description:
    "Wrapping grid of up to 6 items, each with an image and a headline. Columns on desktop, 2 on tablet, stacked on mobile. Clearing an item's image and headline hides it.",
  group: "Media",

  props: {
    columns: props.Variant({
      name: "Columns (desktop)",
      options: ["2", "3", "4"],
      defaultValue: "3",
      tooltip:
        "Columns on desktop. Automatically becomes 2 on tablet and 1 on mobile.",
    }),

    ...allItemProps(),
  },
});
