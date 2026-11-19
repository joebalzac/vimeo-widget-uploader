import { useEffect, useState, type RefObject } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const SPRING = { stiffness: 38, damping: 24 };
const MOBILE_MQ = "(max-width: 480px)";

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return m;
}

/**
 * Scroll-linked ring behind the Apollo section (handoff 05-apollo · Ring backdrop):
 * a soft ring whose band is a slowly rotating conic gradient (lilac · page-colour gaps ·
 * sky · white · lilac · sky), masked to a ~140px soft band.
 * Desktop: grows from the centre (scale .18 → 1.75, edges at the screen sides) while the
 * section scrolls in, blur 48 → 70px; holds; fades once the section has scrolled away.
 * Mobile (v124): keeps expanding (.18 → 3.4) and is fully faded by 44% of the section scroll.
 * Progress is spring-smoothed (stiffness 38, damping 24).
 */
export default function RingBackdrop({ target, reduced }: { target: RefObject<HTMLElement | null>; reduced: boolean }) {
  const mobile = useIsMobile();
  /* 0 when the section's top enters at the bottom → 1 when it reaches the top */
  const { scrollYProgress: inRaw } = useScroll({ target, offset: ["start end", "start start"] });
  /* 0 when the section's bottom is mid-screen → 1 when it has left the top */
  const { scrollYProgress: outRaw } = useScroll({ target, offset: ["end 0.5", "end start"] });
  /* whole pass: top enters at the bottom → bottom leaves at the top (mobile) */
  const { scrollYProgress: allRaw } = useScroll({ target, offset: ["start end", "end start"] });
  const grow = useSpring(inRaw, SPRING);
  const leave = useSpring(outRaw, SPRING);
  const all = useSpring(allRaw, SPRING);

  const dScale = useTransform(grow, [0, 1], [0.18, 1.75]);
  const dBlur = useTransform(grow, [0, 1], [48, 70], { clamp: true });
  const dOpacity = useTransform(leave, [0, 1], [1, 0]);
  const mScale = useTransform(all, [0, 0.44], [0.18, 3.4]);
  const mBlur = useTransform(all, [0, 0.44], [48, 70]);
  const mOpacity = useTransform(all, [0.2, 0.44], [1, 0]);

  const filter = useTransform(mobile ? mBlur : dBlur, (b) => `blur(${b}px)`);

  return (
    <motion.div className="g2a-ringwrap" aria-hidden style={reduced ? undefined : { filter }}>
      <motion.div
        className="g2a-ring"
        style={
          reduced
            ? undefined
            : { scale: mobile ? mScale : dScale, opacity: mobile ? mOpacity : dOpacity }
        }
      >
        <div className="g2a-ring__band" />
      </motion.div>
    </motion.div>
  );
}
