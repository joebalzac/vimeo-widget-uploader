/* Default stats — handoff 07 (Figma 590:46214 desktop, 667:141163 mobile). */
import alnLogo from "../../assets/gen2/stats/aln.png";
import goldOllerLogo from "../../assets/gen2/stats/goldoller.svg";
import graceHillLogo from "../../assets/gen2/stats/grace-hill.png";

export interface Gen2Stat {
  /** Display value, e.g. "+7.1%". The numeric part counts up; prefix/suffix stay fixed. */
  value: string;
  label: string;
  /** Logo image URL. Empty renders `logoName` as a text wordmark. */
  logoSrc?: string;
  /** Source / brand name: the logo's alt text and the wordmark fallback. */
  logoName?: string;
  /** Logo box in px (Figma sizes). */
  logoWidth?: number;
  logoHeight?: number;
  /** How the image fills its box (default "contain"); "cover" + `logoPosition` reproduce a Figma crop. */
  logoFit?: "contain" | "cover";
  /** CSS object-position (default "left center"). */
  logoPosition?: string;
}

export const DEFAULT_STATS: Gen2Stat[] = [
  {
    value: "+7.1%",
    label: "Resident Satisfaction",
    logoSrc: alnLogo,
    logoName: "ALN Apartment Data",
    logoWidth: 76.05,
    logoHeight: 40,
  },
  {
    value: "+47%",
    label: "Team Retention",
    logoSrc: goldOllerLogo,
    logoName: "GoldOller",
    logoWidth: 111.55,
    logoHeight: 22,
  },
  {
    value: "+2%",
    label: "Occupancy",
    logoSrc: graceHillLogo,
    logoName: "Grace Hill",
    logoWidth: 117.91,
    logoHeight: 44,
    /* Figma 590:46480 crops the PNG: 119.17% tall, top -12.07% */
    logoFit: "cover",
    logoPosition: "left 63%",
  },
];
