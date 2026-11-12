/**
 * Extra webpack config merged into the Webflow code-library bundle (webflow.json → bundleConfig).
 *
 * 1. Figma's shader runtime (src/lib, copied verbatim) imports siblings as "./x.js" — the
 *    TypeScript ESM convention. Vite resolves that to the .ts/.tsx source; webpack needs this alias.
 * 2. Images are inlined as data URIs. The CLI's default emits them as separate hashed files
 *    referenced by a relative public path, which doesn't resolve on the published Webflow site,
 *    so every imported icon showed as a broken image.
 */
module.exports = {
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
    },
  },
  module: {
    // The Webflow CLI only applies `rules` when it's a function of the default rules.
    // Swap its image rule (asset/resource) for asset/inline; fonts keep the default.
    rules: (defaults) => [
      ...defaults.map((rule) =>
        rule && rule.type === "asset/resource"
          ? { test: /\.(woff|woff2|eot|ttf|otf)$/i, type: "asset/resource", generator: rule.generator }
          : rule
      ),
      { test: /\.(png|svg|jpg|jpeg|gif)$/i, type: "asset/inline" },
    ],
  },
};
