import PhotoCarousel from "./PhotoCarousel";
import type { PhotoItem } from "./PhotoCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 9;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  // Per-slot props are added dynamically (p1Image, p1Width, p1Height, …).
  [key: string]: ImageValue | string | number | undefined;
}

function PhotoCarouselAdapter(p: AdapterProps) {
  const items: PhotoItem[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const img = p[`p${n}Image`] as ImageValue | undefined;
    if (!img?.src) continue;
    items.push({
      src: img.src,
      alt: img.alt || "",
      width: Number(p[`p${n}Width`]) || undefined,
      height: Number(p[`p${n}Height`]) || undefined,
    });
  }

  return (
    <PhotoCarousel
      eyebrow={p.eyebrow}
      heading={p.heading}
      items={items.length ? items : undefined}
    />
  );
}

function photoProps(n: number) {
  // Figma rhythm: odd cards portrait (200×260), even cards landscape (300×200).
  const portrait = n % 2 === 1;
  return {
    [`p${n}Image`]: props.Image({
      name: `Photo ${n} — Image`,
      tooltip: `Image for card ${n} (upload or paste a URL). Leave empty to hide the card.`,
    }),
    [`p${n}Width`]: props.Number({
      name: `Photo ${n} — Width (px)`,
      defaultValue: portrait ? 200 : 300,
      min: 80,
      max: 800,
      tooltip: `Card width in pixels.`,
    }),
    [`p${n}Height`]: props.Number({
      name: `Photo ${n} — Height (px)`,
      defaultValue: portrait ? 260 : 200,
      min: 80,
      max: 800,
      tooltip: `Card height in pixels.`,
    }),
  };
}

function allPhotoProps() {
  let acc = {};
  for (let n = 1; n <= SLOTS; n++) acc = { ...acc, ...photoProps(n) };
  return acc;
}

export default declareComponent(PhotoCarouselAdapter, {
  name: "Photo Carousel",
  description:
    "Drag-to-scroll image gallery with hover-to-enlarge cards. Grab anywhere and drag to scroll; cards scale up on hover. Add up to 9 images, each with its own size.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "",
      tooltip: "Small label above the gallery. Leave blank to hide the header.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "",
      tooltip: "Main heading above the gallery. Leave blank to hide the header.",
    }),
    ...allPhotoProps(),
  },
});
