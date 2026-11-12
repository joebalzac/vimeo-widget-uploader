import "../utils/interVariableFont";
import { motion, type Variants } from "framer-motion";
import "./OperatorTestimonials.css";
import { DEFAULT_TESTIMONIALS, type Testimonial } from "./operatorTestimonialsData";

export interface OperatorTestimonialsProps {
  items?: Testimonial[];
  className?: string;
}

const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const EZ = [0.22, 0.8, 0.24, 1] as const;

const cardV = (i: number): Variants => ({
  pre: { opacity: 0, y: 16 },
  in: {
    opacity: 1,
    y: 0,
    transition: { opacity: { duration: 0.6, delay: i * 0.1, ease: CSS_EASE }, y: { duration: 0.8, delay: i * 0.1, ease: EZ } },
  },
});

/**
 * OperatorTestimonials — three quote cards in a bordered row ("What Operators Are Saying").
 * Figma: node 204:8333 (desktop), 214:15428 (mobile), .com_2027. The heading is a separate
 * SectionHeading. Cards fade up in sequence on scroll and tint on hover; they stack at <=1000px.
 */
export default function OperatorTestimonials({ items = DEFAULT_TESTIMONIALS, className }: OperatorTestimonialsProps) {
  const visible = items.filter((t) => t.quote.trim());
  if (!visible.length) return null;
  return (
    <motion.div
      className={["opt", className].filter(Boolean).join(" ")}
      initial="pre"
      whileInView="in"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -6% 0px" }}
    >
      {visible.map((t, i) => (
        <motion.figure key={i} className={i === 0 ? "opt__card opt__card--first" : "opt__card"} variants={cardV(i)}>
          <p className="opt__quote">{t.quote}</p>
          <figcaption className="opt__person">
            {t.avatarSrc ? (
              <img className="opt__avatar" src={t.avatarSrc} alt="" />
            ) : (
              <span className="opt__avatar" aria-hidden="true" />
            )}
            <span className="opt__who">
              <span className="opt__name">{t.name}</span>
              <span className="opt__role">{t.role}</span>
            </span>
          </figcaption>
        </motion.figure>
      ))}
    </motion.div>
  );
}
