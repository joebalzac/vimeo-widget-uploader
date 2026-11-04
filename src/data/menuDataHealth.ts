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
              href: "/",
            },
            {
              title: "VoiceAI",
              description:
                "Handle patient calls with intelligent voice automation",
              href: "/voiceai",
            },
            {
              title: "Online Scheduling",
              description:
                "Book verified, correctly routed appointments from your website",
              href: "/online-scheduling",
            },
            {
              title: "Outbound Calling",
              description:
                "Personalized appointment recall, reminders, waitlist management and more",
              href: "/outbound-calling",
            },
          ],
          [
            {
              title: "Billing & Payments",
              description: "Billing questions answered. Payments collected",
              href: "/billing-payments",
            },
            {
              title: "Patient Intake",
              description:
                "Collect patient forms, verify coverage, and prepare every chart before the visit",
              href: "/patient-intake",
            },
            {
              title: "Referrals",
              description:
                "Capture every incoming referral and convert it into a booked appointment, automatically",
              href: "/referrals",
            },
          ],
        ],
      },
    ],
    right: {
      kind: "links",
      background: "gray",
      sections: [
        {
          title: "SPECIALTIES",
          columns: [
            [
              {
                title: "Women's Health",
                description: "AI solutions tailored for OB/GYN care",
                href: "/womens-health",
              },
              {
                title: "Dermatology",
                description:
                  "Improve dermatology workflows with smart automation",
                href: "/dermatology",
              },
              {
                title: "Orthopedic",
                description: "Streamline orthopedic operations with EliseAI",
                href: "/orthopedic",
              },
            ],
            [
              {
                title: "Ophthalmology",
                description: "Enhance patient care in eye health with AI",
                href: "/ophthalmology",
              },
              {
                title: "Primary Care",
                description: "Automating bookings, calls, collections, recalls",
                href: "/primary-care",
              },
            ],
          ],
        },
      ],
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
          ],
          [
            {
              title: "Customer Stories",
              description:
                "Explore real-world success stories straight from EliseAI customers",
              href: "/customer-stories",
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
          category: "Blog",
          title: "Patient Guide for AI in Healthcare",
          imageUrl:
            "https://cdn.prod.website-files.com/6a5d770c1dbe3179dcc6a62b/6aa9f3d76e90a92960b34795_6aa824b8b05551d9339a5e18_69fe63f339aed055bbe65003_Guide_HowToTalkToYourPatientsAboutAI_Thumbnail_05072025.png",
          mobileImageUrl:
            "https://cdn.prod.website-files.com/6a5d770c1dbe3179dcc6a62b/6aa9f3d76e90a92960b34795_6aa824b8b05551d9339a5e18_69fe63f339aed055bbe65003_Guide_HowToTalkToYourPatientsAboutAI_Thumbnail_05072025.png",
          href: "/blog/patient-guide-for-ai-in-healthcare",
        },
        {
          category: "Blog",
          title: "How OutboundAI Helps Healthcare Practices Improve Provider Utilization",
          imageUrl: "https://cdn.prod.website-files.com/6a5d770c1dbe3179dcc6a62b/6ac7f737341a999a78149425_Blog_How%20OutboundAI%20Helps%20Healthcare%20Practices_Cover.avif",
          mobileImageUrl: "https://cdn.prod.website-files.com/6a5d770c1dbe3179dcc6a62b/6ac7f737341a999a78149425_Blog_How%20OutboundAI%20Helps%20Healthcare%20Practices_Cover.avif",
          href: "health.eliseai.com/blog/outboundai-provider-utilization-improvement",
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
              href: "https://eliseai.com/about-us",
            },
            {
              title: "Careers",
              description:
                "Find open roles to help us reinvent housing and healthcare",
              href: "https://eliseai.com/careers",
            },
          ],
          [
            {
              title: "Engineering & Research",
              description:
                "See how our unique engineering culture sets us apart",
              href: "https://eliseai.com/engineering",
            },
            {
              title: "Contact Us",
              description: "Get in touch with the EliseAI team",
              href: "/book-a-demo",
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
