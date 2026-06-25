import { useState, useEffect, useCallback } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./TeamCarouselStyling.css";

export interface TeamMember {
  name: string;
  label: string;
  /** Vimeo numeric ID, e.g. "76979871". Thumbnail is fetched automatically if not provided. */
  vimeoId: string;
  thumbnail?: string;
  /** Optional duration string shown in the card badge, e.g. "02:56". */
  duration?: string;
}

export interface TeamCarouselProps {
  eyebrow?: string;
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  members?: TeamMember[];
  /** Visible cards per page at desktop. Leave 0/undefined to use fixed-width peek layout. */
  perPage?: number;
  /** Fixed card width for the "next card peeks" layout. Default "444px". */
  fixedWidth?: string;
}

const PLACEHOLDER_MEMBERS: TeamMember[] = [
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
];

function useVimeoThumbnails(members: TeamMember[]) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = members.map((m) => m.vimeoId).filter((id) => id && !thumbs[id]);
    if (!ids.length) return;
    ids.forEach((id) => {
      fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.thumbnail_url) {
            setThumbs((prev) => ({ ...prev, [id]: data.thumbnail_url }));
          }
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.map((m) => m.vimeoId).join(",")]);

  return thumbs;
}

export default function TeamCarousel({
  eyebrow = "people behind the product",
  heading = "Hear From Our Team",
  ctaLabel = "Meet Our Team",
  ctaHref = "#",
  members = PLACEHOLDER_MEMBERS,
  perPage,
  fixedWidth = "444px",
}: TeamCarouselProps) {
  const [active, setActive] = useState<TeamMember | null>(null);
  const useFixed = !perPage;
  const autoThumbs = useVimeoThumbnails(members);

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active, close]);

  const options = {
    type: "slide" as const,
    perMove: 1,
    gap: "12px",
    arrows: true,
    pagination: false,
    drag: true,
    ...(useFixed ? { fixedWidth, focus: 0 } : { perPage }),
    breakpoints: {
      991: useFixed ? { fixedWidth: "380px" } : { perPage: 2 },
      767: {
        fixedWidth: 0,
        perPage: 1,
        padding: { left: "24px", right: "24px" },
        trimSpace: false,
        arrows: true,
        start: 1,
      },
    },
  };

  return (
    <section className="tc">
      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="tc__splide"
      >
        <div className="tc__container">
          <div className="tc__head">
            <div className="tc__head-copy">
              <div className="tc__eyebrow">
                <span className="tc__eyebrow-dot" aria-hidden="true" />
                <span>{eyebrow}</span>
              </div>
              <h2 className="tc__heading">{heading}</h2>
            </div>
            <a className="tc__cta" href={ctaHref}>
              {ctaLabel}
            </a>
          </div>
        </div>

        <SplideTrack>
          {members.map((m, i) => {
            const thumb = m.thumbnail || autoThumbs[m.vimeoId];
            const canPlay = Boolean(m.vimeoId);
            const open = () => canPlay && setActive(m);
            return (
              <SplideSlide key={i}>
                <article className="tc__card">
                  {/* Play pill badge */}
                  <button
                    className="tc__card-badge"
                    type="button"
                    aria-label={`Play ${m.name}'s video`}
                    onClick={open}
                    disabled={!canPlay}
                  >
                    <span className="tc__badge-icon" aria-hidden="true" />
                    {m.duration && (
                      <span className="tc__badge-duration">{m.duration}</span>
                    )}
                  </button>

                  {/* Thumbnail — decorative; overlay handles the click */}
                  <div
                    className="tc__photo"
                    style={
                      thumb
                        ? {
                            backgroundImage: `url(${thumb})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />

                  {/* Title + name */}
                  <div className="tc__card-text">
                    <p className="tc__card-title">{m.name}</p>
                    <p className="tc__card-label">{m.label}</p>
                  </div>

                  {/* Full-card hover overlay: dark blur + "Watch Video" pill */}
                  {canPlay && (
                    <button
                      className="tc__card-overlay"
                      type="button"
                      aria-label={`Watch ${m.name}'s video`}
                      onClick={open}
                    >
                      <span className="tc__watch-pill">Watch Video</span>
                    </button>
                  )}
                </article>
              </SplideSlide>
            );
          })}
        </SplideTrack>

        {/* Nav: absolute top-right on desktop, static below track on mobile */}
        <div className="tc__nav splide__arrows">
          <button
            className="tc__nav-btn splide__arrow splide__arrow--prev"
            aria-label="Previous"
          >
            <Arrow direction="left" />
          </button>
          <button
            className="tc__nav-btn splide__arrow splide__arrow--next"
            aria-label="Next"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </Splide>

      {active && (
        <div
          className="tc__modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${active.name} video`}
          onClick={close}
        >
          <div className="tc__modal-inner" onClick={(e) => e.stopPropagation()}>
            <button
              className="tc__modal-close"
              type="button"
              aria-label="Close video"
              onClick={close}
            >
              <CloseIcon />
            </button>
            <div className="tc__modal-frame">
              <iframe
                src={`https://player.vimeo.com/video/${active.vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
                title={`${active.name} video`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
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
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
