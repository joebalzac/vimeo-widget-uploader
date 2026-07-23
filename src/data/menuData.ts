// ===== Mega-menu data model =====
// A mega menu is one of two layouts:
//   - "wide":  a full-width row of link sections (AI for Property Management)
//   - "split": a left group of link sections + a right panel that is either
//              more links, featured cards, or a dark CTA card.

export interface MenuItem {
  title: string;
  description?: string;
  href?: string;
  /** Renders as a purple uppercase sub-label inside a column (e.g. RESIDENTAI). */
  isSubheading?: boolean;
}

/** A titled group whose items are split across one or more sub-columns. */
export interface MenuSection {
  title?: string;
  columns: MenuItem[][];
}

export interface FeaturedCard {
  category: string;
  title: string;
  imageUrl?: string;
  href?: string;
}

export interface CtaCard {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl?: string;
}

export type PanelBackground = "white" | "gray" | "dark";

export type RightPanel =
  | { kind: "links"; background: PanelBackground; section: MenuSection }
  | {
      kind: "cards";
      background: PanelBackground;
      title?: string;
      cards: FeaturedCard[];
    }
  | { kind: "cta"; background: PanelBackground; cta: CtaCard };

export type MegaMenuData =
  | { variant: "wide"; sections: MenuSection[] }
  | { variant: "split"; left: MenuSection[]; right: RightPanel };

