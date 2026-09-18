import { Navbar, type NavbarProps } from "./Navbar";
import { menuDataHealth } from "../data/menuDataHealth";

const DEFAULT_HEALTH_NAV_ITEMS = [
  { label: "AI for Healthcare", href: "/healthcare" },
  { label: "Resources", href: "/resources" },
  { label: "Company", href: "/company" },
];

/** Healthcare-site navbar. Same look/feel as Navbar — different menus only. */
export const NavbarHealth = (
  props: Omit<NavbarProps, "menus" | "defaultNavItems">,
) => (
  <Navbar
    {...props}
    menus={menuDataHealth}
    defaultNavItems={DEFAULT_HEALTH_NAV_ITEMS}
  />
);
