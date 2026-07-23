import { Navbar } from "./Navbar";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Navbar, {
  name: "EliseAI Navbar",
  description:
    "Responsive EliseAI navbar. Transparent + blur over the hero, solid white after. Light or dark text theme.",
  group: "Navigation",
  props: {
    logoImageUrl: props.Text({
      name: "Logo Image URL",
      defaultValue:
        "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/63cc1eef179b051c8e0659d0_EliseAI.svg",
    }),
    logoHref: props.Text({
      name: "Logo Link",
      defaultValue: "/",
    }),
    navItems: props.Text({
      name: "Navigation Items (JSON)",
      defaultValue: JSON.stringify([
        {
          label: "AI for Property Management",
          href: "/property-management",
          isExternal: false,
        },
        {
          label: "AI for Healthcare",
          href: "/healthcare",
          isExternal: false,
        },
        { label: "Resources", href: "/resources", isExternal: false },
        { label: "Company", href: "/company", isExternal: false },
      ]),
    }),
    ctaText: props.Text({
      name: "CTA Button Text",
      defaultValue: "Request Demo",
    }),
    ctaHref: props.Text({
      name: "CTA Button Link",
      defaultValue: "/demo",
    }),
    loginText: props.Text({
      name: "Login Link Text",
      defaultValue: "Log In",
    }),
    loginHref: props.Text({
      name: "Login Link",
      defaultValue: "/login",
    }),

    // ===== Resources → "Latest Posts" (editable in Webflow) =====
    latestPost1Image: props.Image({
      name: "Latest Post 1 Image",
    }),
    latestPost1Category: props.Text({
      name: "Latest Post 1 Category",
      defaultValue: "BLOG",
    }),
    latestPost1Title: props.Text({
      name: "Latest Post 1 Title",
      defaultValue: "Centralization Playbook 2026: What's New in This Edition",
    }),
    latestPost1Href: props.Text({
      name: "Latest Post 1 Link",
      defaultValue: "/blog/centralization-playbook-2026",
    }),
    latestPost2Image: props.Image({
      name: "Latest Post 2 Image",
    }),
    latestPost2Category: props.Text({
      name: "Latest Post 2 Category",
      defaultValue: "EVENTS",
    }),
    latestPost2Title: props.Text({
      name: "Latest Post 2 Title",
      defaultValue: "Where operators master the full potential of multifamily AI",
    }),
    latestPost2Href: props.Text({
      name: "Latest Post 2 Link",
      defaultValue: "/events/elise-beyond",
    }),

    // ===== Company → CTA card graphic (editable in Webflow) =====
    companyCtaImage: props.Image({
      name: "Company CTA Image",
    }),

    // ===== Appearance =====
    theme: props.Variant({
      name: "Theme",
      options: ["light", "dark"],
      defaultValue: "light",
    }),
    heroSectionId: props.Text({
      name: "Hero Section ID",
      defaultValue: "heroSection",
    }),
  },
});
