/**
 * ContentFormWrapper.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers ContentFormWrapper as a Designer Extension component.
 */
import ContentFormWrapper from "./ContentFormWrapper";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(ContentFormWrapper, {
  name: "Content Form Wrapper",
  description:
    "A multi-step form with a content panel alongside steps 2 and 3. Form on the left, content on the right.",
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

    enableNavTrigger: props.Boolean({
      name: "Enable nav button trigger",
      defaultValue: false,
      tooltip:
        "Wires the #open-demo-form nav button to this form's email validation.",
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

    emailInputPlaceholder: props.Text({
      name: "Email Placeholder",
      defaultValue: "What's your work email?",
      tooltip: "Placeholder text for the email input.",
    }),

    emailCTAText: props.Text({
      name: "Email CTA Text",
      defaultValue: "Book a free demo",
      tooltip: "CTA button text on the email step.",
    }),

    promoOffering: props.Text({
      name: "Promo Offering",
      defaultValue: "",
      tooltip: "Hidden field passed to HubSpot on form submission.",
    }),

    // ── Content panel props ───────────────────────────────────────────────────
    contentHeadline: props.Text({
      name: "Content Headline",
      defaultValue: "See why thousands trust us.",
      tooltip: "Headline displayed in the content panel.",
    }),

    contentBody: props.Text({
      name: "Content Body",
      defaultValue:
        "Our platform helps you save time, reduce waste, and take control.",
      tooltip: "Body text displayed in the content panel.",
    }),

    contentBackgroundColor: props.Text({
      name: "Content Background Color",
      defaultValue: "",
      tooltip: "Background color for the content panel.",
    }),

    contentImageUrl: props.Text({
      name: "Background Image URL",
      defaultValue: "",
      tooltip: "Background image URL for the content panel.",
    }),

    contentImageAlt: props.Text({
      name: "Background Image Alt",
      defaultValue: "",
      tooltip: "Alt text for the background image.",
    }),

    contentLogoUrl: props.Text({
      name: "Logo URL",
      defaultValue: "",
      tooltip: "Logo image URL displayed at the top of the content panel.",
    }),

    contentLogoAlt: props.Text({
      name: "Logo Alt Text",
      defaultValue: "",
      tooltip: "Alt text for the logo image.",
    }),

    contentCtaText: props.Text({
      name: "CTA Text",
      defaultValue: "",
      tooltip: "Optional CTA button text in the content panel.",
    }),

    contentCtaUrl: props.Text({
      name: "CTA URL",
      defaultValue: "#",
      tooltip: "URL for the optional CTA button.",
    }),

    testimonialQuote: props.Text({
      name: "Testimonial Quote",
      defaultValue: "",
      tooltip: "Testimonial quote text.",
    }),

    testimonialName: props.Text({
      name: "Testimonial Name",
      defaultValue: "",
      tooltip: "Name of the person giving the testimonial.",
    }),

    testimonialTitle: props.Text({
      name: "Testimonial Title",
      defaultValue: "",
      tooltip: "Job title of the person giving the testimonial.",
    }),

    testimonialCompany: props.Text({
      name: "Testimonial Company",
      defaultValue: "",
      tooltip: "Company of the person giving the testimonial.",
    }),

    testimonialAvatarUrl: props.Text({
      name: "Testimonial Avatar URL",
      defaultValue: "",
      tooltip: "Avatar image URL for the testimonial author.",
    }),
  },
});
