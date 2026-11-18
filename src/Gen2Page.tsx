import "./App.css";
import { Navbar } from "./components/Navbar";
import Gen2Hero from "./components/gen2/Gen2Hero";
import Gen2Journey from "./components/gen2/Gen2Journey";
import Gen2Features from "./components/gen2/features/Gen2Features";
import Gen2Apollo from "./components/gen2/Gen2Apollo";
import Gen2Crm from "./components/gen2/Gen2Crm";
import Gen2Stats from "./components/gen2/Gen2Stats";
import Gen2Routing from "./components/gen2/Gen2Routing";
import Gen2Stories from "./components/gen2/Gen2Stories";
import Gen2Cta from "./components/gen2/Gen2Cta";
import Gen2Footer from "./components/gen2/Gen2Footer";

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
const PAD_TOP = { padding: PHONE ? "48px 0 0" : "120px 0 0" };
const PAD_STORIES = { padding: PHONE ? "48px 0" : "120px 0 60px" };

export default function Gen2Page() {
  return (
    <div style={{ background: "#fdfcfb" }}>
      <Navbar />
      <Gen2Hero />
      <section style={PAD_TOP}>
        <div style={WRAP}>
          <Gen2Journey />
        </div>
      </section>
      <div style={WRAP}>
        <Gen2Features />
      </div>
      <section style={PAD_TOP}>
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
      <Gen2Footer />
    </div>
  );
}
