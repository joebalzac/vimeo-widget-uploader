import "../utils/interVariableFont";
import { useEffect, useState, type ReactNode } from "react";
import "./PortfolioInsights.css";
import tierSilver from "../assets/bento/tier-silver.png";
import tierGold from "../assets/bento/tier-gold.png";
import kpiRing from "../assets/bento/kpi-ring.svg";

type Tier = "Silver" | "Gold" | "Bronze";

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

/** Loads once, reveals the table, then the KPI callout, then loops. */
function usePortfolioLoad() {
  const [loaded, setLoaded] = useState(false);
  const [kpiShown, setKpiShown] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (fn: () => void, ms: number) => {
      timers.push(setTimeout(() => !cancelled && fn(), ms));
    };

    const run = () => {
      setLoaded(false);
      setKpiShown(false);
      after(() => setLoaded(true), 1500);
      after(() => setKpiShown(true), 2100);
      after(run, 4700);
    };

    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return { loaded, kpiShown };
}

function TierBadge({ tier }: { tier: Tier }) {
  if (tier === "Bronze") {
    return (
      <span className="ppi__tier-icon ppi__tier-icon--bronze">
        <img src={tierGold} alt="" />
      </span>
    );
  }
  return (
    <span className="ppi__tier-icon">
      <img src={tier === "Gold" ? tierGold : tierSilver} alt="" />
    </span>
  );
}

/** A cell that shows a shimmering placeholder until `loaded`, then crossfades to its real value. */
function LoadableCell({
  loaded,
  skeletonWidth,
  className,
  children,
}: {
  loaded: boolean;
  skeletonWidth: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={"ppi__cell-inner" + (className ? " " + className : "")}>
      <span
        className={"ppi__skeleton" + (loaded ? " ppi__skeleton--hidden" : "")}
        style={{ width: skeletonWidth }}
      />
      <span className={"ppi__value" + (loaded ? " ppi__value--visible" : "")}>
        {children}
      </span>
    </span>
  );
}

/**
 * PortfolioInsights — agent-performance table preview for the "See
 * Portfolio-Level Insights" bento card. Figma: node 330:28635 (.com_2027).
 *
 * Loops: a skeleton loader fills the table, the real rows reveal, then the
 * Average Team Score callout reveals — then resets.
 */
export default function PortfolioInsights() {
  const { loaded, kpiShown } = usePortfolioLoad();

  return (
    <div className="ppi__wrap">
      <div className="ppi">
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
              <div
                className={
                  "ppi__row" + (i < ROWS.length - 1 ? " ppi__row--divider" : "")
                }
                key={row.name}
              >
                <span className="ppi__cell ppi__cell--agent">
                  <LoadableCell loaded={loaded} skeletonWidth={96}>
                    {row.name}
                  </LoadableCell>
                </span>
                <span className="ppi__cell ppi__cell--score">
                  <LoadableCell
                    loaded={loaded}
                    skeletonWidth={28}
                    className={row.score >= 70 ? "ppi__score--up" : "ppi__score--down"}
                  >
                    {row.score}%
                  </LoadableCell>
                </span>
                <span className="ppi__cell ppi__cell--app">
                  <LoadableCell loaded={loaded} skeletonWidth={28}>
                    {row.tourToApp}%
                  </LoadableCell>
                </span>
                <span className="ppi__cell ppi__cell--lease">
                  <LoadableCell loaded={loaded} skeletonWidth={28}>
                    {row.tourToLease}%
                  </LoadableCell>
                </span>
                <span className="ppi__cell ppi__cell--tier">
                  <LoadableCell loaded={loaded} skeletonWidth={70}>
                    <TierBadge tier={row.tier} />
                    {row.tier}
                  </LoadableCell>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={"ppi__kpi" + (kpiShown ? " ppi__kpi--visible" : "")}>
          <div className="ppi__kpi-text">
            <p className="ppi__kpi-label">Avg. Team score</p>
            <p className="ppi__kpi-value">88%</p>
          </div>
          <img className="ppi__kpi-ring" src={kpiRing} alt="" />
        </div>
      </div>
    </div>
  );
}
