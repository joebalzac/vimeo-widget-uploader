/**
 * LightboxModal.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers LightboxModal as a Designer Extension component
 * with configurable props editable directly in the Webflow canvas.
 */

import LightboxModal from "./LightboxModal";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(LightboxModal, {
  name: "Ligbox Modal",
  description:
    "A lightbox popup modal that gives users a chance to win a gift card when they request a demo.",
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
  },
});
