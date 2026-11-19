/* Customers logo grid — handoff 02b. Logos are the CMS artwork from
   eliseai.com/platform-overview ("Trusted by" grid); embedded rasters re-encoded as WebP. */
import goldoller from "../../assets/gen2/customers/goldoller.svg";
import scion from "../../assets/gen2/customers/scion.svg";
import millCreek from "../../assets/gen2/customers/mill-creek.svg";
import s2 from "../../assets/gen2/customers/s2-residential.svg";
import willowBridge from "../../assets/gen2/customers/willow-bridge.webp";
import avenue5 from "../../assets/gen2/customers/avenue5.svg";
import rpm from "../../assets/gen2/customers/rpm.svg";
import cardinal from "../../assets/gen2/customers/cardinal-group.svg";
import olympus from "../../assets/gen2/customers/olympus-property.svg";
import winn from "../../assets/gen2/customers/winncompanies.svg";

export interface Gen2Customer {
  /** Company name — used as the logo alt text and the link's accessible name. */
  name: string;
  /** Logo image URL. Rendered at its natural size, capped at 32px tall and the cell width. */
  logo: string;
  /** Case-study URL. Non-empty makes the whole cell a link (new tab) with the arrow badge. */
  href?: string;
  /** Desktop render size (px) — the logo's natural size; keeps a raster logo at its design size. */
  width?: number;
  height?: number;
}

const SITE = "https://www.eliseai.com";

export const DEFAULT_CUSTOMERS_HEADING = "Trusted by Over 900 of the Top Property Management Companies";

export const DEFAULT_CUSTOMERS: Gen2Customer[] = [
  {
    name: "GoldOller",
    logo: goldoller,
    width: 122,
    height: 24,
    href: `${SITE}/customer-stories/how-goldoller-enhanced-the-employee-experience-and-improved-conversion-rates-with-elisecrm`,
  },
  { name: "Scion", logo: scion, width: 72, height: 30 },
  { name: "Mill Creek Residential", logo: millCreek, width: 161, height: 28 },
  {
    name: "S2 Residential",
    logo: s2,
    width: 163,
    height: 24,
    href: `${SITE}/customer-stories/how-s2-empowers-their-techs-and-completes-work-orders-faster-with-eliseais-maintenance-app`,
  },
  { name: "Willow Bridge", logo: willowBridge, width: 87, height: 32 },
  {
    name: "Avenue5 Residential",
    logo: avenue5,
    width: 123,
    height: 32,
    href: `${SITE}/customer-stories/reinventing-leasing-at-avenue5-with-eliseai`,
  },
  {
    name: "RPM Living",
    logo: rpm,
    width: 44,
    height: 32,
    href: `${SITE}/customer-stories/how-rpm-living-scaled-their-managed-services-offering-with-eliseai`,
  },
  { name: "Cardinal Group", logo: cardinal, width: 173, height: 32 },
  { name: "Olympus Property", logo: olympus, width: 133, height: 32 },
  {
    name: "WinnCompanies",
    logo: winn,
    width: 170,
    height: 26,
    href: `${SITE}/customer-stories/how-winncompanies-uses-eliseai-to-support-their-affordable-resident-population-at-scale`,
  },
];

/**
 * Merge a JSON override (Webflow text prop) onto the defaults, index by index:
 * `[{"name":"…","logo":"https://…","href":"https://…"}, …]`. Missing fields keep the default
 * at that position; `"href": ""` removes a link; extra entries need their own `logo`.
 * Invalid JSON or an empty array falls back to the defaults (same idea as Navbar's parseNavItems).
 */
export function parseCustomers(
  value?: Gen2Customer[] | string,
  fallback: Gen2Customer[] = DEFAULT_CUSTOMERS,
): Gen2Customer[] {
  let list: Partial<Gen2Customer>[] | null = null;
  if (Array.isArray(value)) list = value;
  else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      // fall through to defaults
    }
  }
  if (!list || list.length === 0) return fallback;

  return list
    .map((item, i): Gen2Customer | null => {
      const base = fallback[i];
      const o = item && typeof item === "object" ? item : {};
      const logo = typeof o.logo === "string" && o.logo.trim() ? o.logo.trim() : base?.logo;
      if (!logo) return null;
      const customLogo = logo !== base?.logo;
      return {
        name: typeof o.name === "string" ? o.name : base?.name ?? "",
        logo,
        href: typeof o.href === "string" ? o.href.trim() : base?.href,
        // A replaced logo renders at its own natural size.
        width: customLogo ? undefined : base?.width,
        height: customLogo ? undefined : base?.height,
      };
    })
    .filter((c): c is Gen2Customer => c !== null);
}
