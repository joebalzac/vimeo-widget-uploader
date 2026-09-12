import { useEffect, type RefObject } from "react";
import arrowRight from "../assets/session-grid/arrow-right.svg";

const MQ = "(max-width: 767px)";
const MARK = "scgCarousel";
const STYLE_ID = "scg-carousel-global";
/** Figma 13107:30011 — 393px frame, 24px side inset, 345px first card. */
const FIGMA_INSET = 24;

const GLOBAL_CSS = `
@media (max-width: 767px) {
  .scg-carousel {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    grid-template-columns: none !important;
    grid-auto-columns: unset !important;
    gap: 12px !important;
    column-gap: 12px !important;
    row-gap: 12px !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
  }
  .scg-carousel::-webkit-scrollbar { display: none; }
  .scg-carousel > *:not(.scg-nav) {
    flex: 0 0 100% !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    scroll-snap-align: start;
  }
  .scg-nav:not([hidden]) {
    display: inline-flex !important;
    align-items: center;
    overflow: hidden;
    margin-top: 32px;
    background-color: #f5f4f2;
    border-radius: 1000px;
    box-shadow: inset 0 0 0 0.5px rgba(0, 0, 0, 0.1);
  }
  .scg-nav__btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 1000px;
    cursor: pointer;
  }
  .scg-nav__btn:not(:disabled):hover,
  .scg-nav__btn:not(:disabled):active {
    background-color: #ffffff;
    box-shadow: 0 0 0.5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.04);
  }
  .scg-nav__btn:disabled { opacity: 0.35; cursor: default; }
  .scg-nav__icon { width: 24px; height: 24px; overflow: hidden; }
  .scg-nav__icon img { display: block; width: 100%; height: 100%; }
  .scg-nav__icon--prev { transform: rotate(180deg); }
}
.scg-nav[hidden] { display: none !important; }
`;

function ensureGlobalStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

function outermostHost(card: HTMLElement): HTMLElement {
  const root = card.getRootNode();
  if (root instanceof ShadowRoot) return root.host as HTMLElement;
  return card;
}

function isCard(el: Element): boolean {
  if ((el as HTMLElement).classList.contains("scg-nav")) return false;
  if (el.classList.contains("scg")) return true;
  if (el.querySelector?.(".scg")) return true;
  const host = el as HTMLElement;
  if (host.shadowRoot?.querySelector(".scg")) return true;
  for (const nested of Array.from(el.children)) {
    if (isCard(nested)) return true;
  }
  return false;
}

function cardChildCount(el: HTMLElement): number {
  return Array.from(el.children).filter(isCard).length;
}

/**
 * Prefer the Webflow Collection List / layout grid that actually holds every
 * card. Component CSS lives in shadow DOM and cannot style that parent, so
 * the hook also injects a document-level stylesheet + inline !important rules.
 */
function findListParent(card: HTMLElement): HTMLElement | null {
  const el = outermostHost(card);

  const dyn = el.closest(".w-dyn-items") as HTMLElement | null;
  if (dyn) {
    const items = dyn.querySelectorAll(":scope > .w-dyn-item");
    if (items.length > 1) return dyn;
    if (cardChildCount(dyn) > 1) return dyn;
  }

  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    if (cardChildCount(node) > 1) return node;
    node = node.parentElement;
  }

  const grid = el.closest(".w-layout-grid") as HTMLElement | null;
  if (grid && cardChildCount(grid) > 1) return grid;

  return null;
}

const SAVED = "scgSavedStyle";

const BLEED_PROPS = [
  "margin-right",
  "width",
  "max-width",
  "padding-left",
  "padding-right",
  "box-sizing",
  "scroll-padding-left",
] as const;

function clearBleed(host: HTMLElement) {
  for (const prop of BLEED_PROPS) host.style.removeProperty(prop);
}

/**
 * First card fills the content column (Figma 345px in a 393px frame). The
 * track then extends to the viewport's right edge so the next card peeks
 * in the page margin instead of shrinking and left-aligning the first card.
 */
function applyPeekBleed(host: HTMLElement) {
  const scrollLeft = host.scrollLeft;
  clearBleed(host);
  const rightBleed = Math.max(
    0,
    Math.round(window.innerWidth - host.getBoundingClientRect().right)
  );
  host.style.setProperty("box-sizing", "border-box", "important");
  if (rightBleed >= 8) {
    host.style.setProperty("width", `calc(100% + ${rightBleed}px)`, "important");
    host.style.setProperty("max-width", "none", "important");
    host.style.setProperty("margin-right", `-${rightBleed}px`, "important");
    host.style.setProperty("padding-right", `${rightBleed}px`, "important");
  } else {
    host.style.setProperty("padding-left", `${FIGMA_INSET}px`, "important");
    host.style.setProperty("padding-right", `${FIGMA_INSET}px`, "important");
    host.style.setProperty("scroll-padding-left", `${FIGMA_INSET}px`, "important");
  }
  host.scrollLeft = scrollLeft;
}

