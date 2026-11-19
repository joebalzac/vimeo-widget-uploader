import { useLayoutEffect, useRef } from "react";
import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { CSS_EASE } from "../shared/motion";
import FCard from "./FCard";
import FText from "./FText";
import FVis from "./FVis";
import { FEATURES, type FeatureId } from "./featuresData";
import { useFeatureSteps, usePageScroll } from "./useFeatureSteps";

export interface FeaturesSectionProps {
  hrefs?: Partial<Record<FeatureId, string>>;
  learnMoreLabel?: string;
}

const N = FEATURES.length;
/** Ruler: a 1.5px tick every 12px; every 4th tick is a product mark (48px per product). */
const TICK_STEP = 48;
/** 44 ticks; tick 11 is product 0 (y 132, the ruler's middle). Marks run from j −2 to 7. */
const TICKS = Array.from({ length: 44 }, (_, i) => i);
const FADE = { duration: 0.25, ease: CSS_EASE } as const;

/**
 * A product mark (prototype `RulerMk`): width 12 → 24 and colour #A093FD → #6B4FFF follow
 * the scroll position continuously, k = max(0, 1 − |pos − j| × 1.6).
 */
function RulerMk({ pos, j, onClick }: { pos: MotionValue<number>; j: number; onClick?: () => void }) {
  const k = useTransform(pos, (v) => Math.max(0, 1 - Math.abs(v - j) * 1.6));
  const width = useTransform(k, (v) => 12 + 12 * v);
  const backgroundColor = useTransform(k, [0, 1], ["#a093fd", "#6b4fff"]);
  if (!onClick) return <motion.i className="g2f-ruler__mk" style={{ width, backgroundColor }} />;
  return (
    <motion.button
      type="button"
      className="g2f-ruler__mk"
      style={{ width, backgroundColor }}
      aria-label={FEATURES[j].name}
      onClick={onClick}
    />
  );
}

/**
 * Desktop (≥1001, prototype `FeaturesPinned`): a 560vh track with a sticky 100vh stage
 * (min 656). Scroll position through the track drives the ruler continuously; the active
 * product is round(pos). Text panes crossfade (opacity 0.25s) and the card does the deck
 * swap (FCard). Row: ruler 24 | 48 | text (300–480) | space-between | card (≤660/780/820).
 */
