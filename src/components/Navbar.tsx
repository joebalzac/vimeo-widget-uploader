import { useEffect, useRef, useState } from "react";
import {
  menuData,
  type MegaMenuData,
  type MenuSection,
  type RightPanel,
  type MenuItem,
} from "../data/menuData";
import "./Navbar.css";

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

/** Webflow Image props resolve to { src, alt }; direct usage may pass a string. */
type ImageInput = string | { src: string; alt?: string };

interface NavbarProps {
  logoImageUrl: string;
  logoHref: string;
  navItems: NavItem[] | string;
  ctaText: string;
  ctaHref: string;
  loginText: string;
  loginHref: string;
  // ----- Configurable "Latest Posts" cards (Resources menu) -----
  latestPost1Image?: ImageInput;
  latestPost1Category?: string;
  latestPost1Title?: string;
  latestPost1Href?: string;
  latestPost2Image?: ImageInput;
  latestPost2Category?: string;
  latestPost2Title?: string;
  latestPost2Href?: string;
  // ----- Configurable Company CTA graphic -----
  companyCtaImage?: ImageInput;
  // ----- Appearance -----
  /**
   * Both themes start transparent (with blur) over the hero, then become
   * solid white once past `#heroSection`.
   * - "light" = dark text while transparent
   * - "dark" = #fafafb text / white logo / white chevrons while transparent
   */
  theme?: "light" | "dark";
  /**
   * Id of the hero element the navbar sits over. Once scrolled past, the
   * navbar becomes solid white with dark text. Defaults to "heroSection".
   */
  heroSectionId?: string;
}

/** White EliseAI wordmark used on the dark/transparent bar. */
const LogoDark = () => (
  <svg
    className="navbar__logo-svg"
    xmlns="http://www.w3.org/2000/svg"
    width="61"
    height="20"
    viewBox="0 0 61 20"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M18.3629 4.20111H20.1678V19.9982H18.3629V4.20111ZM18.3629 2.6854H20.1696V0.821243H18.3629V2.6854ZM0 19.9982H11.6817V18.2699H1.8049V10.8057H9.90235V9.07747H1.80855L1.8049 1.72826H11.6817V0H0V19.9982ZM15.4092 17.9049C15.1865 17.6439 15.0734 17.3027 15.0734 16.8848V0.00364796H13.2685V16.8848C13.2685 17.7753 13.5605 18.5163 14.1445 19.1094C14.7285 19.7025 15.4603 20 16.3363 20H16.7743V18.2717H16.3363C15.9603 18.2699 15.6501 18.1495 15.4092 17.9049ZM41.4634 4.19564C37.505 4.19564 34.2967 7.73246 34.2967 12.096C34.2967 16.4595 37.505 19.9963 41.4634 19.9963C44.5422 19.9963 47.1665 17.8556 48.1812 14.8517H46.2157C45.3087 16.8683 43.4435 18.1586 41.4634 18.1586C38.6858 18.1586 36.1345 15.6164 36.1345 12.0942C36.1345 8.57195 38.684 6.02974 41.4634 6.02974C43.8906 6.02974 46.1427 7.96971 46.6737 10.8076H38.339V12.6453H48.6119C48.6228 12.4628 48.6283 12.2785 48.6283 12.0942C48.6301 7.73428 45.4218 4.19564 41.4634 4.19564ZM30.7809 11.6489C30.1276 11.408 29.414 11.1945 28.6402 11.0047C27.8664 10.8149 27.1529 10.6616 26.4995 10.5411C25.8462 10.4207 25.295 10.1798 24.8497 9.82024C24.419 9.44247 24.2055 8.93512 24.2055 8.30002C24.2055 7.63026 24.5158 7.06269 25.1344 6.59914C25.7695 6.11735 26.5269 5.87827 27.4029 5.87827C28.2971 5.87827 29.0527 6.13559 29.6732 6.65206C30.3083 7.16671 30.6276 7.82006 30.6276 8.61027H32.407C32.407 7.33826 31.9179 6.29072 30.9379 5.46582C29.9579 4.62451 28.7807 4.20294 27.4047 4.20294C26.0287 4.20294 24.8424 4.59896 23.846 5.38918C22.8495 6.1794 22.3513 7.15029 22.3513 8.30185C22.3513 9.22894 22.5667 9.98631 22.9955 10.5703C23.4427 11.1543 23.992 11.5503 24.6453 11.7565C25.2987 11.9628 26.0122 12.1526 26.786 12.3241C27.5598 12.4957 28.2734 12.6508 28.9267 12.7877C29.5801 12.9245 30.1221 13.2165 30.551 13.6637C30.9981 14.1108 31.2207 14.7039 31.2207 15.4412C31.2207 16.2314 30.843 16.9103 30.0856 17.476C29.3282 18.0436 28.4358 18.3265 27.4029 18.3265C26.3535 18.3265 25.452 18.0345 24.6946 17.4505C23.9555 16.8501 23.585 16.0927 23.585 15.182H21.7545C21.7545 16.6074 22.2966 17.768 23.3788 18.6605C24.4793 19.5547 25.8206 20 27.401 20C28.9833 20 30.3247 19.5711 31.4233 18.7116C32.5238 17.8356 33.0731 16.7442 33.0731 15.4394C33.0731 14.4429 32.8486 13.6272 32.4033 12.9921C31.9763 12.3369 31.4343 11.8898 30.7809 11.6489Z"
      fill="#FAFAFB"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M51.7568 12.6654L52.4873 10.6014H56.2349L56.9654 12.6654H58.4222L55.2563 4.17456H53.4659L50.3 12.6654H51.7568ZM60.7828 12.6654V4.17456H59.3883V12.6654H60.7828ZM54.3611 4.74425L52.6566 9.55636L52.6566 9.55635L54.3611 4.74423L54.3611 4.74425ZM52.9212 9.36933L54.3611 5.30437L55.801 9.36933H52.9212ZM60.5957 4.36158H60.5957V12.4784L60.5957 12.4784V4.36158Z"
      fill="#FAFAFB"
    />
  </svg>
);

