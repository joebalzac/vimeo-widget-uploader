import "./CustomerStoriesLogoStyling.css";
import {
  BRAND_LOGOS,
  type CustomerBrandId,
} from "../assets/customer-logos";

export type { CustomerBrandId };

export interface CustomerLogo {
  /** Built-in brand SVG (demo / preset logos). */
  brand?: CustomerBrandId;
  /** Custom logo URL — use for Webflow-uploaded SVGs. */
  logoUrl?: string;
  /** White / inverted logo on hover. Auto-resolved for built-in brands. */
  logoHoverUrl?: string;
  /** Background image revealed on hover. */
  hoverBgUrl?: string;
  /** Case study link. Enables click + width expand when set. */
  href?: string;
  /** Show the arrow badge (default slots from Figma layout). */
  showArrow?: boolean;
  alt?: string;
}

export interface CustomerStoriesLogoProps {
  theme?: "light" | "dark";
  logos?: CustomerLogo[];
}

const ROW_SIZE = 5;

function resolveLogoAssets(
  logo: CustomerLogo,
  theme: "light" | "dark",
): { logoUrl: string; logoHoverUrl: string; alt: string } | null {
  if (logo.brand) {
    const brand = BRAND_LOGOS[logo.brand];
    const logoUrl = theme === "light" ? brand.dark : brand.light;
    const logoHoverUrl = logo.logoHoverUrl || brand.light;
    return {
      logoUrl,
      logoHoverUrl,
      alt: logo.alt || brand.label,
    };
  }

  if (!logo.logoUrl) return null;

  return {
    logoUrl: logo.logoUrl,
    logoHoverUrl: logo.logoHoverUrl || logo.logoUrl,
    alt: logo.alt || "",
  };
}

function ArrowIcon() {
  return (
    <svg
      className="csl__arrow-icon"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 4h5.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M4.5 1.5L7 4l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoCell({
  logo,
  theme,
}: {
  logo: CustomerLogo;
  theme: "light" | "dark";
}) {
  const assets = resolveLogoAssets(logo, theme);
  if (!assets) return null;

  const hasHref = Boolean(logo.href);
  const hasHoverPreview = Boolean(logo.href && logo.hoverBgUrl);
  const showArrow = logo.showArrow ?? hasHref;
  const Tag = hasHref ? "a" : "div";

  return (
    <Tag
      className={`csl__cell${hasHref ? " csl__cell--linked" : ""}`}
      href={hasHref ? logo.href : undefined}
      target={hasHref ? "_blank" : undefined}
      rel={hasHref ? "noopener noreferrer" : undefined}
      aria-label={hasHref ? assets.alt || "Read case study" : undefined}
    >
      {hasHoverPreview && logo.hoverBgUrl && (
        <div className="csl__cell-bg" aria-hidden>
          <img src={logo.hoverBgUrl} alt="" />
        </div>
      )}

      <div className="csl__logo">
        <img
          src={assets.logoUrl}
          alt={assets.alt}
          className="csl__logo-img csl__logo-img--default"
        />
        {hasHoverPreview && (
          <img
            src={assets.logoHoverUrl}
            alt=""
            aria-hidden
            className="csl__logo-img csl__logo-img--hover"
          />
        )}
      </div>

      {showArrow && (
        <span className="csl__arrow" aria-hidden>
          <ArrowIcon />
        </span>
      )}
    </Tag>
  );
}

function chunkRows<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function CustomerStoriesLogo({
  theme = "light",
  logos = [],
}: CustomerStoriesLogoProps) {
  const filled = logos.filter(
    (l) => l.brand || l.logoUrl,
  );
  const rootClass = `csl${theme === "dark" ? " csl--dark" : ""}`;
  const rows = chunkRows(filled, ROW_SIZE);

  return (
    <section className={rootClass}>
      {filled.length > 0 && (
        <div className="csl__grid">
          {rows.map((row, rowIndex) => (
            <div className="csl__row" key={rowIndex}>
              {row.map((logo, i) => (
                <LogoCell key={`${rowIndex}-${i}`} logo={logo} theme={theme} />
              ))}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
