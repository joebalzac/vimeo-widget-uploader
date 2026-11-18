import "../../utils/interVariableFont";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { CSS_EASE, EZ, Reveal } from "./shared";
import { DEFAULT_POSTER, DEFAULT_STORIES, type Gen2Story } from "./gen2StoriesData";
import arrowUrl from "../../assets/gen2/stories/arrow.svg";
import playUrl from "../../assets/gen2/stories/play.svg";
import playMobileUrl from "../../assets/gen2/stories/play-mobile.svg";
import "./Gen2Stories.css";

export interface Gen2StoriesProps {
  heading?: string;
  subtitle?: string;
  /** Figma shows the subtitle on mobile only (667:141208); off = show it on desktop too. */
  subtitleMobileOnly?: boolean;
  stories?: Gen2Story[];
  /** Autoplay time per story, in seconds (handoff: 8). */
  duration?: number;
  className?: string;
}

/* ── Video URL → embed ─────────────────────────────────────── */
type VideoSource = { kind: "iframe"; src: string } | { kind: "file"; src: string } | null;

function videoSource(raw?: string): VideoSource {
  const v = raw?.trim();
  if (!v) return null;
  if (/\.(mp4|webm|ogg|mov|m3u8)(\?|#|$)/i.test(v)) return { kind: "file", src: v };
  const id = v.match(/(\d{6,})/)?.[1];
  if (id && (/vimeo/i.test(v) || /^\d+$/.test(v))) {
    const hash = v.match(/[?&]h=([a-z0-9]+)/i)?.[1] || v.match(/vimeo\.com\/\d{6,}\/([a-z0-9]+)/i)?.[1];
    return {
      kind: "iframe",
      src: `https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ""}autoplay=1&title=0&byline=0&portrait=0`,
    };
  }
  return /^https?:\/\//i.test(v) ? { kind: "iframe", src: v } : null;
}

/* ── Lightbox: minimal black overlay ─────────────────────────
   LightboxModal.tsx is the demo-incentive form modal (copy column + hero image), so it
   doesn't fit a video player. Rendered inline (not portalled) so the shadow-root styles
   apply; the root has no transform, so position: fixed still covers the viewport. */
function VideoLightbox({ source, title, onClose }: { source: NonNullable<VideoSource>; title: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="g2st-lb"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: CSS_EASE }}
    >
      <button ref={closeRef} type="button" className="g2st-lb__close" aria-label="Close video" onClick={onClose}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div className="g2st-lb__frame" onClick={(e) => e.stopPropagation()}>
        {source.kind === "iframe" ? (
          <iframe
            src={source.src}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <video src={source.src} controls autoPlay playsInline />
        )}
      </div>
    </motion.div>
  );
}

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <img
      className={dir === "prev" ? "g2st-arrow__icon g2st-arrow__icon--prev" : "g2st-arrow__icon"}
      src={arrowUrl}
      alt=""
      width={24}
      height={24}
    />
  );
}

function Arrows({ onPrev, onNext, className }: { onPrev: () => void; onNext: () => void; className: string }) {
  return (
    <div className={`g2st-arrows ${className}`}>
      <button type="button" className="g2st-arrow" aria-label="Previous story" onClick={onPrev}>
        <Arrow dir="prev" />
      </button>
      <button type="button" className="g2st-arrow" aria-label="Next story" onClick={onNext}>
        <Arrow dir="next" />
      </button>
    </div>
  );
}

/**
 * Gen2Stories — "Trusted by Operators of All Sizes" (handoff 09, Figma 642:58325 / mobile
 * 667:141205). Header with
 * prev/next arrows, then the quote + name/role beside a video poster (play opens a black
 * lightbox), then a segmented progress bar. Autoplays 8s per story while in view; pauses on
 * video hover, while the lightbox is open, and entirely under reduced motion.
 */
