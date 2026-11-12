/**
 * Extra webpack config merged into the Webflow code-library bundle (webflow.json → bundleConfig).
 * Figma's shader runtime (src/lib, copied verbatim) imports siblings as "./x.js" — the
 * TypeScript ESM convention. Vite resolves that to the .ts/.tsx source; webpack needs this alias.
 */
module.exports = {
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },
};
