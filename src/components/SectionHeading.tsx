import "../utils/interVariableFont";
import { motion } from "framer-motion";
import "./SectionHeading.css";

export interface SectionHeadingProps {
  heading?: string;
  /** Optional eyebrow above the heading (purple marker + mono caption). */
  eyebrow?: string;
  align?: "center" | "left";
  /** "dark" = white text, for dark sections such as Mystery Shopping. */
  theme?: "light" | "dark";
  /** Max text width in px — Figma: 501 (Bento), 418 (Apollo), 474 (Mystery Shopping). */
  maxWidth?: number;
  className?: string;
}

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;

/**
 * SectionHeading — the 48px section headline used above each .com_2027 section
 * (Bento 214:15376, Apollo 204:14686, Mystery Shopping 204:8281). Kept separate from
 * the section components so headings can be edited and placed freely in Webflow.
 * Reveals once on scroll (fade + 18px rise).
 */
export default function SectionHeading({
  heading = "See & Improve Every Tour at Scale",
  eyebrow,
  align = "center",
  theme = "light",
  maxWidth = 501,
  className,
}: SectionHeadingProps) {
  return (
    <motion.div
      className={["sh", `sh--${align}`, `sh--${theme}`, className].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -6% 0px" }}
      transition={{ opacity: { duration: 0.8, ease: CSS_EASE }, y: { duration: 1, ease: EZ } }}
    >
      {eyebrow && (
        <div className="sh__eyebrow">
          <i className="sh__marker" />
          <span>{eyebrow}</span>
        </div>
      )}
      <h2 className="sh__title" style={{ maxWidth }}>
        {heading}
      </h2>
    </motion.div>
  );
}
