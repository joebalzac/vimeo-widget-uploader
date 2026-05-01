export interface MenuItem {
  title: string;
  description: string;
  isSubheading?: boolean;
  imageUrl?: string; // For featured content cards
  category?: string; // For "BLOG", "EVENTS" labels
  href?: string; // Optional explicit link override
}

export interface MenuColumn {
  title: string;
  items: MenuItem[];
  hasGrayBackground?: boolean; // For THE LATEST section with gray background
  isTwoColumnGrid?: boolean; // For THE LATEST content grid
}

export interface MegaMenuData {
  columns: MenuColumn[];
}

export const menuData: Record<string, MegaMenuData> = {
  "AI for Property Management": {
    columns: [
      {
        title: "PLATFORM",
        items: [
          {
            title: "Platform Overview",
            description: "Automating leasing & resident operations",
          },
          {
            title: "EliseCRM",
            description: "Centralize contacts, conversations, & insights",
          },
          {
            title: "VoiceAI",
            description: "Answer every prospect & resident inquiry",
          },
          {
            title: "Lease Audits",
            description: "Find revenue leaks & compliance gaps",
          },
        ],
      },
      {
        title: "LEASINGAI",
        items: [
          {
            title: "Prospect Management",
            description: "Capture, nurture, & convert prospects",
          },
          {
            title: "AI-Guided Tours",
            description: "Self-guided tours that convert 24/7",
          },
          { title: "RESIDENTAI", description: "", isSubheading: true },
          {
            title: "Maintenance",
            description: "Automate repairs from request to resolution",
          },
          {
            title: "Maintenance App",
            description: "Mobile work orders & assignments for techs",
          },
          { title: "Renewals", description: "Predict, engage, & renew" },
          {
            title: "Delinquency",
            description: "Reduce late payments & boost cash flow",
          },
        ],
      },
      {
        title: "ASSETS",
        items: [
          {
            title: "Conventional",
            description: "Low, mid, & high-rise apartment complexes",
          },
          {
            title: "Student Housing",
            description: "Off-campus & purpose-built student housing",
          },
          {
            title: "Affordable",
            description: "Subsidized & regulated housing types",
          },
          {
            title: "Single-Family",
            description: "Detached, stand-alone homes",
          },
        ],
      },
      {
        title: "SOLUTIONS",
        items: [
          {
            title: "Centralized Leasing Operations",
            description: "Centralized leasing across every property",
          },
          { title: "PMCs", description: "AI automation for PMCs" },
          {
            title: "Owners",
            description: "AI automation for ownership groups",
          },
        ],
      },
      {
        title: "SERVICES",
        items: [
          {
            title: "Mystery Shopping",
            description: "Find out how well your teams answer calls",
          },
          {
            title: "Consulting Services",
            description: "Solve core business needs with EliseAI",
          },
          {
            title: "Try VoiceAI",
            description: "Call Elise to answer your leasing questions",
          },
        ],
      },
    ],
  },
  "AI for Healthcare": {
    columns: [
      {
        title: "PRODUCTS",
        isTwoColumnGrid: true,
        items: [
          {
            title: "Platform Overview",
            description: "See how EliseAI powers healthcare practices",
            href: "/platform-overview",
          },
          {
            title: "VoiceAI",
            description:
              "Handle patient calls with intelligent voice automation",
          },
        ],
      },
      {
        title: "SPECIALTIES",
        hasGrayBackground: true,
        isTwoColumnGrid: true,
        items: [
          {
            title: "Women's Health",
            description: "AI solutions tailored for OB/GYN care",
          },
          {
            title: "Dermatology",
            description: "Improve dermatology workflows with smart automation",
          },
          {
            title: "Ophthalmology",
            description: "Enhance patient care in eye health with AI",
          },
          {
            title: "Orthopedic",
            description: "Streamline orthopedic operations with EliseAI",
          },
        ],
      },
    ],
  },
  Resources: {
    columns: [
      {
        title: "RESOURCES",
        items: [
          {
            title: "Blog",
            description:
              "Stay up-to-date with EliseAI and industry news and trends",
          },
          {
            title: "Customer Stories",
            description:
              "Explore real-world success stories straight from EliseAI customers",
          },
          {
            title: "Content Library",
            description: "Reports, guides, testimonials, podcasts & more",
          },
          {
            title: "Newsroom",
            description:
              "Features in leading publications covering AI and real estate innovation",
          },
        ],
      },
      {
        title: "EVENTS",
        items: [
          {
            title: "Webinars",
            description:
              "Learn about the latest industry trends and EliseAI product updates",
          },
          {
            title: "Live Events",
            description:
              "Meet with us across the country at various conferences and summits",
          },
        ],
      },
      {
        title: "THE LATEST",
        hasGrayBackground: true, // This column will have light gray background
        isTwoColumnGrid: true, // Content will be displayed in 2-column grid
        items: [
          {
            // LEFT CARD - Blog Post
            title:
              "What's New in EliseAI's Maintenance App: Unit Turns, Vendor Management, and More",
            description: "BLOG",
            category: "BLOG",
            imageUrl:
              "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/689633e9c6cff4bc81232cbd_maintenance-app.avif",
          },
          {
            // RIGHT CARD - Event
            title:
              "EliseAI's Executive Leadership Conference series brings top multifamily leaders together",
            description: "EVENTS",
            category: "EVENTS",
            imageUrl:
              "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/68b87a60d9bdd8c981911a8a_Hero-Block%20(1)%20(1).avif",
          },
        ],
      },
    ],
  },
  Company: {
    columns: [
      {
        title: "ABOUT US",
        isTwoColumnGrid: true,
        items: [
          {
            title: "About Us",
            description:
              "Learn about what drives us and where EliseAI is headed",
          },
          {
            title: "Careers",
            description:
              "Find open roles to help us reinvent housing and healthcare",
          },
          {
            title: "Engineering & Research",
            description: "See how our unique engineering culture sets us apart",
          },
          {
            title: "Contact Us",
            description: "Get in touch with the EliseAI team",
          },
        ],
      },
      {
        title: "WHY ELISEAI?",
        hasGrayBackground: true,
        isTwoColumnGrid: true,
        items: [
          {
            imageUrl:
              "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/690bb8b3da93e3cd893e2ba7_cta-nav-image%20(1).avif",
            title: "",
            description: "",
          },
        ],
      },
    ],
  },
};
