import type { RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import ringSvg from "../../../assets/gen2/apollo/ring.svg";

const SPRING = { stiffness: 38, damping: 24 };

/**
 * Scroll-linked ring behind the Apollo section (handoff 05-apollo · Ring backdrop),
 * drawn with Figma's own soft lilac ellipse (769:178739: a 10px #BEBEF8 stroke,
 * 1160 across, blurred 50). While the section scrolls in it grows from scale .18 to its
 * Figma size; it then holds and only fades once the section has scrolled away.
 * Progress is spring-smoothed.
 */
export default function RingBackdrop({ target, reduced }: { target: RefObject<HTMLElement | null>; reduced: boolean }) {
  /* 0 when the section's top enters at the bottom → 1 when it reaches the top */
  const { scrollYProgress: inRaw } = useScroll({ target, offset: ["start end", "start start"] });
  /* 0 when the section's bottom is mid-screen → 1 when it has left the top */
  const { scrollYProgress: outRaw } = useScroll({ target, offset: ["end 0.5", "end start"] });
  const grow = useSpring(inRaw, SPRING);
  const leave = useSpring(outRaw, SPRING);
  const scale = useTransform(grow, [0, 1], [0.18, 1]);
  const opacity = useTransform(leave, [0, 1], [1, 0]);

  return (
    <div className="g2a-ringwrap" aria-hidden>
      <motion.div className="g2a-ring" style={reduced ? undefined : { scale, opacity }}>
        <img className="g2a-ring__img" src={ringSvg} alt="" />
      </motion.div>
    </div>
  );
}
