import { useRef, useState } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./SimpleImageCarousel.css";

export interface SimpleImageSlide {
  /** Image URL for the card. */
  image: string;
  /** Title shown at the bottom of the card. */
  title?: string;
  /** Subtitle shown under the title. */
  subtitle?: string;
  /** Destination when the card is clicked. */
  url?: string;
  /** Open the link in a new tab. */
  newTab?: boolean;
}

export interface SimpleImageCarouselProps {
  eyebrow?: string;
  heading?: string;
  slides?: SimpleImageSlide[];
  /** Button under the heading. Leave blank to hide the button. */
  ctaLabel?: string;
  ctaUrl?: string;
  ctaNewTab?: boolean;
  /** Fixed card width so the next card peeks. Default "574px". */
  fixedWidth?: string;
  /** When false, hides the eyebrow/heading header and moves the nav arrows to
   *  the bottom-left beneath the carousel. */
  showHeader?: boolean;
}

const PLACEHOLDER_SLIDES: SimpleImageSlide[] = [
  {
    image: "https://picsum.photos/id/1005/574/323",
    title: "Title",
    subtitle: "Subtitle",
    url: "#",
  },
  {
    image: "https://picsum.photos/id/1011/574/323",
    title: "Title",
    subtitle: "Subtitle",
    url: "#",
  },
  {
    image: "https://picsum.photos/id/1027/574/323",
    title: "Title",
    subtitle: "Subtitle",
    url: "#",
  },
  {
    image: "https://picsum.photos/id/1012/574/323",
    title: "Title",
    subtitle: "Subtitle",
    url: "#",
  },
];

export default function SimpleImageCarousel({
  eyebrow = "Eyebrow",
  heading = "Heading",
  slides = PLACEHOLDER_SLIDES,
  ctaLabel = "Tune In",
  ctaUrl,
  ctaNewTab = false,
  fixedWidth = "574px",
  showHeader = true,
}: SimpleImageCarouselProps) {
  // Splide only wires the first prev/next in the DOM, so the mobile nav (after
  // the track) is the Splide-controlled set. The desktop nav in the header is
  // driven manually via this ref, mirroring the disabled state Splide reports.
  const splideRef = useRef<Splide>(null);
  const [arrows, setArrows] = useState({
    prevDisabled: true,
    nextDisabled: false,
  });
  const onArrowsUpdated = (
    _splide: unknown,
    _prev: HTMLElement,
    _next: HTMLElement,
    prevIndex: number,
    nextIndex: number,
  ) => {
    setArrows({ prevDisabled: prevIndex < 0, nextDisabled: nextIndex < 0 });
  };

  const containerPad = "max(5vw, calc((100vw - var(--container-max)) / 2))";

  const options = {
    type: "slide" as const,
    perMove: 1,
    gap: "12px",
    arrows: true,
    omitEnd: true,
    pagination: false,
    drag: true,
    fixedWidth,
    focus: 0,
    padding: { left: containerPad, right: containerPad },
    breakpoints: {
      991: {
        fixedWidth: "380px",
        padding: { left: "0", right: "0" },
      },
      767: {
        fixedWidth: 0,
        perPage: 1,
        padding: { left: "5vw", right: "10vw" },
        trimSpace: false,
        start: 0,
      },
    },
  };

  return (
    <section className={`sic${showHeader ? "" : " sic--no-header"}`}>
      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="sic__splide"
        ref={splideRef}
        onArrowsUpdated={onArrowsUpdated}
      >
        {showHeader && (
          <div className="sic__container">
            <div className="sic__head">
              {eyebrow && (
                <div className="sic__eyebrow">
                  <span className="sic__eyebrow-dot" aria-hidden="true" />
                  <span>{eyebrow}</span>
                </div>
              )}
              {heading && <h2 className="sic__heading">{heading}</h2>}
              {ctaLabel && (
                <a
                  className="sic__cta"
                  href={ctaUrl || "#"}
                  {...(ctaNewTab
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {ctaLabel}
                </a>
              )}
            </div>

            <div className="sic__nav sic__nav--desktop">
              <button
                className="sic__nav-btn"
                type="button"
                aria-label="Previous"
                onClick={() => splideRef.current?.go("<")}
                disabled={arrows.prevDisabled}
              >
                <Arrow direction="left" />
              </button>
              <button
                className="sic__nav-btn"
                type="button"
                aria-label="Next"
                onClick={() => splideRef.current?.go(">")}
                disabled={arrows.nextDisabled}
              >
                <Arrow direction="right" />
              </button>
            </div>
          </div>
        )}

        <SplideTrack>
          {slides.map((s, i) => (
            <SplideSlide key={i}>
              <Card slide={s} />
            </SplideSlide>
          ))}
        </SplideTrack>

        <div className="sic__nav sic__nav--mobile splide__arrows">
          <button
            className="sic__nav-btn splide__arrow splide__arrow--prev"
            aria-label="Previous"
          >
            <Arrow direction="left" />
          </button>
          <button
            className="sic__nav-btn splide__arrow splide__arrow--next"
            aria-label="Next"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </Splide>
    </section>
  );
}

function Card({ slide }: { slide: SimpleImageSlide }) {
  const content = (
    <>
      <div className="sic__media">
        <img
          className="sic__img"
          src={slide.image}
          alt={slide.title || ""}
          draggable={false}
          loading="lazy"
        />
      </div>
      {(slide.title || slide.subtitle) && (
        <div className="sic__meta">
          {slide.title && <p className="sic__title">{slide.title}</p>}
          {slide.subtitle && <p className="sic__subtitle">{slide.subtitle}</p>}
        </div>
      )}
    </>
  );

  if (!slide.url) {
    return <div className="sic__card">{content}</div>;
  }

  return (
    <a
      className="sic__card"
      href={slide.url}
      draggable={false}
      {...(slide.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {content}
    </a>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
    >
      <title>{direction === "left" ? "Previous" : "Next"}</title>
      <path d="M5 12H19" />
      <path d="M12 5L19 12L12 19" />
    </svg>
  );
}
