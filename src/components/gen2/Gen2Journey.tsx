import "../../utils/interVariableFont";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";
import SectionHeading from "../SectionHeading";
import { FEATURES } from "./features/featuresData";
import { DRAW, E, Reveal, useLoop } from "./shared";
import circleUrl from "../../assets/gen2/journey/circle.svg";
import apolloMarkUrl from "../../assets/gen2/journey/apollo-mark.svg";
import "./Gen2Journey.css";

export interface Gen2JourneyProps {
  heading?: string;
  subtitle?: string;
  /** Six product labels, clockwise from the top. Missing entries fall back to the defaults. */
  products?: string[];
  /** The small static purple dots on the spokes (Figma). Off: the handoff says "no dots". */
  dots?: boolean;
  /**
   * Scroll-linked mode (the "Flatten" choreography, handoff 03). When set, the time loop is
   * off: `sweep` (0→1) draws the purple arc once and lights the products as it passes;
   * `heading` and `ring` are opacities for the heading block and for the ring graphic
   * (ring, names, dots, Apollo and background) so they can fade out on scroll.
   */
  scroll?: {
    sweep: MotionValue<number>;
    heading: MotionValue<number>;
    ring: MotionValue<number>;
  };
  className?: string;
}

export const DEFAULT_SUBTITLE =
  "From first inquiry to lease renewal, Elise handles it all, across text, voice, email, and web chat.";
/** Ring labels (v117 names), clockwise from the top: the same products as Features. */
const DEFAULT_PRODUCTS = FEATURES.map((f) => f.name);

/** Side labels break onto two lines at the space nearest the middle ("Tour / Intelligence"). */
function twoLines(label: string) {
  const mid = label.length / 2;
  let best = -1;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  return best < 0 ? label : `${label.slice(0, best)}\n${label.slice(best + 1)}`;
}

/*
 * Stage geometry. Figma's graphic container (697:176919) is 1200×600 with the circle centred at
 * (600,300); the stage keeps its x 280–920 slice (640×600), so the centre is (320,300).
 */
const W = 640;
const H = 600;
const CX = 320;
const CY = 300;
const R = 199.25; // Figma circle stroke centreline (400 box, 1.5 inside stroke)
const APOLLO_EDGE = 59; // spokes start at the Apollo disc's edge (117.84 / 2)
/** Stage heights: desktop crops to 60px below the circle (handoff); mobile keeps the full 600. */
const STAGE_H_DESK = 560;
const STAGE_H_MOB = 600;
/** Scale: 1 on desktop, 4/7 at a 393 phone (345 content + 2×24 gutters = 393 → 393/688). */
const FIT_W = 688;
const LEAD_DEG = 30; // fading lead on the progress arc (Figma "Growing Line")

const SWEEP_EASE = [0.45, 0.05, 0.3, 1] as const;
const SIDES = ["t", "r", "r", "b", "l", "l"] as const;
type Side = (typeof SIDES)[number];

