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
    "A multi-step form that collects contact details step by step and submits them as a single HubSpot form submission. Supports an optional split layout with a content panel.",
  group: "Forms",

  props: {
    // ── Form props ────────────────────────────────────────────────────────────
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
        "Enable on the first instance only. Wires the #requestModalOpenBtn nav button to this form's email validation.",
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

    enableWebflowEvent: props.Boolean({
      name: "Enable Webflow event",
      defaultValue: false,
      tooltip:
        "When enabled, fires the 'housing-hs-form-submit-optimize' Webflow event on final form submission.",
    }),

    emailInputPlaceholder: props.Text({
      name: "Email input placeholder",
      defaultValue: "What's your work email?",
      tooltip: "Placeholder text for the email input.",
    }),

    emailCTAText: props.Text({
      name: "Email CTA text",
      defaultValue: "Book a Free Demo",
      tooltip: "Text for the email CTA button.",
    }),

    promoOffering: props.Text({
      name: "Promo offering",
      defaultValue: "",
      tooltip: "Hidden field passed to HubSpot on form submission.",
    }),

    enableLowbrow: props.Boolean({
      name: "Enable lowbrow",
      defaultValue: true,
      tooltip: "Show the rating + SOC2 trust bar below the email capture.",
    }),

    // ── Content panel props ───────────────────────────────────────────────────
    contentImageUrl: props.Text({
      name: "Content — Background Image URL",
      defaultValue: "",
      tooltip:
        "Background image URL for the left content panel. If empty, no content panel is shown.",
    }),

    contentImageAlt: props.Text({
      name: "Content — Background Image Alt",
      defaultValue: "",
      tooltip: "Alt text for the background image.",
    }),

    contentBackgroundColor: props.Text({
      name: "Content — Background Color",
      defaultValue: "",
      tooltip: "Fallback background color if no image is set (e.g. #7638fa).",
    }),

    contentHeadline: props.Text({
      name: "Content — Headline",
      defaultValue: "",
      tooltip: "Headline text displayed in the content panel.",
    }),

    contentBody: props.Text({
      name: "Content — Body",
      defaultValue: "",
      tooltip: "Body text displayed in the content panel.",
    }),

    contentOnlyLogoUrl: props.Text({
      name: "Content — Single Logo URL",
      defaultValue: "",
      tooltip: "A single logo image URL. Leave empty if using multiple logos.",
    }),

    multipleLogos: props.Boolean({
      name: "Content — Multiple Logos",
      defaultValue: false,
      tooltip: "Enable to show up to three logos instead of one.",
    }),

    contentOneLogoUrl: props.Text({
      name: "Content — Logo 1 URL",
      defaultValue: "",
      tooltip: "First logo URL (requires Multiple Logos enabled).",
    }),

    contentTwoLogoUrl: props.Text({
      name: "Content — Logo 2 URL",
      defaultValue: "",
      tooltip: "Second logo URL (requires Multiple Logos enabled).",
    }),

    contentThreeLogoUrl: props.Text({
      name: "Content — Logo 3 URL",
      defaultValue: "",
      tooltip: "Third logo URL (requires Multiple Logos enabled).",
    }),

    contentLogoAlt: props.Text({
      name: "Content — Logo Alt Text",
      defaultValue: "",
      tooltip: "Alt text for the logo image(s).",
    }),

    mainQuote: props.Text({
      name: "Content — Main Quote",
      defaultValue: "",
      tooltip: "Large featured quote shown in the content panel.",
    }),

    testimonialQuote: props.Text({
      name: "Content — Testimonial Quote",
      defaultValue: "",
      tooltip: "Smaller testimonial quote shown in a card.",
    }),

    testimonialName: props.Text({
      name: "Content — Testimonial Name",
      defaultValue: "",
      tooltip: "Name of the person giving the testimonial.",
    }),

    testimonialTitle: props.Text({
      name: "Content — Testimonial Title",
      defaultValue: "",
      tooltip: "Job title of the person giving the testimonial.",
    }),

    testimonialCompany: props.Text({
      name: "Content — Testimonial Company",
      defaultValue: "",
      tooltip: "Company of the person giving the testimonial.",
    }),

    testimonialAvatarUrl: props.Text({
      name: "Content — Testimonial Avatar URL",
      defaultValue: "",
      tooltip: "Avatar image URL for the testimonial author.",
    }),
  },
});
