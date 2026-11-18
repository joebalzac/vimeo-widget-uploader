export interface Gen2FooterLink {
  label: string;
  href?: string;
  /** Opens in a new tab and shows a trailing ↗. */
  external?: boolean;
}

export interface Gen2FooterColumn {
  heading: string;
  links: Gen2FooterLink[];
}

/* Placeholder copy from docs/gen2-handoff/10-cta-footer.md — confirm the final list with marketing. */
export const DEFAULT_FOOTER_COLUMNS: Gen2FooterColumn[] = [
  {
    heading: "Products",
    links: [
      { label: "LeasingAI", href: "#" },
      { label: "Tour Intelligence", href: "#" },
      { label: "AI-Guided Tours", href: "#" },
      { label: "Maintenance", href: "#" },
      { label: "Delinquency", href: "#" },
      { label: "Renewals", href: "#" },
      { label: "Apollo", href: "#" },
      { label: "EliseCRM", href: "#" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "Conventional", href: "#" },
      { label: "Affordable", href: "#" },
      { label: "Student", href: "#" },
      { label: "Single-family", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Customer stories", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Help Center", href: "#", external: true },
    ],
  },
  {
    heading: "Follow",
    links: [
      { label: "LinkedIn", href: "#" },
      { label: "X", href: "#" },
      { label: "YouTube", href: "#" },
      { label: "Instagram", href: "#" },
    ],
  },
];

/** Accepts an array or a JSON string (Webflow text prop); falls back to the defaults when empty/invalid. */
export function parseFooterColumns(
  columns?: Gen2FooterColumn[] | string,
  fallback: Gen2FooterColumn[] = DEFAULT_FOOTER_COLUMNS,
): Gen2FooterColumn[] {
  if (Array.isArray(columns) && columns.length > 0) return columns;
  if (typeof columns === "string" && columns.trim()) {
    try {
      const parsed = JSON.parse(columns);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((c) => c && typeof c === "object")
          .map((c) => ({
            heading: String(c.heading ?? ""),
            links: Array.isArray(c.links)
              ? c.links
                  .filter((l: unknown) => l && typeof l === "object" && (l as Gen2FooterLink).label)
                  .map((l: Gen2FooterLink) => ({ label: String(l.label), href: l.href, external: !!l.external }))
              : [],
          }));
      }
    } catch {
      // fall through to defaults
    }
  }
  return fallback;
}
