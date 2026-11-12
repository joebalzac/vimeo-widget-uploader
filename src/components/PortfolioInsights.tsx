import "../utils/interVariableFont";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import "./PortfolioInsights.css";
import tierSilver from "../assets/bento/tier-silver.png";
import tierGold from "../assets/bento/tier-gold.png";
import kpiRing from "../assets/bento/kpi-ring.svg";

type Tier = "Silver" | "Gold" | "Bronze";
/** loading -> wait (scores count up) -> kpi; "done" = static final state. */
type Phase = "loading" | "wait" | "kpi" | "done";

interface AgentRow {
  name: string;
  score: number;
  tourToApp: number;
  tourToLease: number;
  tier: Tier;
}

const ROWS: AgentRow[] = [
  { name: "Rochelle Adams", score: 56, tourToApp: 18, tourToLease: 11, tier: "Silver" },
  { name: "Steven Ortiz", score: 71, tourToApp: 29, tourToLease: 20, tier: "Gold" },
  { name: "Mei Nguyen", score: 68, tourToApp: 23, tourToLease: 15, tier: "Bronze" },
  { name: "Camila Park", score: 82, tourToApp: 40, tourToLease: 21, tier: "Gold" },
];

const KPI = 88;
const EZ = [0.22, 0.8, 0.24, 1] as const;
const CSS_EASE = [0.25, 0.1, 0.25, 1] as const;
const outCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* Spec "toBronze" colour matrix: tints the gold medal bronze. Rendered as an inline SVG so
   the filter reference stays in the same tree (works inside Webflow's shadow DOM). */
const BRONZE_MATRIX = "0.36 0.456 0.184 0 0  0.279 0.088 0.632 0 0  0.507 -0.603 1.096 0 0  0 0 0 1 0";

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "Bronze") {
    return (
      <span className="ppi__tier-icon">
        <svg width="18.333" height="20" viewBox="0 0 18.333 20" aria-hidden="true">
          <filter id="ppiToBronze" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={BRONZE_MATRIX} />
          </filter>
          <image href={tierGold} width="18.333" height="20" filter="url(#ppiToBronze)" />
        </svg>
      </span>
    );
  }
  return (
    <span className="ppi__tier-icon">
      <img src={tier === "Silver" ? tierSilver : tierGold} alt="" />
    </span>
  );
}

/** A cell with a shimmering placeholder while loading; its text fades in afterwards. */
function LoadableCell({
  loading,
  short,
  className,
  children,
}: {
  loading: boolean;
  short?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={"ppi__cell-inner" + (className ? " " + className : "")}>
      <span
        className={"ppi__skeleton" + (short ? " ppi__skeleton--short" : "") + (loading ? "" : " ppi__skeleton--hidden")}
      />
      <span className={"ppi__value" + (loading ? "" : " ppi__value--visible")}>{children}</span>
    </span>
  );
}

/** Score that counts up from 0 (0.9s, staggered 80ms per row) once the table loads. */
function ScoreValue({ n, phase, i }: { n: number; phase: Phase; i: number }) {
  const mv = useMotionValue(phase === "done" ? n : 0);
  const txt = useTransform(mv, (v) => `${Math.round(v)}%`);
  useEffect(() => {
    if (phase === "loading") {
      mv.stop();
      mv.set(0);
    } else if (phase === "wait") {
      mv.set(0);
      const c = animate(mv, n, { duration: 0.9, delay: i * 0.08, ease: outCubic });
      return () => c.stop();
    } else if (!mv.isAnimating()) {
      mv.set(n);
    }
  }, [phase, mv, n, i]);
  return <motion.span>{txt}</motion.span>;
}

/**
 * PortfolioInsights — agent-performance table preview for the "See
 * Portfolio-Level Insights" bento card. Figma: node 408:10797 (.com_2027).
 *
 * Plays when 35% visible and replays on every re-entry: the table loads as a
 * skeleton (1.7s), scores count up, then the "Avg. Team Score" card animates in
 * while 88% counts up and the donut fills counter-clockwise.
 */
