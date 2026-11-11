import "./App.css";
import HeroVimeo from "./components/HeroVimeo";
import BentoBoxSection from "./components/BentoBoxSection";
import JobListingSectionCMS from "./components/JobListingSectionCMS";
import JobCmsItem from "./components/JobCmsItem";

const SAMPLE_JOBS = [
  { category: "Centralization", title: "Regional Leasing Manager", company: "RPM Living", location: "Austin, TX" },
  { category: "Centralization", title: "Shared Services Coordinator", company: "Cardinal Group", location: "Denver, CO" },
  { category: "Experience", title: "Resident Experience Specialist", company: "RPM Living", location: "Austin, TX" },
  { category: "Experience", title: "Learning Experience Designer", company: "RPM Living", location: "Remote" },
  { category: "Experience", title: "Resident Experience Manager", company: "Cardinal Group", location: "Denver, CO" },
  { category: "Experience", title: "Training & Enablement Specialist", company: "Cardinal Group", location: "Denver, CO" },
  { category: "AI & Technology", title: "Product Manager, Automation", company: "RPM Living", location: "Austin, TX" },
  { category: "Corporate Strategy", title: "Strategic Initiatives Analyst", company: "Cardinal Group", location: "Denver, CO" },
];

function App() {
  return (
    <>
      <HeroVimeo vimeoId="1225976653" />
      <BentoBoxSection />
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
    </>
  );
}

export default App;
