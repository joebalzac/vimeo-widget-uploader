/**
 * MeetEliseCTA.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers MeetEliseCTA as a Designer Extension component
 * with configurable props editable directly in the Webflow canvas.
 */

import MeetEliseCTA from "./MeetEliseCTA";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(MeetEliseCTA, {
  name: "Meet Elise — VoiceAI CTA",
  description:
    "CTA button that opens a focused lead capture modal. On submit, fires to HubSpot then transitions to the call confirmation screen with sample questions and language support.",
  group: "Forms",

  props: {
    // ── HubSpot ──────────────────────────────────────────────────────────────
    portalId: props.Text({
      name: "HubSpot Portal ID",
      defaultValue: "21794547",
      tooltip: "Your HubSpot portalId (string).",
    }),

    formGuid: props.Text({
      name: "HubSpot Form GUID",
      defaultValue: "5dcb9ea1-2310-4d8c-a3e8-4e20efed8fff",
      tooltip:
        "Create a dedicated /meetelise form in HubSpot so these leads are segmented separately.",
    }),

    // ── CTA ──────────────────────────────────────────────────────────────────
    ctaLabel: props.Text({
      name: "Button Label",
      defaultValue: "Try Elise VoiceAI",
      tooltip: "Text shown on the CTA button.",
    }),

    ctaVariant: props.Text({
      name: "Button Style",
      defaultValue: "primary",
      tooltip:
        '"primary" = filled purple (#7638fa). "outline" = bordered, transparent bg.',
    }),

    // ── Phone ─────────────────────────────────────────────────────────────────
    phoneDisplay: props.Text({
      name: "Phone Display Text",
      defaultValue: "(888) 315-2945",
      tooltip:
        "Human-readable phone number — also used to generate the tel: link.",
    }),

    // ── GTM Events ────────────────────────────────────────────────────────────
    eventModalOpen: props.Text({
      name: "Event — CTA Clicked",
      defaultValue: "meetelise_cta_clicked",
      tooltip: "GTM dataLayer event fired when the CTA button is clicked.",
    }),

    eventFormSubmit: props.Text({
      name: "Event — Form Submitted",
      defaultValue: "meetelise_lead_submitted",
      tooltip:
        "GTM dataLayer event fired after a successful HubSpot submission.",
    }),
  },
});
