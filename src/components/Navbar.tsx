import { useState } from "react";
import { menuData, type MenuItem } from "../data/menuData";
import "./Navbar.css";

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
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const parsedNavItems =
    typeof navItems === "string" ? JSON.parse(navItems) : navItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileSubmenu(null);
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
    <nav className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <a href={logoHref} className="navbar__logo">
          <img src={logoImageUrl} alt="EliseAI Logo" className="navbar__logo-img" />
        </a>

        {/* Desktop Navigation */}
        <div className="navbar__desktop">
          <ul className="navbar__nav-list">
            {parsedNavItems.map((item: NavItem, index: number) => (
              <li
                key={index}
                className={`navbar__nav-item${hoveredItem === item.label ? " navbar__nav-item--active" : ""}`}
                onMouseEnter={(e) => handleMouseEnter(item.label, e)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={item.href}
                  className="navbar__nav-link"
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </a>
                <svg
                  className="navbar__chevron"
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
          <div className="navbar__actions">
            <a href={loginHref} className="navbar__login">
              {loginText}
              <svg
                className="navbar__login-chevron"
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

            <a href={ctaHref} className="navbar__cta">
              {ctaText}
            </a>
          </div>
        </div>

        {/* Mega Menu */}
        {hoveredItem && menuData[hoveredItem] && (
          <div
            className="navbar__mega-menu"
            onMouseEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHoveredItem(hoveredItem);
            }}
            onMouseLeave={handleMouseLeave}
          >
            {menuData[hoveredItem]?.columns.some((col) => col.hasGrayBackground) ? (
              <div className="navbar__mega-split">
                {/* LEFT SIDE - White background */}
                <div className="navbar__mega-split-left">
                  <div
                    className={`navbar__mega-grid navbar__mega-grid--gap ${
                      menuData[hoveredItem].columns.filter(
                        (col) => !col.hasGrayBackground,
                      ).length === 1
                        ? "navbar__mega-grid--cols-1"
                        : "navbar__mega-grid--cols-2"
                    }`}
                  >
                    {menuData[hoveredItem].columns
                      .filter((col) => !col.hasGrayBackground)
                      .map((column, columnIndex) => (
                        <div key={columnIndex}>
                          <h3 className="navbar__section-title">{column.title}</h3>
                          {column.isTwoColumnGrid ? (
                            <div className="navbar__mega-grid navbar__mega-grid--cols-2">
                              {column.items.map((item, itemIndex) => (
                                <a
                                  key={itemIndex}
                                  href={getItemHref(item)}
                                  className="navbar__menu-link navbar__menu-link--light-hover"
                                >
                                  <div className="navbar__menu-item-title">{item.title}</div>
                                  <div className="navbar__menu-item-desc">{item.description}</div>
                                </a>
                              ))}
                            </div>
                          ) : (
                            <ul className="navbar__menu-list">
                              {column.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <a
                                    href={getItemHref(item)}
                                    className="navbar__menu-link navbar__menu-link--mid-hover"
                                  >
                                    <div className="navbar__menu-item-title">{item.title}</div>
                                    <div className="navbar__menu-item-desc">{item.description}</div>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* RIGHT SIDE - Light gray background */}
                <div className="navbar__mega-split-right">
                  {menuData[hoveredItem].columns
                    .filter((col) => col.hasGrayBackground)
                    .map((column, columnIndex) => (
                      <div key={columnIndex}>
                        <h3 className="navbar__section-title navbar__section-title--uppercase">
                          {column.title}
                        </h3>
                        <div
                          className={`navbar__mega-grid ${
                            column.items.length === 1
                              ? "navbar__mega-grid--cols-1"
                              : "navbar__mega-grid--cols-2"
                          }`}
                        >
                          {column.items.map((item, itemIndex) => (
                            <a
                              key={itemIndex}
                              href={getItemHref(item)}
                              className="navbar__featured-link"
                            >
                              {item.imageUrl && (
                                <div className="navbar__featured-img-wrap">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title || "Content image"}
                                    className="navbar__featured-img"
                                  />
                                </div>
                              )}
                              {(item.title || item.category || item.description) && (
                                <div>
                                  {item.imageUrl || item.category ? (
                                    <>
                                      {(item.category || item.description) && (
                                        <div className="navbar__featured-category">
                                          {item.category || item.description}
                                        </div>
                                      )}
                                      {item.title && (
                                        <div className="navbar__featured-title">{item.title}</div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      {item.title && (
                                        <div className="navbar__featured-title">{item.title}</div>
                                      )}
                                      {item.description && (
                                        <div className="navbar__menu-item-desc">{item.description}</div>
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
              <div className="navbar__mega-standard">
                <div
                  className={`navbar__mega-grid ${
                    menuData[hoveredItem].columns.length === 1
                      ? "navbar__mega-grid--cols-1"
                      : menuData[hoveredItem].columns.length === 2
                      ? "navbar__mega-grid--cols-2"
                      : menuData[hoveredItem].columns.length === 3
                      ? "navbar__mega-grid--cols-3"
                      : "navbar__mega-grid--cols-5"
                  }`}
                >
                  {menuData[hoveredItem].columns.map((column, columnIndex) => (
                    <div key={columnIndex}>
                      <h3 className="navbar__section-title">{column.title}</h3>
                      <ul className="navbar__menu-list">
                        {column.items.map((item, itemIndex) => (
                          <li key={itemIndex}>
                            {item.isSubheading ? (
                              <h4 className="navbar__subheading">{item.title}</h4>
                            ) : (
                              <a
                                href={getItemHref(item)}
                                className="navbar__menu-link navbar__menu-link--gray-hover"
                              >
                                <div className="navbar__menu-item-title">{item.title}</div>
                                <div className="navbar__menu-item-desc">{item.description}</div>
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
          className="navbar__mobile-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile-menu navbar__mobile-menu--open">
          {mobileSubmenu && menuData[mobileSubmenu] ? (
            /* Submenu drill-down view */
            <>
              <div className="navbar__mobile-header">
                <button
                  className="navbar__mobile-back"
                  onClick={() => setMobileSubmenu(null)}
                >
                  ← Back
                </button>
                <button
                  className="navbar__mobile-btn navbar__mobile-btn--inline"
                  onClick={toggleMobileMenu}
                  aria-label="Close menu"
                >
                  ☰
                </button>
              </div>

              {menuData[mobileSubmenu].columns.map((column, colIndex) => (
                <div key={colIndex} className="navbar__mobile-section">
                  {column.title && (
                    <div className="navbar__mobile-section-title">{column.title}</div>
                  )}
                  {column.items.map((item, itemIndex) => (
                    item.isSubheading ? null : (
                      <a
                        key={itemIndex}
                        href={getItemHref(item)}
                        className="navbar__mobile-item"
                      >
                        <div className="navbar__mobile-item-title">{item.title}</div>
                        {item.description && (
                          <div className="navbar__mobile-item-desc">{item.description}</div>
                        )}
                      </a>
                    )
                  ))}
                  {colIndex < menuData[mobileSubmenu].columns.length - 1 && (
                    <hr className="navbar__mobile-divider" />
                  )}
                </div>
              ))}

              <a href={ctaHref} className="navbar__mobile-cta">{ctaText}</a>
              <a href={loginHref} className="navbar__mobile-login">
                {loginText} →
              </a>
            </>
          ) : (
            /* Top-level mobile nav */
            <>
              {parsedNavItems.map((item: NavItem, index: number) => (
                menuData[item.label] ? (
                  <button
                    key={index}
                    className="navbar__mobile-link navbar__mobile-link--drill"
                    onClick={() => setMobileSubmenu(item.label)}
                  >
                    {item.label}
                    <span className="navbar__mobile-link-arrow">›</span>
                  </button>
                ) : (
                  <a
                    key={index}
                    href={item.href}
                    className="navbar__mobile-link"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.label}
                  </a>
                )
              ))}
              <a href={ctaHref} className="navbar__mobile-cta">{ctaText}</a>
              <a href={loginHref} className="navbar__mobile-login">
                {loginText} →
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
