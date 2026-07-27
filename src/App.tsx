import "./App.css";
import PatientOutreach from "./components/PatientOutreach";
import { Navbar } from "./components/Navbar";
import CustomerStoriesLogo from "./components/CustomerStoriesLogo";
import { DEFAULT_LOGO_GRID } from "./data/customerStoriesLogoConfig";

function App() {
  return (
    <>
      <Navbar
        theme="dark"
        heroSectionId="heroSection"
        logoHref="/"
        navItems={[
          { label: "AI for Property Management", href: "/property-management" },
          { label: "AI for Healthcare", href: "/healthcare" },
          { label: "Resources", href: "/resources" },
          { label: "Company", href: "/company" },
        ]}
        ctaText="Request Demo"
        ctaHref="/demo"
        loginText="Log In"
        loginHref="/login"
      />

      {/* Dark hero — fixed transparent navbar overlays this from the top */}
      <section
        id="heroSection"
        style={{
          minHeight: "90vh",
          background:
            "radial-gradient(120% 120% at 50% 0%, #2a1f5c 0%, #14102b 60%, #0b0820 100%)",
          color: "#fafafb",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "160px 24px 80px",
        }}
      >
        <h1 style={{ fontSize: "56px", maxWidth: 800, lineHeight: 1.1 }}>
          The AI platform for property management & healthcare
        </h1>
        <p style={{ fontSize: "20px", opacity: 0.8, maxWidth: 560 }}>
          Scroll down — the transparent navbar turns solid white once you pass
          this hero section.
        </p>
      </section>

      <div>
        <PatientOutreach />
      </div>

      {/* Extra height so local preview can scroll fully past the hero */}
      <div style={{ minHeight: "120vh", padding: "80px 24px", background: "#fff" }}>
        <h2 style={{ fontSize: 32, color: "#181819" }}>Below the hero</h2>
        <p style={{ color: "#52525b", maxWidth: 560 }}>
          The navbar should now be solid white with dark text. Scroll back up to
          see it go transparent again over the hero.
        </p>
      </div>

      <div style={{ padding: "48px 24px", background: "#fff" }}>
        <CustomerStoriesLogo theme="light" logos={DEFAULT_LOGO_GRID} />
      </div>
    </>
  );
}

export default App;
