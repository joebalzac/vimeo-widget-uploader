import "./App.css";
import CustomerStoriesLogo from "./components/CustomerStoriesLogo";
import { DEMO_LOGOS } from "./data/customerStoriesLogoDemo";

import PatientOutreach from "./components/PatientOutreach";
import { Navbar } from "./components/Navbar";



function App() {
  return (
    <>
      <Navbar
        logoImageUrl="https://www.google.com"
        logoHref="https://www.google.com"
        navItems={[]}
        ctaText="Get Started"
        ctaHref="https://www.google.com"
        loginText="Login"
        loginHref="https://www.google.com"
      />

      <div>
        <PatientOutreach />
      </div>
    </>
  );
}

export default App;
