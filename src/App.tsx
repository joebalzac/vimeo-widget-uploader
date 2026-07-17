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
import PhotoCarousel from "./components/PhotoCarousel";
import TeamImageCarousel from "./components/TeamImageCarousel";
import ProductShowcase from "./components/ProductShowcase";
import PatientOutreach from "./components/PatientOutreach";

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
  return (
    <>
      <PatientOutreach />
    </>
  );
}

export default App;
