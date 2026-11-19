/** F3 content table (handoff 04-features). Order = scroll order. */
export type FeatureId = "leasing" | "tour" | "aigt" | "maint" | "delinquency" | "renewals";

export interface Feature {
  id: FeatureId;
  /** Product name: the Plex Mono caps tag above the headline (and the ruler's label). */
  name: string;
  isNew?: boolean;
  /** H3 headline (v109: the old sub-line). Non-breaking hyphens (U+2011) keep compounds whole. */
  title: string;
  whatsNew: string[];
}

export const FEATURES: Feature[] = [
  {
    id: "leasing",
    name: "Leasing",
    title: "Nurtures every lead from inquiry to signed lease",
    whatsNew: ["Brand Suite", "Personalization Suite", "Team Optimization", "Central AI"],
  },
  {
    id: "tour",
    name: "Tour Intelligence",
    isNew: true,
    title: "Records, scores, & coaches every tour",
    whatsNew: ["Real-Time Coaching", "Property Insights", "Custom Rubrics", "Agent Scoring"],
  },
  {
    id: "aigt",
    name: "AI Guided Tours",
    title: "Self\u2011guided tours that convert like in\u2011person ones",
    whatsNew: ["Video Configuration", "Smart Wayfinding"],
  },
  {
    id: "maint",
    name: "Maintenance",
    title: "End\u2011to\u2011end maintenance communication & operations management",
    whatsNew: ["Preventative Maintenance", "Asset Tracking", "Turn Scheduling", "Vendor Coordination"],
  },
  {
    id: "delinquency",
    name: "Delinquency",
    title: "Improve collections without upsetting residents",
    whatsNew: ["Payment Plans", "Demand Notice Generation", "Former Resident Recovery"],
  },
  {
    id: "renewals",
    name: "Renewals",
    title: "Increase resident retention and speed up renewals decisions",
    whatsNew: ["Renewals Prediction", "NTV Saves", "One-Click Renewals Portal"],
  },
];

/** Card coordinate space every visual is drawn in. */
export const CARD_W = 660;
export const CARD_H = 460;
/** How far the two deck layers peek out above the card (476 frame on desktop). */
export const CARD_DECK_H = 16;
export const CARD_MAX_SCALE = 1.25;
