import { useRef, useCallback, useState, useEffect } from "react";
import "./PhotoCarousel.css";

export interface PhotoItem {
  /** Image URL. */
  src: string;
  /** Alt text for the image. */
  alt?: string;
  /** Card width in px. Defaults to the Figma rhythm if omitted. */
  width?: number;
  /** Card height in px. Defaults to 300 (Figma). */
  height?: number;
}

export interface PhotoCarouselProps {
  /** Optional small label above the gallery. Hidden when empty. */
  eyebrow?: string;
  /** Optional heading above the gallery. Hidden when empty. */
  heading?: string;
  items?: PhotoItem[];
  /** Auto-scroll speed in px/second. Set to 0 to disable. */
  autoScrollSpeed?: number;
}

/** All cards share a 300px row height (Figma node 18716-12073); only the
    width varies per card. */
const PLACEHOLDER_ITEMS: PhotoItem[] = [
  { src: "https://picsum.photos/id/1011/245/300", width: 245, height: 300 },
  { src: "https://picsum.photos/id/1025/520/300", width: 520, height: 300 },
  { src: "https://picsum.photos/id/1005/300/300", width: 300, height: 300 },
  { src: "https://picsum.photos/id/1043/400/300", width: 400, height: 300 },
  { src: "https://picsum.photos/id/1062/480/300", width: 480, height: 300 },
  { src: "https://picsum.photos/id/1074/245/300", width: 245, height: 300 },
  { src: "https://picsum.photos/id/1027/520/300", width: 520, height: 300 },
  { src: "https://picsum.photos/id/1084/400/300", width: 400, height: 300 },
  { src: "https://picsum.photos/id/1080/450/300", width: 450, height: 300 },
];

export default function PhotoCarousel({
  eyebrow = "",
  heading = "",
  items = PLACEHOLDER_ITEMS,
  autoScrollSpeed = 40,
}: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const hovered = useRef(false);

  // Drag-to-scroll state. moved tracks whether the pointer travelled far enough
  // to count as a drag (vs. a click), so hover/click aren't triggered mid-drag.
  const drag = useRef({ startX: 0, scrollLeft: 0, active: false, moved: false });

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    drag.current = {
      startX: e.clientX,
      scrollLeft: track.scrollLeft,
      active: true,
      moved: false,
    };
    setDragging(true);
    track.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    track.scrollLeft = drag.current.scrollLeft - dx;
  }, []);

  const endDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (track?.hasPointerCapture(e.pointerId)) {
      track.releasePointerCapture(e.pointerId);
    }
    drag.current.active = false;
    setDragging(false);
  }, []);

  // Suppress the click that fires after a drag so links/images don't activate.
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // Continuous auto-scroll. The item list is rendered twice back-to-back so
  // scrolling past the first copy can snap back by exactly half the track's
  // scrollWidth with no visible seam. Paused while dragging or hovered, and
  // skipped entirely for reduced-motion users.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || autoScrollSpeed <= 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let rafId: number;
    let last = performance.now();
    // Sub-pixel-per-frame speeds get rounded away if we read scrollLeft back
    // from the DOM each tick (browsers round it to an integer), so track the
    // precise position ourselves and only ever write it, not read it back.
    let pos = track.scrollLeft;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (drag.current.active || hovered.current) {
        pos = track.scrollLeft;
      } else {
        const half = track.scrollWidth / 2;
        pos += (autoScrollSpeed * dt) / 1000;
        if (pos >= half) pos -= half;
        track.scrollLeft = pos;
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(rafId);
  }, [autoScrollSpeed, items]);

  const onPointerEnter = useCallback(() => {
    hovered.current = true;
  }, []);

  const onPointerLeave = useCallback(() => {
    hovered.current = false;
  }, []);

  const showHead = Boolean(eyebrow || heading);
  const loop = autoScrollSpeed > 0;
  const renderedItems = loop ? [...items, ...items] : items;

  return (
    <section className="pg">
      {showHead && (
        <div className="pg__container">
          <div className="pg__head">
            {eyebrow && (
              <div className="pg__eyebrow">
                <span className="pg__eyebrow-dot" aria-hidden="true" />
                <span>{eyebrow}</span>
              </div>
            )}
            {heading && <h2 className="pg__heading">{heading}</h2>}
          </div>
        </div>
      )}

      <div
        ref={trackRef}
        className={`pg__track${dragging ? " pg__track--dragging" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onClickCapture={onClickCapture}
        role="list"
        aria-label={heading || "Photo gallery"}
      >
        {renderedItems.map((item, i) => (
          <div
            key={i}
            className="pg__card"
            role="listitem"
            aria-hidden={loop && i >= items.length ? true : undefined}
            style={
              {
                "--pg-w": `${item.width ?? 245}px`,
                "--pg-h": `${item.height ?? 300}px`,
              } as React.CSSProperties
            }
          >
            <img
              className="pg__img"
              src={item.src}
              alt={item.alt ?? ""}
              draggable={false}
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