export default function Gen2Stories({
  heading = "Trusted by Operators of All Sizes",
  subtitle = "Automatically route tasks to the right teams.",
  subtitleMobileOnly = true,
  stories = DEFAULT_STORIES,
  duration = 8,
  className,
}: Gen2StoriesProps) {
  const items = stories.filter((s) => s.quote.trim());
  const count = items.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.3 });
  const reduced = !!useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const closeVideo = useCallback(() => setOpen(false), []);
  const progress = useMotionValue(0);
  const cur = count ? idx % count : 0;

  const go = (i: number) => {
    progress.set(0);
    setIdx(((i % count) + count) % count);
  };

  const paused = reduced || hover || open || !inView || count < 2;
  useEffect(() => {
    if (paused) return;
    const ms = Math.max(1, duration) * 1000;
    let last = performance.now();
    let raf = requestAnimationFrame(function tick(t) {
      const v = progress.get() + (t - last) / ms;
      last = t;
      if (v >= 1) {
        progress.set(0);
        setIdx((i) => (i + 1) % count);
      } else progress.set(v);
      raf = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(raf);
  }, [paused, duration, count, progress]);

  if (!count) return null;
  const story = items[cur];
  const source = videoSource(story.videoUrl);
  const fade = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { opacity: { duration: 0.4, ease: CSS_EASE }, y: { duration: 0.5, ease: EZ } },
  };

  return (
    <div
      ref={rootRef}
      className={["g2st", subtitleMobileOnly && "g2st--sub-mob", className].filter(Boolean).join(" ")}
    >
      <div className="g2st-head">
        <SectionHeading heading={heading} subtitle={subtitle} align="left" maxWidth={420} />
        {count > 1 && (
          <Reveal delay={0.1} className="g2st-head__arrows">
            <Arrows className="g2st-arrows--desk" onPrev={() => go(cur - 1)} onNext={() => go(cur + 1)} />
          </Reveal>
        )}
      </div>

      <Reveal delay={0.15} className="g2st-row">
        <div className="g2st-copy">
          <div className="g2st-quote-wrap" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.figure key={cur} className="g2st-quote" {...fade}>
                <blockquote className="g2st-quote__text">{story.quote}</blockquote>
                <figcaption className="g2st-quote__who">
                  <span className="g2st-quote__name">{story.name}</span>
                  {/* Figma breaks the role after the title: "Director of Operations, / GoldOller" */}
                  <span className="g2st-quote__role">{story.role.replace(/,\s*/, ",\n")}</span>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>
        </div>

        <div
          className="g2st-video"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={cur}
              className="g2st-poster"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: CSS_EASE }}
            >
              <img
                className="g2st-poster__img"
                src={story.posterSrc?.trim() || DEFAULT_POSTER}
                alt=""
                loading="lazy"
              />
            </motion.div>
          </AnimatePresence>
          {(() => {
            const icon = (
              <picture>
                <source media="(max-width: 761px)" srcSet={playMobileUrl} />
                <img src={playUrl} alt="" width={48} height={48} />
              </picture>
            );
            /* Figma always shows the play badge; it is only a button once a video URL is set. */
            return source ? (
              <button
                type="button"
                className="g2st-play"
                aria-label={`Play video: ${story.name}`}
                onClick={() => setOpen(true)}
              >
                {icon}
              </button>
            ) : (
              <span className="g2st-play g2st-play--static" aria-hidden="true">
                {icon}
              </span>
            );
          })()}
        </div>
      </Reveal>

      {count > 1 && (
        <Reveal delay={0.25} className="g2st-progress">
          {items.map((s, j) => (
            <button
              key={j}
              type="button"
              className="g2st-seg"
              aria-label={`Show story ${j + 1}: ${s.name}`}
              aria-current={j === cur || undefined}
              onClick={() => go(j)}
            >
              <motion.span
                className="g2st-seg__fill"
                style={{ scaleX: j === cur ? (reduced ? 1 : progress) : j < cur ? 1 : 0 }}
              />
            </button>
          ))}
        </Reveal>
      )}

      <AnimatePresence>
        {open && source && (
          <VideoLightbox source={source} title={`${story.name} — ${story.role}`} onClose={closeVideo} />
        )}
      </AnimatePresence>
    </div>
  );
}
