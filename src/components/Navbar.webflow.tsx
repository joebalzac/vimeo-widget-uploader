import { Navbar } from "./Navbar";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Navbar, {
  name: "EliseAI Navbar",
  description:
    "A responsive navbar matching EliseAI design with logo, navigation, login, and CTA",
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
  },
});
