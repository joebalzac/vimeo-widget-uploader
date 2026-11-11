/**
 * Registers the `inter-variable` font family used throughout the component CSS.
 *
 * Webflow code components render inside a shadow root, and browsers ignore
 * @font-face rules declared inside shadow DOM — so the face is injected into
 * document.head once, where it applies to every shadow tree on the page.
 * Import this module (side effect only) from any component whose styles use
 * `font-family: inter-variable`.
 */
const STYLE_ID = "inter-variable-font-face";
const BASE = "https://rsms.me/inter/font-files";

const CSS = `
@font-face {
  font-family: inter-variable;
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("${BASE}/InterVariable.woff2?v=4.1") format("woff2");
}
@font-face {
  font-family: inter-variable;
  font-style: italic;
  font-weight: 100 900;
  font-display: swap;
  src: url("${BASE}/InterVariable-Italic.woff2?v=4.1") format("woff2");
}
`;

if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export {};
