import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import BalanceBayDemo from "./components/BalanceBayDemo";

createRoot(document.getElementById("demo-root")!).render(
  <StrictMode>
    <BalanceBayDemo />
  </StrictMode>,
);
