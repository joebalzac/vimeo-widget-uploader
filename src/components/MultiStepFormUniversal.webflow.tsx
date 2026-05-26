/**
 * MultiStepFormUniversal.webflow.tsx
 *
 * Webflow Designer component wrapper for MultiStepFormUniversal.
 * Email capture → vertical picker (Housing / Healthcare) → unified multi-step form
 * that submits all data to a single HubSpot form with conditional fields.
 */

import MultiStepFormUniversal from "./MultiStepFormUniversal";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(MultiStepFormUniversal, {
  name: "Multi-Step Form (Universal)",
  description:
    "Email capture → vertical picker (Housing / Healthcare) → unified form. Submits all data to a single HubSpot form with conditional fields based on the selected vertical.",
  group: "Forms",

  props: {
    // ── HubSpot ───────────────────────────────────────────────────────────────
    portalId: props.Text({
      name: "HubSpot Portal ID",
      defaultValue: "45321630",
      tooltip: "Your HubSpot portalId (string).",
    }),

    formGuid: props.Text({
      name: "HubSpot Form GUID",
      defaultValue: "2e281015-dc06-4517-be23-42f379977b10",
      tooltip: "Your HubSpot formId / GUID for the universal form.",
    }),

    promoOffering: props.Text({
      name: "Promo Offering",
      defaultValue: "",
      tooltip: "Hidden promo field passed to HubSpot on form submission.",
    }),

    // ── Email step ────────────────────────────────────────────────────────────
    emailInputPlaceholder: props.Text({
      name: "Email — Placeholder",
      defaultValue: "What's your work email?",
      tooltip: "Placeholder text for the email input.",
    }),

    emailCTAText: props.Text({
      name: "Email — CTA Text",
      defaultValue: "Book a Free Demo",
      tooltip: "Text for the email submit button.",
    }),

    enableLowbrow: props.Boolean({
      name: "Email — Show Trust Bar",
      defaultValue: true,
      tooltip: "Show the G2 rating + SOC2 badge below the email input.",
    }),

    darkMode: props.Boolean({
      name: "Dark Mode",
      defaultValue: false,
      tooltip: "Enable dark mode for the email step trust bar.",
    }),

    leftAlignContent: props.Boolean({
      name: "Left Align",
      defaultValue: false,
      tooltip: "Left-align the email capture instead of centering it.",
    }),

    enableNavTrigger: props.Boolean({
      name: "Enable Nav Button Trigger",
      defaultValue: false,
      tooltip:
        "Wires the #requestModalOpenBtn nav button to advance this form's email step.",
    }),

    // ── GTM events ────────────────────────────────────────────────────────────
    eventEmailSubmit: props.Text({
      name: "Event — Email Submit",
      defaultValue: "multi_form_email_submit",
      tooltip: "GTM dataLayer event fired when email is submitted.",
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

    eventStepBack: props.Text({
      name: "Event — Step Back",
      defaultValue: "multi_form_step_back",
      tooltip: "GTM dataLayer event fired when back is clicked.",
    }),

    enableWebflowEvent: props.Boolean({
      name: "Enable Webflow Event",
      defaultValue: false,
      tooltip:
        "When enabled, fires the 'form_submitted_optimize' Webflow event on final form submission.",
    }),

    // ── Picker step ───────────────────────────────────────────────────────────
    pickerEyebrow: props.Text({
      name: "Picker — Eyebrow",
      defaultValue: "Getting Started",
      tooltip: "Small label above the picker heading.",
    }),

    pickerHeading: props.Text({
      name: "Picker — Heading",
      defaultValue: "Let's Start With the Basics",
      tooltip: "Main heading on the vertical picker screen.",
    }),

    housingCardTitle: props.Text({
      name: "Picker — Housing Card Title",
      defaultValue: "Housing",
      tooltip: "Title on the Housing card.",
    }),

    housingCardBody: props.Text({
      name: "Picker — Housing Card Body",
      defaultValue: "",
      tooltip: "Optional description text on the Housing card.",
    }),

    healthcareCardTitle: props.Text({
      name: "Picker — Healthcare Card Title",
      defaultValue: "Healthcare",
      tooltip: "Title on the Healthcare card.",
    }),

    healthcareCardBody: props.Text({
      name: "Picker — Healthcare Card Body",
      defaultValue: "",
      tooltip: "Optional description text on the Healthcare card.",
    }),

    // ── Picker content panel ──────────────────────────────────────────────────
    pickerContentImageUrl: props.Text({
      name: "Picker — Content Image URL",
      defaultValue: "",
      tooltip: "Background image URL for the industry selection screen content panel.",
    }),

    pickerContentImageAlt: props.Text({
      name: "Picker — Content Image Alt",
      defaultValue: "",
      tooltip: "Alt text for the picker background image.",
    }),

    pickerContentBackgroundColor: props.Text({
      name: "Picker — Content Background Color",
      defaultValue: "",
      tooltip: "Fallback background color for the picker panel (e.g. #7638fa).",
    }),

    pickerContentHeadline: props.Text({
      name: "Picker — Content Headline",
      defaultValue: "",
      tooltip: "Headline text in the picker content panel.",
    }),

    pickerContentBody: props.Text({
      name: "Picker — Content Body",
      defaultValue: "",
      tooltip: "Body text in the picker content panel.",
    }),

    pickerContentOnlyLogoUrl: props.Text({
      name: "Picker — Logo URL",
      defaultValue: "",
      tooltip: "Logo image URL for the picker content panel.",
    }),

    pickerContentLogoAlt: props.Text({
      name: "Picker — Logo Alt Text",
      defaultValue: "",
      tooltip: "Alt text for the picker logo image.",
    }),

    pickerMainQuote: props.Text({
      name: "Picker — Main Quote",
      defaultValue: "",
      tooltip: "Large featured quote in the picker content panel.",
    }),

    pickerTestimonialQuote: props.Text({
      name: "Picker — Testimonial Quote",
      defaultValue: "",
      tooltip: "Smaller testimonial quote in the picker content panel.",
    }),

    pickerTestimonialName: props.Text({
      name: "Picker — Testimonial Name",
      defaultValue: "",
      tooltip: "Name of the picker testimonial author.",
    }),

    pickerTestimonialTitle: props.Text({
      name: "Picker — Testimonial Title",
      defaultValue: "",
      tooltip: "Job title of the picker testimonial author.",
    }),

    pickerTestimonialCompany: props.Text({
      name: "Picker — Testimonial Company",
      defaultValue: "",
      tooltip: "Company of the picker testimonial author.",
    }),

    pickerTestimonialAvatarUrl: props.Text({
      name: "Picker — Testimonial Avatar URL",
      defaultValue: "",
      tooltip: "Avatar image URL for the picker testimonial.",
    }),

    // ── Housing content panel ─────────────────────────────────────────────────
    housingContentImageUrl: props.Text({
      name: "Housing — Content Image URL",
      defaultValue: "",
      tooltip: "Background image URL for the housing content panel.",
    }),

    housingContentImageAlt: props.Text({
      name: "Housing — Content Image Alt",
      defaultValue: "",
      tooltip: "Alt text for the housing background image.",
    }),

    housingContentBackgroundColor: props.Text({
      name: "Housing — Content Background Color",
      defaultValue: "",
      tooltip: "Fallback background color for the housing panel (e.g. #7638fa).",
    }),

    housingContentHeadline: props.Text({
      name: "Housing — Content Headline",
      defaultValue: "",
      tooltip: "Headline text in the housing content panel.",
    }),

    housingContentBody: props.Text({
      name: "Housing — Content Body",
      defaultValue: "",
      tooltip: "Body text in the housing content panel.",
    }),

    housingContentOnlyLogoUrl: props.Text({
      name: "Housing — Logo URL",
      defaultValue: "",
      tooltip: "Logo image URL for the housing content panel.",
    }),

    housingContentLogoAlt: props.Text({
      name: "Housing — Logo Alt Text",
      defaultValue: "",
      tooltip: "Alt text for the housing logo image.",
    }),

    housingMainQuote: props.Text({
      name: "Housing — Main Quote",
      defaultValue: "",
      tooltip: "Large featured quote in the housing content panel.",
    }),

    housingTestimonialQuote: props.Text({
      name: "Housing — Testimonial Quote",
      defaultValue: "",
      tooltip: "Smaller testimonial quote in the housing content panel.",
    }),

    housingTestimonialName: props.Text({
      name: "Housing — Testimonial Name",
      defaultValue: "",
      tooltip: "Name of the housing testimonial author.",
    }),

    housingTestimonialTitle: props.Text({
      name: "Housing — Testimonial Title",
      defaultValue: "",
      tooltip: "Job title of the housing testimonial author.",
    }),

    housingTestimonialCompany: props.Text({
      name: "Housing — Testimonial Company",
      defaultValue: "",
      tooltip: "Company of the housing testimonial author.",
    }),

    housingTestimonialAvatarUrl: props.Text({
      name: "Housing — Testimonial Avatar URL",
      defaultValue: "",
      tooltip: "Avatar image URL for the housing testimonial.",
    }),

    // ── Healthcare content panel ──────────────────────────────────────────────
    healthContentImageUrl: props.Text({
      name: "Healthcare — Content Image URL",
      defaultValue: "",
      tooltip: "Background image URL for the healthcare content panel.",
    }),

    healthContentImageAlt: props.Text({
      name: "Healthcare — Content Image Alt",
      defaultValue: "",
      tooltip: "Alt text for the healthcare background image.",
    }),

    healthContentBackgroundColor: props.Text({
      name: "Healthcare — Content Background Color",
      defaultValue: "",
      tooltip: "Fallback background color for the healthcare panel (e.g. #7638fa).",
    }),

    healthContentHeadline: props.Text({
      name: "Healthcare — Content Headline",
      defaultValue: "",
      tooltip: "Headline text in the healthcare content panel.",
    }),

    healthContentBody: props.Text({
      name: "Healthcare — Content Body",
      defaultValue: "",
      tooltip: "Body text in the healthcare content panel.",
    }),

    healthContentOnlyLogoUrl: props.Text({
      name: "Healthcare — Logo URL",
      defaultValue: "",
      tooltip: "Logo image URL for the healthcare content panel.",
    }),

    healthContentLogoAlt: props.Text({
      name: "Healthcare — Logo Alt Text",
      defaultValue: "",
      tooltip: "Alt text for the healthcare logo image.",
    }),

    healthMainQuote: props.Text({
      name: "Healthcare — Main Quote",
      defaultValue: "",
      tooltip: "Large featured quote in the healthcare content panel.",
    }),

    healthTestimonialQuote: props.Text({
      name: "Healthcare — Testimonial Quote",
      defaultValue: "",
      tooltip: "Smaller testimonial quote in the healthcare content panel.",
    }),

    healthTestimonialName: props.Text({
      name: "Healthcare — Testimonial Name",
      defaultValue: "",
      tooltip: "Name of the healthcare testimonial author.",
    }),

    healthTestimonialTitle: props.Text({
      name: "Healthcare — Testimonial Title",
      defaultValue: "",
      tooltip: "Job title of the healthcare testimonial author.",
    }),

    healthTestimonialCompany: props.Text({
      name: "Healthcare — Testimonial Company",
      defaultValue: "",
      tooltip: "Company of the healthcare testimonial author.",
    }),

    healthTestimonialAvatarUrl: props.Text({
      name: "Healthcare — Testimonial Avatar URL",
      defaultValue: "",
      tooltip: "Avatar image URL for the healthcare testimonial.",
    }),
  },
});
