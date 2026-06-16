import ScrollSection from "./ScrollSection";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  s1Title?: string; s1Body?: string;
  s2Title?: string; s2Body?: string;
  s3Title?: string; s3Body?: string;
  s4Title?: string; s4Body?: string;
}

function ScrollSectionAdapter({
  eyebrow,
  heading,
  s1Title, s1Body,
  s2Title, s2Body,
  s3Title, s3Body,
  s4Title, s4Body,
}: AdapterProps) {
  const slots = [
    { title: s1Title, body: s1Body },
    { title: s2Title, body: s2Body },
    { title: s3Title, body: s3Body },
    { title: s4Title, body: s4Body },
  ];

  const steps = slots
    .filter((s) => s.title || s.body)
    .map((s) => ({ title: s.title || "", body: s.body || "" }));

  return (
    <ScrollSection
      eyebrow={eyebrow}
      heading={heading}
      steps={steps.length ? steps : undefined}
    />
  );
}

function stepProps(n: number, title: string, body: string) {
  return {
    [`s${n}Title`]: props.Text({
      name: `Step ${n} — Title`,
      defaultValue: title,
      tooltip: `Title for timeline step ${n}.`,
    }),
    [`s${n}Body`]: props.Text({
      name: `Step ${n} — Body`,
      defaultValue: body,
      tooltip: `Body copy for timeline step ${n}.`,
    }),
  };
}

export default declareComponent(ScrollSectionAdapter, {
  name: "Scroll Timeline",
  description:
    "Vertical timeline that progressively fades and slides into view as the section scrolls through the viewport.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "Our mission",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Improve Life's Most Critical Areas Through AI Automation",
      tooltip: "Main section heading.",
    }),
    ...stepProps(
      1,
      "The Stakes",
      "Everyone needs a place to live and access to quality healthcare. Together, those essentials consume more than 40% of the average American household's income.",
    ),
    ...stepProps(
      2,
      "The Problem",
      "Technology has transformed most industries, but housing and healthcare have been the exceptions: too regulated, too complex, and too labor-intensive.",
    ),
    ...stepProps(
      3,
      "The Shift",
      "AI is the first technology capable of meeting that complexity, and EliseAI is the first company to introduce it to housing.",
    ),
    ...stepProps(
      4,
      "The Solution",
      "We're rebuilding these systems from the ground up because we all deserve better, and because few opportunities offer the chance to improve infrastructure this fundamental.",
    ),
  },
});
