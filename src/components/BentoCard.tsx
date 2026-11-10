import "../utils/interVariableFont";
import type { ReactNode } from "react";
import "./BentoCard.css";

export interface BentoCardProps {
  title: string;
  subtitle: string;
  media: ReactNode;
  /** Design width in px — 430 (narrow) or 718 (wide). */
  width?: number;
  className?: string;
}

/**
 * BentoCard — the card chrome shared by every "Bento" feature card: a
 * rounded, tinted frame with a title + subtitle above the media preview.
 * Figma: node 330:29920 ("Bento"), .com_2027.
 */
export default function BentoCard({
  title,
  subtitle,
  media,
  width = 430,
  className,
}: BentoCardProps) {
  return (
    <div
      className={["bc", className].filter(Boolean).join(" ")}
      style={{ flex: `1 1 ${width}px`, maxWidth: width }}
    >
      <div className="bc__text">
        <p className="bc__title">{title}</p>
        <p className="bc__subtitle">{subtitle}</p>
      </div>
      <div className="bc__media">{media}</div>
      <div className="bc__border" />
    </div>
  );
}
