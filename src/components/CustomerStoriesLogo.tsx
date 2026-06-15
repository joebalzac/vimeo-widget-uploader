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
  /** Case study link. Hover expand + preview when set with hoverBgUrl. */
  href?: string;
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

function ArrowIcon({ variant }: { variant: "default" | "hover" }) {
  const stroke = variant === "hover" ? "#ffffff" : "#181819";
  return (
    <svg
      className={`csl__arrow-icon csl__arrow-icon--${variant}`}
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
    >
      <path
        d="M1 4h5.5"
        stroke={stroke}
        strokeWidth="0.75"
        strokeLinecap="round"
      />
      <path
        d="M4.5 1.5L7 4l-2.5 2.5"
        stroke={stroke}
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

  const isLinked = Boolean(logo.href && logo.hoverBgUrl);
  const Tag = isLinked ? "a" : "div";

  return (
    <Tag
      className={`csl__cell${isLinked ? " csl__cell--linked" : ""}`}
      href={isLinked ? logo.href : undefined}
      target={isLinked ? "_blank" : undefined}
      rel={isLinked ? "noopener noreferrer" : undefined}
      aria-label={isLinked ? assets.alt || "Read case study" : undefined}
    >
      {isLinked && logo.hoverBgUrl && (
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
        {isLinked && (
          <img
            src={assets.logoHoverUrl}
            alt=""
            aria-hidden
            className="csl__logo-img csl__logo-img--hover"
          />
        )}
      </div>

      {isLinked && (
        <span className="csl__arrow" aria-hidden>
          <ArrowIcon variant="default" />
          <ArrowIcon variant="hover" />
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
