import "./App.css";
import CustomerStoriesLogo from "./components/CustomerStoriesLogo";
import MultiStepForm from "./components/MultiStepForm";
import MultiStepFormHealth from "./components/MultiStepFormHealth";
import MultiStepFormUniversal from "./components/MultiStepFormUniversal";
import TeamCarousel from "./components/TeamCarousel";
import ValuesCarousel from "./components/ValuesCarousel";
import ScrollSection from "./components/ScrollSection";
import { DEMO_LOGOS } from "./data/customerStoriesLogoDemo";
import JobListingSection from "./components/JobListingSection";
import OfficeLocations from "./components/OfficeLocations";

const params = new URLSearchParams(window.location.search);
const form = params.get("form");
const section = params.get("section");

function CustomerStoriesLogoPreview() {
  return (
    <>
      <CustomerStoriesLogo theme="light" logos={DEMO_LOGOS} />
      <CustomerStoriesLogo theme="dark" logos={DEMO_LOGOS} />
    </>
  );
}

function App() {
  if (section === "logos") {
    return <CustomerStoriesLogoPreview />;
  }

  if (section === "values") {
    return <ValuesCarousel />;
  }

  if (section === "offices") {
    return (
      <div style={{ padding: "120px 140px", backgroundColor: "#131115", minHeight: "100vh" }}>
        <OfficeLocations />
      </div>
    );
  }

  if (section === "scroll") {
    return (
      <>
        <div style={{ height: "100vh" }} />
        <ScrollSection />
        <div style={{ height: "100vh" }} />
      </>
    );
  }

  return (
    <>
      <div>
        {form === "housing" ? (
          <MultiStepForm />
        ) : form === "health" ? (
          <MultiStepFormHealth />
        ) : (
          <MultiStepFormUniversal />
        )}
      </div>

      <div>
        <TeamCarousel />
        <ScrollSection />
      </div>
      <JobListingSection />
      <ValuesCarousel />
      <div style={{ padding: "120px 140px", backgroundColor: "#131115" }}>
        <OfficeLocations />
      </div>
    </>
  );
}

export default App;
