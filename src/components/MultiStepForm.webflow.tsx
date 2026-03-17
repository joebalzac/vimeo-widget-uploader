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
      defaultValue: "0b77026b-30dc-4521-afc4-009261739448",
      tooltip: "Your HubSpot formId / GUID (string).",
    }),

    className: props.Text({
      name: "CSS class",
      defaultValue: "",
      tooltip: "Optional extra CSS class to apply to the form wrapper.",
    }),

    enableNavTrigger: props.Boolean({
      name: "Enable nav button trigger",
      defaultValue: false,
      tooltip:
        "Enable on the first instance only. Wires the #open-demo-form nav button to this form's email validation.",
    }),

    eventEmailSubmit: props.Text({
      name: "Event — Email Submit",
      defaultValue: "multi_form_email_submit",
      tooltip: "GTM dataLayer event fired when the email is submitted.",
    }),

    eventStepTwo: props.Text({
      name: "Event — Step Two",
      defaultValue: "multi_form_step_two",
      tooltip: "GTM dataLayer event fired when step 2 is submitted.",
    }),

    eventStepThree: props.Text({
      name: "Event — Step Three",
      defaultValue: "multi_form_step_three",
      tooltip: "GTM dataLayer event fired when step 3 is submitted.",
    }),
  },
});
