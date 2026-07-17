import PatientOutreach from "./PatientOutreach";
import type { OutreachFeature, StatusTone } from "./PatientOutreach";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

const TONE_OPTIONS = ["Coral", "Azure", "Mint", "Amber"];

const toTone = (v: string | undefined, fallback: StatusTone): StatusTone => {
  const t = (v || "").toLowerCase();
  return t === "coral" || t === "azure" || t === "mint" || t === "amber"
    ? (t as StatusTone)
    : fallback;
};

const FEATURE_DEFAULTS: (Omit<OutreachFeature, "scene"> & {
  scene: OutreachFeature["scene"];
})[] = [
  {
    id: "recall",
    title: "Patient Recall",
    description:
      "Brings overdue patients back for annual exams and follow-ups with appointment reminders and rescheduling.",
    scene: {
      patientName: "Dana Whitfield",
      statusLabel: "Overdue",
      statusTone: "coral",
      detail: "Last Visit: 18 Mo Ago",
      flowLabel: "AI Rescheduling",
    },
  },
  {
    id: "waitlist",
    title: "Waitlist Management",
    description:
      "Fills earlier openings automatically by offering cancelled slots to waitlisted patients in priority order.",
    scene: {
      patientName: "Marcus Chen",
      statusLabel: "Waitlisted",
      statusTone: "azure",
      detail: "Requested: 12 Days Ago",
      flowLabel: "AI Slotting",
    },
  },
  {
    id: "no-show",
    title: "No-Show & Cancellation Recovery",
    description:
      "Reaches out the moment an appointment is missed or cancelled and rebooks patients before the slot goes cold.",
    scene: {
      patientName: "Priya Nair",
      statusLabel: "No-Show",
      statusTone: "coral",
      detail: "Missed: Yesterday",
      flowLabel: "AI Rebooking",
    },
  },
  {
    id: "mass-reschedule",
    title: "Mass Rescheduling",
    description:
      "Handles provider outages and closures by rescheduling every affected patient in a single coordinated wave.",
    scene: {
      patientName: "Dr. Alvarez",
      statusLabel: "Provider Out",
      statusTone: "amber",
      detail: "240 Appointments",
      flowLabel: "AI Rescheduling",
    },
  },
  {
    id: "campaigns",
    title: "Advanced Campaign Management & Analytics",
    description:
      "Launches targeted outreach campaigns and tracks reach, response, and booking rates in real time.",
    scene: {
      patientName: "Flu Season",
      statusLabel: "Campaign",
      statusTone: "mint",
      detail: "1,204 Patients",
      flowLabel: "AI Targeting",
    },
  },
  {
    id: "multi-channel",
    title: "Multi-Channel Outreach",
    description:
      "Meets patients where they are across VoiceAI, SMS, and secure messaging with one continuous conversation.",
    scene: {
      patientName: "Dana Whitfield",
      statusLabel: "Reached",
      statusTone: "mint",
      detail: "Voice · SMS · Portal",
      flowLabel: "AI Follow-Up",
    },
  },
];

interface AdapterProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  autoAdvanceMs?: number;
  eventSelect?: string;
  // Per-feature props are added dynamically (f1Title, f1Desc, f1Name, …).
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
      scene: {
        patientName: get("Name", d.scene.patientName),
        patientAvatarUrl: get("Avatar", "") || undefined,
        statusLabel: get("Status", d.scene.statusLabel),
        statusTone: toTone(p[`f${n}Tone`] as string | undefined, d.scene.statusTone),
        detail: get("Detail", d.scene.detail),
        flowLabel: get("Flow", d.scene.flowLabel),
      },
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
    [`f${n}Name`]: props.Text({
      name: `Feature ${n} — Preview name`,
      defaultValue: d.scene.patientName,
    }),
    [`f${n}Avatar`]: props.Text({
      name: `Feature ${n} — Preview avatar URL`,
      defaultValue: "",
      tooltip:
        "URL of the preview avatar image (upload it in the Webflow Asset Manager, then paste its URL here).",
    }),
    [`f${n}Status`]: props.Text({
      name: `Feature ${n} — Preview status label`,
      defaultValue: d.scene.statusLabel,
    }),
    [`f${n}Tone`]: props.Variant({
      name: `Feature ${n} — Preview status color`,
      defaultValue:
        d.scene.statusTone.charAt(0).toUpperCase() + d.scene.statusTone.slice(1),
      options: TONE_OPTIONS,
    }),
    [`f${n}Detail`]: props.Text({
      name: `Feature ${n} — Preview detail`,
      defaultValue: d.scene.detail,
    }),
    [`f${n}Flow`]: props.Text({
      name: `Feature ${n} — Preview flow label`,
      defaultValue: d.scene.flowLabel,
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
    "Feature accordion with an animated preview panel. The list auto-advances through outreach features, revealing each one's description and a matching patient preview card. Edit each feature's text and preview content.",
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
