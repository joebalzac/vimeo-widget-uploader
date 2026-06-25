import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./ScrollSectionStyling.css";

export interface ScrollSectionStep {
  title: string;
  body: string;
}

export interface ScrollSectionCard {
  title: string;
  body: string;
}

export interface ScrollSectionProps {
  eyebrow?: string;
  heading?: string;
  steps?: ScrollSectionStep[];
  cards?: ScrollSectionCard[];
}

const DEFAULT_STEPS: ScrollSectionStep[] = [
  {
    title: "The Stakes",
    body: "Everyone needs a place to live and access to quality healthcare. Together, those essentials consume more than 40% of the average American household's income.",
  },
  {
    title: "The Problem",
    body: "Technology has transformed most industries, but housing and healthcare have been the exceptions: too regulated, too complex, and too labor-intensive.",
  },
  {
    title: "The Shift",
    body: "AI is the first technology capable of meeting that complexity, and EliseAI is the first company to introduce it to housing.",
  },
  {
    title: "The Solution",
    body: "We're rebuilding these systems from the ground up because we all deserve better, and because few opportunities offer the chance to improve infrastructure this fundamental.",
  },
];

const DEFAULT_CARDS: ScrollSectionCard[] = [
  {
    title: "AI for Property Management",
    body: "Automate the entire resident journey, from finding an apartment to all that comes after.",
  },
  {
    title: "AI for Healthcare",
    body: "Put administrative work on autopilot so practices can focus on patient care.",
  },
];

const INACTIVE_DOT_BG = "#fcfcfb";
const INACTIVE_DOT_RING = "#dddcda";
const ACTIVE_DOT_BG = "#6b4fff";
const ACTIVE_DOT_RING = "#fcfcfb";

function BuildingIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="15" rx="1" />
      <path d="M10 21v-6h4v6" />
      <path d="M7 10h2M15 10h2M7 14h2M15 14h2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ArrowDiagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

const CARD_ICONS = [BuildingIcon, HeartIcon];

function TimelineItem({
  step,
  isLast,
  progress,
  start,
  end,
}: {
  step: ScrollSectionStep;
  isLast: boolean;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
}) {
  const activation = useTransform(progress, [start, end], [0, 1]);
  const opacity = useTransform(activation, [0, 1], [0.4, 1]);
  const y = useTransform(activation, [0, 1], [10, 0]);
  const dotBg = useTransform(activation, [0, 1], [INACTIVE_DOT_BG, ACTIVE_DOT_BG]);
  const dotRing = useTransform(
    activation,
    [0, 1],
    [`0 0 0 1px ${INACTIVE_DOT_RING}`, `0 0 0 6px ${ACTIVE_DOT_RING}`],
  );
  const lineFill = useTransform(activation, [0, 1], [0, 1]);

  return (
    <div className="ss__item">
      <div className="ss__rail">
        <motion.span
          className="ss__dot"
          style={{
            backgroundColor: dotBg,
            boxShadow: dotRing,
          }}
        />
        {!isLast && (
          <div className="ss__line">
            <motion.div className="ss__line-fill" style={{ scaleY: lineFill }} />
          </div>
        )}
      </div>
      <motion.div className="ss__content" style={{ opacity, y }}>
        <h3 className="ss__step-title">{step.title}</h3>
        <p className="ss__step-body">{step.body}</p>
      </motion.div>
    </div>
  );
}

export default function ScrollSection({
  eyebrow = "Our mission",
  heading = "Improve Life's Most Critical Areas Through AI Automation",
  steps = DEFAULT_STEPS,
  cards = DEFAULT_CARDS,
}: ScrollSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.85", "end 0.4"],
  });

  const span = 1 / steps.length;

  return (
    <section className="ss" ref={sectionRef}>
      <div className="ss__row">
        <div className="ss__intro">
          <p className="ss__eyebrow">{eyebrow}</p>
          <h2 className="ss__heading">{heading}</h2>
        </div>
        <div className="ss__timeline">
          {steps.map((step, i) => (
            <TimelineItem
              key={step.title}
              step={step}
              isLast={i === steps.length - 1}
              progress={scrollYProgress}
              start={i * span}
              end={i * span + span * 0.6}
            />
          ))}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="ss__cards">
          {cards.map((card, i) => {
            const Icon = CARD_ICONS[i] ?? CARD_ICONS[CARD_ICONS.length - 1];
            return (
              <div className="ss__card" key={card.title}>
                <div className="ss__card-header">
                  <Icon />
                  <ArrowDiagIcon />
                </div>
                <div className="ss__card-body">
                  <h3 className="ss__card-title">{card.title}</h3>
                  <p className="ss__card-text">{card.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
