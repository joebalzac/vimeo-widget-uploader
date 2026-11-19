import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { E } from "../shared/motion";
import FCard from "./FCard";
import FText from "./FText";
import FVis from "./FVis";
import { FEATURES, type FeatureId } from "./featuresData";
import { useFeatureSteps } from "./useFeatureSteps";

export interface FeaturesSectionProps {
  hrefs?: Partial<Record<FeatureId, string>>;
  learnMoreLabel?: string;
}

const N = FEATURES.length;
/** Ruler (Figma 618:6956): a 1.5px tick every 12px; every 4th tick is a product. */
const MINOR_STEP = 12;
const MINOR_PER_STEP = 4;
const TICK_STEP = MINOR_STEP * MINOR_PER_STEP; // 48px per product
/** Minor-tick indices, padded past both ends so the fades never show a gap. */
const TICKS = Array.from({ length: (N - 1) * MINOR_PER_STEP + 25 }, (_, j) => j - 12);
const FADE = { duration: 0.25, ease: "linear" } as const;

/** Flatten layout: the stage keeps 200px clear at the top for the flat ruler (handoff 03). */
const FLAT_STAGE_TOP = 200;

export interface FeaturesPinnedViewProps extends FeaturesSectionProps {
  trackRef: RefObject<HTMLDivElement | null>;
  active: number;
  goTo: (i: number) => void;
  /**
   * Flatten (handoff 03): no vertical ruler (the flat ruler above replaces it); the stage
   * keeps 200px clear at the top and the copy/visual sit right under it. The track's bottom
   * margin is trimmed so the section ends at the card's bottom edge.
   */
  flat?: boolean;
  /** Extra content inside the sticky stage (e.g. the flat ruler under reduced motion). */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Desktop (≥1001): a 6×100vh track with a sticky 100vh stage. Scroll progress through the
 * track picks the active product; text panes crossfade (opacity only, 0.25s) and the card
 * does a soft deck swap (see FCard). Classic layout follows Figma 618:6955:
 * ruler | 48 | text 480 (v109) | 48 | card 660×476; the flat layout drops the ruler column.
 */
export function FeaturesPinnedView({
  trackRef,
  active,
  goTo,
  hrefs = {},
  learnMoreLabel,
  flat = false,
  children,
  className,
  style,
}: FeaturesPinnedViewProps) {
  const reduced = !!useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridH, setGridH] = useState(0);

  /* Flat: end the section at the card's bottom edge (handoff 05 v124: Products → Apollo
     spacing), i.e. drop the stage's empty space under the grid. */
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!flat || !el) return;
    const ro = new ResizeObserver(() => setGridH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [flat]);

  const trackStyle: CSSProperties = { height: `${N * 100}vh`, ...style };
  if (flat && gridH > 0) trackStyle.marginBottom = `min(0px, calc(${FLAT_STAGE_TOP + gridH}px - 100vh))`;

  return (
    <div
      ref={trackRef}
      className={["g2f-pinned", flat && "g2f-pinned--flat", className].filter(Boolean).join(" ")}
      style={trackStyle}
    >
      <div className="g2f-pinned__sticky">
        {children}
        <div ref={gridRef} className="g2f-pinned__grid">
          {!flat && (
            <div className="g2f-ruler">
              <motion.div
                className="g2f-ruler__track"
                initial={false}
                animate={{ y: -active * TICK_STEP }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: E }}
              >
                {TICKS.map((k) => {
                  const i = k / MINOR_PER_STEP;
                  const product = Number.isInteger(i) && i >= 0 && i < N;
                  const on = product && i === active;
                  const tick = (
                    <motion.span
                      className="g2f-ruler__tick"
                      initial={false}
                      animate={{
                        width: on ? 24 : 12,
                        backgroundColor: on ? "#6B4FFF" : product ? "#A093FD" : "#DDDCDA",
                      }}
                      transition={reduced ? { duration: 0 } : { duration: 0.3, ease: E }}
                    />
                  );
                  const top = k * MINOR_STEP;
                  return product ? (
                    <button
                      key={k}
                      type="button"
                      className="g2f-ruler__hit"
                      style={{ top }}
                      aria-label={FEATURES[i].name}
                      aria-current={on ? "step" : undefined}
                      onClick={() => goTo(i)}
                    >
                      {tick}
                    </button>
                  ) : (
                    <span key={k} className="g2f-ruler__hit" style={{ top }} aria-hidden>
                      {tick}
                    </span>
                  );
                })}
              </motion.div>
            </div>
          )}

          <div className="g2f-panes">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                className="g2f-pane"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : FADE}
                inert={i !== active}
                aria-hidden={i !== active}
              >
                <FText feature={f} href={hrefs[f.id]} learnMoreLabel={learnMoreLabel} />
              </motion.div>
            ))}
          </div>

          <div className="g2f-pinned__visual">
            {/* Deck swap: FCard swaps the whole front card (background + visual). */}
            <FCard deck swapKey={FEATURES[active].id}>
              <div className="g2f-vis">
                <FVis id={FEATURES[active].id} />
              </div>
            </FCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The classic pinned Features (vertical tick ruler), as used by `Gen2Features`. */
export default function FeaturesPinned(props: FeaturesSectionProps) {
  const track = useRef<HTMLDivElement>(null);
  const { active, goTo } = useFeatureSteps(track, "floor");
  return <FeaturesPinnedView {...props} trackRef={track} active={active} goTo={goTo} />;
}
