import { useEffect, useRef, useState, type MouseEvent, type Ref } from "react";
import { useSessionCarousel } from "./useSessionCarousel";
import SessionGatedModal, {
  GATED_SESSION_EVENT,
  hasGatedSessionCookie,
} from "./SessionGatedModal";
import "./SessionCardGrid.css";

export interface SessionCardGridProps {
  /** Image shown in the media area. Takes priority over the Vimeo thumbnail. */
  imageSrc?: string;
  imageAlt?: string;
  /** Numeric Vimeo ID, or a vimeo.com URL. Thumbnail is fetched automatically if no image is set. */
  vimeoId?: string;
  title?: string;
  details?: string;
  /** Collection slug or full URL. The whole card links here. */
  slug?: string;
  ctaLabel?: string;
  /** Prepended to a bare slug (ignored for absolute URLs and paths that already start with `/`). */
  slugPrefix?: string;
  /** CMS Locked Video switch. On: lock icon + HubSpot form. Off: card links to the URL Slug. */
  lockedVideo?: boolean | string;
  /** Separate Designer boolean — not the CMS lock switch, and not Gated Vimeo Form. */
  gatedVideo?: boolean | string;
  /** Light text for use on dark section backgrounds. */
  darkMode?: boolean;
  className?: string;
}

/** CMS Switch / Webflow Boolean. `"false"` must not count as on — Boolean("false") is true. */
export function isSwitchOn(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (value === false || value === 0 || value == null) return false;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    return v === "true" || v === "on" || v === "yes" || v === "1";
  }
  return false;
}

function LockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 5.5H2.5C1.94772 5.5 1.5 5.94772 1.5 6.5V10C1.5 10.5523 1.94772 11 2.5 11H9.5C10.0523 11 10.5 10.5523 10.5 10V6.5C10.5 5.94772 10.0523 5.5 9.5 5.5Z"
        fill="white"
      />
      <path
        d="M3.5 5.5V3.5C3.5 2.83696 3.76339 2.20107 4.23223 1.73223C4.70107 1.26339 5.33696 1 6 1C6.66304 1 7.29893 1.26339 7.76777 1.73223C8.23661 2.20107 8.5 2.83696 8.5 3.5V5.5"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowNeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4.7 11.3 11.3 4.7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.7 4.7h6.6v6.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function componentHost(el: HTMLElement): HTMLElement {
  const root = el.getRootNode();
  if (root instanceof ShadowRoot) return root.host as HTMLElement;
  return el;
}

function stopAndOpen(
  e: Event | MouseEvent,
  open: () => void
) {
  e.preventDefault();
  e.stopPropagation();
  if ("stopImmediatePropagation" in e) e.stopImmediatePropagation();
  open();
}

const THUMB_WIDTH = 960;

function parseVimeoId(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const m = v.match(/(\d{6,})/);
  return m ? m[1] : v;
}

