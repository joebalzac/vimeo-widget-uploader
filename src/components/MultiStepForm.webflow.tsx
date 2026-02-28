/**
 * MultiStepForm.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers MultiStepForm as a Designer Extension component
 * with configurable props editable directly in the Webflow canvas.
 */

import MultiStepForm from "./MultiStepForm";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(MultiStepForm, {
  name: "Multi-Step Form",
  description:
    "A multi-step form that collects contact details step by step and submits them as a single HubSpot form submission.",
  group: "Forms",

  props: {
    portalId: props.Text({
      name: "HubSpot Portal ID",
      defaultValue: "45321630",
      tooltip: "Your HubSpot portalId (string).",
    }),

    formGuid: props.Text({
      name: "HubSpot Form GUID",
      defaultValue: "a68880cf-aa3e-4845-9822-f863608bed1f",
      tooltip: "Your HubSpot formId / GUID (string).",
    }),

    className: props.Text({
      name: "CSS class",
      defaultValue: "",
      tooltip: "Optional extra CSS class to apply to the form wrapper.",
    }),
  },
});
