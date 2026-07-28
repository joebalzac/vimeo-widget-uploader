import type { CustomerLogo, CustomerBrandId } from "../components/CustomerStoriesLogo";
import { BRAND_LOGOS } from "../assets/customer-logos";

/** Grid order: row 1 left → right, then row 2. */
export const LOGO_SLOT_BRANDS: CustomerBrandId[] = [
  "goldoller",
  "scion",
  "millcreek",
  "s2",
  "greystar",
  "avenue5",
  "rpm",
  "cardinal",
  "olympus",
  "winn",
];

/** Per-brand hover background images (case-study cells). */
export const BRAND_HOVER_BGS: Partial<Record<CustomerBrandId, string>> = {
  goldoller:
    "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68f7af456bcf4932e78f3d_goldollder-cs-bg.avif",
  s2: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68f7af36ea92dad089bf1c_s2-residential-cs-bg.avif",
  winn: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68f7afbde4a2ed6f345d93_winn-companies-cs-bg.avif",
  rpm: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68f7affe48b957a6e9ed74_rpm-cs-bg%20(1).avif",
  avenue5:
    "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68f7af4c0eb655c2be15d7_avenue-5-bg.avif",
};

/** Per-brand case study page URLs. */
export const BRAND_CASE_STUDY_URLS: Partial<Record<CustomerBrandId, string>> = {
  avenue5:
    "https://eliseai.com/customer-stories/reinventing-leasing-at-avenue5-with-eliseai",
  rpm: "https://eliseai.com/customer-stories/how-rpm-living-scaled-their-managed-services-offering-with-eliseai",
  goldoller:
    "https://eliseai.com/customer-stories/how-goldoller-enhanced-the-employee-experience-and-improved-conversion-rates-with-elisecrm",
  s2: "https://eliseai.com/customer-stories/how-s2-empowers-their-techs-and-completes-work-orders-faster-with-eliseais-maintenance-app",
  winn: "https://eliseai.com/customer-stories/how-winncompanies-uses-eliseai-to-support-their-affordable-resident-population-at-scale",
};

/** Slots with a case-study hover (brands that have a case study URL). 0-based. */
const CASE_STUDY_SLOT_INDEXES = new Set(
  LOGO_SLOT_BRANDS.map((brand, i) =>
    BRAND_CASE_STUDY_URLS[brand] ? i : -1,
  ).filter((i) => i >= 0),
);

const SLOT_LABELS = [
  "Row 1 — GoldOller",
  "Row 1 — Scion",
  "Row 1 — Mill Creek",
  "Row 1 — S2 Residential",
  "Row 1 — Greystar",
  "Row 2 — Avenue5",
  "Row 2 — RPM",
  "Row 2 — Cardinal Group",
  "Row 2 — Olympus Property",
  "Row 2 — WinnCompanies",
];

export function slotLabel(n: number): string {
  return SLOT_LABELS[n - 1] ?? `Slot ${n}`;
}

/** Preset CDN values for a 1-based slot (used as Webflow prop defaults). */
export function slotLogoDefaults(n: number): {
  logoUrl: string;
  logoHoverUrl: string;
  hoverBgUrl: string;
  caseStudyUrl: string;
  label: string;
} {
  const brand = LOGO_SLOT_BRANDS[n - 1];
  const entry = brand ? BRAND_LOGOS[brand] : undefined;
  return {
    logoUrl: entry?.dark ?? "",
    logoHoverUrl: entry?.light ?? "",
    hoverBgUrl: (brand && BRAND_HOVER_BGS[brand]) || "",
    caseStudyUrl: (brand && BRAND_CASE_STUDY_URLS[brand]) || "",
    label: entry?.label ?? `Slot ${n}`,
  };
}

/** Per-slot overrides. Any field is optional — omit to fall back to presets. */
export interface LogoSlotConfig {
  /** Case study link. Enables click + width expand + arrow badge. */
  href?: string;
  /** Black logo URL (light theme). Overrides the preset brand logo. */
  logoUrl?: string;
  /** White logo URL (dark theme + hover). */
  logoHoverUrl?: string;
  /** Custom hover background image URL. Overrides the shared fallback. */
  hoverBgUrl?: string;
}

/**
 * Build the 10-logo grid from optional per-slot config.
 * Logos / hover BGs default to preset CDN values — Webflow props override them.
 * Hover preview requires both a case study URL + a hover background URL.
 */
export function buildLogoGrid(
  slots: (LogoSlotConfig | undefined)[],
  fallbackHoverBgUrl?: string,
): CustomerLogo[] {
  const fallbackBg = fallbackHoverBgUrl?.trim();

  return LOGO_SLOT_BRANDS.map((brand, i) => {
    const slot = slots[i] ?? {};
    const href = slot.href?.trim() || BRAND_CASE_STUDY_URLS[brand];
    const logoUrl = slot.logoUrl?.trim();
    const logoHoverUrl = slot.logoHoverUrl?.trim();
    const hoverBg =
      slot.hoverBgUrl?.trim() || BRAND_HOVER_BGS[brand] || fallbackBg;
    const showArrow = CASE_STUDY_SLOT_INDEXES.has(i) || Boolean(href);
    const defaults = BRAND_LOGOS[brand];

    // Prefer explicit Webflow URLs; otherwise keep the brand preset.
    if (logoUrl || logoHoverUrl) {
      return {
        logoUrl: logoUrl || defaults.dark,
        logoHoverUrl: logoHoverUrl || defaults.light,
        alt: defaults.label,
        showArrow,
        ...(href ? { href, ...(hoverBg ? { hoverBgUrl: hoverBg } : {}) } : {}),
      };
    }

    return {
      brand,
      showArrow,
      ...(href ? { href, ...(hoverBg ? { hoverBgUrl: hoverBg } : {}) } : {}),
    };
  });
}

/** Local / default grid with case-study links on the five linked brands. */
export const DEFAULT_LOGO_GRID: CustomerLogo[] = buildLogoGrid(
  LOGO_SLOT_BRANDS.map((brand) =>
    BRAND_CASE_STUDY_URLS[brand]
      ? { href: BRAND_CASE_STUDY_URLS[brand] }
      : undefined,
  ),
);