function talkHref(slug: string, prefix: string): string {
  const s = slug.trim();
  if (!s) return "";
  if (/^(https?:\/\/|mailto:|#)/i.test(s) || s.startsWith("/")) return s;
  const p = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return `${p}${s}`;
}

function upscaleThumb(url: string): string {
  return url
    .replace(/_\d+x\d+(?=\.\w+($|\?)|$|\?)/, `_${THUMB_WIDTH}`)
    .replace(/([?&](?:w|mw)=)\d+/, `$1${THUMB_WIDTH}`);
}

function useVimeoThumb(vimeoId: string) {
  const [thumb, setThumb] = useState("");

  useEffect(() => {
    if (!vimeoId) {
      setThumb("");
      return;
    }
    let cancelled = false;
    fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vimeoId}&width=${THUMB_WIDTH}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.thumbnail_url) return;
        const url = upscaleThumb(data.thumbnail_url);
        setThumb(url);
        const img = new Image();
        img.src = url;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [vimeoId]);

  return thumb;
}

/**
 * SessionCard — a single talk card (Figma 13254-25475 / 13107-30011).
 * The whole card is a link to the URL slug.
 */
export default function SessionCardGrid({
  imageSrc = "",
  imageAlt = "",
  vimeoId = "",
  title = "Session Title",
  details = "Session Details...",
  slug = "",
  ctaLabel = "View Talk",
  slugPrefix = "/",
  lockedVideo = false,
  gatedVideo = false,
  darkMode = false,
  className,
}: SessionCardGridProps) {
  const id = parseVimeoId(vimeoId);
  const vimeoThumb = useVimeoThumb(imageSrc ? "" : id);
  const thumb = imageSrc || vimeoThumb;
  const href = slug ? talkHref(slug, slugPrefix) : "";
  const [unlocked, setUnlocked] = useState(hasGatedSessionCookie);
  const [modalOpen, setModalOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);
  const locked = isSwitchOn(lockedVideo);
  const gated = isSwitchOn(gatedVideo);
  const rootClass = ["scg", darkMode ? "scg--dark" : "", className || ""]
    .filter(Boolean)
    .join(" ");
  useSessionCarousel(rootRef);

  const openGatedForm = () => setModalOpen(true);

  useEffect(() => {
    const card = rootRef.current;
    if (!card) return;
    card.style.cursor = "pointer";
    const host = componentHost(card);
    host.style.cursor = "pointer";
    const item = host.closest(".w-dyn-item") as HTMLElement | null;
    if (item) item.style.cursor = "pointer";
    if (locked) {
      host.setAttribute("data-scg-locked", "true");
    } else {
      host.removeAttribute("data-scg-locked");
    }
    if (gated) {
      host.setAttribute("data-scg-gated", "true");
    } else {
      host.removeAttribute("data-scg-gated");
    }
  }, [locked, gated]);

  useEffect(() => {
    const unlock = () => setUnlocked(true);
    window.addEventListener(GATED_SESSION_EVENT, unlock);
    return () => window.removeEventListener(GATED_SESSION_EVENT, unlock);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const card = rootRef.current;
    if (!card) return;

    const host = componentHost(card);
    const item = host.closest(".w-dyn-item");
    const onClick = (e: Event) => {
      const path = e.composedPath();
      if (!path.includes(host) && !path.includes(card)) return;
      stopAndOpen(e, openGatedForm);
    };

    host.addEventListener("click", onClick, true);
    item?.addEventListener("click", onClick, true);
    return () => {
      host.removeEventListener("click", onClick, true);
      item?.removeEventListener("click", onClick, true);
    };
  }, [locked]);

  const inner = (
    <>
      <div className="scg__media">
        {thumb && (
          <img
            className="scg__thumb"
            src={thumb}
            alt={imageAlt || title || ""}
            loading="lazy"
          />
        )}
        {locked && (
          <span className="scg__lock">
            <LockIcon />
            <span className="scg__lock-label">Exclusive</span>
          </span>
        )}
        <span className="scg__overlay" aria-hidden="true">
          <span className="scg__watch-pill">Watch Video</span>
        </span>
      </div>
      <div className="scg__body">
        <div className="scg__copy">
          {title && <h3 className="scg__title">{title}</h3>}
          {details && <p className="scg__details">{details}</p>}
        </div>
        <span className="scg__cta">
          <span>{ctaLabel}</span>
          <span className="scg__cta-icon">
            <ArrowNeIcon />
          </span>
        </span>
      </div>
    </>
  );

  const modal =
    locked && modalOpen ? (
      <SessionGatedModal
        alreadySubmitted={unlocked}
        onClose={() => setModalOpen(false)}
        onSubmitted={() => setUnlocked(true)}
      />
    ) : null;

  if (locked) {
    return (
      <>
        <button
          type="button"
          className={rootClass}
          ref={rootRef as Ref<HTMLButtonElement>}
          onClick={(e) => stopAndOpen(e, openGatedForm)}
          aria-haspopup="dialog"
          data-scg-locked="true"
        >
          {inner}
        </button>
        {modal}
      </>
    );
  }

  if (href) {
    return (
      <a
        className={rootClass}
        href={href}
        ref={rootRef as Ref<HTMLAnchorElement>}
      >
        {inner}
      </a>
    );
  }

  return (
    <article className={rootClass} ref={rootRef}>
      {inner}
    </article>
  );
}
