import "../../utils/interVariableFont";
import { useEffect, useState } from "react";
import { Reveal } from "./shared";
import { DEFAULT_CUSTOMERS, DEFAULT_CUSTOMERS_HEADING, type Gen2Customer } from "./gen2CustomersData";
import arrowUrl from "../../assets/gen2/customers/arrow.svg";
import arrowHoverUrl from "../../assets/gen2/customers/arrow-hover.svg";
import "./Gen2Customers.css";

export interface Gen2CustomersProps {
  heading?: string;
  customers?: Gen2Customer[];
  className?: string;
}

const MOBILE_QUERY = "(max-width: 767px)";

/** Column count of the grid (5, or 2 at ≤767) — drives the reveal stagger. */
function useColumns() {
  const [cols, setCols] = useState(() =>
    typeof window !== "undefined" && window.matchMedia?.(MOBILE_QUERY).matches ? 2 : 5,
  );
  useEffect(() => {
    const mq = window.matchMedia?.(MOBILE_QUERY);
    if (!mq) return;
    const sync = () => setCols(mq.matches ? 2 : 5);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return cols;
}

/**
 * Gen2Customers — "Trusted by" logo grid (handoff 02b), directly below the hero.
 * Centred H2 + a 5×2 hairline grid (2 columns at ≤767). Case-study cells are whole-cell links
 * (new tab) with a 32px arrow badge (Figma 874:180245).
 * No section padding or background: drop it into the Webflow "main padding section"
 * (120 top / 40 bottom desktop · 96 top ≤1000 · 72 / 24 ≤767).
 */
export default function Gen2Customers({
  heading = DEFAULT_CUSTOMERS_HEADING,
  customers = DEFAULT_CUSTOMERS,
  className,
}: Gen2CustomersProps) {
  const cols = useColumns();

  return (
    <div className={["g2cu", className].filter(Boolean).join(" ")}>
      {heading.trim() && (
        <Reveal amount={0.35}>
          <h2 className="g2cu__title">{heading}</h2>
        </Reveal>
      )}
      {customers.length > 0 && (
        <ul className="g2cu__grid">
          {customers.map((c, i) => {
            const delay = 0.06 * (i % cols) + 0.08 * Math.floor(i / cols);
            const logo = (
              <img
                className="g2cu__logo"
                src={c.logo}
                alt={c.name}
                width={c.width}
                height={c.height}
                style={c.width ? { width: c.width } : undefined}
                loading="lazy"
                decoding="async"
              />
            );
            return (
              <li key={`${c.name}-${i}`} className="g2cu__item">
                {c.href ? (
                  <a
                    className="g2cu__cell g2cu__cell--link"
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${c.name} case study (opens in a new tab)`}
                  >
                    <Reveal className="g2cu__inner" delay={delay} amount={0.3}>
                      <span className="g2cu__row">{logo}</span>
                      <span className="g2cu__arrow" aria-hidden="true">
                        <img src={arrowUrl} alt="" width={16} height={16} />
                        <img className="g2cu__arrow-hover" src={arrowHoverUrl} alt="" width={16} height={16} />
                      </span>
                    </Reveal>
                  </a>
                ) : (
                  <div className="g2cu__cell">
                    <Reveal className="g2cu__inner" delay={delay} amount={0.3}>
                      <span className="g2cu__row">{logo}</span>
                    </Reveal>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
