import "./App.css";
import HubSpotVimeoWidget from "./components/HubspotVimeoWidget";
import MultiStepForm from "./components/MultiStepForm";
import VimeoVideoGrid from "./components/VimeoVideoGrid";

function App() {
  return (
    <>
      <div>
        <HubSpotVimeoWidget
          backendBase={import.meta.env.VITE_VIMEO_BACKEND_BASE}
          portalId="45321630"
          formId="5da905fc-5b70-47ed-9f71-e54d166618ff"
          region="na1"
          questionText="“How has working with EliseAI improved your work experience?”"
          maxMB={100}
        />
      </div>

      <div>
        <MultiStepForm
          portalId="45321630"
          formGuid="a68880cf-aa3e-4845-9822-f863608bed1f"
        />
      </div>
    </>
  );
}

export default App;
