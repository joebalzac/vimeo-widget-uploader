import { Navbar } from "./Navbar";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

interface AdapterProps {
  logoHref?: string;
  navItems?: string;
  ctaText?: string;
  ctaHref?: string;
  loginText?: string;
  loginHref?: string;
  /** Webflow boolean — true = white text/logo over a dark hero (local `theme="dark"`). */
  darkMode?: boolean;
  /** Webflow boolean — true = offset nav 3.2rem for a top CTA/announcement banner. */
  ctaBannerOnTop?: boolean;
  heroSectionId?: string;
}

function NavbarAdapter({ darkMode = false, ...rest }: AdapterProps) {
  return <Navbar {...rest} theme={darkMode ? "dark" : "light"} />;
}

export default declareComponent(NavbarAdapter, {
  name: "EliseAI Navbar",
  description:
    "Responsive EliseAI navbar. Transparent + blur over the hero, solid white after. Toggle Dark mode for white text/logo over a dark hero. Mega-menu images/copy are hardcoded in menuData.ts.",
  group: "Navigation",
  props: {
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

    // ===== Appearance =====
    darkMode: props.Boolean({
      name: "Dark mode",
      defaultValue: false,
      tooltip:
        "On: white logo/links over a dark hero (same as local theme=\"dark\"). Off: dark text (default light theme). Pair with a hero that has the Hero Section ID below.",
    }),
    ctaBannerOnTop: props.Boolean({
      name: "CTA Banner on top",
      defaultValue: false,
      tooltip:
        "On: adds 3.2rem margin-top so the fixed navbar sits below a sitewide CTA/announcement banner (desktop only — ignored on mobile).",
    }),
    heroSectionId: props.Text({
      name: "Hero Section ID",
      defaultValue: "heroSection",
      tooltip:
        'HTML id of the hero the navbar sits over (e.g. set id="heroSection" on the hero). Controls when the bar switches from transparent to solid white.',
    }),
  },
});
