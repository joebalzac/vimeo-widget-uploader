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
  // Per-feature props are added dynamically (f1Title, f1Desc, f4Show, …).
  [key: string]: string | number | boolean | undefined;
}

function PatientOutreachAdapter(p: AdapterProps) {
  const features: OutreachFeature[] = FEATURE_DEFAULTS.flatMap((d, i) => {
    const n = i + 1;
    const rawTitle = p[`f${n}Title`] as string | undefined;
    const rawDesc = p[`f${n}Desc`] as string | undefined;
    const title = (rawTitle === undefined ? d.title : rawTitle).trim();
    // Features 4–6 can be switched off without clearing their copy.
    // A blank title hides any feature.
    const show = n < 4 || p[`f${n}Show`] !== false;
    if (!show || !title) return [];
    return [
      {
        id: d.id,
        title,
        eyebrow:
          ((p[`f${n}Eyebrow`] as string | undefined) ?? "").trim() || undefined,
        description: (rawDesc === undefined ? d.description : rawDesc).trim(),
        imageUrl:
          ((p[`f${n}ImageUrl`] as string | undefined) ?? "").trim() || undefined,
        vimeoId:
          ((p[`f${n}VimeoId`] as string | undefined) ?? "").trim() || undefined,
      },
    ];
  });

  return (
    <PatientOutreach
      eyebrow={p.eyebrow}
      heading={p.heading}
      body={p.body}
      features={features}
      centerHeadline={p.centerHeadline === true}
      theme={p.theme === "dark" ? "dark" : "light"}
      autoAdvanceMs={p.autoAdvanceMs}
      eventSelect={p.eventSelect}
    />
  );
}

function featureProps(d: (typeof FEATURE_DEFAULTS)[number], n: number) {
  return {
    ...(n >= 4
      ? {
          [`f${n}Show`]: props.Boolean({
            name: `Feature ${n} — Show`,
            defaultValue: true,
            tooltip:
              "Turn off to hide this feature. Leaving the title blank hides it too.",
          }),
        }
      : {}),
    [`f${n}Eyebrow`]: props.Text({
      name: `Feature ${n} — Eyebrow`,
      defaultValue: "",
      tooltip:
        'Label above the title while this feature is active. "Step 1 - document capture" renders as STEP 1 • DOCUMENT CAPTURE. Leave blank to hide it.',
    }),
    [`f${n}Title`]: props.Text({
      name: `Feature ${n} — Title`,
      defaultValue: d.title,
      tooltip: "Leave blank to hide this feature.",
    }),
    [`f${n}Desc`]: props.Text({
      name: `Feature ${n} — Description`,
      defaultValue: d.description,
    }),
    [`f${n}ImageUrl`]: props.Text({
      name: `Feature ${n} — Image URL`,
      defaultValue: "",
      tooltip:
        "Image URL shown in the panel while this feature is active. When set, this is used instead of the Vimeo ID.",
    }),
    [`f${n}VimeoId`]: props.Text({
      name: `Feature ${n} — Vimeo ID`,
      defaultValue: "",
      tooltip:
        "Vimeo video ID shown in the panel while this feature is active (e.g. the '76979871' in vimeo.com/76979871). Ignored when an image URL is set.",
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
    "Feature accordion with a preview panel. The list auto-advances through outreach features, revealing each one's description and a matching preview. Each feature shows either an image (paste an image URL) or a Vimeo video, and can include a step eyebrow such as \"Step 1 - document capture\". Turn on Center Headline to stack and center the eyebrow, heading, and body. Use Theme to switch to a transparent dark treatment. Clear a title to hide that feature. Features 4–6 also have a Show toggle.",
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
    centerHeadline: props.Boolean({
      name: "Center Headline",
      defaultValue: false,
      tooltip:
        "Stack the eyebrow, heading, and body and center them as one block.",
    }),
    theme: props.Variant({
      name: "Theme",
      options: ["light", "dark"],
      defaultValue: "light",
      tooltip:
        "Light keeps the cream background. Dark is transparent with white titles and warm gray supporting text, for dark sections.",
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
