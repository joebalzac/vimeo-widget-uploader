import "../utils/interVariableFont";
import { useEffect, useRef } from "react";
import "./TourHero.css";
import { WALLS, DETAIL_SVG } from "./tour-hero/floorplan-data";
import { HERO_ROOMS, createHeroController } from "./tour-hero/heroController";

export interface TourHeroProps {
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

const WALLS_SVG = WALLS.map((d) => `<path d="${d}" stroke="#C7C6C4" stroke-width="8"/>`).join("");

/**
 * TourHero — Tour Intelligence hero. Figma ".com_2027", frames "Hero2" 1–4 and "Final Illustration".
 *
 * React renders the static markup once; `createHeroController` (Web Animations API) runs the whole
 * sequence: the plan draws in, three timestamps pin to their rooms, and one room card at a time plays
 * its update. It restarts whenever 25% of the hero re-enters the viewport.
 *
 * Layers, back to front: plan (A) → mobile glow → timestamps + desktop cards (B) → mobile card → copy.
 */
export default function TourHero({
  heading = "Tour Intelligence",
  subtitle = "Records and scores tours, automates follow-up tasks, and surfaces coaching and property insights to turn more tours into leases.",
  ctaLabel = "Get A Demo",
  ctaHref = "#",
  className,
}: TourHeroProps) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const ctl = createHeroController(root.current!);
    return () => ctl.destroy();
  }, []);

  /* "Tour <br/>Intelligence": the break only shows below 768px */
  const sp = heading.indexOf(" ");
  const h1 =
    sp > 0 ? (
      <>
        {heading.slice(0, sp + 1)}
        <br className="tih-br" />
        {heading.slice(sp + 1)}
      </>
    ) : (
      heading
    );

  return (
    <section ref={root} className={["tih", className].filter(Boolean).join(" ")} aria-label={heading}>
      {/* layer A: the plan (scaled 1440 x 880 stage) */}
      <div data-layer-a className="tih-layer">
        <svg data-det viewBox="0 0 1440 880" className="tih-svg" fill="none" strokeWidth="1.25" dangerouslySetInnerHTML={{ __html: DETAIL_SVG }} />
        <svg data-walls viewBox="0 0 1440 880" className="tih-svg" fill="none" dangerouslySetInnerHTML={{ __html: WALLS_SVG }} />
        {/* Figma inner shadows: one at full strength, one at 50% */}
        <div className="tih-shade" />
        <div className="tih-shade tih-shade--half" />
      </div>
      {/* soft glow behind the headline (mobile): above the plan, below the timestamps */}
      <div data-glow className="tih-glow" />
      {/* layer B: timestamps + desktop cards, same transform as layer A */}
      <div data-layer-b className="tih-layer tih-layer--b">
        {HERO_ROOMS.map((r) => (
          <div key={r.k} data-chip={r.k} className="hchip">
            <span className={`pill ${r.tone}`}>
              <svg width="8.6" height="9.9" viewBox="0 0 8.6 9.9">
                <path d="M8.6 4.95L0 9.9V0Z" fill="#fff" />
              </svg>
              {r.time}
            </span>
            <span className="pt">
              <span className="halo" />
              <span className="pulse-ring" />
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15.375" fill="#FDFCFB" stroke="#C1BAFE" strokeWidth="1.25" />
                <circle cx="16" cy="16" r="6.4" fill="#6B4FFF" />
              </svg>
            </span>
          </div>
        ))}
      </div>
      {/* mobile: the active card sits centred under its dot */}
      <div data-mcards className="tih-mcards" />
      {/* copy: above everything */}
      <div data-copy className="tih-copy-wrap">
        <div className="tih-copy">
          <div className="tih-copy__header">
            <h1 data-in className="tih-copy__title">
              {h1}
            </h1>
            <p data-in className="tih-copy__subtitle">
              {subtitle}
            </p>
          </div>
          {ctaLabel && (
            <a data-in href={ctaHref} className="tih-copy__cta">
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
      <div className="tih-mobile-vignette" />
    </section>
  );
}
