import "./App.css";
import LightboxWithForm from "./components/LightboxWithForm";

function App() {
  return (
    <>
      <div>
        <LightboxWithForm
          headline="Request a demo"
          bodyText="Request a demo"
          heroImageUrl="https://www.google.com"
          heroImageAlt="Request a demo"
          termsUrl="https://www.google.com"
          className="lightbox-with-form"
          defaultOpen={true}
        />
      </div>
    </>
  );
}

export default App;
