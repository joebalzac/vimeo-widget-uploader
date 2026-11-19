import "../../utils/interVariableFont";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { Reveal } from "./shared";
import { DEFAULT_STATS, type Gen2Stat } from "./gen2StatsData";
import "./Gen2Stats.css";

export interface Gen2StatsProps {
  heading?: string;
  subtitle?: string;
  stats?: Gen2Stat[];
  /**
   * Screen-blend + grayscale/contrast on logo images, for raster logos with a grey box baked in.
   * Off by default: the bundled Figma logos are white on transparent.
   */
  logoBlend?: boolean;
  className?: string;
}

const OUT_CUBIC = [0.33, 1, 0.68, 1] as const;

function parseValue(raw: string) {
  const m = raw.match(/^(\D*?)(-?\d+(?:[.,]\d+)?)(.*)$/);
  if (!m) return null;
  const num = m[2].replace(",", ".");
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { prefix: m[1], target: parseFloat(num), decimals, suffix: m[3] };
}

/**
 * Counts 0 → value when the NUMBER itself is 50% in view (prototype `Stat2`), and again each time it
 * re-enters. Observing the small number rather than the whole row means the threshold is always
 * reachable, even when the stacked mobile row is taller than the viewport.
 * A hidden copy of the final value reserves the width.
 */
function Counter({ value, delay, reduced }: { value: string; delay: number; reduced: boolean }) {
  const parsed = parseValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [n, setN] = useState(0);
  const run = useRef<AnimationPlaybackControls | null>(null);

  /* Start on each entry; once started, a count always runs to the end (leaving view mid-count
     doesn't freeze it on a partial value). */
  useEffect(() => {
    if (!parsed || !inView || reduced) return;
    run.current?.stop();
    setN(0);
    run.current = animate(0, parsed.target, { duration: 1.4, delay, ease: OUT_CUBIC, onUpdate: setN });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, delay]);
  useEffect(() => () => run.current?.stop(), []);

  if (!parsed) return <span className="g2s-num">{value}</span>;
  const live = reduced ? value : `${parsed.prefix}${n.toFixed(parsed.decimals)}${parsed.suffix}`;
  return (
    <span ref={ref} className="g2s-num" aria-label={value}>
      <span className="g2s-num__ghost" aria-hidden="true">
        {value}
      </span>
      <span className="g2s-num__live" aria-hidden="true">
        {live}
      </span>
    </span>
  );
}

/** Logo fade-in on its own <img> (prototype `LogoIn`: 18% in view, once). */
function useSeen<T extends Element>() {
  const ref = useRef<T>(null);
  const seen = useInView(ref, { once: true, amount: 0.18, margin: "0px 0px -6% 0px" });
  return [ref, seen] as const;
}

/**
 * Gen2Stats — "AI That Drives Asset Performance" (handoff 07, Figma 590:46214 / mobile
 * 667:141163). White-on-dark,
 * full-bleed; the dark background and vertical padding come from the Webflow section.
 * Three boxed stats; each number counts up when it is half in view; logos fade in on their
 * own, with no fading/transformed parent, so the screen blend never flashes the grey box.
 */
export default function Gen2Stats({
  heading = "AI That Drives Asset Performance",
  subtitle = "The right AI product directly produces financial results, unlike previous technologies.",
  stats = DEFAULT_STATS,
  logoBlend = false,
  className,
}: Gen2StatsProps) {
  const [rowRef, inView] = useSeen<HTMLDivElement>();
  const reduced = !!useReducedMotion();
  const items = stats.filter((s) => s.value.trim() || s.label.trim());

  return (
    <section className={["g2s", className].filter(Boolean).join(" ")}>
      <div className="g2s-inner">
        <SectionHeading heading={heading} subtitle={subtitle} theme="dark" align="center" maxWidth={440} />

        {items.length > 0 && (
          <div ref={rowRef} className="g2s-row">
            {items.map((s, i) => {
              const src = s.logoSrc?.trim();
              const delay = i * 0.07;
              return (
                <div key={i} className="g2s-box">
                  <Reveal delay={delay} className="g2s-copy">
                    <Counter value={s.value} delay={delay} reduced={reduced} />
                    <span className="g2s-label">{s.label}</span>
                  </Reveal>
                  <div className="g2s-logo">
                    {src ? (
                      <img
                        className={logoBlend ? "g2s-logo__img g2s-logo__img--blend" : "g2s-logo__img"}
                        src={src}
                        alt={s.logoName ?? ""}
                        loading="lazy"
                        style={{
                          width: s.logoWidth,
                          height: s.logoHeight,
                          objectFit: s.logoFit ?? "contain",
                          objectPosition: s.logoPosition ?? "left center",
                          opacity: inView || reduced ? 1 : 0,
                          transitionDelay: `${0.08 + delay}s`,
                        }}
                      />
                    ) : (
                      s.logoName?.trim() && (
                        <span
                          className="g2s-logo__word"
                          style={{ opacity: inView || reduced ? 1 : 0, transitionDelay: `${0.08 + delay}s` }}
                        >
                          {s.logoName}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