/** Dropdown chevron — uses currentColor so dark/light themes recolor it. */
const Chevron = () => (
  <svg
    className="navbar__chevron"
    xmlns="http://www.w3.org/2000/svg"
    width="8"
    height="5"
    viewBox="0 0 8 5"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M0.683105 0.682983L3.58083 3.58071L6.47856 0.682983"
      stroke="currentColor"
      strokeWidth="0.965909"
      strokeLinecap="square"
    />
  </svg>
);

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/['"&]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getLinkHref = (link: { title?: string; href?: string }) => {
  if (link.href) return link.href;
  if (link.title) return `/${slugify(link.title)}`;
  return "#";
};

const resolveImg = (img?: ImageInput): string | undefined =>
  typeof img === "string" ? img || undefined : img?.src;

/* ===== Shared renderers ===== */

const Column = ({ items }: { items: MenuItem[] }) => (
  <ul className="navbar__link-list">
    {items.map((item, index) =>
      item.isSubheading ? (
        <li key={index} className="navbar__subheading">
          {item.title}
        </li>
      ) : (
        <li key={index}>
          <a href={getLinkHref(item)} className="navbar__link">
            <span className="navbar__link-title">{item.title}</span>
            {item.description && (
              <span className="navbar__link-desc">{item.description}</span>
            )}
          </a>
        </li>
      ),
    )}
  </ul>
);

const Section = ({ section }: { section: MenuSection }) => (
  <div className="navbar__section">
    {section.title && <h3 className="navbar__panel-title">{section.title}</h3>}
    <div
      className="navbar__section-cols"
      style={{
        gridTemplateColumns: `repeat(${section.columns.length}, minmax(0, 1fr))`,
      }}
    >
      {section.columns.map((column, index) => (
        <Column key={index} items={column} />
      ))}
    </div>
  </div>
);

