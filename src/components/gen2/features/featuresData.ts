/** F3 content table (handoff 04-features). Order = scroll order. */
export type FeatureId = "leasing" | "tour" | "aigt" | "maint" | "delinquency" | "renewals";

export interface Feature {
  id: FeatureId;
  title: string;
  isNew?: boolean;
  description: string;
  whatsNew: string[];
}

export const FEATURES: Feature[] = [
  {
    id: "leasing",
    title: "LeasingAI",
    description: "Nurtures every lead from inquiry to signed lease.",
    whatsNew: ["Brand Suite", "Personalization Suite", "Team Optimization", "Central AI"],
  },
  {
    id: "tour",
    title: "Tour Intelligence",
    isNew: true,
    description: "Records, scores, and coaches every tour.",
    whatsNew: ["Real-Time Coaching", "Property Insights", "Custom Rubrics", "Agent Scoring"],
  },
  {
    id: "aigt",
    title: "AI-Guided Tours",
    description: "Interactive self-guided touring.",
    whatsNew: ["Video Configuration", "Smart Wayfinding"],
  },
  {
    id: "maint",
    title: "Maintenance",
    description: "Resident communications and end-to-end operations management.",
    whatsNew: ["Preventative Maintenance", "Asset Tracking", "Turn Scheduling", "Vendor Coordination"],
  },
  {
    id: "delinquency",
    title: "Delinquency",
    description: "Improve collections without reducing sentiment.",
    whatsNew: ["Payment Plans", "Demand Notice Generation", "Former Resident Recovery"],
  },
  {
    id: "renewals",
    title: "Renewals",
    description: "Increase retention and speed up renewal decisions.",
    whatsNew: ["Renewals Prediction", "NTV Saves", "One-Click Renewals Portal"],
  },
];

/** Card coordinate space every visual is drawn in. */
export const CARD_W = 660;
export const CARD_H = 460;
/** How far the two deck layers peek out above the card (476 frame on desktop). */
export const CARD_DECK_H = 16;
export const CARD_MAX_SCALE = 1.25;
