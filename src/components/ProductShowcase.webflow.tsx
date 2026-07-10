import ProductShowcase from "./ProductShowcase";
import type { DemoTab, DemoMessage } from "./ProductShowcase";
import { AUDIO } from "../assets/audio";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

// Each scenario is an explicit ordered message list, so scenarios can differ in
// structure (Housing is user-first; Healthcare is AI-first). `audioKey` points at
// a per-line clip in ../assets/audio.
type MsgDef = {
  role: "user" | "ai";
  name?: string;
  status?: string;
  text: string;
  audioKey?: string;
  durationMs?: number;
};

const TAB_DEFAULTS: { key: string; label: string; messages: MsgDef[] }[] = [
  {
    key: "t1",
    label: "Housing",
    messages: [
      {
        role: "user",
        name: "Jordan T.",
        text: "Hey, the garbage disposal just hums and won't turn on.",
        audioKey: "housing/Jordan-Hey",
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI is gathering details and checking device guides…",
        text: 'Sorry to hear that. A humming disposal is usually jammed. Try inserting a 1/4" Allen wrench into the hex slot underneath, turning it back and forth to free the jam, then press the red reset button and test it again. Let me know how it goes.',
        audioKey: "housing/Elise-Sorry",
        durationMs: 17000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Oh great, that worked! It's running now.",
        audioKey: "housing/Jordan-Oh-Great",
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI logs outcome and closes the maintenance request.",
        text: "Wonderful! I'm glad that resolved it, and we saved you a maintenance visit.",
        audioKey: "housing/Elise-Wonderful",
        durationMs: 5000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Super helpful! Thank you!",
        audioKey: "housing/Jordan-Super-Helpful",
        durationMs: 2000,
      },
    ],
  },
  {
    key: "t2",
    label: "Healthcare",
    messages: [
      {
        role: "ai",
        text: "Hi Mia, your annual physical is coming up next week. Before I confirm your appointment, has your insurance changed since your last visit?",
        audioKey: "healthcare/Elise-Hi-Mia",
        durationMs: 8000,
      },
      {
        role: "user",
        name: "Mia S.",
        text: "Yes, I switched jobs and now have Blue Cross.",
        audioKey: "healthcare/Mia-Yes-I-Swithced",
        durationMs: 3000,
      },
      {
        role: "ai",
        status: "AI updates insurance on file and checks eligibility…",
        text: "Thanks. Can you provide your member ID so I can verify coverage?",
        audioKey: "healthcare/Mia-Got-It",
        durationMs: 4000,
      },
      {
        role: "user",
        name: "Mia S.",
        text: "Sure, it's BC12345678.",
        audioKey: "healthcare/Mia-XJH",
        durationMs: 6000,
      },
      {
        role: "ai",
        status: "AI verifies coverage and confirms appointment.",
        text: "Thanks. I've confirmed your plan is accepted. You're all set, we'll see you next week!",
        audioKey: "healthcare/Elise-Thanks",
        durationMs: 5000,
      },
    ],
  },
];

type TabDefault = (typeof TAB_DEFAULTS)[number];

const senderName = (d: TabDefault) =>
  d.messages.find((m) => m.role === "user")?.name ?? "";

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  eventHousingTab?: string;
  eventHealthcareTab?: string;
  eventAudioBtn?: string;
  // Per-tab text props are added dynamically (t1Label, t1Name, t1Text1, …).
  [key: string]: string | undefined;
}

function ProductShowcaseAdapter(p: AdapterProps) {
  const tabs: DemoTab[] = TAB_DEFAULTS.map((d) => {
    const get = (field: string, fallback: string) =>
      (p[`${d.key}${field}`] as string | undefined) || fallback;
    const name = get("Name", senderName(d));

    const messages: DemoMessage[] = d.messages.map((m, i) => {
      const mi = i + 1;
      const defaultAudio = m.audioKey ? AUDIO[m.audioKey] || "" : "";
      const msg: DemoMessage = {
        role: m.role,
        text: get(`Text${mi}`, m.text),
        audioSrc: get(`Audio${mi}`, defaultAudio) || undefined,
        durationMs: m.durationMs,
      };
      if (m.role === "user") msg.name = name;
      if (m.role === "ai" && m.status !== undefined) {
        msg.status = get(`Status${mi}`, m.status);
      }
      return msg;
    });

    return { id: d.key, label: get("Label", d.label), messages };
  });

  return (
    <ProductShowcase
      eyebrow={p.eyebrow}
      heading={p.heading}
      tabs={tabs}
      eventHousingTab={p.eventHousingTab}
      eventHealthcareTab={p.eventHealthcareTab}
      eventAudioBtn={p.eventAudioBtn}
    />
  );
}

function tabProps(d: TabDefault, n: number) {
  const acc: Record<string, ReturnType<typeof props.Text>> = {
    [`${d.key}Label`]: props.Text({
      name: `Scenario ${n} — Tab label`,
      defaultValue: d.label,
    }),
    [`${d.key}Name`]: props.Text({
      name: `Scenario ${n} — Sender name`,
      defaultValue: senderName(d),
    }),
  };
  d.messages.forEach((m, i) => {
    const mi = i + 1;
    acc[`${d.key}Text${mi}`] = props.Text({
      name: `Scenario ${n} — Message ${mi} (${m.role})`,
      defaultValue: m.text,
    });
    if (m.role === "ai" && m.status !== undefined) {
      acc[`${d.key}Status${mi}`] = props.Text({
        name: `Scenario ${n} — Message ${mi} status`,
        defaultValue: m.status,
      });
    }
    acc[`${d.key}Audio${mi}`] = props.Text({
      name: `Scenario ${n} — Message ${mi} audio URL`,
      defaultValue: m.audioKey ? AUDIO[m.audioKey] || "" : "",
      tooltip:
        "URL of the uploaded audio clip (upload the .mp3 in the Webflow Asset Manager, then paste its URL here).",
    });
  });
  return acc;
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
    "Looping AI conversation demo inside a framed card. Two switchable scenarios play out turn-by-turn with a processing indicator, voice waveform, word-by-word streaming, and synced per-line call audio. Edit any message text per scenario.",
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

    eventHousingTab: props.Text({
      name: "Event — Housing Tab",
      defaultValue: "product_demo_housing_tab",
      tooltip: "GTM dataLayer event fired when the Housing tab is selected.",
    }),
    eventHealthcareTab: props.Text({
      name: "Event — Healthcare Tab",
      defaultValue: "product_demo_healthcare_tab",
      tooltip: "GTM dataLayer event fired when the Healthcare tab is selected.",
    }),
    eventAudioBtn: props.Text({
      name: "Event — Audio Button",
      defaultValue: "product_demo_audio_btn",
      tooltip: "GTM dataLayer event fired when the audio speaker button is clicked.",
    }),

    ...allTabProps(),
  },
});
