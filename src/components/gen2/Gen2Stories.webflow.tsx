import Gen2Stories from "./Gen2Stories";
import { DEFAULT_STORIES, type Gen2Story } from "./gen2StoriesData";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 3;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  heading?: string;
  subtitle?: string;
  subtitleMobileOnly?: boolean;
  duration?: number;
  [key: string]: ImageValue | string | number | boolean | undefined;
}

function Gen2StoriesAdapter(p: AdapterProps) {
  const stories: Gen2Story[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const img = p[`t${n}Poster`] as ImageValue | undefined;
    stories.push({
      quote: (p[`t${n}Quote`] as string | undefined) ?? "",
      name: (p[`t${n}Name`] as string | undefined) ?? "",
      role: (p[`t${n}Role`] as string | undefined) ?? "",
      posterSrc: img?.src || (p[`t${n}PosterUrl`] as string | undefined) || "",
      videoUrl: (p[`t${n}Video`] as string | undefined) ?? "",
    });
  }
  return <Gen2Stories
      heading={p.heading}
      subtitle={p.subtitle}
      subtitleMobileOnly={p.subtitleMobileOnly}
      duration={p.duration} stories={stories} />;
}

function storyProps(n: number) {
  const d = DEFAULT_STORIES[n - 1];
  return {
    [`t${n}Quote`]: props.Text({
      name: `Story ${n} — Quote`,
      defaultValue: d.quote,
      tooltip: `Leave empty to hide story ${n}.`,
    }),
    [`t${n}Name`]: props.Text({ name: `Story ${n} — Name`, defaultValue: d.name }),
    [`t${n}Role`]: props.Text({ name: `Story ${n} — Role`, defaultValue: d.role }),
    [`t${n}Poster`]: props.Image({ name: `Story ${n} — Poster`, tooltip: "Video poster image. Empty uses the default Figma poster." }),
    [`t${n}PosterUrl`]: props.Text({ name: `Story ${n} — Poster URL`, defaultValue: "", tooltip: "Used when no Poster image is set." }),
    [`t${n}Video`]: props.Text({
      name: `Story ${n} — Vimeo ID`,
      defaultValue: "",
      tooltip:
        "Paste the Vimeo ID (e.g. 76979871) or the full Vimeo link. For unlisted videos paste the full link so the privacy hash comes along. A direct .mp4 URL also works. Leave empty and the play button does nothing.",
    }),
  };
}

export default declareComponent(Gen2StoriesAdapter, {
  name: "Gen2 — Operator Stories",
  description:
    "“Trusted by Operators of All Sizes”: heading with prev/next arrows, a quote beside a video poster (opens a lightbox), and a progress bar. Autoplays while in view; pauses on video hover.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "Trusted by Operators of All Sizes" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "Automatically route tasks to the right teams." }),
    subtitleMobileOnly: props.Boolean({
      name: "Subtitle on Mobile Only",
      defaultValue: true,
      tooltip: "Figma shows the subtitle on mobile only. Turn off to show it on desktop too.",
    }),
    duration: props.Number({ name: "Seconds per Story", defaultValue: 8, min: 3, max: 30 }),
    ...storyProps(1),
    ...storyProps(2),
    ...storyProps(3),
  },
});
