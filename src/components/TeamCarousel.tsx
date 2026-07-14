import { useState, useEffect, useCallback, useRef } from "react";
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
  /** When false, hides the eyebrow/heading/CTA header and moves the nav arrows
   *  to the bottom-left, 48px beneath the carousel (Figma 18125-27752). */
  showHeader?: boolean;
}

const PLACEHOLDER_MEMBERS: TeamMember[] = [
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
  { name: "Lorem Ipsum", label: "Name", vimeoId: "" },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* Request a large thumbnail so it stays crisp on retina cards (card is up to
   ~476px wide → ~2x on high-DPR screens). Vimeo's oembed default is ~295px. */
const THUMB_WIDTH = 960;

/* Vimeo CDN thumbnails encode their size either in the path (…_295x166.jpg) or
   as a query param (?…w=295). Bump whichever form is present so the browser
   isn't upscaling a small image to fill the card. */
function upscaleThumb(url: string): string {
  return url
    .replace(/_\d+x\d+(?=\.\w+($|\?)|$|\?)/, `_${THUMB_WIDTH}`)
    .replace(/([?&](?:w|mw)=)\d+/, `$1${THUMB_WIDTH}`);
}

function useVimeoData(members: TeamMember[]) {
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [durations, setDurations] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = members.map((m) => m.vimeoId).filter((id) => id && !thumbs[id]);
    if (!ids.length) return;
    ids.forEach((id) => {
      fetch(
        `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=${THUMB_WIDTH}`,
      )
        .then((r) => r.json())
        .then((data) => {
          if (data?.thumbnail_url) {
            const url = upscaleThumb(data.thumbnail_url);
            setThumbs((prev) => ({ ...prev, [id]: url }));
            // Warm the browser cache so the image is decoded before it paints.
            const img = new Image();
            img.src = url;
          }
          if (typeof data?.duration === "number") {
            setDurations((prev) => ({
              ...prev,
              [id]: formatDuration(data.duration),
            }));
          }
        })
        .catch(() => {});
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.map((m) => m.vimeoId).join(",")]);

  return { thumbs, durations };
}

export default function TeamCarousel({
  eyebrow = "people behind the product",
  heading = "Hear From Our Team",
  ctaLabel = "Meet Our Team",
  ctaHref = "#",
  members = PLACEHOLDER_MEMBERS,
  perPage,
  fixedWidth = "444px",
  showHeader = true,
}: TeamCarouselProps) {
  const [active, setActive] = useState<TeamMember | null>(null);
  const useFixed = !perPage;
  const { thumbs: autoThumbs, durations: autoDurations } =
    useVimeoData(members);

  // Splide only wires the first prev/next it finds in the DOM, so the mobile
  // nav (rendered after the track) is the Splide-controlled set. The desktop
  // nav lives inside the header container and is driven manually through this
  // ref, mirroring the disabled state Splide reports via onArrowsUpdated.
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
    <section className={`tc${showHeader ? "" : " tc--no-header"}`}>
      <Splide
        hasTrack={false}
        options={options}
        aria-label={heading}
        className="tc__splide"
        ref={splideRef}
        onArrowsUpdated={onArrowsUpdated}
      >
        {showHeader && (
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

            {/* Desktop nav — sits flex-end alongside the header copy. Driven
                manually via the Splide ref (the mobile set below is the one
                Splide binds to). */}
            <div className="tc__nav tc__nav--desktop">
              <button
                className="tc__nav-btn"
                type="button"
                aria-label="Previous"
                onClick={() => splideRef.current?.go("<")}
                disabled={arrows.prevDisabled}
              >
                <Arrow direction="left" />
              </button>
              <button
                className="tc__nav-btn"
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
          {members.map((m, i) => {
            const thumb = m.thumbnail || autoThumbs[m.vimeoId];
            const duration = m.duration || autoDurations[m.vimeoId];
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
                    {duration && (
                      <span className="tc__badge-duration">{duration}</span>
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

                  {/* Full-card hover overlay: dark blur + "Watch Video" pill.
                      Always rendered so hover effect shows; disabled prevents
                      click when no video is wired up. */}
                  <button
                    className="tc__card-overlay"
                    type="button"
                    aria-label={`Watch ${m.name}'s video`}
                    onClick={open}
                    disabled={!canPlay}
                  >
                    <span className="tc__watch-pill">Watch Video</span>
                  </button>
                </article>
              </SplideSlide>
            );
          })}
        </SplideTrack>

        {/* Mobile nav (also the header-less desktop nav): the Splide-bound set.
            Shown below the track on mobile, and bottom-left under the track when
            there's no header. Hidden on desktop when the header nav is present. */}
        <div className="tc__nav tc__nav--mobile splide__arrows">
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
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      style={{ transform: direction === "left" ? "rotate(180deg)" : undefined }}
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 5L19 12L12 19"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
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
