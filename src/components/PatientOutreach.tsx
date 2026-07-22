import { useEffect, useState } from "react";
import "./PatientOutreach.css";

function pushEvent(event: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

export interface OutreachFeature {
  /** Stable id used for accordion state. */
  id: string;
  /** Feature title shown in the list. */
  title: string;
  /** Shown only while the feature is active. */
  description: string;
  /** Preview image URL shown in the panel while this feature is active. */
  imageUrl?: string;
  /** Alt text for the preview image (defaults to the feature title). */
  imageAlt?: string;
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
                    <span className="po__item-desc">{feature.description}</span>
                  </button>
                  {/* Inline preview used only in the mobile column layout, where
                      every feature is expanded at once. Renders as an empty
                      placeholder box when no image is provided. */}
                  <div className="po__item-panel">
                    {feature.imageUrl && (
                      <img
                        className="po__panel-img"
                        src={feature.imageUrl}
                        alt={feature.imageAlt || feature.title}
                      />
                    )}
                  </div>
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
            {activeFeature.imageUrl && (
              <img
                key={activeFeature.id}
                className="po__panel-img"
                src={activeFeature.imageUrl}
                alt={activeFeature.imageAlt || activeFeature.title}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
