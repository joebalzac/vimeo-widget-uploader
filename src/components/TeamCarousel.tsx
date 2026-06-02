import { useState, useEffect, useCallback } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./TeamCarouselStyling.css";

export interface TeamMember {
  /** Person's name — card title (22px). */
  name: string;
  /** Secondary label under the name (18px). */
  label: string;
  /** Vimeo numeric ID, e.g. "76979871". */
  vimeoId: string;
  /** Thumbnail image URL for the card's photo block. */
  thumbnail?: string;
}

export interface TeamCarouselProps {
  eyebrow?: string;
  heading?: string;
  ctaLabel?: string;
  ctaHref?: string;
  members?: TeamMember[];
  /** Visible cards per page at desktop. Omit to use the fixed-width peek. */
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

  const close = useCallback(() => setActive(null), []);

  // Escape to close + body-scroll lock while a video is open.
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
      767: useFixed ? { fixedWidth: "85%" } : { perPage: 1 },
    },
  };

  return (
    <section className="tc">
      <div className="tc__head">
        <div className="tc__head-copy">
          <p className="tc__eyebrow">{eyebrow}</p>
          <h2 className="tc__heading">{heading}</h2>
        </div>
        <a className="tc__cta" href={ctaHref}>
          {ctaLabel}
        </a>
      </div>

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

      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="tc__splide"
      >
        <SplideTrack>
          {members.map((m, i) => (
            <SplideSlide key={i}>
              <article className="tc__card">
                <div className="tc__card-head">
                  <div className="tc__card-text">
                    <p className="tc__card-title">{m.name}</p>
                    <p className="tc__card-label">{m.label}</p>
                  </div>
                  <button
                    className="tc__play"
                    type="button"
                    aria-label={`Play ${m.name}'s video`}
                    onClick={() => m.vimeoId && setActive(m)}
                    disabled={!m.vimeoId}
                  >
                    <span className="tc__play-icon" aria-hidden="true" />
                  </button>
                </div>

                <button
                  className="tc__photo"
                  type="button"
                  aria-label={`Play ${m.name}'s video`}
                  onClick={() => m.vimeoId && setActive(m)}
                  disabled={!m.vimeoId}
                  style={
                    m.thumbnail
                      ? {
                          backgroundImage: `url(${m.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  <span className="tc__photo-play" aria-hidden="true">
                    <span className="tc__photo-play-icon" />
                  </span>
                </button>
              </article>
            </SplideSlide>
          ))}
        </SplideTrack>
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