export default function PortfolioInsights() {
  const ref = useRef<HTMLDivElement>(null);
  const play = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [seqPhase, setPhase] = useState<Phase>("loading");
  /* out of view (or reduced motion): hold the finished state; in view: the running sequence */
  const phase: Phase = reduce ? "done" : !play ? (seqPhase === "kpi" ? "kpi" : "done") : seqPhase;
  /* start at the final value so static / server-rendered markup reads 88%; the sequence
     resets it to 0 itself when it plays */
  const kmv = useMotionValue(KPI);
  const ktxt = useTransform(kmv, (v) => String(Math.round(v)));
  /* The purple arc of kpi-ring.svg runs clockwise from 3 o'clock to 88%; the ring is turned
     90deg in CSS so the arc starts at 6 o'clock. This overlay paints the track colour over
     the part not yet filled, so the arc grows clockwise from the bottom: bottom -> left ->
     top -> right. */
  const p = useMotionValue(KPI);
  const cover = useTransform(p, (v) => `conic-gradient(from 90deg, transparent 0 ${v}%, #dfdbff ${v}% ${KPI}%, transparent 0)`);

  useEffect(() => {
    if (!play || reduce) return;
    let alive = true;
    (async () => {
      setPhase("loading");
      await sleep(1700);
      if (!alive) return;
      setPhase("wait");
      await sleep(900);
      if (!alive) return;
      setPhase("kpi");
    })();
    return () => {
      alive = false;
    };
  }, [play, reduce]);

  useEffect(() => {
    if (phase === "loading" || phase === "wait") {
      p.stop();
      p.set(0);
    } else if (phase === "kpi") {
      kmv.set(0);
      const a = animate(kmv, KPI, { duration: 1.4, delay: 0.25, ease: outCubic });
      const b = animate(p, KPI, { duration: 1.4, delay: 0.3, ease: EZ });
      return () => {
        a.stop();
        b.stop();
      };
    } else {
      if (!kmv.isAnimating()) kmv.set(KPI);
      if (!p.isAnimating() && p.get() !== KPI) {
        const b = animate(p, KPI, { duration: 1.4, delay: 0.3, ease: EZ });
        return () => b.stop();
      }
    }
  }, [phase, kmv, p]);

  const loading = phase === "loading";
  const showKpi = phase === "kpi" || phase === "done";

  return (
    <div className="ppi" ref={ref}>
      <div className="ppi__table-card">
        <div className="ppi__table">
          <div className="ppi__row ppi__row--header">
            <span className="ppi__cell ppi__cell--agent ppi__th">Agent</span>
            <span className="ppi__cell ppi__cell--score ppi__th">Score</span>
            <span className="ppi__cell ppi__cell--app ppi__th">Tour to App.</span>
            <span className="ppi__cell ppi__cell--lease ppi__th">Tour to Lease</span>
            <span className="ppi__cell ppi__cell--tier ppi__th">Tier</span>
          </div>
          {ROWS.map((row, i) => (
            <motion.div
              className={"ppi__row" + (i < ROWS.length - 1 ? " ppi__row--divider" : "")}
              key={row.name}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{
                opacity: { duration: 0.5, delay: 0.3 + i * 0.09, ease: CSS_EASE },
                y: { duration: 0.6, delay: 0.3 + i * 0.09, ease: EZ },
              }}
            >
              <span className="ppi__cell ppi__cell--agent">
                <LoadableCell loading={loading}>{row.name}</LoadableCell>
              </span>
              <span className="ppi__cell ppi__cell--score">
                <LoadableCell
                  loading={loading}
                  short
                  className={row.score >= 70 ? "ppi__score--up" : "ppi__score--down"}
                >
                  <ScoreValue n={row.score} phase={phase} i={i} />
                </LoadableCell>
              </span>
              <span className="ppi__cell ppi__cell--app">
                <LoadableCell loading={loading} short>
                  {row.tourToApp}%
                </LoadableCell>
              </span>
              <span className="ppi__cell ppi__cell--lease">
                <LoadableCell loading={loading} short>
                  {row.tourToLease}%
                </LoadableCell>
              </span>
              <span className="ppi__cell ppi__cell--tier">
                <LoadableCell loading={loading}>
                  <TierBadge tier={row.tier} />
                  {row.tier}
                </LoadableCell>
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Figma "Blur" (408:10878): soft fades over the table's top and right bleed */}
      <div className="ppi__blurs" aria-hidden="true">
        <div className="ppi__blur-a">
          <i />
        </div>
        <i className="ppi__blur-b" />
        <div className="ppi__blur-c">
          <i />
        </div>
      </div>
      <div className="ppi__top-fade" aria-hidden="true" />

      <motion.div
        className="ppi__kpi"
        initial={false}
        animate={showKpi ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -12, scale: 0.97 }}
        transition={{
          opacity: { duration: 0.5, ease: CSS_EASE },
          y: { duration: 0.7, ease: EZ, delay: 0.2 },
          scale: { duration: 0.7, ease: EZ, delay: 0.2 },
        }}
      >
        <div className="ppi__kpi-text">
          <p className="ppi__kpi-label">Avg. Team score</p>
          <p className="ppi__kpi-value">
            <motion.span>{ktxt}</motion.span>%
          </p>
        </div>
        <span className="ppi__kpi-ring">
          <img src={kpiRing} alt="" />
          <motion.span className="ppi__kpi-ring-cover" style={{ background: cover }} />
        </span>
      </motion.div>
    </div>
  );
}
