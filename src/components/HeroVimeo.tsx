import { useEffect, useState } from "react";
import "./HeroVimeo.css";

const PLAY_ICON =
  "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6aa37ce4d43ad66653d96523_Frame%201984078603.avif";

export interface HeroVimeoProps {
  /** Numeric Vimeo ID, or a full vimeo.com / player URL (include h= for unlisted). */
  vimeoId?: string;
  heading?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Matches the navbar overlay target. */
  id?: string;
  className?: string;
}

function parseVimeoId(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const m = v.match(/(\d{6,})/);
  return m ? m[1] : v;
}

function privacyHash(raw: string): string | undefined {
  return (
    raw.match(/[?&]h=([a-z0-9]+)/i)?.[1] ||
    raw.match(/vimeo\.com\/\d{6,}\/([a-z0-9]+)/i)?.[1]
  );
}

function vimeoSrc(raw: string, background: boolean): string {
  const id = parseVimeoId(raw);
  if (!id) return "";
  const hash = privacyHash(raw);
  const params = background
    ? "background=1&autoplay=1&loop=1&muted=1&autopause=0&title=0&byline=0&portrait=0"
    : "autoplay=1&title=0&byline=0&portrait=0";
  const h = hash ? `h=${hash}&` : "";
  return `https://player.vimeo.com/video/${id}?${h}${params}`;
}

function pushEvent(event: string) {
  const w = window as Window & { dataLayer?: Array<Record<string, string>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event });
}

export default function HeroVimeo({
  vimeoId = "",
  heading = "Elise Beyond 2026",
  subtitle = "EliseAI’s first marquee conference on mastering AI in multifamily.",
  ctaLabel = "Get Access to Beyond 2027",
  ctaHref = "#",
  id = "heroSection",
  className = "",
}: HeroVimeoProps) {
  const [open, setOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const bgSrc = vimeoSrc(vimeoId, true);
  const fullSrc = vimeoSrc(vimeoId, false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const openLightbox = () => {
    if (!fullSrc) return;
    pushEvent("hero_vimeo_play");
    setOpen(true);
  };

  const closeLightbox = () => setOpen(false);

  return (
    <section
      id={id}
      className={["hv", className].filter(Boolean).join(" ")}
    >
      <div className="hv__media" aria-hidden="true">
        {bgSrc && !reduceMotion && (
          <iframe
            className="hv__bg"
            src={bgSrc}
            title=""
            width="100%"
            height="100%"
            allow="autoplay; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
          />
        )}
        <div className="hv__scrim" />
      </div>

      <div className="hv__inner">
        <div className="hv__copy">
          <div className="hv__text">
            <h1 className="hv__heading">{heading}</h1>
            {subtitle && <p className="hv__subtitle">{subtitle}</p>}
          </div>
          {ctaLabel && (
            <a className="hv__cta" href={ctaHref}>
              {ctaLabel}
            </a>
          )}
        </div>

        {fullSrc && (
          <button
            type="button"
            className="hv__play"
            aria-label="Play video"
            onClick={openLightbox}
          >
            <img
              src={PLAY_ICON}
              alt="Play video"
              width={64}
              height={64}
              draggable={false}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {open && fullSrc && (
        <div
          className="hv__modal"
          role="dialog"
          aria-modal="true"
          aria-label="Video"
          onClick={closeLightbox}
        >
          <div
            className="hv__modal-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="hv__modal-close"
              aria-label="Close video"
              onClick={closeLightbox}
            >
              <CloseIcon />
            </button>
            <div className="hv__modal-frame">
              <iframe
                src={fullSrc}
                title={heading}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
