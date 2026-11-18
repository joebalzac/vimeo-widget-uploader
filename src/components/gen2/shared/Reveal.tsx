import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { CSS_EASE, EZ } from "./motion";

export interface RevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
}

/** Fade + rise once on scroll. The shared entrance for every Gen2 section. */
export default function Reveal({ delay = 0, y = 18, amount = 0.18, children, ...rest }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -6% 0px" }}
      transition={{
        opacity: { duration: 0.8, delay, ease: CSS_EASE },
        y: { duration: 1, delay, ease: EZ },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
