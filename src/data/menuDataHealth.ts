import type { MegaMenuData } from "./menuData";

export const menuDataHealth: Record<string, MegaMenuData> = {
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
          ],
          [
            {
              title: "Outbound Calling",
              description:
                "Personalized appointment recall, reminders, waitlist management and more",
              href: "/health/outbound-calling",
            },
            {
              title: "Billing & Payments",
              description: "Billing questions answered. Payments collected",
              href: "/health/billing-payments",
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
            {
              title: "Orthopedic",
              description: "Streamline orthopedic operations with EliseAI",
              href: "/health/orthopedic",
            },
          ],
          [
            {
              title: "Ophthalmology",
              description: "Enhance patient care in eye health with AI",
              href: "/health/ophthalmology",
            },
            {
              title: "Primary Care",
              description: "Automating bookings, calls, collections, recalls",
              href: "/health/primary-care",
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
              href: "/health/blog",
            },
          ],
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
      kind: "cards",
      background: "gray",
      title: "LATEST POSTS",
      cards: [
        {
          category: "BLOG",
          title: "Placeholder: How AI is transforming patient scheduling",
          href: "#",
        },
        {
          category: "BLOG",
          title: "Placeholder: Latest from the EliseAI healthcare blog",
          href: "#",
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
              href: "/about-us",
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
        imageUrl:
          "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a62813757a5937d710c44e9_company-cta.avif",
        mobileImageUrl:
          "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a628469766729e54dcdbcd7_company-cta-mobile.avif",
      },
    },
  },
};
