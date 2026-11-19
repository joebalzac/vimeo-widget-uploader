import "./App.css";
import { Navbar } from "./components/Navbar";
import Gen2Hero from "./components/gen2/Gen2Hero";
import Gen2Customers from "./components/gen2/Gen2Customers";
import Gen2Features from "./components/gen2/features/Gen2Features";
import Gen2Apollo from "./components/gen2/Gen2Apollo";
import Gen2Crm from "./components/gen2/Gen2Crm";
import Gen2Stats from "./components/gen2/Gen2Stats";
import Gen2Routing from "./components/gen2/Gen2Routing";
import Gen2Stories from "./components/gen2/Gen2Stories";
import Gen2Cta from "./components/gen2/Gen2Cta";

/*
 * Gen2 page preview (open with ?page=gen2), composed the way it will be in Webflow.
 * WRAP stands in for the Webflow Container and the PAD styles for the main padding
 * section (the components carry no vertical section padding of their own).
 * Hero, Apollo and Stats are full-bleed.
 */
const PHONE = typeof window !== "undefined" && window.innerWidth <= 480;
const WRAP = { width: PHONE ? "100%" : "min(100%, 1192px)", margin: "0 auto", padding: PHONE ? "0 24px" : "0 16px", boxSizing: "border-box" as const };
const PAD = { padding: PHONE ? "48px 0" : "120px 0" };
/* Figma spacing: Journey and Apollo have no bottom padding, Stories has 60. */
/* Apollo (handoff v124/v125): 60 top on desktop; 48 top / 40 bottom on mobile. */
const PAD_APOLLO = { padding: PHONE ? "48px 0 40px" : "60px 0 0" };
/* Hero (handoff 02): 144 top desktop, 96 mobile. Features: 60 top (Figma 618:6951). */
const PAD_HERO = { padding: PHONE ? "96px 0 0" : "144px 0 0" };
const PAD_FEATURES = { padding: PHONE ? "48px 0 0" : "60px 0 0" };
/* Customers (handoff 02b): 120 / 40 desktop, 96 top ≤1000, 72 / 24 ≤767. */
const PAD_CUSTOMERS = { padding: PHONE ? "72px 0 24px" : "120px 0 40px" };
const PAD_STORIES = { padding: PHONE ? "48px 0" : "120px 0 60px" };

export default function Gen2Page() {
  return (
    <div style={{ background: "#fdfcfb" }}>
      <Navbar />
      {/* Hero + Renter Journey in one component (Webflow container inside; haze behind both). */}
      <section style={PAD_HERO}>
        <Gen2Hero />
      </section>
      <section style={PAD_CUSTOMERS}>
        <div style={WRAP}>
          <Gen2Customers />
        </div>
      </section>
      {/* Features pins on scroll: nothing above it may set overflow hidden/auto/clip. */}
      <section style={PAD_FEATURES}>
        <div style={WRAP}>
          <Gen2Features />
        </div>
      </section>
      <section style={PAD_APOLLO}>
        <Gen2Apollo />
      </section>
      <section style={PAD}>
        <div style={WRAP}>
          <Gen2Crm />
        </div>
      </section>
      <section style={{ ...PAD, background: "#131115" }}>
        <Gen2Stats />
      </section>
      <section style={PAD}>
        <div style={WRAP}>
          <Gen2Routing />
        </div>
      </section>
      <section style={PAD_STORIES}>
        <div style={WRAP}>
          <Gen2Stories />
        </div>
      </section>
      <section style={PAD}>
        <div style={WRAP}>
          <Gen2Cta />
        </div>
      </section>
    </div>
  );
}
