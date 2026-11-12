import OperatorTestimonials from "./OperatorTestimonials";
import { DEFAULT_TESTIMONIALS, type Testimonial } from "./operatorTestimonialsData";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const SLOTS = 3;

type ImageValue = { src: string; alt?: string };

interface AdapterProps {
  [key: string]: ImageValue | string | undefined;
}

function OperatorTestimonialsAdapter(p: AdapterProps) {
  const items: Testimonial[] = [];
  for (let n = 1; n <= SLOTS; n++) {
    items.push({
      quote: (p[`q${n}Quote`] as string | undefined) ?? "",
      name: (p[`q${n}Name`] as string | undefined) ?? "",
      role: (p[`q${n}Role`] as string | undefined) ?? "",
      avatarSrc: (p[`q${n}Avatar`] as ImageValue | undefined)?.src,
    });
  }
  return <OperatorTestimonials items={items} />;
}

function quoteProps(n: number) {
  const d = DEFAULT_TESTIMONIALS[n - 1];
  return {
    [`q${n}Quote`]: props.Text({
      name: `Quote ${n} — Text`,
      defaultValue: d.quote,
      tooltip: `Leave empty to hide quote ${n}.`,
    }),
    [`q${n}Name`]: props.Text({ name: `Quote ${n} — Name`, defaultValue: d.name }),
    [`q${n}Role`]: props.Text({ name: `Quote ${n} — Role`, defaultValue: d.role }),
    [`q${n}Avatar`]: props.Image({
      name: `Quote ${n} — Avatar`,
      tooltip: "Optional headshot. Leave empty for the grey placeholder circle.",
    }),
  };
}

export default declareComponent(OperatorTestimonialsAdapter, {
  name: "Tour Intelligence — Operator Testimonials",
  description:
    "Three bordered quote cards (“What Operators Are Saying”). Pair with a Section Heading above. Stacks at tablet/mobile.",
  group: "Tour Intelligence",

  props: {
    ...quoteProps(1),
    ...quoteProps(2),
    ...quoteProps(3),
  },
});
