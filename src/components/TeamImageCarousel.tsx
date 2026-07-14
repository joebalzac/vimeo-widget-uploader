import { useRef, useState } from "react";
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./TeamImageCarouselStyling.css";

export interface TeamImageMember {
  /** Full name shown at the bottom of the card. */
  name: string;
  /** Role / title shown under the name. */
  role: string;
  /** Quote revealed on hover under the blur overlay. */
  quote?: string;
  /** Image URL for the team member's photo. */
  image: string;
}

export interface TeamImageCarouselProps {
  eyebrow?: string;
  heading?: string;
  members?: TeamImageMember[];
  /** Visible cards per page at desktop. Leave 0/undefined to use fixed-width peek layout. */
  perPage?: number;
  /** Fixed card width for the "next card peeks" layout. Default "476px" (Figma). */
  fixedWidth?: string;
  /** When false, hides the eyebrow/heading header and moves the nav arrows to
   *  the bottom-left, 48px beneath the carousel (32px on mobile). */
  showHeader?: boolean;
}

const PLACEHOLDER_MEMBERS: TeamImageMember[] = [
  {
    name: "Ryan St. Pierre",
    role: "VP of Engineering",
    quote:
      "EliseAI transformed the way our team works. We respond faster, automate repetitive tasks, and provide a better experience for every resident and prospect. It's become an essential part of our daily operations.",
    image: "https://picsum.photos/id/1005/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "Working here means owning real problems end to end and shipping work that reaches millions of people every day.",
    image: "https://picsum.photos/id/1011/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "The pace is unreal. We move fast, learn faster, and the people around you push you to do the best work of your career.",
    image: "https://picsum.photos/id/1027/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "I get to work on hard technical challenges with a team that genuinely cares about the impact we have on customers.",
    image: "https://picsum.photos/id/1012/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "There's a rare mix of autonomy and support here. You're trusted to make big decisions from day one.",
    image: "https://picsum.photos/id/1025/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "Every project feels meaningful. We're building something generational and you can feel it in the work.",
    image: "https://picsum.photos/id/1074/476/520",
  },
  {
    name: "Name",
    role: "Role",
    quote:
      "The people make it. I'm surrounded by talented, driven folks who show up for each other every single day.",
    image: "https://picsum.photos/id/1062/476/520",
  },
];

export default function TeamImageCarousel({
  eyebrow = "Building with the best",
  heading = "Meet the Engineers",
  members = PLACEHOLDER_MEMBERS,
  perPage,
  fixedWidth = "476px",
  showHeader = true,
}: TeamImageCarouselProps) {
  const useFixed = !perPage;

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

  // Left offset matches the site container (max-width: var(--container-max), width: 90%,
  // centered; --container-max steps from 90rem to 100rem at 1440px and 120rem at 1920px).
  const containerPad = "max(5vw, calc((100vw - var(--container-max)) / 2))";

  const options = {
    type: "slide" as const,
    perMove: 1,
    gap: "12px",
    arrows: true,
    // Trim the trailing empty space so the last slide reaches the right edge
    // and the "next" arrow becomes disabled at the final slide.
    omitEnd: true,
    pagination: false,
    drag: true,
    // Left/right padding = container margin so the first slide starts at the
    // left container edge and the last slide rests at the right container edge.
    // Slides in between overflow through the margins and off screen.
    padding: { left: containerPad, right: containerPad },
    ...(useFixed ? { fixedWidth, focus: 0 } : { perPage }),
    breakpoints: {
      // Tablet: section padding handles alignment; reset Splide padding.
      991: {
        ...(useFixed ? { fixedWidth: "380px" } : { perPage: 2 }),
        padding: { left: "0", right: "0" },
      },
      767: {
        fixedWidth: 0,
        perPage: 1,
        padding: { left: "0", right: "0" },
        trimSpace: false,
        arrows: true,
        start: 0,
      },
    },
  };

  return (
    <section className={`tic${showHeader ? "" : " tic--no-header"}`}>
      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="tic__splide"
        ref={splideRef}
        onArrowsUpdated={onArrowsUpdated}
      >
        {showHeader && (
          <div className="tic__container">
            <div className="tic__head">
              <div className="tic__head-copy">
                <div className="tic__eyebrow">
                  <span className="tic__eyebrow-dot" aria-hidden="true" />
                  <span>{eyebrow}</span>
                </div>
                <h2 className="tic__heading">{heading}</h2>
              </div>
            </div>

            {/* Desktop nav — flex-end alongside the header copy. Driven manually
                via the Splide ref (the mobile set below is Splide-bound). */}
            <div className="tic__nav tic__nav--desktop">
              <button
                className="tic__nav-btn"
                type="button"
                aria-label="Previous"
                onClick={() => splideRef.current?.go("<")}
                disabled={arrows.prevDisabled}
              >
                <Arrow direction="left" />
              </button>
              <button
                className="tic__nav-btn"
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
          {members.map((m, i) => (
            <SplideSlide key={i}>
              <article className="tic__card">
                {/* Photo */}
                <img
                  className="tic__img"
                  src={m.image}
                  alt={m.name}
                  draggable={false}
                  loading="lazy"
                />

                {/* Bottom scrim keeps the name/role legible over the photo */}
                <div className="tic__scrim" aria-hidden="true" />

                {/* Hover overlay: dark blur + quote — on every card */}
                <div className="tic__overlay">
                  <QuoteMark />
                  <p className="tic__quote">{m.quote}</p>
                </div>

                {/* Name + role — always visible, sits above the blur */}
                <div className="tic__meta">
                  <p className="tic__name">{m.name}</p>
                  <p className="tic__role">{m.role}</p>
                </div>
              </article>
            </SplideSlide>
          ))}
        </SplideTrack>

        {/* Mobile nav (also the header-less desktop nav): the Splide-bound set.
            Below the track on mobile; bottom-left under the track when there's
            no header. Hidden on desktop when the header nav is present. */}
        <div className="tic__nav tic__nav--mobile splide__arrows">
          <button
            className="tic__nav-btn splide__arrow splide__arrow--prev"
            aria-label="Previous"
          >
            <Arrow direction="left" />
          </button>
          <button
            className="tic__nav-btn splide__arrow splide__arrow--next"
            aria-label="Next"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </Splide>
    </section>
  );
}

function QuoteMark() {
  return (
    <svg
      className="tic__quote-mark"
      width="22"
      height="16"
      viewBox="0 0 22 16"
      fill="#ffffff"
      aria-hidden="true"
    >
      <path d="M0 16V9.04C0 4.06 3.07 0.78 8.04 0V3.13C5.62 3.78 4.3 5.4 4.18 7.83H7.83V16H0Z" />
      <path d="M13.13 16V9.04C13.13 4.06 16.2 0.78 21.17 0V3.13C18.75 3.78 17.43 5.4 17.31 7.83H20.96V16H13.13Z" />
    </svg>
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
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
    >
      <path d="M5 12H19" />
      <path d="M12 5L19 12L12 19" />
    </svg>
  );
}