const RightPanelView = ({ panel }: { panel: RightPanel }) => {
  if (panel.kind === "links") {
    return <Section section={panel.section} />;
  }

  if (panel.kind === "cards") {
    return (
      <>
        {panel.title && <h3 className="navbar__panel-title">{panel.title}</h3>}
        <div className="navbar__cards">
          {panel.cards.map((card, index) => (
            <a key={index} href={getLinkHref(card)} className="navbar__card">
              <div className="navbar__card-img-wrap">
                {card.imageUrl && (
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="navbar__card-img"
                  />
                )}
              </div>
              <div className="navbar__card-category">{card.category}</div>
              <div className="navbar__card-title">{card.title}</div>
            </a>
          ))}
        </div>
      </>
    );
  }

  // panel.kind === "cta"
  return (
    <div className="navbar__cta-card">
      <div className="navbar__cta-card-content">
        <h3 className="navbar__cta-card-title">{panel.cta.title}</h3>
        <p className="navbar__cta-card-desc">{panel.cta.description}</p>
        <a href={panel.cta.ctaHref} className="navbar__cta-card-link">
          {panel.cta.ctaText}
          <svg
            className="navbar__cta-card-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M13 6l6 6-6 6"
            />
          </svg>
        </a>
      </div>
      {panel.cta.imageUrl ? (
        <img src={panel.cta.imageUrl} alt="" className="navbar__cta-card-img" />
      ) : (
        <div className="navbar__cta-card-decor" aria-hidden="true" />
      )}
    </div>
  );
};

