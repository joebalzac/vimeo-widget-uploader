import { useState } from "react";
import { menuData, type MenuItem } from "../data/menuData";
import "../index.css";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface NavbarProps {
  logoImageUrl: string;
  logoHref: string;
  navItems: NavItem[] | string;
  ctaText: string;
  ctaHref: string;
  loginText: string;
  loginHref: string;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getItemHref = (item: MenuItem) => {
  if (item.href) return item.href;
  if (item.title) {
    return `/${slugify(item.title)}`;
  }
  return "#";
};

export const Navbar = ({
  logoImageUrl,
  logoHref,
  navItems,
  ctaText,
  ctaHref,
  loginText,
  loginHref,
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  // Parse navItems if it's a JSON string
  const parsedNavItems =
    typeof navItems === "string" ? JSON.parse(navItems) : navItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMouseEnter = (itemLabel: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredItem(itemLabel);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHoveredItem(null);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-transparent backdrop-blur-sm">
      <div
        className="flex items-center gap-[74px] self-stretch"
        style={{
          borderBottom: "1px solid #EAEAED",
          padding: "0px 56px",
        }}
      >
        {/* Logo */}
        <a href={logoHref} className="flex items-center">
          <img src={logoImageUrl} alt="EliseAI Logo" className="h-8 w-auto" />
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <ul className="flex items-center gap-8 list-none m-0">
            {parsedNavItems.map((item: NavItem, index: number) => (
              <li
                key={index}
                className={`flex items-center group relative transition-colors duration-200 py-7 cursor-pointer border-b-2 ${
                  hoveredItem === item.label
                    ? "border-[#7638FA]"
                    : "border-transparent"
                }`}
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => handleMouseEnter(item.label, e)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={item.href}
                  className="text-gray-900 hover:text-gray-700 transition-colors duration-200 no-underline hover:no-underline cursor-pointer"
                  style={{ cursor: "pointer" }}
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </a>
                <svg
                  className="ml-1 h-3 w-3 text-gray-500 transition-colors duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </li>
            ))}
          </ul>

          {/* Right side - Login Link and CTA Button */}
          <div className="flex items-center gap-6">
            {/* Login Link */}
            <a
              href={loginHref}
              className="text-[#7638FA] hover:text-[#5a2bc7] font-medium transition-colors duration-200 no-underline flex items-center"
            >
              {loginText}
              <svg
                className="ml-1 h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>

            {/* CTA Button */}
            <a
              href={ctaHref}
              className="bg-[#7638FA] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#5a2bc7] transition-colors duration-200 no-underline"
            >
              {ctaText}
            </a>
          </div>
        </div>

        {/* Mega Menu */}
        {hoveredItem && menuData[hoveredItem] && (
          <div
            className="absolute top-full left-0 w-full bg-white shadow-lg z-40 transition-opacity duration-300 ease-in-out opacity-100"
            onMouseEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHoveredItem(hoveredItem);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {/* Special layout for menus with gray background section: white left, gray right */}
            {hoveredItem &&
            menuData[hoveredItem]?.columns.some(
              (col) => col.hasGrayBackground,
            ) ? (
              <div className="flex w-full">
                {/* LEFT SIDE - White background (RESOURCES and EVENTS columns) */}
                <div
                  className="flex-1 bg-white"
                  style={{ padding: "40px 24px 40px 24px" }}
                >
                  <div
                    className={`grid gap-8 ${
                      menuData[hoveredItem].columns.filter(
                        (col) => !col.hasGrayBackground,
                      ).length === 1
                        ? "grid-cols-1"
                        : "grid-cols-2"
                    }`}
                  >
                    {menuData[hoveredItem].columns
                      .filter((col) => !col.hasGrayBackground)
                      .map((column, columnIndex) => (
                        <div key={columnIndex}>
                          <h3 className="text-[#7638FA] font-semibold text-xs pl-4 mb-4">
                            {column.title}
                          </h3>
                          {column.isTwoColumnGrid ? (
                            /* Two-column grid layout for items */
                            <div className="grid grid-cols-2">
                              {column.items.map((item, itemIndex) => (
                                <a
                                  key={itemIndex}
                                  href={getItemHref(item)}
                                  className="block group hover:bg-[#f5f5f7] py-3 px-4 transition-colors duration-200"
                                >
                                  <div className="font-semibold text-gray-900 transition-colors duration-200 text-sm">
                                    {item.title}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </div>
                                </a>
                              ))}
                            </div>
                          ) : (
                            /* Vertical list layout for items */
                            <ul className="space-y-3">
                              {column.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <a
                                    href={getItemHref(item)}
                                    className="block group hover:bg-[#eaeaed] py-3 px-4 transition-colors duration-200"
                                  >
                                    <div className="font-semibold text-gray-900 transition-colors duration-200 text-sm">
                                      {item.title}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {item.description}
                                    </div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* RIGHT SIDE - Light gray background (THE LATEST section) */}
                <div
                  className="flex-1 bg-[#fafafa]"
                  style={{ padding: "40px 24px 40px 24px" }}
                >
                  {menuData[hoveredItem].columns
                    .filter((col) => col.hasGrayBackground)
                    .map((column, columnIndex) => (
                      <div key={columnIndex}>
                        <h3 className="text-[#7638FA] font-semibold text-xs uppercase mb-4 pl-3">
                          {column.title}
                        </h3>
                        {/* TWO COLUMN GRID FOR FEATURED CONTENT CARDS */}
                        <div
                          className={`grid  ${
                            column.items.length === 1
                              ? "grid-cols-1"
                              : "grid-cols-2"
                          }`}
                        >
                          {column.items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={getItemHref(item)}
                              className="block overflow-hidden py-3 px-4 hover:bg-gray-100 transition-colors duration-200"
                            >
                              {/* ADD YOUR IMAGE HERE */}
                              {item.imageUrl && (
                                <div className="w-full h-48 bg-gray-200 overflow-hidden">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title || "Content image"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {/* Only show text content if title or category exists */}
                              {(item.title ||
                                item.category ||
                                item.description) && (
                                <div>
                                  {/* For featured content cards (with category or imageUrl), show category/description first */}
                                  {item.imageUrl || item.category ? (
                                    <>
                                      {(item.category || item.description) && (
                                        <div className="text-xs text-gray-500 uppercase mb-2">
                                          {item.category || item.description}
                                        </div>
                                      )}
                                      {item.title && (
                                        <div className="font-semibold text-gray-900 text-sm leading-tight">
                                          {item.title}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    /* For regular menu items, show title first, then description */
                                    <>
                                      {item.title && (
                                        <div className="font-semibold text-gray-900 text-sm leading-tight">
                                          {item.title}
                                        </div>
                                      )}
                                      {item.description && (
                                        <div className="text-sm text-gray-600 mt-1">
                                          {item.description}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              /* Standard layout for other menus */
              <div
                className="flex flex-col items-start flex-1"
                style={{
                  padding: "40px 24px 40px 24px",
                }}
              >
                <div
                  className={`grid w-full  ${
                    menuData[hoveredItem].columns.length === 1
                      ? "grid-cols-1"
                      : menuData[hoveredItem].columns.length === 2
                      ? "grid-cols-2"
                      : menuData[hoveredItem].columns.length === 3
                      ? "grid-cols-3"
                      : "grid-cols-5"
                  }`}
                >
                  {menuData[hoveredItem].columns.map((column, columnIndex) => (
                    <div key={columnIndex}>
                      <h3 className="text-[#7638FA] font-semibold text-xs  pl-4 mb-4">
                        {column.title}
                      </h3>
                      <ul className="space-y-3">
                        {column.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            {item.isSubheading ? (
                              <h4 className="text-[#7638FA] font-semibold text-xs uppercase pl-4">
                                {item.title}
                              </h4>
                            ) : (
                              <a
                                href={getItemHref(item)}
                                className="block group hover:bg-gray-100 py-3 px-4 hover:text-gray-700 transition-colors duration-200"
                              >
                                <div className="font-semibold text-gray-900 transition-colors duration-200 text-sm">
                                  {item.title}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {item.description}
                                </div>
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden bg-transparent border-none text-gray-900 text-2xl cursor-pointer"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`${
          isMobileMenuOpen ? "flex" : "hidden"
        } lg:hidden flex-col bg-white/95 backdrop-blur-sm shadow-lg px-6 py-4`}
      >
        {parsedNavItems.map((item: NavItem, index: number) => (
          <a
            key={index}
            href={item.href}
            className="text-gray-900 font-medium py-3 hover:text-gray-700 transition-colors duration-200 no-underline"
            target={item.isExternal ? "_blank" : undefined}
            rel={item.isExternal ? "noopener noreferrer" : undefined}
          >
            {item.label}
          </a>
        ))}
        <a
          href={loginHref}
          className="text-[#7638FA] hover:text-[#5a2bc7] font-medium py-3 transition-colors duration-200 no-underline"
        >
          {loginText}
        </a>
        <a
          href={ctaHref}
          className="bg-[#7638FA] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a2bc7] transition-colors duration-200 no-underline text-center mt-2"
        >
          {ctaText}
        </a>
      </div>
    </nav>
  );
};
