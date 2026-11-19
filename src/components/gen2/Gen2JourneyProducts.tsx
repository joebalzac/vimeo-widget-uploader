import "../../utils/interVariableFont";
import { useRef, useState, useSyncExternalStore } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Gen2Journey, { DEFAULT_SUBTITLE } from "./Gen2Journey";
import FeaturesStack from "./features/FeaturesStack";
import FlatRuler from "./features/FlatRuler";
import { FeaturesPinnedView, type FeaturesSectionProps } from "./features/FeaturesPinned";
import { useFeatureSteps } from "./features/useFeatureSteps";
import { FEATURES } from "./features/featuresData";
import "./features/Gen2Features.css";
import "./Gen2JourneyProducts.css";

export interface Gen2JourneyProductsProps {
  /** HTML id on the wrapper, for anchor links. */
  id?: string;
  heading?: string;
  subtitle?: string;
  leasingHref?: string;
  tourHref?: string;
  aigtHref?: string;
  maintenanceHref?: string;
  delinquencyHref?: string;
  renewalsHref?: string;
  learnMoreLabel?: string;
  className?: string;
}

const N = FEATURES.length;
const DESKTOP = "(min-width: 1001px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getDesktop = () => window.matchMedia(DESKTOP).matches;
const getServerDesktop = () => true;

/*
 * Flatten choreography (handoff 03), keyed to k = journey-track progress (0 when the track
 * top reaches the viewport top, 1 when its bottom reaches the viewport bottom).
 */
const K_SWEEP: [number, number] = [0, 0.3]; // purple arc draws once
const K_HEAD: [number, number] = [0.26, 0.36]; // heading fades out
const K_RING: [number, number] = [0.3, 0.42]; // ring, names, dots, Apollo fade out together
const K_RULER: [number, number] = [0.36, 0.48]; // flat ruler fades in (8px rise)

/**
 * Gen2 Journey + Products: "The Ideal Renter Journey" ring followed by the six products.
 * One component so the desktop "Flatten" hand-off between the two can share scroll progress.
 *
 * Desktop ≥1001 (motion allowed): the journey pins for 200vh; the products track overlaps
 * it by 120vh (no background, above it). Scrolling draws the ring's purple arc once, fades
 * the heading and then the ring away, and fades in the flat product ruler at top 120 while
 * the product copy/visual ride up underneath and pin below it (stage padding-top 200). The
 * ruler then tracks the active product until the products un-pin.
 *
 * Reduced motion (desktop): no scroll-linked animation — the fully lit ring, then the pinned
 * products with the flat ruler shown in the stage, switching instantly.
 * ≤1000: the looping ring, then the stacked product cards.
 */
export default function Gen2JourneyProducts({
  id,
  heading = "The Ideal Renter Journey",
  subtitle = DEFAULT_SUBTITLE,
  leasingHref,
  tourHref,
  aigtHref,
  maintenanceHref,
  delinquencyHref,
  renewalsHref,
  learnMoreLabel = "Learn More",
  className,
}: Gen2JourneyProductsProps) {
  const desktop = useSyncExternalStore(subscribe, getDesktop, getServerDesktop);
  const reduced = !!useReducedMotion();
  const hrefs = {
    leasing: leasingHref,
    tour: tourHref,
    aigt: aigtHref,
    maint: maintenanceHref,
    delinquency: delinquencyHref,
    renewals: renewalsHref,
  };
  const cls = ["g2jp", className].filter(Boolean).join(" ");

  if (!desktop) {
    return (
      <div id={id || undefined} className={cls}>
        <Gen2Journey heading={heading} subtitle={subtitle} />
        <section className="g2f" aria-label="Products">
          <FeaturesStack hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
        </section>
      </div>
    );
  }
  return reduced ? (
    <StaticDesktop id={id} className={cls} heading={heading} subtitle={subtitle} hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
  ) : (
    <Flatten id={id} className={cls} heading={heading} subtitle={subtitle} hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
  );
}

interface InnerProps extends FeaturesSectionProps {
  id?: string;
  className: string;
  heading: string;
  subtitle: string;
}

/** Desktop, reduced motion: static ring, then pinned products with the ruler in the stage. */
function StaticDesktop({ id, className, heading, subtitle, hrefs, learnMoreLabel }: InnerProps) {
  const fTrack = useRef<HTMLDivElement>(null);
  const { active, goTo } = useFeatureSteps(fTrack, "round");
  return (
    <div id={id || undefined} className={className}>
      <Gen2Journey heading={heading} subtitle={subtitle} />
      <section className="g2f" aria-label="Products">
        <FeaturesPinnedView flat trackRef={fTrack} active={active} goTo={goTo} hrefs={hrefs} learnMoreLabel={learnMoreLabel}>
          <FlatRuler active={active} goTo={goTo} />
        </FeaturesPinnedView>
      </section>
    </div>
  );
}

/** Desktop: the Flatten choreography. */
function Flatten({ id, className, heading, subtitle, hrefs, learnMoreLabel }: InnerProps) {
  const jTrack = useRef<HTMLDivElement>(null);
  const fTrack = useRef<HTMLDivElement>(null);
  const { active, goTo } = useFeatureSteps(fTrack, "round");

  const { scrollYProgress: k } = useScroll({ target: jTrack, offset: ["start start", "end end"] });
  const sweep = useTransform(k, K_SWEEP, [0, 1]);
  const headOp = useTransform(k, K_HEAD, [1, 0]);
  const ringOp = useTransform(k, K_RING, [1, 0]);
  const rulerOp = useTransform(k, K_RULER, [0, 1]);
  const rulerY = useTransform(k, K_RULER, [8, 0]);
  const [scroll] = useState(() => ({ sweep, heading: headOp, ring: ringOp }));

  /* The ruler only takes clicks / focus once it's mostly in. */
  const [rulerOn, setRulerOn] = useState(false);
  useMotionValueEvent(rulerOp, "change", (o) => setRulerOn(o > 0.5));

  return (
    <div id={id || undefined} className={`${className} g2jp--flat`}>
      {/* The ruler's rail: sticky at top 120 from the moment the journey pins until the
          products stage un-pins (rail = products-stage top + 120 + ruler height). */}
      <div className="g2jp-rail" style={{ height: `calc(${N * 100 - 20}vh + 120px + var(--g2jp-ruler-h))` }}>
        <FlatRuler
          className="g2jp-ruler"
          active={active}
          goTo={goTo}
          hidden={!rulerOn}
          style={{ opacity: rulerOp, y: rulerY }}
        />
      </div>

      <div ref={jTrack} className="g2jp-journey">
        <div className="g2jp-journey__sticky">
          <Gen2Journey heading={heading} subtitle={subtitle} scroll={scroll} />
        </div>
      </div>

      <section className="g2f g2jp-products" aria-label="Products">
        <FeaturesPinnedView flat trackRef={fTrack} active={active} goTo={goTo} hrefs={hrefs} learnMoreLabel={learnMoreLabel} />
      </section>
    </div>
  );
}
