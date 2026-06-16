import goldollerDark from "./goldoller.svg";
import goldollerWhite from "./goldoller-white.svg";
import greystarDark from "./greystar-dark.svg";
import greystarWhite from "./greystar-white.svg";
import rpmDark from "./rpm.svg";
import rpmWhite from "./rpm-white.svg";
import scionDark from "./scion-dark.svg";
import scionWhite from "./scion-white.svg";

export type CustomerBrandId = "goldoller" | "rpm" | "scion" | "greystar";

export const BRAND_LOGOS: Record<
  CustomerBrandId,
  { dark: string; light: string; label: string }
> = {
  goldoller: {
    dark: goldollerDark,
    light: goldollerWhite,
    label: "GoldOller",
  },
  rpm: { dark: rpmDark, light: rpmWhite, label: "RPM Living" },
  scion: { dark: scionDark, light: scionWhite, label: "Scion" },
  greystar: {
    dark: greystarDark,
    light: greystarWhite,
    label: "Greystar",
  },
};

