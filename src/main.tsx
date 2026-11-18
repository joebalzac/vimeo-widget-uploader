import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import Gen2Page from "./Gen2Page.tsx";

/* ?page=gen2 previews the Gen2 page; everything else renders the existing preview. */
const page = new URLSearchParams(window.location.search).get("page");

createRoot(document.getElementById("root")!).render(
  <StrictMode>{page === "gen2" ? <Gen2Page /> : <App />}</StrictMode>,
);
