import { useEffect, useRef, useState, type Ref } from "react";
import playIcon from "../assets/session-grid/play.svg";
import arrowNe from "../assets/session-grid/arrow-ne.svg";
import { useSessionCarousel } from "./useSessionCarousel";
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
  className?: string;
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
  className,
}: SessionCardGridProps) {
  const id = parseVimeoId(vimeoId);
  const vimeoThumb = useVimeoThumb(imageSrc ? "" : id);
  const thumb = imageSrc || vimeoThumb;
  const href = slug ? talkHref(slug, slugPrefix) : "";
  const rootClass = ["scg", className || ""].filter(Boolean).join(" ");
  const rootRef = useRef<HTMLElement | null>(null);
  useSessionCarousel(rootRef);

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
        <span className="scg__play" aria-hidden="true">
          <span className="scg__play-icon">
            <img src={playIcon} alt="" width={40} height={40} />
          </span>
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
            <img src={arrowNe} alt="" width={16} height={16} />
          </span>
        </span>
      </div>
    </>
  );

  if (href) {
    return (
      <a className={rootClass} href={href} ref={rootRef as Ref<HTMLAnchorElement>}>
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
