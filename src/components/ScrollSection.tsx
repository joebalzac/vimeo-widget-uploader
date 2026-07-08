import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import "./ScrollSectionStyling.css";

export interface ScrollSectionStep {
  title: string;
  body: string;
}

export interface ScrollSectionProps {
  eyebrow?: string;
  heading?: string;
  steps?: ScrollSectionStep[];
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

const INACTIVE_DOT_BG = "#fcfcfb";
const INACTIVE_DOT_RING = "#dddcda";
const ACTIVE_DOT_BG = "#6b4fff";

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
    [`0 0 0 1px ${INACTIVE_DOT_RING}`, `0 0 0 0px transparent`],
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
    </section>
  );
}
