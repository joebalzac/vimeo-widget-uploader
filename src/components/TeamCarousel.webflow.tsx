import TeamCarousel from "./TeamCarousel";
import type { TeamMember } from "./TeamCarousel";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  fixedWidth?: string;
  perPage?: number;
  // Member slots — only included in the array if vimeoId is non-empty
  m1Name?: string; m1Title?: string; m1VimeoId?: string;
  m2Name?: string; m2Title?: string; m2VimeoId?: string;
  m3Name?: string; m3Title?: string; m3VimeoId?: string;
  m4Name?: string; m4Title?: string; m4VimeoId?: string;
  m5Name?: string; m5Title?: string; m5VimeoId?: string;
  m6Name?: string; m6Title?: string; m6VimeoId?: string;
}

function TeamCarouselAdapter({
  eyebrow, heading, ctaLabel, ctaHref, fixedWidth, perPage,
  m1Name, m1Title, m1VimeoId,
  m2Name, m2Title, m2VimeoId,
  m3Name, m3Title, m3VimeoId,
  m4Name, m4Title, m4VimeoId,
  m5Name, m5Title, m5VimeoId,
  m6Name, m6Title, m6VimeoId,
}: AdapterProps) {
  const slots = [
    { name: m1Name, label: m1Title, vimeoId: m1VimeoId },
    { name: m2Name, label: m2Title, vimeoId: m2VimeoId },
    { name: m3Name, label: m3Title, vimeoId: m3VimeoId },
    { name: m4Name, label: m4Title, vimeoId: m4VimeoId },
    { name: m5Name, label: m5Title, vimeoId: m5VimeoId },
    { name: m6Name, label: m6Title, vimeoId: m6VimeoId },
  ];

  const members: TeamMember[] = slots
    .filter((s) => s.vimeoId)
    .map((s) => ({
      name: s.name || "",
      label: s.label || "",
      vimeoId: s.vimeoId!,
    }));

  return (
    <TeamCarousel
      eyebrow={eyebrow}
      heading={heading}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
      fixedWidth={fixedWidth}
      perPage={perPage}
      members={members.length ? members : undefined}
    />
  );
}

function memberProps(n: number) {
  return {
    [`m${n}VimeoId`]: props.Text({
      name: `Member ${n} — Vimeo ID`,
      defaultValue: "",
      tooltip: `Numeric Vimeo video ID for member ${n}, e.g. "76979871". Thumbnail is fetched automatically.`,
    }),
    [`m${n}Name`]: props.Text({
      name: `Member ${n} — Name`,
      defaultValue: "",
      tooltip: `Full name shown on the card.`,
    }),
    [`m${n}Title`]: props.Text({
      name: `Member ${n} — Title`,
      defaultValue: "",
      tooltip: `Job title or label shown under the name.`,
    }),
  };
}

export default declareComponent(TeamCarouselAdapter, {
  name: "Team Carousel",
  description:
    "Hear From Our Team carousel. Add up to 6 members — just paste a Vimeo ID and the thumbnail is fetched automatically. Clicking a card opens the video in a modal.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "people behind the product",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Hear From Our Team",
      tooltip: "Main section heading.",
    }),
    ctaLabel: props.Text({
      name: "CTA Label",
      defaultValue: "Meet Our Team",
      tooltip: "Text for the CTA link.",
    }),
    ctaHref: props.Text({
      name: "CTA URL",
      defaultValue: "#",
      tooltip: "Destination URL for the CTA link.",
    }),
    fixedWidth: props.Text({
      name: "Card Width",
      defaultValue: "444px",
      tooltip: 'Fixed card width so the next card peeks. CSS value, e.g. "444px".',
    }),
    perPage: props.Number({
      name: "Cards per page",
      defaultValue: 0,
      min: 0,
      max: 6,
      tooltip: "Set > 0 to override the peek layout with a fixed count per page.",
    }),
    ...memberProps(1),
    ...memberProps(2),
    ...memberProps(3),
    ...memberProps(4),
    ...memberProps(5),
    ...memberProps(6),
  },
});
