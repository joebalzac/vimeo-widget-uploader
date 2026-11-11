import "../utils/interVariableFont";
import "./BentoBoxSection.css";
import BentoCard from "./BentoCard";
import RecordTheTour from "./RecordTheTour";
import AutomatePostTourAdmin from "./AutomatePostTourAdmin";
import PortfolioInsights from "./PortfolioInsights";
import CoachEveryTour from "./CoachEveryTour";

export interface BentoBoxSectionProps {
  className?: string;
}

/**
 * BentoBoxSection — the "Tour Intelligence" bento showcase: four animated
 * feature-card previews (Record The Tour, Automate Post-Tour Admin, See
 * Portfolio-Level Insights, Coach Every Tour) in the asymmetric 2x2 layout.
 * Figma: node 330:29920 ("Bento"), .com_2027.
 */
export default function BentoBoxSection({ className }: BentoBoxSectionProps) {
  return (
    <section className={["bbs", className].filter(Boolean).join(" ")}>
      <div className="bbs__grid">
        <div className="bbs__row">
          <BentoCard
            title="Record The Tour"
            subtitle="Elise records so agents can focus on the prospect, with points for recording tours and following up promptly."
            media={<RecordTheTour />}
            width={430}
          />
          <BentoCard
            title="Automate Post-Tour Admin"
            subtitle="Elise updates tour status and guest cards in EliseCRM, and drafts personalized follow-ups agents can send in one tap."
            media={<AutomatePostTourAdmin />}
            width={718}
          />
        </div>
        <div className="bbs__row">
          <BentoCard
            title="See Portfolio-Level Insights"
            subtitle="Elise surfaces agent performance, property insights, and top objections so leaders know where to invest."
            media={<PortfolioInsights />}
            width={718}
          />
          <BentoCard
            title="Coach Every Tour"
            subtitle="Elise scores each tour against a customizable rubric and flags areas for improvement."
            media={<CoachEveryTour />}
            width={430}
          />
        </div>
      </div>
    </section>
  );
}
