export type CustomerBrandId =
  | "goldoller"
  | "rpm"
  | "scion"
  | "greystar"
  | "s2"
  | "avenue5"
  | "winn"
  | "millcreek"
  | "cardinal"
  | "olympus";

/**
 * CDN-hosted logos (keeps the Webflow library under size limits).
 * `dark` = black logo for light backgrounds
 * `light` = white logo for dark backgrounds / hover
 */
const CDN = {
  goldoller: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc39ca8f7daec4f78023_GoldOller.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d6931b4e0ba62ab5d895_GoldOller.svg",
  },
  rpm: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc39f3b34415f1b6e118_RPM.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d693805b351d267c16a5_RPM.svg",
  },
  scion: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc3a17e1dcf43c60b490_Scion.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d693f1b3314f7772a6e0_Scion.svg",
  },
  greystar: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc398eb15c8f7a1b98cb_Greystar.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d693948bfa3ec89065b4_Greystar.svg",
  },
  s2: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc3aa8490265bfaf73bf_S2Residential.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d693805b351d267c16aa_S2Residential.svg",
  },
  avenue5: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc39ca8f7daec4f78027_Avenue5.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d696c52a1c4f6570cdfe_Avenue5.svg",
  },
  winn: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc3a442ba85083b596c3_WinnCompanies.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d694c0351355767d3374_WinnCompanies.svg",
  },
  millcreek: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc3ef00527f607d955d3_MillcreekResidential.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d696c52a1c4f6570ce01_MillcreekResidential.svg",
  },
  cardinal: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc3aba73ebdcc290ad71_CardinalGroup.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d6931666d83f0e72a615_CardinalGroup.svg",
  },
  olympus: {
    dark: "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68cc39ba73ebdcc290ad47_OlympusProperty.svg",
    light:
      "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/6a68d693c57821d38bc12da2_OlympusProperty.svg",
  },
} as const;

export const BRAND_LOGOS: Record<
  CustomerBrandId,
  { dark: string; light: string; label: string }
> = {
  goldoller: { ...CDN.goldoller, label: "GoldOller" },
  rpm: { ...CDN.rpm, label: "RPM Living" },
  scion: { ...CDN.scion, label: "Scion" },
  greystar: { ...CDN.greystar, label: "Greystar" },
  s2: { ...CDN.s2, label: "S2 Residential" },
  avenue5: { ...CDN.avenue5, label: "Avenue5 Residential" },
  winn: { ...CDN.winn, label: "WinnCompanies" },
  millcreek: { ...CDN.millcreek, label: "Mill Creek Residential" },
  cardinal: { ...CDN.cardinal, label: "Cardinal Group" },
  olympus: { ...CDN.olympus, label: "Olympus Property" },
};