export default function FeaturesPinned({ hrefs = {}, learnMoreLabel }: FeaturesSectionProps) {
  const reduced = !!useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef({ mode: "sticky" as "sticky" | "fixed" | "transform", phase: "", box: "", shift: 0 });
  const { pos, active, goTo } = useFeatureSteps(trackRef);
  const rulerY = useTransform(pos, (v) => -v * TICK_STEP);
  const rowRef = useRef<HTMLDivElement>(null);

  /* The CSS margins assume the row is the card's full-size frame (--row-h 476/563/591).
     Where the card is narrower (1001–1300ish) feed in the real row height so the card
     still starts 195px in and ends 60px above the next section. */
  useLayoutEffect(() => {
    const row = rowRef.current;
    const track = trackRef.current;
    if (!row || !track) return;
    const ro = new ResizeObserver(() => {
      const h = row.offsetHeight;
      if (h > 0) track.style.setProperty("--row-h", `${h}px`);
    });
    ro.observe(row);
    return () => ro.disconnect();
  }, []);

  /* Pin fallback. The stage is `position: sticky`, but sticky silently stops working when an
     ancestor sets overflow hidden/auto (common in Webflow: sections, wrappers, body). If, while
     the track spans the viewport, the stage isn't held at the top, switch to a "fixed" pin:
     the stage sits at the top of the track before the pin, `position: fixed` (lined up with
     the track) while pinned, and at the bottom of the track after. The browser positions fixed
     elements itself, so there's no per-frame lag; styles only change at the two edges. If an
     ancestor transform stops `fixed` from working too, fall back to a transform offset.
     The track's negative margins (see CSS) only move the track box, so this is unaffected. */
  usePageScroll(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const r = track.getBoundingClientRect();
    const h = stage.offsetHeight;
    const pinned = r.top <= 0 && r.bottom > h;
    const pin = pinRef.current;

    if (pin.mode === "sticky") {
      const st = stage.getBoundingClientRect().top;
      if (r.top > 0) {
        // Before the pin the stage must sit at the track's top. A padded overflow-hidden
        // ancestor clamps sticky to its content box, which (with the track's negative
        // top margin) pushes the stage down: switch to the fixed pin straight away.
        if (r.top >= window.innerHeight || Math.abs(st - r.top) <= 2) return;
      } else {
        // Sticky works if the stage sits at the viewport top while the track spans it.
        if (!pinned || r.bottom < h + 2) return;
        if (Math.abs(st) <= 2) return;
      }
      pin.mode = "fixed";
    }

    if (pin.mode === "transform") {
      const want = r.top > 0 ? r.top : Math.min(0, r.bottom - h);
      const natural = stage.getBoundingClientRect().top - pin.shift;
      let next = want - natural;
      if (Math.abs(next) < 0.5) next = 0;
      if (next !== pin.shift) {
        pin.shift = next;
        stage.style.transform = next ? `translate3d(0, ${next}px, 0)` : "";
      }
      return;
    }

    // fixed mode
    const phase = r.top > 0 ? "top" : pinned ? "fixed" : "bottom";
    const box = `${Math.round(r.left)}:${Math.round(r.width)}`;
    if (phase === pin.phase && (phase !== "fixed" || box === pin.box)) return;
    pin.phase = phase;
    pin.box = box;
    const st = stage.style;
    st.left = phase === "fixed" ? `${r.left}px` : "0px";
    st.width = `${r.width}px`;
    st.position = phase === "fixed" ? "fixed" : "absolute";
    st.top = phase === "bottom" ? "auto" : "0px";
    st.bottom = phase === "bottom" ? "0px" : "auto";
    // An ancestor transform makes `fixed` behave like `absolute`; detect and degrade.
    if (phase === "fixed" && Math.abs(stage.getBoundingClientRect().top) > 2) {
      st.position = st.left = st.width = st.top = st.bottom = "";
      pin.mode = "transform";
      pin.phase = "";
    }
  });

  return (
    <div ref={trackRef} className="g2f-pin">
      <div ref={stageRef} className="g2f-stick">
        <div ref={rowRef} className="g2f-row">
          <div className="g2f-ruler">
            <motion.div className="g2f-ruler__tk" style={{ y: rulerY }}>
              {TICKS.map((i) => {
                const j = (i - 11) / 4;
                if ((i - 11) % 4 !== 0 || j < -2 || j > 7) return <i key={i} aria-hidden />;
                const product = j >= 0 && j < N;
                return <RulerMk key={i} pos={pos} j={j} onClick={product ? () => goTo(j) : undefined} />;
              })}
            </motion.div>
            <i className="g2f-ruler__fdt" aria-hidden />
            <i className="g2f-ruler__fdb" aria-hidden />
          </div>

          <div className="g2f-main">
            <div className="g2f-txs">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.id}
                  className="g2f-pane"
                  initial={false}
                  animate={{ opacity: i === active ? 1 : 0 }}
                  transition={reduced ? { duration: 0 } : FADE}
                  style={{ pointerEvents: i === active ? "auto" : "none" }}
                  inert={i !== active}
                  aria-hidden={i !== active}
                >
                  <FText feature={f} href={hrefs[f.id]} learnMoreLabel={learnMoreLabel} />
                </motion.div>
              ))}
            </div>

            <div className="g2f-vis-col">
              <FCard deck swapKey={FEATURES[active].id}>
                <FVis id={FEATURES[active].id} />
              </FCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
