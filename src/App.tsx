import "./App.css";
import BentoBoxSection from "./components/BentoBoxSection";
import JobListingSectionCMS from "./components/JobListingSectionCMS";
import JobCmsItem from "./components/JobCmsItem";
import ValuesCarousel from "./components/ValuesCarousel";
import TourHero from "./components/TourHero";
import SectionHeading from "./components/SectionHeading";
import ApolloShowcase from "./components/ApolloShowcase";
import MysteryShoppingComparison from "./components/MysteryShoppingComparison";
import OperatorTestimonials from "./components/OperatorTestimonials";
import TourCta from "./components/TourCta";

/* Preview-only stand-ins for the Webflow Section + Container (spec "Wrap"). */
const TI_PHONE = typeof window !== "undefined" && window.innerWidth <= 480;
const TI_SECTION = { padding: TI_PHONE ? "48px 24px" : "120px 16px", background: "#fdfcfb" };
const TI_WRAP = {
  width: TI_PHONE ? "100%" : "min(100%, 1160px)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column" as const,
};

const SAMPLE_JOBS = [
  {
    category: "Centralization",
    title: "Regional Leasing Manager",
    company: "RPM Living",
    location: "Austin, TX",
  },
  {
    category: "Centralization",
    title: "Shared Services Coordinator",
    company: "Cardinal Group",
    location: "Denver, CO",
  },
  {
    category: "Experience",
    title: "Resident Experience Specialist",
    company: "RPM Living",
    location: "Austin, TX",
  },
  {
    category: "Experience",
    title: "Learning Experience Designer",
    company: "RPM Living",
    location: "Remote",
  },
  {
    category: "Experience",
    title: "Resident Experience Manager",
    company: "Cardinal Group",
    location: "Denver, CO",
  },
  {
    category: "Experience",
    title: "Training & Enablement Specialist",
    company: "Cardinal Group",
    location: "Denver, CO",
  },
  {
    category: "AI & Technology",
    title: "Product Manager, Automation",
    company: "RPM Living",
    location: "Austin, TX",
  },
  {
    category: "Corporate Strategy",
    title: "Strategic Initiatives Analyst",
    company: "Cardinal Group",
    location: "Denver, CO",
  },
];

const SAMPLE_VALUES = [
  { title: "Value 1", description: "Description 1" },
  { title: "Value 2", description: "Description 2" },
  { title: "Value 3", description: "Description 3" },
];

function App() {
  return (
    <>
      {/* Tour Intelligence page (.com_2027), composed the way it will be in Webflow */}
      <TourHero />
      <section style={TI_SECTION}>
        <div style={TI_WRAP}>
          <SectionHeading heading="See & Improve Every Tour at Scale" maxWidth={501} />
          <BentoBoxSection />
        </div>
      </section>
      <section style={TI_SECTION}>
        <div style={TI_WRAP}>
          <ApolloShowcase />
        </div>
      </section>
      <section style={{ ...TI_SECTION, background: "#131115" }}>
        <div style={TI_WRAP}>
          <SectionHeading heading="Mystery Shopping With Visibility Into Every Tour" theme="dark" maxWidth={474} />
          <MysteryShoppingComparison />
        </div>
      </section>
      <section style={TI_SECTION}>
        <div style={TI_WRAP}>
          <SectionHeading heading="What Operators Are Saying" maxWidth={548} />
          <OperatorTestimonials />
        </div>
      </section>
      <section style={TI_SECTION}>
        <div style={TI_WRAP}>
          <TourCta />
        </div>
      </section>

      
      <JobListingSectionCMS
        jobs={SAMPLE_JOBS.map((job) => (
          <JobCmsItem
            key={job.title}
            category={job.category}
            title={job.title}
            company={job.company}
            department={job.category}
            location={job.location}
            url="https://example.com"
          />
        ))}
      />
      <ValuesCarousel items={SAMPLE_VALUES} />
    </>
  );
}

export default App;
