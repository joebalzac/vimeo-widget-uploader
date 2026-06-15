import type { CustomerLogo, CustomerBrandId } from "../components/CustomerStoriesLogo";
import { hoverBg } from "../assets/customer-logos";

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

/**
 * Build the 10-logo grid from optional per-slot case study URLs.
 * Logos are bundled SVGs — only paste URLs for slots that should link out.
 * Hover preview activates when both case study URL + hover background are set.
 */
export function buildLogoGrid(
  caseStudyUrls: (string | undefined)[],
  hoverBgUrl?: string,
): CustomerLogo[] {
  const bg = hoverBgUrl || hoverBg;

  return LOGO_SLOT_BRANDS.map((brand, i) => {
    const href = caseStudyUrls[i]?.trim();
    const linked = Boolean(href && bg);

    return {
      brand,
      ...(linked ? { href, hoverBgUrl: bg } : {}),
    };
  });
}

/** Default demo grid with placeholder case study links on interactive cells. */
export const DEFAULT_LOGO_GRID: CustomerLogo[] = buildLogoGrid([
  "#",
  undefined,
  undefined,
  "#",
  undefined,
  "#",
  "#",
  undefined,
  undefined,
  "#",
]);
