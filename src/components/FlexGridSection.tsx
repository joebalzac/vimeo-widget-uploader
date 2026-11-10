import "../utils/interVariableFont";
import type { CSSProperties, ReactNode } from "react";
import "./FlexGridSection.css";

export interface FlexGridItem {
  /** Stable key for the item. Falls back to its index. */
  id?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** Rendered in place of imageSrc when provided (e.g. a live component preview). */
  media?: ReactNode;
  headline?: string;
  /** Secondary line below the headline — e.g. a dev/animation note. */
  caption?: string;
}

export interface FlexGridSectionProps {
  items?: FlexGridItem[];
  /** Columns on desktop. Collapses to 2 on tablet and 1 on mobile. */
  columns?: number;
  className?: string;
}

/**
 * FlexGridSection — a wrapping flex grid of image + headline items.
 *
 * Figma: node 214-15375 (.com_2027). Styling is provisional: it has not been
 * compared against the design yet.
 */
export default function FlexGridSection({
  items = [],
  columns = 3,
  className,
}: FlexGridSectionProps) {
  const visible = items.filter(
    (item) => item.imageSrc || item.media || item.headline
  );
  if (!visible.length) return null;

  return (
    <section
      className={["fgs", className].filter(Boolean).join(" ")}
      style={{ "--fgs-cols-desktop": columns } as CSSProperties}
    >
      <div className="fgs__grid">
        {visible.map((item, i) => (
          <article className="fgs__item" key={item.id ?? i}>
            {(item.media || item.imageSrc) && (
              <div className="fgs__media">
                {item.media ??
                  (item.imageSrc && (
                    <img
                      className="fgs__img"
                      src={item.imageSrc}
                      alt={item.imageAlt ?? ""}
                      loading="lazy"
                    />
                  ))}
              </div>
            )}
            {item.headline && <h3 className="fgs__headline">{item.headline}</h3>}
            {item.caption && <p className="fgs__caption">{item.caption}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}
