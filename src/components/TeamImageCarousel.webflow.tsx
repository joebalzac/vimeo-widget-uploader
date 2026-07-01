import TeamImageCarousel from "./TeamImageCarousel";
import type { TeamImageMember } from "./TeamImageCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 6;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  fixedWidth?: string;
  perPage?: number;
  // Per-slot props are added dynamically (m1Image, m1Name, m1Role, m1Quote, …).
  [key: string]: ImageValue | string | number | undefined;
}

function TeamImageCarouselAdapter(p: AdapterProps) {
  const members: TeamImageMember[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    const img = p[`m${n}Image`] as ImageValue | undefined;
    if (!img?.src) continue;
    members.push({
      image: img.src,
      name: (p[`m${n}Name`] as string) || (img.alt as string) || "",
      role: (p[`m${n}Role`] as string) || "",
      quote: (p[`m${n}Quote`] as string) || undefined,
    });
  }

  return (
    <TeamImageCarousel
      eyebrow={p.eyebrow}
      heading={p.heading}
      fixedWidth={p.fixedWidth}
      perPage={p.perPage as number | undefined}
      members={members.length ? members : undefined}
    />
  );
}

function memberProps(n: number) {
  return {
    [`m${n}Image`]: props.Image({
      name: `Member ${n} — Photo`,
      tooltip: `Photo for member ${n} (upload or paste an image URL). Leave empty to hide the card.`,
    }),
    [`m${n}Name`]: props.Text({
      name: `Member ${n} — Name`,
      defaultValue: "",
      tooltip: `Full name shown at the bottom of the card.`,
    }),
    [`m${n}Role`]: props.Text({
      name: `Member ${n} — Role`,
      defaultValue: "",
      tooltip: `Job title shown under the name.`,
    }),
    [`m${n}Quote`]: props.Text({
      name: `Member ${n} — Quote`,
      defaultValue: "",
      tooltip: `Quote revealed on hover. Leave blank for no hover quote.`,
    }),
  };
}

function allMemberProps() {
  let acc = {};
  for (let n = 1; n <= SLOTS; n++) acc = { ...acc, ...memberProps(n) };
  return acc;
}

export default declareComponent(TeamImageCarouselAdapter, {
  name: "Team Image Carousel",
  description:
    "\"Meet the Engineers\" carousel. Each card shows a team member's photo with their name and role; hovering reveals a dark blur with their quote. Add up to 6 members — upload a photo or paste an image URL.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "Building with the best",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Meet the Engineers",
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
    ...allMemberProps(),
  },
});
