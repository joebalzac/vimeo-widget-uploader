import "./App.css";
import MultiStepForm from "./components/MultiStepForm";
import MultiStepFormHealth from "./components/MultiStepFormHealth";
import MultiStepFormUniversal from "./components/MultiStepFormUniversal";
import TeamCarousel from "./components/TeamCarousel";

const form = new URLSearchParams(window.location.search).get("form");

function App() {
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
      </div>
    </>
  );
}

export default App;