export const menuData: Record<string, MegaMenuData> = {
  "AI for Property Management": {
    variant: "wide",
    sections: [
      {
        title: "PLATFORM",
        columns: [
          [
            {
              title: "Platform Overview",
              description: "Automating leasing & resident operations",
              href: "/platform-overview",
            },
            {
              title: "EliseCRM",
              description: "Centralize contacts, conversations, & insights",
              href: "/elisecrm",
            },
            {
              title: "VoiceAI",
              description: "Answer every prospect & resident inquiry",
              href: "/voiceai",
            },
            {
              title: "Lease Audits",
              description: "Find revenue leaks & compliance gaps",
              href: "/lease-audits",
            },
            {
              title: "Fee Transparency",
              description: "Centralized, automated cost clarity",
              href: "/fee-transparency",
            },
            {
              title: "Integrations",
              description: "Connect with your existing tools and systems",
              href: "/integrations",
            },
          ],
        ],
      },
      {
        title: "LEASINGAI",
        columns: [
          [
            {
              title: "Prospect Management",
              description: "Capture, nurture, & convert prospects",
              href: "/prospect-management",
            },
            {
              title: "AI-Guided Tours",
              description: "Self-guided tours that convert 24/7",
              href: "/aigt",
            },
            { title: "RESIDENTAI", isSubheading: true },
            {
              title: "Move-In",
              description: "Effortless move-ins powered by AI",
              href: "/move-in",
            },
            {
              title: "Maintenance",
              description: "Automate repairs from request to resolution",
              href: "/maintenance",
            },
            {
              title: "Maintenance App",
              description: "Mobile work orders & assignments for techs",
              href: "/maintenance-app",
            },
            {
              title: "Renewals",
              description: "Predict, engage, & renew",
              href: "/renewals",
            },
            {
              title: "Delinquency",
              description: "Reduce late payments & boost cash flow",
              href: "/delinquency",
            },
          ],
        ],
      },
      {
        title: "ASSETS",
        columns: [
          [
            {
              title: "Conventional",
              description: "Low, mid, & high-rise apartment complexes",
              href: "/asset/conventional",
            },
            {
              title: "Student Housing",
              description: "Off-campus & purpose-built student housing",
              href: "/asset/student",
            },
            {
              title: "Affordable",
              description: "Subsidized & regulated housing types",
              href: "/asset/affordable",
            },
            {
              title: "Single-Family",
              description: "Detached, stand-alone homes",
              href: "/asset/single-family",
            },
          ],
        ],
      },
      {
        title: "SOLUTIONS",
        columns: [
          [
            {
              title: "Centralized Operations",
              description:
                "Modern, AI-powered operations across leasing, admin, and maintenance",
              href: "/centralization",
            },
            {
              title: "Owner Operators and Fee Managers",
              description: "AI automation for property management companies",
              href: "/property-managers",
            },
            {
              title: "Owners",
              description: "AI automation for ownership groups",
              href: "/owners",
            },
          ],
        ],
      },
      {
        title: "SERVICES",
        columns: [
          [
            {
              title: "Centralized Services",
              description:
                "Design, implement, and scale centralized operating models",
              href: "/centralization",
            },
            {
              title: "Consulting Services",
              description: "Solve core business needs with EliseAI expertise",
              href: "/services/consulting",
            },
            {
              title: "Mystery Shopping",
              description: "Find out how well your teams answer calls",
              href: "/services/mystery-shop",
            },
            {
              title: "Try VoiceAI",
              description: "Call Elise to answer your leasing questions",
              href: "/meetelise",
            },
          ],
        ],
      },
    ],
  },

  "AI for Healthcare": {
    variant: "split",
    left: [
      {
        title: "PRODUCTS",
        columns: [
          [
            {
              title: "Platform Overview",
              description: "See how EliseAI powers healthcare practices",
              href: "/healthai",
            },
            {
              title: "VoiceAI",
              description:
                "Handle patient calls with intelligent voice automation",
              href: "/health/voiceai",
            },
            {
              title: "Online Scheduling",
              description:
                "Book verified, correctly routed appointments from your website",
              href: "/health/online-scheduling",
            },
            {
              title: "Outbound Calling",
              description:
                "Personalized appointment recall, reminders, waitlist management and more",
              href: "/health/outbound-calling",
            },
          ],
        ],
      },
      {
        title: "RESOURCES",
        columns: [
          [
            {
              title: "Customer Stories",
              description:
                "Explore real-world success stories straight from EliseAI customers",
              href: "/health/customer-stories",
            },
          ],
        ],
      },
    ],
    right: {
      kind: "links",
      background: "gray",
      section: {
        title: "SPECIALTIES",
        columns: [
          [
            {
              title: "Women's Health",
              description: "AI solutions tailored for OB/GYN care",
              href: "/health/womens-health",
            },
            {
              title: "Dermatology",
              description:
                "Improve dermatology workflows with smart automation",
              href: "/health/dermatology",
            },
          ],
          [
            {
              title: "Ophthalmology",
              description: "Enhance patient care in eye health with AI",
              href: "/health/ophthalmology",
            },
            {
              title: "Orthopedic",
              description: "Streamline orthopedic operations with EliseAI",
              href: "/health/orthopedic",
            },
          ],
        ],
      },
    },
  },

  Resources: {
    variant: "split",
    left: [
      {
        title: "RESOURCES",
        columns: [
          [
            {
              title: "Blog",
              description:
                "Stay up-to-date with EliseAI and industry news and trends",
              href: "/blog",
            },
            {
              title: "Customer Stories",
              description:
                "Explore real-world success stories straight from EliseAI customers",
              href: "/customer-stories",
            },
            {
              title: "Content Library",
              description: "Reports, guides, testimonials, podcasts & more",
              href: "/content-library",
            },
            {
              title: "Newsroom",
              description:
                "Features in leading publications covering AI and real estate innovation",
              href: "/newsroom",
            },
            {
              title: "In Good Company Podcast",
              description:
                "Real talk with leaders building the future of multifamily",
              href: "/podcast",
            },
          ],
        ],
      },
      {
        title: "EVENTS",
        columns: [
          [
            {
              title: "Webinars",
              description:
                "Learn about the latest industry trends and EliseAI product updates",
              href: "/webinars",
            },
            {
              title: "Live Events",
              description:
                "Meet with us across the country at various conferences and summits",
              href: "/events",
            },
            {
              title: "EliseNOW",
              description:
                "See what's next in property management in one hour with live demos and customer stories",
              href: "/now",
            },
          ],
        ],
      },
    ],
    right: {
      kind: "cards",
      background: "gray",
      title: "LATEST POSTS",
      cards: [
        {
          category: "BLOG",
          title: "Centralization Playbook 2026: What's New in This Edition",
          imageUrl:
            "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/689633e9c6cff4bc81232cbd_maintenance-app.avif",
          href: "/blog/centralization-playbook-2026-edition",
        },
        {
          category: "EVENTS",
          title: "Where operators master the full potential of multifamily AI",
          imageUrl:
            "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/68b87a60d9bdd8c981911a8a_Hero-Block%20(1)%20(1).avif",
          href: "/elise-beyond",
        },
      ],
    },
  },

  Company: {
    variant: "split",
    left: [
      {
        title: "ABOUT US",
        columns: [
          [
            {
              title: "About Us",
              description:
                "Learn about what drives us and where EliseAI is headed",
              href: "/about",
            },
            {
              title: "Careers",
              description:
                "Find open roles to help us reinvent housing and healthcare",
              href: "/careers",
            },
          ],
          [
            {
              title: "Engineering & Research",
              description:
                "See how our unique engineering culture sets us apart",
              href: "/engineering",
            },
            {
              title: "Contact Us",
              description: "Get in touch with the EliseAI team",
              href: "/contact",
            },
          ],
        ],
      },
    ],
    right: {
      kind: "cta",
      background: "dark",
      cta: {
        title: "Interested in Our Product?",
        description:
          "Contact us to discuss becoming a customer & finding solutions that meet your unique needs.",
        ctaText: "Talk to Sales",
        ctaHref: "/demo",
        // No default graphic — falls back to the CSS decorative diamond.
        // Supply a (text-free) graphic via the "Company CTA Image" prop in Webflow.
      },
    },
  },
};
