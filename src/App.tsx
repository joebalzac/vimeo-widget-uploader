import "./App.css";
import ContentFormWrapper from "./components/ContentFormWrapper";

function App() {
  return (
    <>
      <div>
        <ContentFormWrapper
          contentOnlyLogoUrl="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/67d992a1a4081be4dfcd2cd3_eqr-logo.svg"
          contentHeadline="See why thousands trust us."
          contentBody="Our platform helps you save time, reduce waste, and take control."
          testimonialName="Arthur Kosmider"
          testimonialTitle="Sr. Director, Marketing & Resident Experience"
          testimonialCompany="LeFrak"
          testimonialQuote="EliseAI’s combination of advanced AI, automation, and industry expertise made it the best choice for enhancing resident communication at scale."
        />
      </div>
    </>
  );
}

export default App;
