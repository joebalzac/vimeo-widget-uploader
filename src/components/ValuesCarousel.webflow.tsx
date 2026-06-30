import ValuesCarousel from "./ValuesCarousel";
import type { ValueItem } from "./ValuesCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  fixedWidth?: string;
  perPage?: number;
  // Value card slots — only included if a title is set.
  v1Title?: string; v1Desc?: string; v1VideoSrc?: string; v1VimeoId?: string;
  v2Title?: string; v2Desc?: string; v2VideoSrc?: string; v2VimeoId?: string;
  v3Title?: string; v3Desc?: string; v3VideoSrc?: string; v3VimeoId?: string;
  v4Title?: string; v4Desc?: string; v4VideoSrc?: string; v4VimeoId?: string;
  v5Title?: string; v5Desc?: string; v5VideoSrc?: string; v5VimeoId?: string;
  v6Title?: string; v6Desc?: string; v6VideoSrc?: string; v6VimeoId?: string;
}

function ValuesCarouselAdapter({
  eyebrow, heading, fixedWidth, perPage,
  v1Title, v1Desc, v1VideoSrc, v1VimeoId,
  v2Title, v2Desc, v2VideoSrc, v2VimeoId,
  v3Title, v3Desc, v3VideoSrc, v3VimeoId,
  v4Title, v4Desc, v4VideoSrc, v4VimeoId,
  v5Title, v5Desc, v5VideoSrc, v5VimeoId,
  v6Title, v6Desc, v6VideoSrc, v6VimeoId,
}: AdapterProps) {
  const slots = [
    { title: v1Title, description: v1Desc, videoSrc: v1VideoSrc, vimeoId: v1VimeoId },
    { title: v2Title, description: v2Desc, videoSrc: v2VideoSrc, vimeoId: v2VimeoId },
    { title: v3Title, description: v3Desc, videoSrc: v3VideoSrc, vimeoId: v3VimeoId },
    { title: v4Title, description: v4Desc, videoSrc: v4VideoSrc, vimeoId: v4VimeoId },
    { title: v5Title, description: v5Desc, videoSrc: v5VideoSrc, vimeoId: v5VimeoId },
    { title: v6Title, description: v6Desc, videoSrc: v6VideoSrc, vimeoId: v6VimeoId },
  ];

  const items: ValueItem[] = slots
    .filter((s) => s.title)
    .map((s) => ({
      title: s.title || "",
      description: s.description || "",
      videoSrc: s.videoSrc || undefined,
      vimeoId: s.vimeoId || undefined,
    }));

  return (
    <ValuesCarousel
      eyebrow={eyebrow}
      heading={heading}
      fixedWidth={fixedWidth}
      perPage={perPage}
      items={items.length ? items : undefined}
    />
  );
}

function valueProps(n: number) {
  return {
    [`v${n}Title`]: props.Text({
      name: `Value ${n} — Title`,
      defaultValue: "",
      tooltip: `Card heading for value ${n}, e.g. "Be Great and Good". Leave blank to hide the card.`,
    }),
    [`v${n}Desc`]: props.Text({
      name: `Value ${n} — Description`,
      defaultValue: "",
      tooltip: `Supporting paragraph shown under the title.`,
    }),
    [`v${n}VideoSrc`]: props.Text({
      name: `Value ${n} — Video URL (mp4)`,
      defaultValue: "",
      tooltip: `Direct .mp4 URL (e.g. a Webflow CDN asset). Loops muted in the background. Takes priority over the Vimeo ID.`,
    }),
    [`v${n}VimeoId`]: props.Text({
      name: `Value ${n} — Vimeo ID`,
      defaultValue: "",
      tooltip: `Numeric Vimeo video ID, e.g. "76979871". Used as a looping background player when no mp4 URL is set.`,
    }),
  };
}

export default declareComponent(ValuesCarouselAdapter, {
  name: "Values Carousel",
  description:
    "\"Values That Power Our People\" dark carousel. Add up to 6 value cards — each shows a title, description, and a looping background video (paste a Webflow CDN .mp4 URL or a Vimeo ID).",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "How we work",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Values That Power Our People",
      tooltip: "Main section heading.",
    }),
    fixedWidth: props.Text({
      name: "Card Width",
      defaultValue: "476px",
      tooltip: 'Fixed card width so the next card peeks. CSS value, e.g. "476px".',
    }),
    perPage: props.Number({
      name: "Cards per page",
      defaultValue: 0,
      min: 0,
      max: 6,
      tooltip: "Set > 0 to override the peek layout with a fixed count per page.",
    }),
    ...valueProps(1),
    ...valueProps(2),
    ...valueProps(3),
    ...valueProps(4),
    ...valueProps(5),
    ...valueProps(6),
  },
});
