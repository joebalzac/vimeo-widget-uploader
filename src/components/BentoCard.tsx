import "../utils/interVariableFont";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import "./BentoCard.css";

export interface BentoCardProps {
  title: string;
  subtitle: string;
  media: ReactNode;
  /** Wide (718px) card — its header text keeps 180px clear on the right, as in Figma. */
  wide?: boolean;
  className?: string;
}

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;

/**
 * BentoCard — the card chrome shared by every "Bento" feature card: a
 * rounded, tinted frame with a title + subtitle above the media preview.
 * Sized by its grid cell (see BentoBoxSection). Fades up once on scroll.
 * Figma: node 330:29920 ("Bento"), .com_2027.
 */
export default function BentoCard({ title, subtitle, media, wide, className }: BentoCardProps) {
  return (
    <motion.div
      className={["bc", wide ? "bc--wide" : "", className].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -6% 0px" }}
      transition={{ opacity: { duration: 0.8, ease: CSS_EASE }, y: { duration: 1, ease: EZ } }}
    >
      <div className="bc__text">
        <p className="bc__title">{title}</p>
        <p className="bc__subtitle">{subtitle}</p>
      </div>
      <div className="bc__media">{media}</div>
      <div className="bc__border" />
    </motion.div>
  );
}
