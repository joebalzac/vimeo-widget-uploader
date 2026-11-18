import "../../utils/interVariableFont";
import { Reveal } from "./shared";
import logoUrl from "../../assets/gen2/footer/elise-logo.svg";
import { parseFooterColumns, type Gen2FooterColumn } from "./gen2FooterData";
import "./Gen2Footer.css";

export interface Gen2FooterProps {
  /** Array, or a JSON string: [{ "heading": "Products", "links": [{ "label": "…", "href": "…", "external": true }] }] */
  columns?: Gen2FooterColumn[] | string;
  logoSrc?: string;
  logoHref?: string;
  logoAlt?: string;
  className?: string;
}

/**
 * Gen2Footer — handoff 10, Figma 590:46508 ("Body"): logo in a 300px mark column,
 * then equal-width link columns (Plex Mono heading + Inter links). Full-bleed with a
 * hairline top border; content is capped at 1160px. Stacks below 762px.
 */
export default function Gen2Footer({
  columns,
  logoSrc,
  logoHref = "/",
  logoAlt = "EliseAI",
  className,
}: Gen2FooterProps) {
  const cols = parseFooterColumns(columns);
  return (
    <footer className={["g2ft", className].filter(Boolean).join(" ")}>
      <div className="g2ft__inner">
        <Reveal className="g2ft__mark">
          <a className="g2ft__logo" href={logoHref} aria-label={logoAlt}>
            <img src={logoSrc || logoUrl} alt={logoAlt} width={96} height={31.6982} />
          </a>
        </Reveal>
        <nav className="g2ft__cols" aria-label="Footer">
          {cols.map((col, i) => (
            <Reveal key={`${col.heading}-${i}`} className="g2ft__col" delay={0.06 * i}>
              {col.heading && <p className="g2ft__heading">{col.heading}</p>}
              {col.links.length > 0 && (
                <ul className="g2ft__links">
                  {col.links.map((l, j) => (
                    <li key={`${l.label}-${j}`}>
                      <a
                        className="g2ft__link"
                        href={l.href || "#"}
                        {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        <span className="g2ft__label">{l.label}</span>
                        {l.external && (
                          <span className="g2ft__ext" aria-hidden="true">
                            ↗
                          </span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </nav>
      </div>
    </footer>
  );
}