const NODES = SIDES.map((side, i) => {
  const deg = 60 * i;
  const a = ((deg - 90) * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  return {
    side,
    deg,
    x: CX + R * cos,
    y: CY + R * sin,
    ix: CX + APOLLO_EDGE * cos,
    iy: CY + APOLLO_EDGE * sin,
  };
});
const SPOKE_LEN = R - APOLLO_EDGE;
const GLOW_LEN = 56;

/* Figma: labels sit 30.7 above/below the node centre, and 35 beside it with the first line centred. */
const LABEL_V = 30.7;
const LABEL_H = 35;
const HALF_LINE = 7.7;
function labelStyle(side: Side, x: number, y: number): React.CSSProperties {
  switch (side) {
    case "t":
      return { left: x, top: y - LABEL_V, transform: "translate(-50%, -100%)" };
    case "b":
      return { left: x, top: y + LABEL_V, transform: "translate(-50%, 0)" };
    case "r":
      return { left: x + LABEL_H, top: y - HALF_LINE };
    case "l":
      return { right: W - x + LABEL_H, top: y - HALF_LINE };
  }
}
const SLIDE: Record<Side, { x: number; y: number }> = {
  t: { x: 0, y: -8 },
  b: { x: 0, y: 8 },
  r: { x: 8, y: 0 },
  l: { x: -8, y: 0 },
};

/* Figma 697:176929 — static spoke dots, in stage coordinates (centres). `sq` = square dot. */
const DOTS: { x: number; y: number; sq?: boolean }[] = [
  { x: 320, y: 137 },
  { x: 320, y: 213 },
  { x: 188, y: 224 },
  { x: 320, y: 457.3 },
  { x: 320, y: 467.3 },
  { x: 401.9, y: 255.7 },
  { x: 393.2, y: 260.7 },
  { x: 219.9, y: 359.7 },
  { x: 211.2, y: 364.7 },
  { x: 416.1, y: 354.7, sq: true },
  { x: 466.2, y: 383.7 },
];

/** Point on the ring at `deg` clockwise from the top. */
function ringPt(deg: number, r = R) {
  const a = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}
function arcD(from: number, to: number, r = R) {
  const p0 = ringPt(from, r);
  const p1 = ringPt(to, r);
  const large = to - from > 180 ? 1 : 0;
  return `M${p0.x} ${p0.y}A${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`;
}

/** Fits the stage to the container. */
function useFit(frameRef: React.RefObject<HTMLDivElement | null>) {
  const [fit, setFit] = useState({ scale: 1, mobile: false });
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const sync = () => {
      const w = el.clientWidth;
      setFit({
        scale: Math.min(1, (w + 48) / FIT_W),
        mobile: window.matchMedia("(max-width: 761px)").matches,
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    if (el.parentElement?.parentElement) ro.observe(el.parentElement.parentElement); // section root (heading reflow)
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [frameRef]);
  return fit;
}

/**
 * Gen2Journey — "The Ideal Renter Journey" (handoff 03, Figma 642:88637 / mobile 642:139566).
 * Six products on a ring around the Apollo mark; a purple progress stroke (with a fading lead,
 * Figma's "Growing Line") sweeps clockwise, lighting each product's node, label and spoke as it
 * passes, holds, rewinds and loops while in view. Under reduced motion the fully lit frame shows.
 */
export default function Gen2Journey({
  heading = "The Ideal Renter Journey",
  subtitle = DEFAULT_SUBTITLE,
  products = DEFAULT_PRODUCTS,
  dots = false,
  scroll,
  className,
}: Gen2JourneyProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const frameRef = useRef<HTMLDivElement>(null);
  const { scale, mobile } = useFit(frameRef);
  const stageH = mobile ? STAGE_H_MOB : STAGE_H_DESK;

  const ownProgress = useMotionValue(0);
  const progress = scroll?.sweep ?? ownProgress;
  const leadRef = useRef<SVGPathElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const [lit, setLit] = useState(0);
  const litRef = useRef(0);
  const setLitN = (n: number) => {
    if (litRef.current === n) return;
    litRef.current = n;
    setLit(n);
  };

  /* Lead arc: from the sweep head forward LEAD_DEG, purple → transparent. */
  const drawLead = (v: number) => {
    const path = leadRef.current;
    const grad = gradRef.current;
    if (!path || !grad) return;
    const head = v * 360;
    const len = Math.min(LEAD_DEG, 360 - head);
    if (v <= 0 || len <= 0.5) {
      path.setAttribute("d", "");
      return;
    }
    const p0 = ringPt(head);
    const p1 = ringPt(head + len);
    path.setAttribute("d", arcD(head, head + len));
    grad.setAttribute("x1", String(p0.x));
    grad.setAttribute("y1", String(p0.y));
    grad.setAttribute("x2", String(p1.x));
    grad.setAttribute("y2", String(p1.y));
  };

  /* Lit products follow the sweep head. The loop resets its own count at 0; scroll mode
     unlights everything when the sweep is scrolled back to 0. */
  const litFor = (v: number) =>
    v <= 0 ? (scroll ? 0 : litRef.current) : Math.min(6, Math.floor(v * 6 + 1e-4) + 1);
  useMotionValueEvent(progress, "change", (v) => {
    drawLead(v);
    setLitN(litFor(v));
  });
  useLayoutEffect(() => {
    if (!scroll) return;
    drawLead(scroll.sweep.get());
    setLitN(litFor(scroll.sweep.get()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll?.sweep]);

  const { reduced } = useLoop(frameRef, async ({ wait, alive }) => {
    if (scroll) return; // scroll-linked: no time loop
    while (alive()) {
      progress.stop();
      progress.set(0);
      setLitN(1);
      await animate(progress, 1, { duration: 3.4, ease: SWEEP_EASE });
      if (!alive() || !(await wait(3000))) return;
      await animate(progress, 0, { duration: 1, ease: DRAW });
      if (!alive()) return;
      setLitN(0);
      if (!(await wait(400))) return;
    }
  });

  /* Reduced motion shows the fully lit ring (scroll mode is never used under reduced motion). */
  const still = reduced && !scroll; // jump, don't tween
  const shown = still ? 6 : lit;
  const labels = DEFAULT_PRODUCTS.map((d, i) => products[i]?.trim() || d);

  return (
    <div className={["g2j", className].filter(Boolean).join(" ")}>
      {/* No background of its own: the Webflow section supplies the background image. */}
      <motion.div className="g2j-head" style={{ opacity: scroll?.heading }}>
        <SectionHeading heading={heading} subtitle={subtitle} align="center" maxWidth={520} />
      </motion.div>

      <Reveal delay={0.2} className="g2j-fit">
        <motion.div ref={frameRef} className="g2j-frame" style={{ height: stageH * scale, opacity: scroll?.ring }}>
          <div
            className="g2j-stage"
            style={{ transform: `translateX(-50%) scale(${scale})` }}
          >
            <img className="g2j-circle" src={circleUrl} alt="" width={400} height={400} />

            <svg className="g2j-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              <defs>
                <linearGradient id={`${uid}-lead`} ref={gradRef} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#6B4FFF" />
                  <stop offset="1" stopColor="#F6F4F2" stopOpacity="0" />
                </linearGradient>
                {NODES.map((n, i) => (
                  <linearGradient
                    key={i}
                    id={`${uid}-spoke-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={n.ix}
                    y1={n.iy}
                    x2={n.x}
                    y2={n.y}
                  >
                    <stop offset="0" stopColor="#6B4FFF" />
                    <stop offset="0.55" stopColor="#6B4FFF" stopOpacity="0" />
                  </linearGradient>
                ))}
                {NODES.map((n, i) => (
                  <linearGradient
                    key={`g${i}`}
                    id={`${uid}-glow-${i}`}
                    gradientUnits="userSpaceOnUse"
                    x1={n.ix}
                    y1={n.iy}
                    x2={n.x}
                    y2={n.y}
                  >
                    <stop offset="0" stopColor="#6B4FFF" stopOpacity="0.9" />
                    <stop offset="1" stopColor="#6B4FFF" stopOpacity="0.15" />
                  </linearGradient>
                ))}
              </defs>

              {/* Lit spokes: purple at Apollo fading outward (Figma spoke gradient), drawn outward,
                  then a soft glow travels outward along them. */}
              {NODES.map((n, i) => {
                const on = i < shown;
                return (
                  <g key={`l${i}`}>
                    <motion.line
                      x1={n.ix}
                      y1={n.iy}
                      x2={n.x}
                      y2={n.y}
                      stroke={`url(#${uid}-spoke-${i})`}
                      strokeWidth="1.5"
                      initial={false}
                      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                      transition={
                        still
                          ? { duration: 0 }
                          : { pathLength: { duration: 0.9, ease: DRAW }, opacity: { duration: 0.3 } }
                      }
                    />
                    {on && !still && (
                      <motion.line
                        x1={n.ix}
                        y1={n.iy}
                        x2={n.x}
                        y2={n.y}
                        stroke={`url(#${uid}-glow-${i})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray={`${GLOW_LEN} ${SPOKE_LEN + GLOW_LEN}`}
                        initial={{ strokeDashoffset: GLOW_LEN, opacity: 0 }}
                        animate={{ strokeDashoffset: -SPOKE_LEN, opacity: [0, 1, 1, 0] }}
                        transition={{
                          duration: 1.6,
                          delay: 0.5,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatDelay: 1.4,
                          opacity: { duration: 1.6, delay: 0.5, times: [0, 0.2, 0.75, 1], repeat: Infinity, repeatDelay: 1.4 },
                        }}
                      />
                    )}
                  </g>
                );
              })}

              {/* Ring progress: solid purple from the top, plus a fading lead ahead of the head. */}
              <motion.circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="#6B4FFF"
                strokeWidth="1.5"
                transform={`rotate(-90 ${CX} ${CY})`}
                style={{ pathLength: still ? 1 : progress }}
              />
              {!still && <path ref={leadRef} fill="none" stroke={`url(#${uid}-lead)`} strokeWidth="1.5" />}
            </svg>

            {dots &&
              DOTS.map((d, i) => (
                <i
                  key={`d${i}`}
                  className={d.sq ? "g2j-dot g2j-dot--sq" : "g2j-dot"}
                  style={{ left: d.x, top: d.y }}
                />
              ))}

            {/* Apollo (Figma 697:176922): cream ring with a purple progress border, dark disc, mark. */}
            <div className="g2j-apollo">
              <svg className="g2j-apollo__ring" width="118" height="118" viewBox="0 0 118 118" aria-hidden="true">
                <motion.circle
                  cx="59"
                  cy="59"
                  r="58.5"
                  fill="none"
                  stroke="#6B4FFF"
                  strokeWidth="1"
                  transform="rotate(-90 59 59)"
                  style={{ pathLength: still ? 1 : progress }}
                />
              </svg>
              <div className="g2j-apollo__disc">
                <img className="g2j-apollo__mark" src={apolloMarkUrl} alt="" width={67.8438} height={67.8438} />
              </div>
            </div>

            {NODES.map((n, i) => (
              <i
                key={`n${i}`}
                className={i < shown ? "g2j-node is-on" : "g2j-node"}
                style={{ left: n.x, top: n.y, transitionDuration: still ? "0s" : undefined }}
              />
            ))}

            {NODES.map((n, i) => {
              const on = i < shown;
              const off = SLIDE[n.side];
              return (
                <div key={i} className={`g2j-label g2j-label--${n.side}`} style={labelStyle(n.side, n.x, n.y)}>
                  <motion.span
                    className="g2j-label__txt"
                    initial={false}
                    animate={on ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: off.x, y: off.y }}
                    transition={{ duration: still ? 0 : 0.4, ease: E }}
                  >
                    {/* Side labels break onto two lines (Figma: "Tour / Intelligence") */}
                    {n.side === "r" || n.side === "l" ? twoLines(labels[i]) : labels[i]}
                  </motion.span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </Reveal>
    </div>
  );
}
