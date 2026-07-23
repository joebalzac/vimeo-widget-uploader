import type { CustomerLogo, CustomerBrandId } from "../components/CustomerStoriesLogo";

/** Grid order: row 1 left → right, then row 2. Matches Figma. */
export const LOGO_SLOT_BRANDS: CustomerBrandId[] = [
  "goldoller",
  "rpm",
  "scion",
  "greystar",
  "rpm",
  "rpm",
  "greystar",
  "rpm",
  "scion",
  "goldoller",
];

/** Slots that show the arrow badge by default (matches Figma). 1-based: 1, 4, 6, 7, 10 */
const CASE_STUDY_SLOT_INDEXES = new Set([0, 3, 5, 6, 9]);

const SLOT_LABELS = [
  "Row 1 — GoldOller",
  "Row 1 — RPM",
  "Row 1 — Scion",
  "Row 1 — Greystar",
  "Row 1 — RPM",
  "Row 2 — RPM",
  "Row 2 — Greystar",
  "Row 2 — RPM",
  "Row 2 — Scion",
  "Row 2 — GoldOller",
];

export function slotLabel(n: number): string {
  return SLOT_LABELS[n - 1] ?? `Slot ${n}`;
}

/** Per-slot overrides. Any field is optional — omit to fall back to presets. */
export interface LogoSlotConfig {
  /** Case study link. Enables click + width expand + arrow badge. */
  href?: string;
  /** Custom logo URL. Overrides the bundled brand SVG for this slot. */
  logoUrl?: string;
  /** Custom logo URL shown on hover (defaults to the same as logoUrl). */
  logoHoverUrl?: string;
  /** Custom hover background image URL. Overrides the shared fallback. */
  hoverBgUrl?: string;
}

/**
 * Build the 10-logo grid from optional per-slot config.
 * Logos default to bundled SVGs — pass `logoUrl` to override a slot with a
 * custom logo, `href` to link it out, and `hoverBgUrl` to set the hover image.
 * Hover preview requires both a case study URL + a hover background URL.
 */
export function buildLogoGrid(
  slots: (LogoSlotConfig | undefined)[],
  fallbackHoverBgUrl?: string,
): CustomerLogo[] {
  const fallbackBg = fallbackHoverBgUrl?.trim();

  return LOGO_SLOT_BRANDS.map((brand, i) => {
    const slot = slots[i] ?? {};
    const href = slot.href?.trim();
    const logoUrl = slot.logoUrl?.trim();
    const logoHoverUrl = slot.logoHoverUrl?.trim();
    const hoverBg = slot.hoverBgUrl?.trim() || fallbackBg;
    const showArrow = CASE_STUDY_SLOT_INDEXES.has(i) || Boolean(href);

    return {
      // Custom logo URL replaces the bundled brand SVG when provided.
      ...(logoUrl ? { logoUrl } : { brand }),
      ...(logoHoverUrl ? { logoHoverUrl } : {}),
      showArrow,
      ...(href ? { href, ...(hoverBg ? { hoverBgUrl: hoverBg } : {}) } : {}),
    };
  });
}

/** Demo hover image — hosted URL only, not bundled (keeps Webflow library under size limit). */
const DEMO_HOVER_BG =
  "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/69e923490d2027c0e66d0c17_meetelise-qr-code.png";

/** Default demo grid with placeholder case study links on interactive cells. */
export const DEFAULT_LOGO_GRID: CustomerLogo[] = buildLogoGrid(
  [
    { href: "#" },
    undefined,
    undefined,
    { href: "#" },
    undefined,
    { href: "#" },
    { href: "#" },
    undefined,
    undefined,
    { href: "#" },
  ],
  DEMO_HOVER_BG,
);
