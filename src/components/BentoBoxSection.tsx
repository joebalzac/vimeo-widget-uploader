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
 * Portfolio-Level Insights, Coach Every Tour).
 * Figma: node 330:29920 ("Bento"), .com_2027.
 *
 * Layout is a 3-track CSS grid (430fr 276fr 430fr, 12px gaps) so both rows land on
 * the Figma widths at 1160px: row 1 = 430 | 718, row 2 = 718 | 430. The tracks scale
 * proportionally inside any container and stack to one column at <=1000px.
 * The section heading is a separate component (SectionHeading).
 */
export default function BentoBoxSection({ className }: BentoBoxSectionProps) {
  return (
    <section className={["bbs", className].filter(Boolean).join(" ")}>
      <div className="bbs__grid">
        <BentoCard
          className="bbs__record"
          title="Record The Tour"
          subtitle="Elise records so agents can focus on the prospect, with points for recording tours and following up promptly."
          media={<RecordTheTour />}
        />
        <BentoCard
          className="bbs__automate"
          wide
          title="Automate Post-Tour Admin"
          subtitle="Elise updates tour status and guest cards in EliseCRM, and drafts personalized follow-ups agents can send in one tap."
          media={<AutomatePostTourAdmin />}
        />
        <BentoCard
          className="bbs__insights"
          wide
          title="See Portfolio-Level Insights"
          subtitle="Elise surfaces agent performance, property insights, and top objections so leaders know where to invest."
          media={<PortfolioInsights />}
        />
        <BentoCard
          className="bbs__coach"
          title="Coach Every Tour"
          subtitle="Elise scores each tour against a customizable rubric and flags areas for improvement."
          media={<CoachEveryTour />}
        />
      </div>
    </section>
  );
}
