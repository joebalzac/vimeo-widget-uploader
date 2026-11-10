import "./App.css";
import BentoCard from "./components/BentoCard";
import RecordTheTour from "./components/RecordTheTour";
import AutomatePostTourAdmin from "./components/AutomatePostTourAdmin";
import PortfolioInsights from "./components/PortfolioInsights";
import CoachEveryTour from "./components/CoachEveryTour";

import HeroVimeo from "./components/HeroVimeo";


const FEATURE_CARDS = [
  {
    id: "workforce",
    imageSrc: "/feature-cards/smarter-workforce.png",
    title: "Smarter Workforce",
    subtitle:
      "Apollo gives every employee expert-level operational context from day one.",
  },
  {
    id: "utilization",
    imageSrc: "/feature-cards/product-utilization.png",
    title: "Maximize Product Utilization",
    subtitle:
      "Unlock the full power of products you already have with prompt-based actions.",
  },
  {
    id: "insights",
    imageSrc: "/feature-cards/asset-performance.png",
    title: "Asset Performance Insights",
    subtitle:
      "Give leaders eyes and ears to spot problems before they happen.",
  },
];

function App() {

  return (
    <>
     

      <HeroVimeo vimeoId="1225976653" />

      <section id="bento" style={{ padding: "80px 24px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 1160,
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
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
    </>
  );
}

export default App;
