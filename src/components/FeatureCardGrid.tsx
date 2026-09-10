import type { CSSProperties } from "react";
import "./FeatureCardGrid.css";

export interface FeatureCard {
  /** Stable key for the card. Falls back to its index. */
  id?: string;
  /** Image shown in the media area above the text. */
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
}

export interface FeatureCardGridProps {
  cards?: FeatureCard[];
  /** Columns on desktop. Collapses to 2 on tablet and 1 on mobile. */
  columns?: number;
  /** Swaps text/divider colors for placement on a dark background. */
  theme?: "light" | "dark";
  /** How the image fills its media area. */
  imageFit?: "contain" | "cover";
  /** Outer frame + dividers between cards. */
  bordered?: boolean;
  className?: string;
}

const PLACEHOLDER_CARDS: FeatureCard[] = [
  {
    id: "workforce",
    title: "Smarter Workforce",
    subtitle:
      "Apollo gives every employee expert-level operational context from day one.",
  },
  {
    id: "utilization",
    title: "Maximize Product Utilization",
    subtitle:
      "Unlock the full power of products you already have with prompt-based actions.",
  },
  {
    id: "insights",
    title: "Asset Performance Insights",
    subtitle:
      "Give leaders eyes and ears to spot problems before they happen.",
  },
];

/**
 * FeatureCardGrid — a transparent, bordered grid of cards, each with an image,
 * a title, and a subtitle. Desktop lays the cards out in columns separated by
 * vertical dividers; mobile stacks them with horizontal dividers.
 *
 * Figma: desktop node 21512-9164, mobile node 21291-4275.
 */
export default function FeatureCardGrid({
  cards = PLACEHOLDER_CARDS,
  columns = 3,
  theme = "light",
  imageFit = "contain",
  bordered = true,
  className,
}: FeatureCardGridProps) {
  const visible = cards.filter(
    (card) => card.title || card.subtitle || card.imageSrc
  );
  if (!visible.length) return null;

  // Never ask for more columns than there are cards, or the frame would end
  // with an empty cell.
  const cols = Math.max(1, Math.min(Math.round(columns) || 3, visible.length));

  const rootClass = [
    "fcg",
    `fcg--${theme}`,
    `fcg--fit-${imageFit}`,
    bordered ? "fcg--bordered" : "",
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section
      className={rootClass}
      style={{ "--fcg-cols-desktop": cols } as CSSProperties}
    >
      <div className="fcg__grid">
        {visible.map((card, i) => (
          <article className="fcg__card" key={card.id ?? i}>
            <div className="fcg__media">
              {card.imageSrc && (
                <img
                  className="fcg__img"
                  src={card.imageSrc}
                  alt={card.imageAlt ?? card.title ?? ""}
                  loading="lazy"
                />
              )}
            </div>
            <div className="fcg__text">
              {card.title && <h3 className="fcg__title">{card.title}</h3>}
              {card.subtitle && (
                <p className="fcg__subtitle">{card.subtitle}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
