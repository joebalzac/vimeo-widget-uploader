import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import "./ValuesCarouselStyling.css";

export interface ValueItem {
  /** Card heading, e.g. "Be Great and Good". */
  title: string;
  /** Supporting paragraph shown under the title. */
  description: string;
  /**
   * Direct video URL (e.g. a Webflow CDN .mp4). Rendered as a muted, looping,
   * autoplaying background <video>. Takes priority over vimeoId when both set.
   */
  videoSrc?: string;
  /** Numeric Vimeo ID, e.g. "76979871". Used as a looping background player when videoSrc is empty. */
  vimeoId?: string;
  /** Optional poster image shown before the video paints / if it can't play. */
  poster?: string;
}

export interface ValuesCarouselProps {
  eyebrow?: string;
  heading?: string;
  items?: ValueItem[];
  /** Visible cards per page at desktop. Leave 0/undefined to use fixed-width peek layout. */
  perPage?: number;
  /** Fixed card width for the "next card peeks" layout. Default "476px" (Figma). */
  fixedWidth?: string;
}

const PLACEHOLDER_ITEMS: ValueItem[] = [
  {
    title: "Be Great and Good",
    description:
      "We dream big and take bold bets. We build things that change the game and improve the world. The bigger our impact, the greater our responsibility.",
  },
  {
    title: "Make Magic",
    description:
      "We make the hard things feel easy. We stay close to our customers and obsess over solving their real problems by turning complexity into clarity.",
  },
  {
    title: "Own the Outcome",
    description:
      "We take the problem, run with it, and deliver. Forget titles or egos. We own problems end-to-end, even when it means stepping outside our lanes.",
  },
  {
    title: "No Passengers, Only Crew",
    description:
      "Every seat here is earned and everyone on board moves the mission forward. We work with people who elevate the standard.",
  },
  {
    title: "Ship Fast, Improve Faster",
    description:
      "Speed wins. We move fast, stay scrappy, and ship quickly. Progress beats perfection, so we launch, test, and improve.",
  },
  {
    title: "Winning is Hard",
    description:
      "We take on problems others avoid. In order to win, we push harder, move faster, and do what it takes to achieve our vision.",
  },
];

function CardMedia({ item }: { item: ValueItem }) {
  if (item.videoSrc) {
    return (
      <video
        className="vc__video"
        src={item.videoSrc}
        poster={item.poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  if (item.vimeoId) {
    // background=1 hides controls and gives a clean muted, looping autoplay player.
    const src = `https://player.vimeo.com/video/${item.vimeoId}?background=1&autoplay=1&loop=1&muted=1&autopause=0&dnt=1`;
    return (
      <iframe
        className="vc__video"
        src={src}
        title={item.title}
        allow="autoplay; fullscreen; picture-in-picture"
        frameBorder={0}
        aria-hidden="true"
      />
    );
  }

  return null;
}

export default function ValuesCarousel({
  eyebrow = "How we work",
  heading = "Values That Power Our People",
  items = PLACEHOLDER_ITEMS,
  perPage,
  fixedWidth = "476px",
}: ValuesCarouselProps) {
  const useFixed = !perPage;

  // Left offset matches the site container (max-width: 90rem, width: 90%, centered).
  // At viewports < 100rem: 5vw each side. At >= 100rem: (100vw - 90rem) / 2.
  const containerPad = "max(5vw, calc((100vw - 90rem) / 2))";

  const options = {
    type: "slide" as const,
    perMove: 1,
    gap: "12px",
    arrows: true,
    pagination: false,
    drag: true,
    padding: { left: containerPad, right: "0" },
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
        padding: { left: "24px", right: "24px" },
        trimSpace: false,
        arrows: true,
        start: 0,
      },
    },
  };

  return (
    <section className="vc">
      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="vc__splide"
      >
        <div className="vc__container">
          <div className="vc__head">
            <div className="vc__head-copy">
              <div className="vc__eyebrow">
                <span className="vc__eyebrow-dot" aria-hidden="true" />
                <span>{eyebrow}</span>
              </div>
              <h2 className="vc__heading">{heading}</h2>
            </div>
          </div>
        </div>

        <SplideTrack>
          {items.map((item, i) => (
            <SplideSlide key={i}>
              <article className={`vc__card${i === 0 ? " vc__card--solid" : ""}`}>
                <div className="vc__card-text">
                  <p className="vc__card-title">{item.title}</p>
                  <p className="vc__card-desc">{item.description}</p>
                </div>
                <div className="vc__media">
                  <CardMedia item={item} />
                </div>
              </article>
            </SplideSlide>
          ))}
        </SplideTrack>

        {/* Nav: absolute top-right on desktop, static below track on mobile */}
        <div className="vc__nav splide__arrows">
          <button
            className="vc__nav-btn splide__arrow splide__arrow--prev"
            aria-label="Previous"
          >
            <Arrow direction="left" />
          </button>
          <button
            className="vc__nav-btn splide__arrow splide__arrow--next"
            aria-label="Next"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </Splide>
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
