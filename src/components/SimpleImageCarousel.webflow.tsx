import SimpleImageCarousel from "./SimpleImageCarousel";
import type { SimpleImageSlide } from "./SimpleImageCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 8;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  fixedWidth?: string;
  showHeader?: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  ctaNewTab?: boolean;
  // Per-slot props are added dynamically (s1Image, s1Title, s1Subtitle, s1Url, s1NewTab, …).
  [key: string]: ImageValue | string | number | boolean | undefined;
}

function SimpleImageCarouselAdapter(p: AdapterProps) {
  const slides: SimpleImageSlide[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const img = p[`s${n}Image`] as ImageValue | undefined;
    if (!img?.src) continue;
    slides.push({
      image: img.src,
      title: (p[`s${n}Title`] as string) || undefined,
      subtitle: (p[`s${n}Subtitle`] as string) || undefined,
      url: (p[`s${n}Url`] as string) || undefined,
      newTab: Boolean(p[`s${n}NewTab`]),
    });
  }

  return (
    <SimpleImageCarousel
      eyebrow={p.eyebrow}
      heading={p.heading}
      ctaLabel={p.ctaLabel}
      ctaUrl={p.ctaUrl}
      ctaNewTab={p.ctaNewTab}
      fixedWidth={p.fixedWidth}
      slides={slides.length ? slides : undefined}
      showHeader={p.showHeader}
    />
  );
}

function slideProps(n: number) {
  return {
    [`s${n}Image`]: props.Image({
      name: `Slide ${n} — Image`,
      tooltip: `Image for slide ${n}. Leave empty to hide the card.`,
    }),
    [`s${n}Title`]: props.Text({
      name: `Slide ${n} — Title`,
      defaultValue: "",
      tooltip: `Title shown at the bottom of the card.`,
    }),
    [`s${n}Subtitle`]: props.Text({
      name: `Slide ${n} — Subtitle`,
      defaultValue: "",
      tooltip: `Subtitle shown under the title.`,
    }),
    [`s${n}Url`]: props.Text({
      name: `Slide ${n} — Link URL`,
      defaultValue: "",
      tooltip: `Clicking anywhere on the card goes here. Leave blank for a non-clickable card.`,
    }),
    [`s${n}NewTab`]: props.Boolean({
      name: `Slide ${n} — Open in new tab`,
      defaultValue: false,
    }),
  };
}

function allSlideProps() {
  let acc = {};
  for (let n = 1; n <= SLOTS; n++) acc = { ...acc, ...slideProps(n) };
  return acc;
}

export default declareComponent(SimpleImageCarouselAdapter, {
  name: "Simple Image Carousel",
  description:
    "Basic image carousel. Each card shows an image with a title and subtitle, and the whole card links to a URL. Add up to 8 slides.",
  group: "Media",

  props: {
    showHeader: props.Boolean({
      name: "Show Header",
      defaultValue: true,
      tooltip:
        "Show the eyebrow/heading header. Turn off to hide it and move the nav arrows beneath the carousel.",
    }),
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "Eyebrow",
      tooltip: "Small label above the heading. Leave blank to hide.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Heading",
      tooltip: "Main section heading. Leave blank to hide.",
    }),
    ctaLabel: props.Text({
      name: "Button Label",
      defaultValue: "Tune In",
      tooltip: "Button under the heading. Leave blank to hide the button.",
    }),
    ctaUrl: props.Text({
      name: "Button URL",
      defaultValue: "",
      tooltip: "Where the button links to.",
    }),
    ctaNewTab: props.Boolean({
      name: "Button — Open in new tab",
      defaultValue: false,
    }),
    fixedWidth: props.Text({
      name: "Card Width",
      defaultValue: "574px",
      tooltip: 'Fixed card width so the next card peeks. Height follows at 16:9. CSS value, e.g. "574px".',
    }),
    ...allSlideProps(),
  },
});
