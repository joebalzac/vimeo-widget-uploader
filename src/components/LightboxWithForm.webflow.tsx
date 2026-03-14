/**
 * LightboxWithForm.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers LightboxWithForm as a Designer Extension component
 * with configurable props editable directly in the Webflow canvas.
 */

import LightboxWithForm from "./LightboxWithForm";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(LightboxWithForm, {
  name: "Lightbox With Form",
  description:
    "A lightbox popup modal with an embedded multi-step form. The form is portaled outside the lightbox to prevent overflow clipping.",
  group: "Marketing",

  props: {
    headline: props.Text({
      name: "Headline",
      defaultValue:
        "Limited time: Get a chance to win a gift card when you request a demo.",
      tooltip: "The main headline displayed inside the lightbox.",
    }),

    bodyText: props.Text({
      name: "Body Text",
      defaultValue:
        "See how our product helps you save time, reduce waste, and take control — then walk away with a chance to win a gift card for your time.",
      tooltip: "The supporting body copy displayed below the headline.",
    }),

    heroImageUrl: props.Text({
      name: "Hero Image URL",
      defaultValue: "",
      tooltip: "URL of the image displayed on the right side of the lightbox.",
    }),

    heroImageAlt: props.Text({
      name: "Hero Image Alt Text",
      defaultValue: "Gift card",
      tooltip: "Alt text for the hero image (for accessibility).",
    }),

    termsUrl: props.Text({
      name: "Terms & Conditions URL",
      defaultValue: "/legal/terms",
      tooltip: "URL for the Terms and Conditions link.",
    }),

    className: props.Text({
      name: "CSS Class",
      defaultValue: "",
      tooltip: "Optional extra CSS class to apply to the lightbox wrapper.",
    }),

    defaultOpen: props.Boolean({
      name: "Open by default",
      defaultValue: false,
      tooltip:
        "Force the lightbox open on load. Enable only for canvas preview — use trigger behavior in production.",
    }),

    removeOnSubmit: props.Boolean({
      name: "Remove lightbox on email submit",
      defaultValue: true,
      tooltip:
        "When enabled, the lightbox and overlay close the moment the user submits their email, letting the multi-step form take over fullscreen.",
    }),

    portalId: props.Text({
      name: "HubSpot Portal ID",
      defaultValue: "45321630",
      tooltip: "Your HubSpot portalId passed to MultiStepForm.",
    }),

    formGuid: props.Text({
      name: "HubSpot Form GUID",
      defaultValue: "0b77026b-30dc-4521-afc4-009261739448",
      tooltip: "Your HubSpot formId / GUID passed to MultiStepForm.",
    }),

    enableNavTrigger: props.Boolean({
      name: "Enable nav button trigger",
      defaultValue: false,
      tooltip:
        "Enable on the first instance only. Wires the #open-demo-form nav button to this form's email validation.",
    }),

    triggerPages: props.Text({
      name: "Trigger Pages",
      defaultValue: "/,/platform-overview",
      tooltip:
        "Comma-separated list of qualifying page paths. e.g. /,/platform-overview",
    }),

    triggerAfter: props.Number({
      name: "Trigger After (visits)",
      defaultValue: 2,
      tooltip:
        "How many qualifying pages must be visited before the lightbox fires.",
    }),

    triggerDelay: props.Number({
      name: "Trigger Delay (ms)",
      defaultValue: 0,
      tooltip:
        "Delay in ms before showing the lightbox once conditions are met. Default is 0.",
    }),
  },
});
