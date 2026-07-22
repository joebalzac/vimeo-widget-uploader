import ProductShowcase from "./ProductShowcase";
import type { DemoTab, DemoMessage } from "./ProductShowcase";
import { AUDIO } from "../assets/audio";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

// Health-site variant of the Product Showcase — same underlying component and
// styling as ProductShowcase.webflow.tsx, just two different scenarios:
// a missed-appointment reschedule call and a waitlist slot-opened call. Both
// are AI-first, 5-line exchanges (AI, user, AI+status, user, AI+status), so
// no changes were needed to ProductShowcase.tsx itself.
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
    label: "Reschedule",
    messages: [
      {
        role: "ai",
        text: "Hi Jordan, this is Elise calling on behalf of One Clinic. I noticed you missed your appointment with Dr. Smith on Monday at 10AM. Would you like to reschedule?",
        audioKey: "reschedule/Elise-Missed-Appt",
        durationMs: 9500,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Yes, I'd like to come in sometime next week if possible.",
        audioKey: "reschedule/Jordan-Next-Week",
        durationMs: 3500,
      },
      {
        role: "ai",
        status: "Checking provider availability and appointment rules...",
        text: "Dr. Smith has openings next Tuesday at 9AM and Thursday at 3PM. Would either of those work for you?",
        audioKey: "reschedule/Elise-Openings",
        durationMs: 6000,
      },
      {
        role: "user",
        name: "Jordan T.",
        text: "Uh, Thursday at 3 PM works for me.",
        audioKey: "reschedule/Jordan-Thursday-3PM",
        durationMs: 2500,
      },
      {
        role: "ai",
        status: "Verifying appointment eligibility and reserving time slot...",
        text: "Perfect! I've scheduled you for Thursday at 3PM with Dr. Smith. You'll receive a confirmation by text shortly.",
        audioKey: "reschedule/Elise-Confirmed",
        durationMs: 6000,
      },
    ],
  },
  {
    key: "t2",
    label: "Waitlist",
    messages: [
      {
        role: "ai",
        text: "Hi Kaia, this is Elise calling on behalf of Grove Health. I'm reaching out because a slot just opened up with Dr. Casanova on Monday at 10AM for your wellness exam. Would you like to book this appointment?",
        audioKey: "waitlist/Elise-Slot-Opened",
        durationMs: 12000,
      },
      {
        role: "user",
        name: "Kaia C.",
        text: "That might work. Is it at the same location as my previous appointment?",
        audioKey: "waitlist/Kaia-Same-Location",
        durationMs: 4000,
      },
      {
        role: "ai",
        status: "Verifying provider, location, and appointment details...",
        text: "Yes, it's at our Midtown office with Dr. Casanova at 10AM on Monday.",
        audioKey: "waitlist/Elise-Midtown-Office",
        durationMs: 4000,
      },
      {
        role: "user",
        name: "Kaia C.",
        text: "Great! I'd like to take it.",
        audioKey: "waitlist/Kaia-Ill-Take-It",
        durationMs: 2000,
      },
      {
        role: "ai",
        status: "Reserving appointment and updating the waitlist...",
        text: "You're all set! I've booked your appointment for Monday at 10AM. You'll receive a confirmation text with all of the details shortly.",
        audioKey: "waitlist/Elise-Booked",
        durationMs: 8000,
      },
    ],
  },
];

type TabDefault = (typeof TAB_DEFAULTS)[number];

const senderName = (d: TabDefault) =>
  d.messages.find((m) => m.role === "user")?.name ?? "";

interface AdapterProps {
  isHealthcare?: boolean;
  eventHousingTab?: string;
  eventHealthcareTab?: string;
  eventAudioBtn?: string;
  // Per-tab text/number props are added dynamically (t1Label, t1Name, t1Text1, t1Duration1, …).
  [key: string]: string | boolean | number | undefined;
}

function ProductShowcaseHealthAdapter(p: AdapterProps) {
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
        durationMs:
          (p[`${d.key}Duration${mi}`] as number | undefined) ?? m.durationMs,
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
      isHealthcare={p.isHealthcare}
      tabs={tabs}
      eventHousingTab={p.eventHousingTab}
      eventHealthcareTab={p.eventHealthcareTab}
      eventAudioBtn={p.eventAudioBtn}
    />
  );
}

function tabProps(d: TabDefault, n: number) {
  const acc: Record<
    string,
    ReturnType<typeof props.Text> | ReturnType<typeof props.Number>
  > = {
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
    acc[`${d.key}Duration${mi}`] = props.Number({
      name: `Scenario ${n} — Message ${mi} duration (ms)`,
      defaultValue: m.durationMs ?? 2500,
      tooltip:
        "Length of this line's audio clip in ms — controls when the next line appears. Match it to the uploaded clip's actual length.",
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

export default declareComponent(ProductShowcaseHealthAdapter, {
  name: "Product Showcase — Health",
  description:
    "Looping AI conversation demo inside a framed card, for the health site. Two switchable scenarios (missed-appointment reschedule, waitlist slot opened) play out turn-by-turn with a processing indicator, voice waveform, word-by-word streaming, and synced per-line call audio. Edit any message text per scenario.",
  group: "Media",

  props: {
    isHealthcare: props.Boolean({
      name: "Is Healthcare",
      defaultValue: false,
      trueLabel: "Healthcare",
      falseLabel: "Standard",
      tooltip: "Hides the eyebrow/heading section above the card.",
    }),

    eventHousingTab: props.Text({
      name: "Event — Scenario 1 Tab",
      defaultValue: "product_demo_reschedule_tab",
      tooltip: "GTM dataLayer event fired when the Reschedule tab is selected.",
    }),
    eventHealthcareTab: props.Text({
      name: "Event — Scenario 2 Tab",
      defaultValue: "product_demo_waitlist_tab",
      tooltip: "GTM dataLayer event fired when the Waitlist tab is selected.",
    }),
    eventAudioBtn: props.Text({
      name: "Event — Audio Button",
      defaultValue: "product_demo_audio_btn",
      tooltip: "GTM dataLayer event fired when the audio speaker button is clicked.",
    }),

    ...allTabProps(),
  },
});
