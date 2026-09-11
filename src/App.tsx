import "./App.css";
import PatientOutreach from "./components/PatientOutreach";
import { Navbar } from "./components/Navbar";
import CustomerStoriesLogo from "./components/CustomerStoriesLogo";
import { DEFAULT_LOGO_GRID } from "./data/customerStoriesLogoConfig";
import OfficeLocations from "./components/OfficeLocations";
import FeatureCardGrid from "./components/FeatureCardGrid";
import SessionCardGrid from "./components/SessionCardGrid";
import GatedVimeoForm from "./components/GatedVimeoForm";

const FEATURE_CARDS = [
  {
    id: "workforce",
    imageSrc: "/feature-cards/smarter-workforce.png",
    title: "Smarter Workforce",
    subtitle:
      "Apollo gives every employee expert-level operational context from day one.",
  },
  {
    id: "utilization",
    imageSrc: "/feature-cards/product-utilization.png",
    title: "Maximize Product Utilization",
    subtitle:
      "Unlock the full power of products you already have with prompt-based actions.",
  },
  {
    id: "insights",
    imageSrc: "/feature-cards/asset-performance.png",
    title: "Asset Performance Insights",
    subtitle:
      "Give leaders eyes and ears to spot problems before they happen.",
  },
];

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

      <section id="gatedVimeoForm" className="gated-vimeo-preview-wrap">
        <GatedVimeoForm vimeoId="76979871" previewSeconds={30} />
      </section>

      {/* Feature Card Grid — no background of its own, so whatever section it
          sits in shows through. */}
      <section id="featureCardGrid" style={{ padding: "80px 24px" }}>
        <FeatureCardGrid cards={FEATURE_CARDS} />
      </section>

      <section id="sessionCardGrid" className="session-card-preview-wrap">
        <div className="session-card-preview">
          {Array.from({ length: 8 }, (_, i) => (
            <SessionCardGrid
              key={i}
              title={i === 7 ? "Gated Session Title" : "Session Title"}
              details="Session Details..."
              slug={`/talks/session-${i + 1}`}
              lockedVideo={i === 7}
            />
          ))}
        </div>
      </section>

      <section
        id="sessionCardGridDark"
        className="session-card-preview-wrap session-card-preview-wrap--dark"
      >
        <div className="session-card-preview">
          {Array.from({ length: 3 }, (_, i) => (
            <SessionCardGrid
              key={i}
              title="Session Title"
              details="Session Details..."
              slug={`/talks/dark-${i + 1}`}
              darkMode
            />
          ))}
        </div>
      </section>

      {/* Extra height so local preview can scroll fully past the hero */}
      <div
        style={{ minHeight: "120vh", padding: "80px 24px", background: "#fff" }}
      >
        <h2 style={{ fontSize: 32, color: "#181819" }}>Below the hero</h2>
        <p style={{ color: "#52525b", maxWidth: 560 }}>
          The navbar should now be solid white with dark text. Scroll back up to
          see it go transparent again over the hero.
        </p>
      </div>

      <div>
        <CustomerStoriesLogo theme="light" logos={DEFAULT_LOGO_GRID} />

        <OfficeLocations />
      </div>
    </>
  );
}

export default App;
