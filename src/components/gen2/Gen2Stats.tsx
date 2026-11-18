import "../../utils/interVariableFont";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
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

/** Counts 0 → value once in view. A hidden copy of the final value reserves the width. */
function Counter({ value, run, delay, reduced }: { value: string; run: boolean; delay: number; reduced: boolean }) {
  const parsed = parseValue(value);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!parsed || !run || reduced) return;
    const c = animate(0, parsed.target, { duration: 1.4, delay, ease: OUT_CUBIC, onUpdate: setN });
    return () => c.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, reduced, value, delay]);

  if (!parsed) return <span className="g2s-num">{value}</span>;
  const live = reduced ? value : `${parsed.prefix}${n.toFixed(parsed.decimals)}${parsed.suffix}`;
  return (
    <span className="g2s-num" aria-label={value}>
      <span className="g2s-num__ghost" aria-hidden="true">
        {value}
      </span>
      <span className="g2s-num__live" aria-hidden="true">
        {live}
      </span>
    </span>
  );
}

/**
 * Gen2Stats — "The AI That Drives Asset Performance" (handoff 07, Figma 590:46214 / mobile
 * 667:141163). Dark,
 * full-bleed section (paints its own #131115 background and padding; `data-dark="1"` tells
 * the nav to go dark). Three boxed stats count up when half in view; logos fade in on their
 * own, with no fading/transformed parent, so the screen blend never flashes the grey box.
 */
export default function Gen2Stats({
  heading = "The AI That Drives Asset Performance",
  subtitle = "Third-party syndicated to drive financial results.",
  stats = DEFAULT_STATS,
  logoBlend = false,
  className,
}: Gen2StatsProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { amount: 0.5, once: true });
  const reduced = !!useReducedMotion();
  const items = stats.filter((s) => s.value.trim() || s.label.trim());

  return (
    <section className={["g2s", className].filter(Boolean).join(" ")} data-dark="1">
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
                    <Counter value={s.value} run={inView} delay={delay} reduced={reduced} />
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
                          transitionDelay: `${0.3 + delay}s`,
                        }}
                      />
                    ) : (
                      s.logoName?.trim() && (
                        <span
                          className="g2s-logo__word"
                          style={{ opacity: inView || reduced ? 1 : 0, transitionDelay: `${0.3 + delay}s` }}
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
