import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

/* handoff gradients.css §2 · Apollo ring */
const SPRING = { stiffness: 38, damping: 24, mass: 1 };
const MOBILE_MQ = "(max-width: 767px)";
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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
 * Scroll-linked ring behind the Apollo section (designer gradients package §2):
 * a 1160px (mobile 640px) soft ring whose conic band rotates every 24s, inside a wrapper whose
 * scale / opacity / blur follow the section's scroll progress (top enters → bottom leaves,
 * spring 38/24/1).
 *
 * Webflow: the section padding lives OUTSIDE this component, so the ring layer bleeds out of the
 * component box by `--g2a-ring-bleed-top/bottom` (default = the prototype's section padding:
 * 60/0 desktop, 48/40 mobile) and is stretched horizontally to the viewport (measured, so it
 * never causes horizontal scroll). The prototype's soft top/bottom mask then sits on that layer,
 * so the ring fades out instead of being cut at the component's edge. Not rendered under
 * reduced motion (same as the prototype).
 */
export default function RingBackdrop({ reduced }: { reduced: boolean }) {
  const mobile = useIsMobile();
  const layerRef = useRef<HTMLDivElement>(null);

  /* span the viewport horizontally whatever the component's own width/offset */
  useIsoLayoutEffect(() => {
    const el = layerRef.current;
    const host = el?.parentElement;
    if (!el || !host) return;
    const fit = () => {
      const r = host.getBoundingClientRect();
      const vw = document.documentElement.clientWidth || window.innerWidth;
      el.style.left = `${-r.left}px`;
      el.style.width = `${vw}px`;
      el.style.right = "auto";
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    ro.observe(document.documentElement);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [reduced]);

  /* the ring layer has the prototype section's box, so it is the progress target */
  const { scrollYProgress } = useScroll({ target: layerRef, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, SPRING);

  const scale = useTransform(p, [0.04, 0.42], mobile ? [0.18, 3.4] : [0.18, 1.75]);
  const opacity = useTransform(
    p,
    mobile ? [0.04, 0.16, 0.3, 0.44] : [0.04, 0.18, 0.86, 0.98],
    mobile ? [0, 0.85, 0.45, 0] : [0, 0.85, 0.85, 0],
  );
  const filter = useTransform(p, [0.04, 0.42], ["blur(48px)", "blur(70px)"]);

  if (reduced) return null;
  return (
    <div ref={layerRef} className="g2a-ring" aria-hidden>
      <motion.div className="g2a-ring__wrap" style={{ scale, opacity, filter }}>
        <div className="g2a-ring__ring">
          <i className="g2a-ring__band" />
        </div>
      </motion.div>
    </div>
  );
}
