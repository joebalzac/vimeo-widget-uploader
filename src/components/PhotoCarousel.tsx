import { useRef, useCallback, useState } from "react";
import "./PhotoCarousel.css";

export interface PhotoItem {
  /** Image URL. */
  src: string;
  /** Alt text for the image. */
  alt?: string;
  /** Card width in px. Defaults alternate portrait/landscape if omitted. */
  width?: number;
  /** Card height in px. */
  height?: number;
}

export interface PhotoCarouselProps {
  /** Optional small label above the gallery. Hidden when empty. */
  eyebrow?: string;
  /** Optional heading above the gallery. Hidden when empty. */
  heading?: string;
  items?: PhotoItem[];
}

/** Figma alternates portrait (200×260) and landscape (300×200) cards, with one
    taller 230×300 hero in the middle. Defaults mirror that rhythm. */
const PLACEHOLDER_ITEMS: PhotoItem[] = [
  { src: "https://picsum.photos/id/1011/400/520", width: 200, height: 260 },
  { src: "https://picsum.photos/id/1025/600/400", width: 300, height: 200 },
  { src: "https://picsum.photos/id/1005/400/520", width: 200, height: 260 },
  { src: "https://picsum.photos/id/1043/600/400", width: 300, height: 200 },
  { src: "https://picsum.photos/id/1062/460/600", width: 230, height: 300 },
  { src: "https://picsum.photos/id/1074/600/400", width: 300, height: 200 },
  { src: "https://picsum.photos/id/1027/400/520", width: 200, height: 260 },
  { src: "https://picsum.photos/id/1084/600/400", width: 300, height: 200 },
  { src: "https://picsum.photos/id/1080/400/520", width: 200, height: 260 },
];

export default function PhotoCarousel({
  eyebrow = "",
  heading = "",
  items = PLACEHOLDER_ITEMS,
}: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

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

  const showHead = Boolean(eyebrow || heading);

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
        onClickCapture={onClickCapture}
        role="list"
        aria-label={heading || "Photo gallery"}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="pg__card"
            role="listitem"
            style={
              {
                "--pg-w": `${item.width ?? 200}px`,
                "--pg-h": `${item.height ?? 260}px`,
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
