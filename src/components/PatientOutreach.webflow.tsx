import PatientOutreach from "./PatientOutreach";
import type { OutreachFeature } from "./PatientOutreach";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const FEATURE_DEFAULTS: OutreachFeature[] = [
  {
    id: "recall",
    title: "Patient Recall",
    description:
      "Brings overdue patients back for annual exams and follow-ups with appointment reminders and rescheduling.",
  },
  {
    id: "waitlist",
    title: "Waitlist Management",
    description:
      "Fills earlier openings automatically by offering cancelled slots to waitlisted patients in priority order.",
  },
  {
    id: "no-show",
    title: "No-Show & Cancellation Recovery",
    description:
      "Reaches out the moment an appointment is missed or cancelled and rebooks patients before the slot goes cold.",
  },
  {
    id: "mass-reschedule",
    title: "Mass Rescheduling",
    description:
      "Handles provider outages and closures by rescheduling every affected patient in a single coordinated wave.",
  },
  {
    id: "campaigns",
    title: "Advanced Campaign Management & Analytics",
    description:
      "Launches targeted outreach campaigns and tracks reach, response, and booking rates in real time.",
  },
  {
    id: "multi-channel",
    title: "Multi-Channel Outreach",
    description:
      "Meets patients where they are across VoiceAI, SMS, and secure messaging with one continuous conversation.",
  },
];

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  autoAdvanceMs?: number;
  eventSelect?: string;
  // Per-feature props are added dynamically (f1Title, f1Desc, f1Image, …).
  [key: string]: string | number | undefined;
}

function PatientOutreachAdapter(p: AdapterProps) {
  const features: OutreachFeature[] = FEATURE_DEFAULTS.map((d, i) => {
    const n = i + 1;
    const get = (field: string, fallback: string) =>
      (p[`f${n}${field}`] as string | undefined) || fallback;
    return {
      id: d.id,
      title: get("Title", d.title),
      description: get("Desc", d.description),
      imageUrl: get("Image", "") || undefined,
    };
  });

  return (
    <PatientOutreach
      eyebrow={p.eyebrow}
      heading={p.heading}
      body={p.body}
      features={features}
      autoAdvanceMs={p.autoAdvanceMs}
      eventSelect={p.eventSelect}
    />
  );
}

function featureProps(d: (typeof FEATURE_DEFAULTS)[number], n: number) {
  return {
    [`f${n}Title`]: props.Text({
      name: `Feature ${n} — Title`,
      defaultValue: d.title,
    }),
    [`f${n}Desc`]: props.Text({
      name: `Feature ${n} — Description`,
      defaultValue: d.description,
    }),
    [`f${n}Image`]: props.Text({
      name: `Feature ${n} — Panel URL`,
      defaultValue: d.imageUrl ?? "",
      tooltip:
        "URL of the image shown in the panel while this feature is active (upload it in the Webflow Asset Manager, then paste its URL here).",
    }),
  };
}

function allFeatureProps() {
  let acc = {};
  FEATURE_DEFAULTS.forEach((d, i) => {
    acc = { ...acc, ...featureProps(d, i + 1) };
  });
  return acc;
}

export default declareComponent(PatientOutreachAdapter, {
  name: "Patient Outreach",
  description:
    "Feature accordion with a preview panel. The list auto-advances through outreach features, revealing each one's description and a matching preview image. Edit each feature's text and preview image URL.",
  group: "Media",

  props: {
    eyebrow: props.Text({
      name: "Eyebrow",
      defaultValue: "Proactive, Personalized, & Always-On",
      tooltip: "Small label above the heading.",
    }),
    heading: props.Text({
      name: "Heading",
      defaultValue: "Patient Outreach That Drives Engagement",
    }),
    body: props.Text({
      name: "Body",
      defaultValue:
        "VoiceAI, SMS, and secure messaging that reaches patients with natural interactions, freeing your team to focus on the patients in front of them.",
    }),
    autoAdvanceMs: props.Number({
      name: "Auto-advance (ms)",
      defaultValue: 6000,
      tooltip:
        "How long each feature stays active before advancing. Set to 0 to disable auto-advance.",
    }),
    eventSelect: props.Text({
      name: "Event — Feature Select",
      defaultValue: "patient_outreach_select",
      tooltip: "GTM dataLayer event fired when a feature is selected.",
    }),

    ...allFeatureProps(),
  },
});
