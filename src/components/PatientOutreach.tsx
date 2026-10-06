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
  /**
   * Label above the title while the feature is active.
   * "Step 1 - document capture" renders as STEP 1 • DOCUMENT CAPTURE.
   */
  eyebrow?: string;
  /** Shown only while the feature is active. */
  description: string;
  /** Image URL shown in the panel. Used instead of the Vimeo video when set. */
  imageUrl?: string;
  /** Vimeo video ID shown in the panel when no image URL is set. */
  vimeoId?: string;
}

/** Vimeo "background" mode: autoplays muted, loops, hides all chrome, and
 * fills its container (Vimeo scales the video to cover, no CSS needed). */
function vimeoEmbedUrl(vimeoId: string) {
  return `https://player.vimeo.com/video/${vimeoId}?background=1&autoplay=1&loop=1&muted=1&byline=0&title=0&portrait=0`;
}

function FeatureEyebrow({ text }: { text: string }) {
  const parts = text
    .trim()
    .split(/\s+[-–—•·]\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const [lead, ...rest] = parts;
  const tail = rest.join(" ");
  return (
    <span className="po__item-kicker">
      <span>{lead}</span>
      {tail && (
        <>
          <span className="po__item-kicker-dot" aria-hidden="true" />
          <span>{tail}</span>
        </>
      )}
    </span>
  );
}

function FeatureMedia({ feature }: { feature: OutreachFeature }) {
  if (feature.imageUrl) {
    return (
      <img
        className="po__panel-image"
        src={feature.imageUrl}
        alt={feature.title}
      />
    );
  }
  if (feature.vimeoId) {
    return (
      <iframe
        className="po__panel-video"
        src={vimeoEmbedUrl(feature.vimeoId)}
        title={feature.title}
        allow="autoplay; fullscreen; picture-in-picture"
        frameBorder={0}
      />
    );
  }
  return null;
}

export interface PatientOutreachProps {
  eyebrow?: string;
  heading?: string;
  body?: string;
  features?: OutreachFeature[];
  /** Stack and center the eyebrow, heading, and body. */
  centerHeadline?: boolean;
  /** Light keeps the cream background. Dark is transparent with light text. */
  theme?: "light" | "dark" | string;
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
  centerHeadline = false,
  theme = "light",
  autoAdvanceMs = 6000,
  eventSelect = "patient_outreach_select",
}: PatientOutreachProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // A feature with no title is treated as unused and left out of the list.
  const visibleFeatures = features.filter((feature) => feature.title.trim());
  const activeFeature = visibleFeatures[activeIndex] ?? visibleFeatures[0];

  useEffect(() => {
    if (activeIndex > 0 && activeIndex >= visibleFeatures.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, visibleFeatures.length]);

  // Auto-advance through the features so the section feels "always-on". The
  // progress bar under the active item is driven by a CSS animation keyed on
  // activeIndex, so it restarts cleanly on every change.
  useEffect(() => {
    if (!autoAdvanceMs || paused || visibleFeatures.length <= 1) return;
    const t = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % visibleFeatures.length);
    }, autoAdvanceMs);
    return () => window.clearTimeout(t);
  }, [activeIndex, paused, autoAdvanceMs, visibleFeatures.length]);

  const select = (i: number) => {
    if (i === activeIndex) return;
    setActiveIndex(i);
    pushEvent(eventSelect);
  };

  const isDark = String(theme).toLowerCase() === "dark";

  return (
    <section
      className={`po${centerHeadline ? " po--center" : ""}${
        isDark ? " po--dark" : ""
      }`}
    >
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
            {visibleFeatures.map((feature, i) => {
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
                    {feature.eyebrow?.trim() && (
                      <FeatureEyebrow text={feature.eyebrow} />
                    )}
                    <span className="po__item-title">{feature.title}</span>
                    <span className="po__item-desc">{feature.description}</span>
                  </button>
                  {/* Inline preview used only in the mobile column layout, where
                      every feature is expanded at once. Renders as an empty
                      placeholder box when no image or video is provided. */}
                  <div className="po__item-panel">
                    <FeatureMedia feature={feature} />
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
            {activeFeature && (
              <FeatureMedia key={activeFeature.id} feature={activeFeature} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
