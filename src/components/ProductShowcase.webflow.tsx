import ProductShowcase from "./ProductShowcase";
import type { DemoTab, DemoMessage } from "./ProductShowcase";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

// Two scenarios, each a fixed 5-turn conversation (user → ai → user → ai → user).
// Defaults mirror the Figma demo so the component renders fully without setup.
const TAB_DEFAULTS = [
  {
    key: "t1",
    label: "Housing",
    name: "Jordan T.",
    u1: "The garbage disposal just hums and won't turn on.",
    s1: "Pulling resident file…",
    a1: 'Sorry to hear that. A humming disposal is usually jammed. Try inserting a 1/4" Allen wrench into the hex slot underneath, turning it back and forth to free the jam, then press the red reset button and test it again. Let me know how it goes.',
    u2: "Ok, that worked, it's running now.",
    s2: "Logging resolution…",
    a2: "Wonderful, I'm glad that resolved it, and we saved you a maintenance visit.",
    u3: "Super helpful. Thank you!",
  },
  {
    key: "t2",
    label: "Healthcare",
    name: "Marcus R.",
    u1: "I need to reschedule my appointment with Dr. Chen tomorrow.",
    s1: "Checking schedule…",
    a1: "Of course, Marcus! Dr. Chen has openings this Thursday at 10 AM or Friday at 2 PM. Which works better for you?",
    u2: "Friday at 2 PM works.",
    s2: "Verifying coverage…",
    a2: "Done! I've rescheduled you to Friday, June 27th at 2:00 PM with Dr. Chen. You'll get a confirmation text shortly.",
    u3: "Perfect, thank you so much!",
  },
] as const;

type TabDefault = (typeof TAB_DEFAULTS)[number];

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  // Per-tab text props are added dynamically (t1Label, t1Name, t1U1, …).
  [key: string]: string | undefined;
}

function ProductShowcaseAdapter(p: AdapterProps) {
  const tabs: DemoTab[] = TAB_DEFAULTS.map((d) => {
    const get = (field: string, fallback: string) =>
      (p[`${d.key}${field}`] as string | undefined) || fallback;
    const name = get("Name", d.name);
    const messages: DemoMessage[] = [
      { role: "user", name, text: get("U1", d.u1) },
      { role: "ai", status: get("S1", d.s1), text: get("A1", d.a1) },
      { role: "user", name, text: get("U2", d.u2) },
      { role: "ai", status: get("S2", d.s2), text: get("A2", d.a2) },
      { role: "user", name, text: get("U3", d.u3) },
    ];
    return { id: d.key, label: get("Label", d.label), messages };
  });

  return (
    <ProductShowcase eyebrow={p.eyebrow} heading={p.heading} tabs={tabs} />
  );
}

function tabProps(d: TabDefault, n: number) {
  const text = (field: string, value: string, name: string) => ({
    [`${d.key}${field}`]: props.Text({
      name: `Scenario ${n} — ${name}`,
      defaultValue: value,
    }),
  });
  return {
    ...text("Label", d.label, "Tab label"),
    ...text("Name", d.name, "Sender name"),
    ...text("U1", d.u1, "User message 1"),
    ...text("S1", d.s1, "AI status 1"),
    ...text("A1", d.a1, "AI reply 1"),
    ...text("U2", d.u2, "User message 2"),
    ...text("S2", d.s2, "AI status 2"),
    ...text("A2", d.a2, "AI reply 2"),
    ...text("U3", d.u3, "User message 3"),
  };
}

function allTabProps() {
  let acc = {};
  TAB_DEFAULTS.forEach((d, i) => {
    acc = { ...acc, ...tabProps(d, i + 1) };
  });
  return acc;
}

export default declareComponent(ProductShowcaseAdapter, {
  name: "Product Showcase",
  description:
    "Looping AI conversation demo inside a framed card. Two switchable scenarios play out turn-by-turn with a processing indicator, voice waveform, and word-by-word streaming. Edit any message text per scenario.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "See it in action",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Product Demo",
    }),
    ...allTabProps(),
  },
});