const MegaMenu = ({
  menu,
  isClosing,
  onMouseEnter,
  onMouseLeave,
}: {
  menu: MegaMenuData;
  isClosing?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) => {
  const megaClassName = `navbar__mega${isClosing ? " navbar__mega--closing" : ""}`;

  if (menu.variant === "wide") {
    return (
      <div
        className={megaClassName}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="navbar__mega-wide">
          {menu.sections.map((section, index) => (
            <Section key={index} section={section} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={megaClassName}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="navbar__mega-inner">
        <div className="navbar__mega-half navbar__mega-half--white navbar__mega-left">
          {menu.left.map((section, index) => (
            <Section key={index} section={section} />
          ))}
        </div>
        <div
          className={`navbar__mega-half navbar__mega-half--${menu.right.background}`}
        >
          <RightPanelView panel={menu.right} />
        </div>
      </div>
    </div>
  );
};

/* ===== Mobile helpers ===== */

const collectMobileSections = (menu: MegaMenuData): MenuSection[] => {
  if (menu.variant === "wide") return menu.sections;
  const sections = [...menu.left];
  if (menu.right.kind === "links") sections.push(menu.right.section);
  return sections;
};

export const Navbar = ({
  logoImageUrl,
  logoHref,
  navItems,
  ctaText,
  ctaHref,
  loginText,
  loginHref,
  latestPost1Image,
  latestPost1Category,
  latestPost1Title,
  latestPost1Href,
  latestPost2Image,
  latestPost2Category,
  latestPost2Title,
  latestPost2Href,
  companyCtaImage,
  theme = "light",
  heroSectionId = "heroSection",
}: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const menuCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearMenuCloseTimer = () => {
    if (menuCloseTimerRef.current) {
      clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
  };

  const openMenuItem = (label: string | null) => {
    clearMenuCloseTimer();
    setIsMenuClosing(false);
    setHoveredItem(label);
  };

  const scheduleMenuClose = () => {
    if (!hoveredItem) return;
    setIsMenuClosing(true);
    clearMenuCloseTimer();
    menuCloseTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      setIsMenuClosing(false);
      menuCloseTimerRef.current = null;
    }, 1000);
  };

  const keepMenuOpen = () => {
    clearMenuCloseTimer();
    setIsMenuClosing(false);
  };

  useEffect(() => () => clearMenuCloseTimer(), []);

  const parsedNavItems: NavItem[] =
    typeof navItems === "string" ? JSON.parse(navItems) : navItems;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setMobileSubmenu(null);
  };

  // Lock page scroll while the mobile menu is open. Use position:fixed so
  // iOS/Safari don't jump the scroll position when overflow is hidden.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const scrollY = window.scrollY;
    const { body } = document;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
      width: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isMobileMenuOpen]);

  // Watch the hero for BOTH themes. Transparent + blurred while the hero is
  // still under the bar; solid white once its bottom edge clears the bar.
  // Falls back to solid if no hero element exists on the page.
  useEffect(() => {
    const hero = document.getElementById(heroSectionId);
    if (!hero) {
      setScrolledPastHero(true);
      return;
    }

    const update = () => {
      // Switch when the hero's bottom edge reaches (or clears) the top of the
      // viewport — i.e. the hero has fully scrolled past.
      setScrolledPastHero(hero.getBoundingClientRect().bottom <= 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [heroSectionId]);

  const hasMenu = (label: string) => Boolean(menuData[label]);

  /** Merge configurable props (images / post copy) into the static menu data. */
  const getMenu = (label: string): MegaMenuData | undefined => {
    const base = menuData[label];
    if (!base || base.variant !== "split") return base;

    if (label === "Resources" && base.right.kind === "cards") {
      const [card1, card2] = base.right.cards;
      return {
        ...base,
        right: {
          ...base.right,
          cards: [
            {
              category: latestPost1Category ?? card1.category,
              title: latestPost1Title ?? card1.title,
              href: latestPost1Href ?? card1.href,
              imageUrl: resolveImg(latestPost1Image) ?? card1.imageUrl,
            },
            {
              category: latestPost2Category ?? card2.category,
              title: latestPost2Title ?? card2.title,
              href: latestPost2Href ?? card2.href,
              imageUrl: resolveImg(latestPost2Image) ?? card2.imageUrl,
            },
          ],
        },
      };
    }

    if (label === "Company" && base.right.kind === "cta") {
      return {
        ...base,
        right: {
          ...base.right,
          cta: {
            ...base.right.cta,
            imageUrl: resolveImg(companyCtaImage) ?? base.right.cta.imageUrl,
          },
        },
      };
    }

    return base;
  };

  const activeMenu = hoveredItem ? getMenu(hoveredItem) : undefined;

  // Transparent + blur over the hero; solid white once past it, or while a
  // dropdown / mobile menu is open (so mega-menu text stays legible).
  // While the mega menu is fading out, drop solid immediately so the bar can
  // ease back to transparent over the same 1s as the menu.
  const isSolid =
    scrolledPastHero ||
    isMobileMenuOpen ||
    (Boolean(hoveredItem) && !isMenuClosing);

  // Dark text treatment only applies while still transparent over the hero.
  const isDarkTransparent = theme === "dark" && !isSolid;

  const navClassName = [
    "navbar",
    theme === "dark" ? "navbar--dark" : "",
    isSolid ? "navbar--solid" : "navbar--transparent",
    isMenuClosing ? "navbar--menu-closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav className={navClassName} onMouseLeave={scheduleMenuClose}>
      <div className="navbar__container">
        {/* Logo (or Back button when a mobile submenu is open) */}
        {isMobileMenuOpen && mobileSubmenu ? (
          <button
            className="navbar__back"
            onClick={() => setMobileSubmenu(null)}
            aria-label="Back"
          >
            <svg
              className="navbar__back-arrow"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M14.25 9L3.75005 9"
                stroke="#515152"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M9 14.25L3.74996 9L9 3.74996"
                stroke="#515152"
                stroke-width="1.25"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            Back
          </button>
        ) : (
          <a href={logoHref} className="navbar__logo" aria-label="EliseAI">
            {isDarkTransparent ? (
              <LogoDark />
            ) : (
              <img
                src={logoImageUrl}
                alt="EliseAI"
                className="navbar__logo-img"
              />
            )}
          </a>
        )}

        {/* Desktop Navigation */}
        <div className="navbar__desktop">
          <ul className="navbar__nav-list">
            {parsedNavItems.map((item, index) => (
              <li
                key={index}
                className={`navbar__nav-item${
                  hoveredItem === item.label && !isMenuClosing
                    ? " navbar__nav-item--active"
                    : ""
                }`}
                onMouseEnter={() => {
                  if (hasMenu(item.label)) openMenuItem(item.label);
                  else scheduleMenuClose();
                }}
                onMouseLeave={(event) => {
                  const next = event.relatedTarget as HTMLElement | null;
                  // Stay open when moving into the mega menu or another nav link.
                  if (next?.closest?.(".navbar__mega")) return;
                  if (next?.closest?.(".navbar__nav-item")) return;
                  scheduleMenuClose();
                }}
              >
                <a
                  href={item.href}
                  className="navbar__nav-link"
                  target={item.isExternal ? "_blank" : undefined}
                  rel={item.isExternal ? "noopener noreferrer" : undefined}
                >
                  {item.label}
                </a>
                {hasMenu(item.label) && <Chevron />}
              </li>
            ))}
          </ul>

          {/* Right side - Log In link and CTA button */}
          <div className="navbar__actions">
            <a href={loginHref} className="navbar__login">
              {loginText}
              <svg
                className="navbar__login-arrow"
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3.75 9H14.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 3.75L14.25 9L9 14.25"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a href={ctaHref} className="navbar__cta">
              {ctaText}
            </a>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className={`navbar__mobile-btn${
            isMobileMenuOpen ? " navbar__mobile-btn--open" : ""
          }`}
          onClick={toggleMobileMenu}
          aria-label={
            isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
          }
          aria-expanded={isMobileMenuOpen}
        >
          <span className="navbar__burger" />
          <span className="navbar__burger" />
          <span className="navbar__burger" />
        </button>
      </div>

      {/* Mega Menu */}
      {activeMenu && (
        <MegaMenu
          menu={activeMenu}
          isClosing={isMenuClosing}
          onMouseEnter={keepMenuOpen}
          onMouseLeave={scheduleMenuClose}
        />
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="navbar__mobile-menu navbar__mobile-menu--open">
          {mobileSubmenu && menuData[mobileSubmenu] ? (
            /* Submenu drill-down view */
            <>
              <div className="navbar__mobile-nav navbar__mobile-nav--submenu">
                {collectMobileSections(menuData[mobileSubmenu]).map(
                  (section, sectionIndex) => (
                    <div key={sectionIndex} className="navbar__mobile-section">
                      {section.title && (
                        <div className="navbar__mobile-section-title">
                          {section.title}
                        </div>
                      )}
                      {section.columns.flat().map((item, itemIndex) =>
                        item.isSubheading ? (
                          <div
                            key={itemIndex}
                            className="navbar__mobile-section-title"
                          >
                            {item.title}
                          </div>
                        ) : (
                          <a
                            key={itemIndex}
                            href={getLinkHref(item)}
                            className="navbar__mobile-item"
                          >
                            <div className="navbar__mobile-item-title">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="navbar__mobile-item-desc">
                                {item.description}
                              </div>
                            )}
                          </a>
                        ),
                      )}
                    </div>
                  ),
                )}
              </div>

              <div className="navbar__mobile-actions">
                <a href={ctaHref} className="navbar__mobile-cta">
                  {ctaText}
                </a>
                <a href={loginHref} className="navbar__mobile-login">
                  {loginText}
                  <svg
                    className="navbar__mobile-login-arrow"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.75 9H14.25"
                      stroke="#7638FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 3.75L14.25 9L9 14.25"
                      stroke="#7638FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </>
          ) : (
            /* Top-level mobile nav */
            <>
              <div className="navbar__mobile-nav">
                {parsedNavItems.map((item, index) =>
                  hasMenu(item.label) ? (
                    <button
                      key={index}
                      className="navbar__mobile-link navbar__mobile-link--drill"
                      onClick={() => setMobileSubmenu(item.label)}
                    >
                      {item.label}
                      <svg
                        className="navbar__mobile-link-arrow"
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.75 9H14.25"
                          stroke="#515152"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 3.75L14.25 9L9 14.25"
                          stroke="#515152"
                          strokeWidth="1.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
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
                  ),
                )}
              </div>
              <div className="navbar__mobile-actions">
                <a href={ctaHref} className="navbar__mobile-cta">
                  {ctaText}
                </a>
                <a href={loginHref} className="navbar__mobile-login">
                  {loginText}
                  <svg
                    className="navbar__mobile-login-arrow"
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.75 9H14.25"
                      stroke="#7638FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 3.75L14.25 9L9 14.25"
                      stroke="#7638FA"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