function applyCarouselStyles(host: HTMLElement, on: boolean) {
  const items = Array.from(host.children).filter(
    (c) => !(c as HTMLElement).classList.contains("scg-nav")
  ) as HTMLElement[];

  if (on) {
    host.classList.add("scg-carousel");
    host.style.setProperty("display", "flex", "important");
    host.style.setProperty("flex-direction", "row", "important");
    host.style.setProperty("flex-wrap", "nowrap", "important");
    host.style.setProperty("grid-template-columns", "none", "important");
    host.style.setProperty("gap", "12px", "important");
    host.style.setProperty("overflow-x", "auto", "important");
    host.style.setProperty("overflow-y", "hidden", "important");
    applyPeekBleed(host);
    for (const item of items) {
      if (!item.dataset[SAVED]) {
        item.dataset[SAVED] = item.getAttribute("style") || "";
      }
      item.style.setProperty("flex", "0 0 100%", "important");
      item.style.setProperty("width", "100%", "important");
      item.style.setProperty("max-width", "100%", "important");
      item.style.setProperty("min-width", "0", "important");
    }
  } else {
    host.classList.remove("scg-carousel");
    host.style.removeProperty("display");
    host.style.removeProperty("flex-direction");
    host.style.removeProperty("flex-wrap");
    host.style.removeProperty("grid-template-columns");
    host.style.removeProperty("gap");
    host.style.removeProperty("overflow-x");
    host.style.removeProperty("overflow-y");
    clearBleed(host);
    host.scrollLeft = 0;
    for (const item of items) {
      const saved = item.dataset[SAVED];
      if (saved !== undefined) {
        if (saved) item.setAttribute("style", saved);
        else item.removeAttribute("style");
        delete item.dataset[SAVED];
      }
    }
  }
}

function makeNav(host: HTMLElement): HTMLDivElement {
  const nav = document.createElement("div");
  nav.className = "scg-nav";
  nav.innerHTML = `
    <button class="scg-nav__btn" type="button" aria-label="Previous" disabled>
      <span class="scg-nav__icon scg-nav__icon--prev">
        <img src="${arrowRight}" alt="" width="24" height="24" />
      </span>
    </button>
    <button class="scg-nav__btn" type="button" aria-label="Next">
      <span class="scg-nav__icon">
        <img src="${arrowRight}" alt="" width="24" height="24" />
      </span>
    </button>
  `;

  const prev = nav.querySelector<HTMLButtonElement>('[aria-label="Previous"]')!;
  const next = nav.querySelector<HTMLButtonElement>('[aria-label="Next"]')!;

  const update = () => {
    prev.disabled = host.scrollLeft <= 8;
    next.disabled =
      host.scrollLeft + host.clientWidth >= host.scrollWidth - 8;
  };

  const scrollByCard = (dir: -1 | 1) => {
    const item = Array.from(host.children).find(
      (c) => !(c as HTMLElement).classList.contains("scg-nav")
    ) as HTMLElement | undefined;
    const gap = 12;
    const delta = (item?.offsetWidth ?? host.clientWidth) + gap;
    host.scrollBy({ left: dir * delta, behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByCard(-1));
  next.addEventListener("click", () => scrollByCard(1));
  host.addEventListener("scroll", update, { passive: true });
  (nav as HTMLDivElement & { _scgUpdate?: () => void })._scgUpdate = update;
  return nav;
}

/**
 * On mobile, restyle the parent Collection List / 3-col grid into the Figma
 * peeking carousel (one card + next-card peek, pill arrows underneath).
 */
export function useSessionCarousel(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    ensureGlobalStyles();

    let host: HTMLElement | null = null;
    let nav: HTMLDivElement | null = null;
    let mq: MediaQueryList | null = null;
    const timers: number[] = [];
    let observer: MutationObserver | null = null;
    let applying = false;

    const apply = () => {
      if (!host || !nav || !mq || applying) return;
      applying = true;
      try {
        if (mq.matches) {
          applyCarouselStyles(host, true);
          nav.hidden = false;
          (
            nav as HTMLDivElement & { _scgUpdate?: () => void }
          )._scgUpdate?.();
        } else {
          applyCarouselStyles(host, false);
          nav.hidden = true;
        }
      } finally {
        applying = false;
      }
    };

    const init = (): boolean => {
      const list = findListParent(card);
      if (!list || cardChildCount(list) < 2) return false;
      if (list.dataset[MARK]) return true;

      host = list;
      host.dataset[MARK] = "1";
      nav = makeNav(host);
      host.insertAdjacentElement("afterend", nav);
      mq = window.matchMedia(MQ);
      mq.addEventListener("change", apply);
      window.addEventListener("resize", apply);
      apply();
      return true;
    };

    if (!init()) {
      timers.push(window.setTimeout(init, 0));
      timers.push(window.setTimeout(init, 200));
      observer = new MutationObserver(() => {
        if (init()) observer?.disconnect();
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      timers.forEach(clearTimeout);
      observer?.disconnect();
      window.removeEventListener("resize", apply);
      mq?.removeEventListener("change", apply);
      nav?.remove();
      if (host) {
        applyCarouselStyles(host, false);
        delete host.dataset[MARK];
      }
    };
  }, [ref]);
}
