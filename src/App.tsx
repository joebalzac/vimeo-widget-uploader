import "./App.css";
import MultiStepForm from "./components/MultiStepForm";

function App() {
  return (
    <>
      <div>
        <MultiStepForm
          contentImageUrl="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/69cadb3ff79827c042d21b18_Equity-Residential-City.png"
          contentImageAlt="Equity Residential City"
          contentBackgroundColor="#000000"
          contentOnlyLogoUrl="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/67d992a1a4081be4dfcd2cd3_eqr-logo.svg"
          mainQuote="EliseAI’s combination of advanced AI, automation, and industry expertise made it the best choice for enhancing resident communication at scale."
          testimonialQuote="EliseAI’s combination of advanced AI, automation, and industry expertise made it the best choice for enhancing resident communication at scale."
          testimonialName="Arthur Kosmider"
          testimonialTitle="Sr. Director, Marketing & Resident Experience"
          testimonialCompany="LeFrak"
          testimonialAvatarUrl="https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/69cd452406f5c1c4c0c1304a_arthur-kosmider.png"
        />
      </div>
    </>
  );
}

export default App;
