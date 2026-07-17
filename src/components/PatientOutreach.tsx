import { useEffect, useState } from "react";
import "./PatientOutreach.css";

function pushEvent(event: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

export type StatusTone = "coral" | "azure" | "mint" | "amber";

export interface OutreachScene {
  /** Patient / subject name shown in the preview card. */
  patientName: string;
  /** Circular avatar image URL (falls back to an initial when empty). */
  patientAvatarUrl?: string;
  /** Pill label, e.g. "OVERDUE". */
  statusLabel: string;
  /** Pill color theme. */
  statusTone: StatusTone;
  /** Secondary line under the name, e.g. "Last Visit: 18 Mo Ago". */
  detail: string;
  /** Gradient label between the flow icons, e.g. "AI Rescheduling". */
  flowLabel: string;
}

export interface OutreachFeature {
  /** Stable id used for accordion state. */
  id: string;
  /** Feature title shown in the list. */
  title: string;
  /** Shown only while the feature is active. */
  description: string;
  /** Preview panel content for this feature. */
  scene: OutreachScene;
}

export interface PatientOutreachProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  features?: OutreachFeature[];
  /** Auto-advance interval in ms (0 disables auto-advance). */
  autoAdvanceMs?: number;
  /** GTM dataLayer event fired when a feature is selected. */
  eventSelect?: string;
}

const PLACEHOLDER_FEATURES: OutreachFeature[] = [
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

export default function PatientOutreach({
  eyebrow = "Proactive, Personalized, & Always-On",
  heading = "Patient Outreach That Drives Engagement",
  body = "VoiceAI, SMS, and secure messaging that reaches patients with natural interactions, freeing your team to focus on the patients in front of them.",
  features = PLACEHOLDER_FEATURES,
  autoAdvanceMs = 6000,
  eventSelect = "patient_outreach_select",
}: PatientOutreachProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeFeature = features[activeIndex] ?? features[0];

  // Auto-advance through the features so the section feels "always-on". The
  // progress bar under the active item is driven by a CSS animation keyed on
  // activeIndex, so it restarts cleanly on every change.
  useEffect(() => {
    if (!autoAdvanceMs || paused || features.length <= 1) return;
    const t = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % features.length);
    }, autoAdvanceMs);
    return () => window.clearTimeout(t);
  }, [activeIndex, paused, autoAdvanceMs, features.length]);

  const select = (i: number) => {
    if (i === activeIndex) return;
    setActiveIndex(i);
    pushEvent(eventSelect);
  };

  return (
    <section className="po">
      <div className="po__inner">
        <div className="po__head">
          <div className="po__head-left">
            <div className="po__eyebrow">
              <span className="po__eyebrow-dot" aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="po__heading">{heading}</h2>
          </div>
          {body && <p className="po__body">{body}</p>}
        </div>

        <div
          className="po__content"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <ul className="po__list">
            {features.map((feature, i) => {
              const active = i === activeIndex;
              return (
                <li
                  key={feature.id}
                  className={`po__item${active ? " is-active" : ""}`}
                >
                  <button
                    type="button"
                    className="po__item-btn"
                    aria-expanded={active}
                    onClick={() => select(i)}
                  >
                    <span className="po__item-title">{feature.title}</span>
                    {active && (
                      <span className="po__item-desc">
                        {feature.description}
                      </span>
                    )}
                  </button>
                  {active && (
                    <span
                      key={`progress-${activeIndex}`}
                      className={`po__progress${
                        paused || !autoAdvanceMs ? " is-paused" : ""
                      }`}
                      style={{ animationDuration: `${autoAdvanceMs}ms` }}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div className="po__panel">
            <OutreachPreview key={activeFeature.id} scene={activeFeature.scene} />
          </div>
        </div>
      </div>
    </section>
  );
}

function OutreachPreview({ scene }: { scene: OutreachScene }) {
  return (
    <div className="po__scene">
      <div className="po__card">
        <div className={`po__avatar po__avatar--${scene.statusTone}`}>
          {scene.patientAvatarUrl ? (
            <img src={scene.patientAvatarUrl} alt={scene.patientName} />
          ) : (
            <span className="po__avatar-fallback" aria-hidden="true">
              {scene.patientName.charAt(0)}
            </span>
          )}
        </div>
        <div className="po__card-body">
          <div className="po__card-top">
            <span className="po__card-name">{scene.patientName}</span>
            <span className={`po__badge po__badge--${scene.statusTone}`}>
              {scene.statusLabel}
            </span>
          </div>
          <span className="po__card-detail">{scene.detail}</span>
        </div>
      </div>

      <span className="po__connector" aria-hidden="true" />

      <div className="po__flow">
        <span className="po__flow-icon po__flow-icon--call" aria-hidden="true">
          <PhoneIcon />
        </span>
        <span className="po__flow-line" aria-hidden="true" />
        <span className="po__flow-label">{scene.flowLabel}</span>
        <span className="po__flow-line" aria-hidden="true" />
        <span className="po__flow-icon po__flow-icon--done" aria-hidden="true">
          <CheckIcon />
        </span>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M14 11.28v1.86a1.24 1.24 0 0 1-1.35 1.24 12.28 12.28 0 0 1-5.36-1.9 12.1 12.1 0 0 1-3.72-3.72A12.28 12.28 0 0 1 1.66 3.4 1.24 1.24 0 0 1 2.9 2.05h1.86a1.24 1.24 0 0 1 1.24 1.07c.08.6.22 1.18.43 1.74a1.24 1.24 0 0 1-.28 1.31l-.79.79a9.94 9.94 0 0 0 3.72 3.72l.79-.79a1.24 1.24 0 0 1 1.31-.28c.56.2 1.15.35 1.74.43A1.24 1.24 0 0 1 14 11.28z"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13 4.5 6.5 11 3 7.5"
        stroke="white"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
