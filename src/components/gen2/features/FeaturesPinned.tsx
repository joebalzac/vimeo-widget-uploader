import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { E } from "../shared/motion";
import FCard from "./FCard";
import FText from "./FText";
import FVis from "./FVis";
import { FEATURES, type FeatureId } from "./featuresData";

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

/**
 * Desktop (≥1001): a 6×100vh track with a sticky 100vh stage. Scroll progress through the
 * track picks the active product; the ruler (24 wide, 264 tall, ticks every 12px) shifts
 * 48px per product, text panes crossfade (opacity only, 0.25s) and the card does a soft
 * deck swap (see FCard).
 * Layout follows Figma 618:6955: ruler | 48 | text 380 | 48 | card 660×476, centred.
 */
export default function FeaturesPinned({ hrefs = {}, learnMoreLabel }: FeaturesSectionProps) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.max(0, Math.min(N - 1, Math.floor(p * N)));
    setActive((prev) => (prev === i ? prev : i));
  });

  /** Scroll the window to the middle of step `i`'s slice of the track. */
  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + ((i + 0.5) / N) * travel, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div ref={track} className="g2f-pinned" style={{ height: `${N * 100}vh` }}>
      <div className="g2f-pinned__sticky">
        <div className="g2f-pinned__grid">
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
                    aria-label={FEATURES[i].title}
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
