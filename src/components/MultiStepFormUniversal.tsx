import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import "./MultiFormStyling.css";

// ─── Default SDK types ────────────────────────────────────────────────────────

interface DefaultQuestion {
  id: string;
  name: string;
  type: string;
  options?: Array<string | number>;
  lead_attribute?: string;
}

interface DefaultSubmission {
  form_id: number;
  team_id: number;
  responses: Record<string, string>;
  questions: DefaultQuestion[];
}

interface DefaultCallbacks {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  onSchedulerDisplayed?: (data: unknown) => void;
  onSchedulerClosed?: (data: { redirectUrl?: string }) => void;
  onMeetingBooked?: (data: { payload: unknown }) => void;
}

declare global {
  interface Window {
    DefaultSDK?: {
      submit: (
        submission: DefaultSubmission,
        callbacks?: DefaultCallbacks,
      ) => Promise<void>;
      helloWorld: () => void;
    };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "email" | "picker" | "form" | "complete";
type Vertical = "housing" | "healthcare";

interface FormData {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  company: string;
  // Real Estate
  units_managed: string;
  pms_compatability: string;
  ai_areas: string;
  // Healthcare
  monthly_call_volume: string;
  ehr: string;
  specialty: string;
  num_providers: string;
  how_did_you_hear: string;
}

interface HubSpotField {
  name: string;
  value: string;
}

interface HubSpotPayload {
  fields: HubSpotField[];
  context: { pageUri: string; pageName: string; hutk?: string };
}

interface ContentPanelProps {
  contentHeadline?: string;
  contentBody?: string;
  contentImageUrl?: string;
  contentImageAlt?: string;
  contentBackgroundColor?: string;
  contentOnlyLogoUrl?: string;
  contentLogoAlt?: string;
  mainQuote?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialTitle?: string;
  testimonialCompany?: string;
  testimonialAvatarUrl?: string;
}

interface Props {
  portalId?: string;
  formGuid?: string;
  className?: string;
  enableNavTrigger?: boolean;
  eventEmailSubmit?: string;
  eventStepTwo?: string;
  eventStepThree?: string;
  eventStepBack?: string;
  onStepChange?: (step: number) => void;
  enableWebflowEvent?: boolean;
  emailInputPlaceholder?: string;
  emailCTAText?: string;
  promoOffering?: string;
  onComplete?: () => void;
  enableLowbrow?: boolean;
  leftAlignContent?: boolean;
  darkMode?: boolean;
  // Picker
  pickerEyebrow?: string;
  pickerHeading?: string;
  housingCardTitle?: string;
  housingCardBody?: string;
  healthcareCardTitle?: string;
  healthcareCardBody?: string;
  // Picker content panel
  pickerContentImageUrl?: string;
  pickerContentImageAlt?: string;
  pickerContentBackgroundColor?: string;
  pickerContentHeadline?: string;
  pickerContentBody?: string;
  pickerContentOnlyLogoUrl?: string;
  pickerContentLogoAlt?: string;
  pickerMainQuote?: string;
  pickerTestimonialQuote?: string;
  pickerTestimonialName?: string;
  pickerTestimonialTitle?: string;
  pickerTestimonialCompany?: string;
  pickerTestimonialAvatarUrl?: string;
  // Housing content panel
  housingContentImageUrl?: string;
  housingContentImageAlt?: string;
  housingContentBackgroundColor?: string;
  housingContentHeadline?: string;
  housingContentBody?: string;
  housingContentOnlyLogoUrl?: string;
  housingContentLogoAlt?: string;
  housingMainQuote?: string;
  housingTestimonialQuote?: string;
  housingTestimonialName?: string;
  housingTestimonialTitle?: string;
  housingTestimonialCompany?: string;
  housingTestimonialAvatarUrl?: string;
  // Healthcare content panel
  healthContentImageUrl?: string;
  healthContentImageAlt?: string;
  healthContentBackgroundColor?: string;
  healthContentHeadline?: string;
  healthContentBody?: string;
  healthContentOnlyLogoUrl?: string;
  healthContentLogoAlt?: string;
  healthMainQuote?: string;
  healthTestimonialQuote?: string;
  healthTestimonialName?: string;
  healthTestimonialTitle?: string;
  healthTestimonialCompany?: string;
  healthTestimonialAvatarUrl?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTAL_ID = "45321630";
const FORM_GUID = "2e281015-dc06-4517-be23-42f379977b10";
const API_BASE = "https://contact-checker-backend.vercel.app";
const DEFAULT_FORM_ID = 539717;
const DEFAULT_TEAM_ID = 588;

const UNITS_MANAGED_OPTIONS = [
  "<450",
  "450-999",
  "1,000-4,999",
  "5,000-15,999",
  "16,000+",
];
const PMS_OPTIONS = [
  "Appfolio",
  "Buildium",
  "Entrata",
  "MRI",
  "Propertyware",
  "RealPage",
  "ResMan",
  "Yardi",
  "More than one",
  "Other",
];
const EHR_OPTIONS = [
  "AdvancedMD",
  "AthenaHealth",
  "eClinicalWorks",
  "Epic",
  "EyeCare Leaders",
  "Greenway Health",
  "ModMed",
  "Nextech",
  "NextGen",
  "Oracle/Cerner",
  "Veradigm",
  "Other",
];
const SPECIALTY_OPTIONS = [
  "Women's Health",
  "Dermatology",
  "Ophthalmology",
  "Orthopedics",
  "Other",
];

const INITIAL_FORM: FormData = {
  email: "",
  firstname: "",
  lastname: "",
  phone: "",
  company: "",
  units_managed: "",
  pms_compatability: "",
  ai_areas: "",
  monthly_call_volume: "",
  ehr: "",
  specialty: "",
  num_providers: "",
  how_did_you_hear: "",
};

const BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "yahoo.co.in",
  "yahoo.fr",
  "yahoo.es",
  "yahoo.de",
  "hotmail.com",
  "hotmail.co.uk",
  "hotmail.fr",
  "hotmail.es",
  "hotmail.de",
  "outlook.com",
  "outlook.co.uk",
  "outlook.fr",
  "live.com",
  "live.co.uk",
  "live.fr",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "email.com",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "gmx.com",
  "gmx.de",
  "gmx.net",
  "tutanota.com",
  "tutamail.com",
  "fastmail.com",
  "fastmail.fm",
  "hey.com",
  "duck.com",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pushEvent(event: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

function validateEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  return !BLOCKED_DOMAINS.has(val.split("@")[1].toLowerCase());
}

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
}

function loadDefaultSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.DefaultSDK) return resolve();
    const script = document.createElement("script");
    script.src = "https://import-cdn.default.com/sdk.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Default SDK"));
    document.head.appendChild(script);
  });
}

async function createContact(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/create-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch (err) {
    console.warn("[createContact] failed silently", err);
  }
}

async function updateContact(
  email: string,
  properties: Record<string, string>,
): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/update-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, properties }),
    });
  } catch (err) {
    console.warn("[updateContact] failed silently", err);
  }
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

// ─── Content panel ────────────────────────────────────────────────────────────

function ContentPanel({
  contentHeadline,
  contentBody,
  contentImageUrl,
  contentImageAlt,
  contentBackgroundColor,
  contentOnlyLogoUrl,
  contentLogoAlt,
  mainQuote,
  testimonialQuote,
  testimonialName,
  testimonialTitle,
  testimonialCompany,
  testimonialAvatarUrl,
}: ContentPanelProps) {
  const bgStyle = contentImageUrl
    ? {
        backgroundImage: `url(${contentImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : { backgroundColor: contentBackgroundColor };

  return (
    <div
      className="msf__content-col"
      style={bgStyle}
      aria-label={contentImageAlt}
    >
      <div className="msf__content-inner">
        {(contentHeadline || contentBody) && (
          <div className="msf__content-headline-body">
            {contentHeadline && (
              <h2 className="msf__content-headline">{contentHeadline}</h2>
            )}
            {contentBody && <p className="msf__content-body">{contentBody}</p>}
          </div>
        )}

        {contentOnlyLogoUrl && (
          <img
            src={contentOnlyLogoUrl}
            alt={contentLogoAlt}
            className="msf__content-logo"
          />
        )}

        {mainQuote && (
          <div className="msf__main-quote">
            <p className="msf__main-quote-text">{mainQuote}</p>
            {(testimonialName || testimonialAvatarUrl) && (
              <div className="msf__testimonial-author">
                {testimonialAvatarUrl && (
                  <img
                    src={testimonialAvatarUrl}
                    alt={testimonialName}
                    className="msf__testimonial-avatar"
                  />
                )}
                <div className="msf__testimonial-meta">
                  {testimonialName && (
                    <span className="msf__testimonial-name">
                      {testimonialName}
                    </span>
                  )}
                  {testimonialTitle && (
                    <span className="msf__testimonial-title">
                      {testimonialTitle}
                    </span>
                  )}
                  {testimonialCompany && (
                    <span className="msf__testimonial-company">
                      {testimonialCompany}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {testimonialQuote && (
          <div className="msf__testimonial">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="31"
              height="24"
              viewBox="0 0 31 24"
              fill="none"
            >
              <path
                d="M29.1827 13.1561V24H18.3389V10.3655C18.3389 7.17608 19.216 4.65117 20.9701 2.7907C22.7774 0.930233 25.4352 0 28.9435 0H30.3787V4.06645H29.103C24.9037 4.06645 22.804 6.08638 22.804 10.1262V13.1561H29.1827ZM10.8439 13.1561V24H0V10.3655C0 7.17608 0.877077 4.65117 2.63123 2.7907C4.43854 0.930233 7.09635 0 10.6047 0H12.0399V4.06645H10.7641C6.56478 4.06645 4.46512 6.08638 4.46512 10.1262V13.1561H10.8439Z"
                fill="#A594FF"
              />
            </svg>
            <p className="msf__testimonial-quote">{testimonialQuote}</p>
            {(testimonialName || testimonialAvatarUrl) && (
              <div className="msf__testimonial-author">
                {testimonialAvatarUrl && (
                  <img
                    src={testimonialAvatarUrl}
                    alt={testimonialName}
                    className="msf__testimonial-avatar"
                  />
                )}
                <div className="msf__testimonial-meta">
                  {testimonialName && (
                    <span className="msf__testimonial-name">
                      {testimonialName}
                    </span>
                  )}
                  {testimonialTitle && (
                    <span className="msf__testimonial-title">
                      {testimonialTitle}
                    </span>
                  )}
                  {testimonialCompany && (
                    <span className="msf__testimonial-company">
                      {testimonialCompany}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SVG helpers ──────────────────────────────────────────────────────────────

function HousingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M10 12H10.01"
        stroke="#0D0D0C"
        strokeOpacity="0.815686"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 20V6C18 5.46957 17.7893 4.96086 17.4142 4.58579C17.0391 4.21071 16.5304 4 16 4H8C7.46957 4 6.96086 4.21071 6.58579 4.58579C6.21071 4.96086 6 5.46957 6 6V20"
        stroke="#0D0D0C"
        strokeOpacity="0.815686"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 20H22"
        stroke="#0D0D0C"
        strokeOpacity="0.815686"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HealthcareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M14.479 19.3745L13.508 20.3135C13.3217 20.5275 13.0919 20.6994 12.834 20.8178C12.5762 20.9362 12.296 20.9984 12.0123 21.0002C11.7285 21.002 11.4476 20.9434 11.1883 20.8283C10.9289 20.7131 10.697 20.5442 10.508 20.3325L5 15.0005C3.5 13.5005 2 11.8005 2 9.50053C2.00002 8.38773 2.33759 7.30111 2.96813 6.38419C3.59867 5.46727 4.49252 4.76319 5.53161 4.36493C6.5707 3.96667 7.70616 3.89297 8.78801 4.15357C9.86987 4.41417 10.8472 4.99681 11.591 5.82453C11.6434 5.88054 11.7067 5.9252 11.7771 5.95573C11.8474 5.98626 11.9233 6.00201 12 6.00201C12.0767 6.00201 12.1526 5.98626 12.2229 5.95573C12.2933 5.9252 12.3566 5.88054 12.409 5.82453C13.1504 4.99143 14.128 4.4039 15.2116 4.14013C16.2952 3.87636 17.4335 3.94887 18.4749 4.34801C19.5163 4.74715 20.4114 5.45398 21.0411 6.37443C21.6708 7.29488 22.0053 8.38529 22 9.50053C21.9997 10.0052 21.9259 10.5071 21.781 10.9905"
        stroke="#0D0D0C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 15H21"
        stroke="#0D0D0C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 12V18"
        stroke="#0D0D0C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MultiStepFormUniversal({
  portalId = PORTAL_ID,
  formGuid = FORM_GUID,
  className = "",
  enableNavTrigger = false,
  eventEmailSubmit = "multi_form_email_submit",
  eventStepTwo = "multi_form_step_two",
  eventStepThree = "multi_form_step_three",
  eventStepBack = "multi_form_step_back",
  onStepChange,
  enableWebflowEvent = false,
  emailInputPlaceholder = "What's your work email?",
  emailCTAText = "Book a Free Demo",
  promoOffering = "",
  onComplete,
  enableLowbrow = true,
  leftAlignContent = false,
  darkMode = false,
  pickerEyebrow = "Getting Started",
  pickerHeading = "Let's Start With the Basics",
  housingCardTitle = "Housing",
  housingCardBody = "",
  healthcareCardTitle = "Healthcare",
  healthcareCardBody = "",
  pickerContentImageUrl,
  pickerContentImageAlt,
  pickerContentBackgroundColor,
  pickerContentHeadline,
  pickerContentBody,
  pickerContentOnlyLogoUrl,
  pickerContentLogoAlt,
  pickerMainQuote,
  pickerTestimonialQuote,
  pickerTestimonialName,
  pickerTestimonialTitle,
  pickerTestimonialCompany,
  pickerTestimonialAvatarUrl,
  housingContentImageUrl,
  housingContentImageAlt,
  housingContentBackgroundColor,
  housingContentHeadline,
  housingContentBody = "Discover how EliseAI revolutionizes leasing, resident management, and operations, delivering measurable results for our clients.",
  housingContentOnlyLogoUrl,
  housingContentLogoAlt,
  housingMainQuote,
  housingTestimonialQuote,
  housingTestimonialName,
  housingTestimonialTitle,
  housingTestimonialCompany,
  housingTestimonialAvatarUrl,
  healthContentImageUrl,
  healthContentImageAlt,
  healthContentBackgroundColor,
  healthContentHeadline,
  healthContentBody = "Empowering healthcare providers to automate patient interactions and administrative tasks, enhancing efficiency, reducing costs, and improving patient outcomes.",
  healthContentOnlyLogoUrl,
  healthContentLogoAlt,
  healthMainQuote,
  healthTestimonialQuote,
  healthTestimonialName,
  healthTestimonialTitle,
  healthTestimonialCompany,
  healthTestimonialAvatarUrl,
}: Props) {
  const [phase, setPhase] = useState<Phase>("email");
  const [formStep, setFormStep] = useState<number>(2);
  const [dir, setDir] = useState<number>(1);
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(
    null,
  );
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Preload Default SDK
  useEffect(() => {
    loadDefaultSDK().catch((err) => console.warn("[Default SDK]", err));
  }, []);

  // Scroll lock while overlay is open
  useEffect(() => {
    if (phase !== "email") {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, [phase]);

  // Nav button trigger
  useEffect(() => {
    if (!enableNavTrigger) return;
    const navBtn = document.getElementById("requestModalOpenBtn");
    if (!navBtn) return;
    const handler = (e: Event) => {
      e.preventDefault();
      if (!form.email) {
        setErrors((p) => ({ ...p, email: "Email is required." }));
        return;
      }
      if (!validateEmail(form.email)) {
        setErrors((p) => ({
          ...p,
          email: "Please use your work email address.",
        }));
        return;
      }
      void createContact(form.email);
      setPhase("picker");
    };
    navBtn.addEventListener("click", handler);
    return () => navBtn.removeEventListener("click", handler);
  }, [form.email, enableNavTrigger]);

  const set = useCallback(
    <K extends keyof FormData>(key: K, val: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    },
    [],
  );

  const validateEmailStep = useCallback((): boolean => {
    if (!form.email) {
      setErrors({ email: "Email is required." });
      return false;
    }
    if (!validateEmail(form.email)) {
      setErrors({ email: "Please use your work email address." });
      return false;
    }
    return true;
  }, [form.email]);

  const validateFormStep = useCallback((): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (formStep === 2) {
      if (!form.firstname) errs.firstname = "First name is required.";
      if (!form.lastname) errs.lastname = "Last name is required.";
      if (!form.phone) errs.phone = "Phone number is required.";
    }
    if (formStep === 3) {
      if (!form.company) errs.company = "Company name is required.";
      if (selectedVertical === "healthcare") {
        if (!form.monthly_call_volume)
          errs.monthly_call_volume = "Monthly call volume is required.";
        if (!form.ehr) errs.ehr = "EHR is required.";
        if (!form.specialty) errs.specialty = "Specialty is required.";
        if (!form.num_providers)
          errs.num_providers = "Number of providers is required.";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formStep, form, selectedVertical]);

  const handleEmailSubmit = useCallback(() => {
    if (!validateEmailStep()) return;
    pushEvent(eventEmailSubmit);
    if ((window as any).wf) {
      (window as any).wf.ready(() =>
        (window as any).wf.sendEvent("email_capture_optimize"),
      );
    }
    void createContact(form.email);
    setErrors({});
    setPhase("picker");
  }, [validateEmailStep, form.email, eventEmailSubmit]);

  const handlePickerContinue = useCallback(() => {
    if (!selectedVertical) return;
    setFormStep(2);
    setDir(1);
    setPhase("form");
    onStepChange?.(2);
  }, [selectedVertical, onStepChange]);

  const handleNext = useCallback(() => {
    if (!validateFormStep()) return;
    setDir(1);
    setFormStep(3);
    onStepChange?.(3);
    if (formStep === 2) {
      void updateContact(form.email, {
        firstname: form.firstname,
        lastname: form.lastname,
        phone: form.phone,
      });
    }
  }, [validateFormStep, formStep, form, onStepChange]);

  const handleBack = useCallback(() => {
    pushEvent(eventStepBack);
    if (phase === "picker") {
      setPhase("email");
    } else if (phase === "form" && formStep === 2) {
      setPhase("picker");
    } else {
      setDir(-1);
      setFormStep(2);
      onStepChange?.(2);
    }
  }, [phase, formStep, eventStepBack, onStepChange]);

  const submit = useCallback(async () => {
    if (!validateFormStep()) return;
    setSubmitting(true);
    setApiError("");

    const industryValue =
      selectedVertical === "housing" ? "Real Estate" : "Healthcare";

    const fields: HubSpotField[] = [
      { name: "email", value: form.email },
      { name: "firstname", value: form.firstname },
      { name: "lastname", value: form.lastname },
      { name: "phone", value: form.phone },
      { name: "company", value: form.company },
      { name: "what_industry_are_you_in_", value: industryValue },
    ];

    if (selectedVertical === "housing") {
      fields.push(
        { name: "units_managed", value: form.units_managed },
        { name: "pms_compatability", value: form.pms_compatability },
        {
          name: "in_which_areas_of_your_operations_are_you_looking_to_implement_ai_",
          value: form.ai_areas,
        },
      );
    } else {
      fields.push(
        {
          name: "whats_your_monthly_call_volume",
          value: form.monthly_call_volume,
        },
        { name: "what_ehr_do_you_use_", value: form.ehr },
        { name: "what_s_your_speciality_", value: form.specialty },
        { name: "how_many_providers_do_you_have_", value: form.num_providers },
        {
          name: "how_did_you_hear_about_us_form__c",
          value: form.how_did_you_hear,
        },
      );
    }

    if (promoOffering)
      fields.push({ name: "promo_offering", value: promoOffering });

    (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((p) => {
      const v = getParam(p);
      if (v) fields.push({ name: p, value: v });
    });

    const hutk = getCookie("hubspotutk");
    const payload: HubSpotPayload = {
      fields: fields.filter((f) => f.value !== ""),
      context: {
        pageUri: window.location.href,
        pageName: document.title,
        ...(hutk && { hutk }),
      },
    };

    try {
      const res = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[HubSpot] ${res.status}`, errBody);
        throw new Error(`HubSpot responded with ${res.status}: ${errBody}`);
      }

      console.log("[HubSpot] submission success", {
        portalId,
        formGuid,
        fields: payload.fields,
      });

      // Default SDK — housing only
      if (selectedVertical === "housing") {
        try {
          await loadDefaultSDK();
          window.DefaultSDK!.submit(
            {
              form_id: DEFAULT_FORM_ID,
              team_id: DEFAULT_TEAM_ID,
              responses: {
                email: form.email,
                firstname: form.firstname,
                lastname: form.lastname,
                phone: form.phone,
                company: form.company,
                units_managed: form.units_managed,
                pms_compatability: form.pms_compatability,
                ai_areas: form.ai_areas,
              },
              questions: [
                { id: "email", name: "Email", type: "email" },
                { id: "firstname", name: "First Name", type: "input", lead_attribute: "first_name" },
                { id: "lastname", name: "Last Name", type: "input", lead_attribute: "last_name" },
                { id: "phone", name: "Phone Number", type: "tel", lead_attribute: "phone" },
                { id: "company", name: "Company Name", type: "input", lead_attribute: "company" },
                { id: "units_managed", name: "Units Managed", type: "select", options: UNITS_MANAGED_OPTIONS },
                { id: "pms_compatability", name: "PMS Compatibility", type: "select", options: PMS_OPTIONS },
                { id: "ai_areas", name: "AI Implementation Areas", type: "textarea" },
              ],
            },
            {
              onSuccess: (d) => console.log("[Default] success", d),
              onError: (e) => console.error("[Default] error", e),
              onSchedulerDisplayed: (d) => console.log("[Default] scheduler displayed", d),
              onSchedulerClosed: (d) => console.log("[Default] scheduler closed", d),
              onMeetingBooked: (d) => console.log("[Default] meeting booked", d),
            },
          );
        } catch (err) {
          console.warn("[Default SDK] failed silently", err);
        }
      }

      if (enableWebflowEvent && (window as any).wf) {
        (window as any).wf.ready(() =>
          (window as any).wf.sendEvent("form_submitted_optimize"),
        );
      }

      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      onComplete?.();
      setPhase("complete");
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [
    validateFormStep,
    form,
    selectedVertical,
    portalId,
    formGuid,
    promoOffering,
    enableWebflowEvent,
    onComplete,
  ]);

  // Auto-dismiss complete screen
  useEffect(() => {
    if (phase !== "complete") return;
    const t = setTimeout(() => {
      setPhase("email");
      setForm(INITIAL_FORM);
      setErrors({});
      setSelectedVertical(null);
      setFormStep(2);
    }, 5000);
    return () => clearTimeout(t);
  }, [phase]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (phase === "email") handleEmailSubmit();
      if (phase === "form") formStep < 3 ? handleNext() : void submit();
    },
    [phase, formStep, handleEmailSubmit, handleNext, submit],
  );

  const flowStep = formStep - 1;
  const flowTotal = 2;
  const progress =
    phase === "form" ? Math.round((flowStep / flowTotal) * 100) : 0;

  const step3Heading =
    selectedVertical === "healthcare"
      ? "Tell Us About Your Practice"
      : "Tell Us About Your Operations";

  const isHealth = selectedVertical === "healthcare";

  const hasContentPanel = isHealth
    ? !!(
        healthContentImageUrl ||
        healthContentBackgroundColor ||
        healthContentHeadline ||
        healthContentBody ||
        healthContentOnlyLogoUrl ||
        healthMainQuote ||
        healthTestimonialQuote
      )
    : !!(
        housingContentImageUrl ||
        housingContentBackgroundColor ||
        housingContentHeadline ||
        housingContentBody ||
        housingContentOnlyLogoUrl ||
        housingMainQuote ||
        housingTestimonialQuote
      );

  const contentPanelProps: ContentPanelProps = isHealth
    ? {
        contentImageUrl: healthContentImageUrl,
        contentImageAlt: healthContentImageAlt,
        contentBackgroundColor: healthContentBackgroundColor,
        contentHeadline: healthContentHeadline,
        contentBody: healthContentBody,
        contentOnlyLogoUrl: healthContentOnlyLogoUrl,
        contentLogoAlt: healthContentLogoAlt,
        mainQuote: healthMainQuote,
        testimonialQuote: healthTestimonialQuote,
        testimonialName: healthTestimonialName,
        testimonialTitle: healthTestimonialTitle,
        testimonialCompany: healthTestimonialCompany,
        testimonialAvatarUrl: healthTestimonialAvatarUrl,
      }
    : {
        contentImageUrl: housingContentImageUrl,
        contentImageAlt: housingContentImageAlt,
        contentBackgroundColor: housingContentBackgroundColor,
        contentHeadline: housingContentHeadline,
        contentBody: housingContentBody,
        contentOnlyLogoUrl: housingContentOnlyLogoUrl,
        contentLogoAlt: housingContentLogoAlt,
        mainQuote: housingMainQuote,
        testimonialQuote: housingTestimonialQuote,
        testimonialName: housingTestimonialName,
        testimonialTitle: housingTestimonialTitle,
        testimonialCompany: housingTestimonialCompany,
        testimonialAvatarUrl: housingTestimonialAvatarUrl,
      };

  const hasPickerContentPanel = !!(
    pickerContentImageUrl ||
    pickerContentBackgroundColor ||
    pickerContentHeadline ||
    pickerContentBody ||
    pickerContentOnlyLogoUrl ||
    pickerMainQuote ||
    pickerTestimonialQuote
  );

  const pickerContentPanelProps: ContentPanelProps = {
    contentImageUrl: pickerContentImageUrl,
    contentImageAlt: pickerContentImageAlt,
    contentBackgroundColor: pickerContentBackgroundColor,
    contentHeadline: pickerContentHeadline,
    contentBody: pickerContentBody,
    contentOnlyLogoUrl: pickerContentOnlyLogoUrl,
    contentLogoAlt: pickerContentLogoAlt,
    mainQuote: pickerMainQuote,
    testimonialQuote: pickerTestimonialQuote,
    testimonialName: pickerTestimonialName,
    testimonialTitle: pickerTestimonialTitle,
    testimonialCompany: pickerTestimonialCompany,
    testimonialAvatarUrl: pickerTestimonialAvatarUrl,
  };

  return (
    <>
      {/* ── Step 1: Email — inline on page ── */}
      <div
        className={`hsf ${
          leftAlignContent ? "hsf--left-align" : ""
        } ${className}`}
        onKeyDown={onKeyDown}
      >
        {phase === "email" && (
          <div
            className={`hsf__step-1-container${
              leftAlignContent ? " hsf__step-1-container--left-align" : ""
            }`}
          >
            <div className="hsf__fields">
              <div
                className={`emailCapture${
                  errors.email ? " emailCapture--error" : ""
                }`}
              >
                <input
                  id="msfu-email"
                  className="emailCapture__input"
                  type="email"
                  placeholder={emailInputPlaceholder}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <button
                  className="defaultButton emailCapture__btn"
                  type="button"
                  onClick={handleEmailSubmit}
                >
                  {emailCTAText}
                </button>
              </div>
              {errors.email && (
                <span className="fieldError">{errors.email}</span>
              )}
            </div>

            {enableLowbrow && (
              <div className="hsf__lowbrow-container">
                <div className="lowbrow-check-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8.45568 1.25003L10.5469 5.39315L14.5719 5.7919C14.6678 5.79986 14.7593 5.83512 14.8357 5.89348C14.9121 5.95185 14.9702 6.03089 15.0031 6.12125C15.0359 6.2116 15.0422 6.30948 15.0212 6.40331C15.0002 6.49713 14.9527 6.58297 14.8844 6.65065L11.5719 9.93378L12.8001 14.395C12.8252 14.4897 12.8224 14.5895 12.7922 14.6826C12.7619 14.7757 12.7053 14.8581 12.6293 14.9198C12.5533 14.9816 12.4611 15.02 12.3638 15.0306C12.2665 15.0412 12.1682 15.0234 12.0807 14.9794L8.00006 12.9588L3.92506 14.9769C3.83759 15.0209 3.73927 15.0387 3.64194 15.0281C3.54461 15.0175 3.4524 14.9791 3.37641 14.9173C3.30041 14.8556 3.24388 14.7732 3.21359 14.6801C3.1833 14.587 3.18056 14.4872 3.20568 14.3925L4.43381 9.93128L1.11881 6.64815C1.05052 6.58047 1.00305 6.49463 0.982023 6.40081C0.960999 6.30698 0.9673 6.2091 1.00018 6.11875C1.03306 6.02839 1.09114 5.94935 1.16755 5.89098C1.24396 5.83262 1.33549 5.79736 1.43131 5.7894L5.45631 5.39065L7.54443 1.25003C7.58738 1.16615 7.65264 1.09576 7.73303 1.0466C7.81343 0.997446 7.90583 0.971436 8.00006 0.971436C8.09429 0.971436 8.18669 0.997446 8.26708 1.0466C8.34747 1.09576 8.41274 1.16615 8.45568 1.25003Z"
                      fill={darkMode ? "#fafafb" : "#7638FA"}
                    />
                  </svg>
                  <p
                    className={`hsf__lowbrow-text ${
                      darkMode ? "hsf__lowbrow-text--dark" : ""
                    }`}
                  >
                    4.5 Rating on
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <g clipPath="url(#g2u)">
                    <mask
                      id="g2um"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="16"
                      height="16"
                    >
                      <path d="M16 0H0V16H16V0Z" fill="white" />
                    </mask>
                    <g mask="url(#g2um)">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M16 8C16 12.4182 12.4182 16 8 16C3.58176 16 0 12.4182 0 8C0 3.58176 3.58176 0 8 0C12.4182 0 16 3.58176 16 8Z"
                        fill="#FF492C"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.4672 6.12677H10.1C10.1371 5.9125 10.2693 5.79298 10.5378 5.65698L10.7898 5.52921C11.24 5.29852 11.4796 5.03887 11.4796 4.61436C11.4796 4.34649 11.3763 4.13625 11.1698 3.98386C10.9674 3.83135 10.7195 3.75711 10.4345 3.75711C10.2073 3.75711 10.0008 3.81484 9.81079 3.93433C9.62493 4.04978 9.48445 4.19813 9.39777 4.38354L9.79434 4.77922C9.94711 4.47013 10.1702 4.31762 10.4634 4.31762C10.7113 4.31762 10.8642 4.44543 10.8642 4.62255C10.8642 4.771 10.7898 4.89455 10.5047 5.03887L10.3437 5.11714C9.99258 5.29436 9.74887 5.49628 9.60839 5.72706C9.46801 5.95372 9.39777 6.24626 9.39777 6.59666V6.69145H11.4672V6.12677Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M11.2813 7.34573H9.02101L7.89093 9.30356H10.1512L11.2813 11.2615L12.4114 9.30356L11.2813 7.34573Z"
                        fill="white"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.08243 10.6115C6.64147 10.6115 5.46918 9.44001 5.46918 8.00001C5.46918 6.56014 6.64147 5.38865 8.08243 5.38865L8.97705 3.51764C8.68777 3.46026 8.38867 3.42999 8.08243 3.42999C5.55677 3.42999 3.50928 5.4761 3.50928 8.00001C3.50928 10.524 5.55677 12.57 8.08243 12.57C9.08941 12.57 10.0202 12.2446 10.7757 11.6935L9.78493 9.9787C9.32726 10.3725 8.73238 10.6115 8.08243 10.6115Z"
                        fill="white"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="g2u">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span
                  className={`hsf__separator ${
                    darkMode ? "hsf__separator--dark" : ""
                  }`}
                />
                <div className="lowbrow-check-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill={darkMode ? "#fafafb" : "none"}
                  >
                    <g clipPath="url(#soc2u)">
                      <path
                        d="M7.99998 15.4286C12.1027 15.4286 15.4286 12.1027 15.4286 7.99998C15.4286 3.8973 12.1027 0.571411 7.99998 0.571411C3.8973 0.571411 0.571411 3.8973 0.571411 7.99998C0.571411 12.1027 3.8973 15.4286 7.99998 15.4286Z"
                        stroke={darkMode ? "#fafafb" : "#515152"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4.99994 8.16663L6.99994 10.1666L10.9999 6.16663"
                        stroke="#515152"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="soc2u">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <p
                    className={`hsf__lowbrow-text ${
                      darkMode ? "hsf__lowbrow-text--dark" : ""
                    }`}
                  >
                    SOC2 Type II
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Overlay (picker, form steps, complete) ── */}
      <AnimatePresence>
        {phase !== "email" && (
          <motion.div
            className="hsf__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`hsf__split${
                (hasPickerContentPanel && phase === "picker") ||
                (hasContentPanel && phase === "form")
                  ? " hsf__split--with-panel"
                  : ""
              }`}
            >
              {/* Content panel — picker phase */}
              {hasPickerContentPanel && phase === "picker" && (
                <ContentPanel {...pickerContentPanelProps} />
              )}
              {/* Content panel — form steps */}
              {hasContentPanel && phase === "form" && (
                <ContentPanel {...contentPanelProps} />
              )}

              <div className="hsf__form-col" onKeyDown={onKeyDown}>
                {/* ── Picker view ── */}
                {phase === "picker" && (
                  <div className="hsf__overlay-inner">
                    <div
                      className="hsf__progress-track"
                      role="progressbar"
                      aria-valuenow={0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="hsf__progress-fill"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <div className="hsf__nav-back-container">
                      <div className="hsf__nav-back" onClick={handleBack}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M14.25 9H3.75005"
                            stroke="#6A6A6B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 3.75L3.74996 9L9 14.25"
                            stroke="#6A6A6B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "8px",
                        marginTop: "16px",
                      }}
                    >
                      <p className="above-eye-brow">{pickerEyebrow}</p>
                      <h2 className="step-heading">{pickerHeading}</h2>
                    </div>
                    <div className="msf__picker-cards">
                      <button
                        type="button"
                        className={`msf__picker-card${
                          selectedVertical === "housing"
                            ? " msf__picker-card--selected"
                            : ""
                        }`}
                        onClick={() => setSelectedVertical("housing")}
                      >
                        <div className="msf__picker-card-icon">
                          <HousingIcon />
                        </div>
                        <p className="msf__picker-card-title">
                          {housingCardTitle}
                        </p>
                        {housingCardBody && (
                          <p className="msf__picker-card-body">
                            {housingCardBody}
                          </p>
                        )}
                      </button>
                      <button
                        type="button"
                        className={`msf__picker-card${
                          selectedVertical === "healthcare"
                            ? " msf__picker-card--selected"
                            : ""
                        }`}
                        onClick={() => setSelectedVertical("healthcare")}
                      >
                        <div className="msf__picker-card-icon">
                          <HealthcareIcon />
                        </div>
                        <p className="msf__picker-card-title">
                          {healthcareCardTitle}
                        </p>
                        {healthcareCardBody && (
                          <p className="msf__picker-card-body">
                            {healthcareCardBody}
                          </p>
                        )}
                      </button>
                    </div>
                    <div className="hsf__nav">
                      <button
                        className="defaultButton"
                        type="button"
                        onClick={handlePickerContinue}
                        disabled={!selectedVertical}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Form steps view ── */}
                {phase === "form" && (
                  <div className="hsf__overlay-inner">
                    <div
                      className="hsf__progress-track"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <motion.div
                        className="hsf__progress-fill"
                        initial={false}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>

                    <div className="hsf__nav-back-container">
                      <div className="hsf__nav-back" onClick={handleBack}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                        >
                          <path
                            d="M14.25 9H3.75005"
                            stroke="#6A6A6B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M9 3.75L3.74996 9L9 14.25"
                            stroke="#6A6A6B"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <p className="hsf__step-count">
                        {flowStep} / {flowTotal}
                      </p>
                    </div>

                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "8px",
                        marginTop: "16px",
                      }}
                    >
                      <p className="above-eye-brow">
                        {formStep === 2 ? "Getting Started" : "Almost There"}
                      </p>
                      <h2 className="step-heading">
                        {formStep === 2
                          ? "Let's Start With the Basics"
                          : step3Heading}
                      </h2>
                    </div>

                    <div className="hsf__slide-wrap">
                      <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                          key={formStep}
                          className="hsf__slide"
                          custom={dir}
                          variants={slideVariants as unknown as Variants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                        >
                          {/* Step 2 — Basics */}
                          {formStep === 2 && (
                            <div className="hsf__fields">
                              <div className="hsf__row">
                                <div className="hsf__col">
                                  <label
                                    className="field-label field-label-required"
                                    htmlFor="msfu-firstname"
                                  >
                                    First Name
                                  </label>
                                  <input
                                    id="msfu-firstname"
                                    className={`formInput${
                                      errors.firstname
                                        ? " formInput--error"
                                        : ""
                                    }`}
                                    type="text"
                                    placeholder="First name"
                                    value={form.firstname}
                                    onChange={(e) =>
                                      set("firstname", e.target.value)
                                    }
                                    autoFocus
                                  />
                                  {errors.firstname && (
                                    <span className="fieldError">
                                      {errors.firstname}
                                    </span>
                                  )}
                                </div>
                                <div className="hsf__col">
                                  <label
                                    className="field-label field-label-required"
                                    htmlFor="msfu-lastname"
                                  >
                                    Last Name
                                  </label>
                                  <input
                                    id="msfu-lastname"
                                    className={`formInput${
                                      errors.lastname ? " formInput--error" : ""
                                    }`}
                                    type="text"
                                    placeholder="Last name"
                                    value={form.lastname}
                                    onChange={(e) =>
                                      set("lastname", e.target.value)
                                    }
                                  />
                                  {errors.lastname && (
                                    <span className="fieldError">
                                      {errors.lastname}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="hsf__col">
                                <label
                                  className="field-label field-label-required"
                                  htmlFor="msfu-phone"
                                >
                                  Phone Number
                                </label>
                                <input
                                  id="msfu-phone"
                                  className={`formInput${
                                    errors.phone ? " formInput--error" : ""
                                  }`}
                                  type="tel"
                                  inputMode="numeric"
                                  placeholder="(555) 555-5555"
                                  value={form.phone}
                                  onChange={(e) => set("phone", e.target.value)}
                                />
                                {errors.phone && (
                                  <span className="fieldError">
                                    {errors.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Step 3 — Conditional details */}
                          {formStep === 3 && (
                            <div className="hsf__fields">
                              <div className="hsf__col">
                                <label
                                  className="field-label field-label-required"
                                  htmlFor="msfu-company"
                                >
                                  Company Name
                                </label>
                                <input
                                  id="msfu-company"
                                  className={`formInput${
                                    errors.company ? " formInput--error" : ""
                                  }`}
                                  type="text"
                                  placeholder="Company name"
                                  value={form.company}
                                  onChange={(e) =>
                                    set("company", e.target.value)
                                  }
                                  autoFocus
                                />
                                {errors.company && (
                                  <span className="fieldError">
                                    {errors.company}
                                  </span>
                                )}
                              </div>

                              {/* Real Estate fields */}
                              {selectedVertical === "housing" && (
                                <>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label"
                                      htmlFor="msfu-units"
                                    >
                                      Units Managed
                                    </label>
                                    <select
                                      id="msfu-units"
                                      className="formSelect"
                                      value={form.units_managed}
                                      onChange={(e) =>
                                        set("units_managed", e.target.value)
                                      }
                                    >
                                      <option value="">Please select</option>
                                      {UNITS_MANAGED_OPTIONS.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label"
                                      htmlFor="msfu-pms"
                                    >
                                      PMS Compatibility
                                    </label>
                                    <select
                                      id="msfu-pms"
                                      className="formSelect"
                                      value={form.pms_compatability}
                                      onChange={(e) =>
                                        set("pms_compatability", e.target.value)
                                      }
                                    >
                                      <option value="">Please select</option>
                                      {PMS_OPTIONS.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label"
                                      htmlFor="msfu-ai"
                                    >
                                      In which areas of your operations are you
                                      looking to implement AI?
                                    </label>
                                    <textarea
                                      id="msfu-ai"
                                      className="formTextarea"
                                      placeholder="Tell us about your goals..."
                                      rows={4}
                                      value={form.ai_areas}
                                      onChange={(e) =>
                                        set("ai_areas", e.target.value)
                                      }
                                    />
                                  </div>
                                </>
                              )}

                              {/* Healthcare fields */}
                              {selectedVertical === "healthcare" && (
                                <>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label field-label-required"
                                      htmlFor="msfu-callvol"
                                    >
                                      What's Your Monthly Call Volume?
                                    </label>
                                    <input
                                      id="msfu-callvol"
                                      className={`formInput${
                                        errors.monthly_call_volume
                                          ? " formInput--error"
                                          : ""
                                      }`}
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="e.g. 5000"
                                      value={form.monthly_call_volume}
                                      onChange={(e) =>
                                        set(
                                          "monthly_call_volume",
                                          e.target.value.replace(/[^\d]/g, ""),
                                        )
                                      }
                                    />
                                    {errors.monthly_call_volume && (
                                      <span className="fieldError">
                                        {errors.monthly_call_volume}
                                      </span>
                                    )}
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label field-label-required"
                                      htmlFor="msfu-ehr"
                                    >
                                      What EHR Do You Use?
                                    </label>
                                    <select
                                      id="msfu-ehr"
                                      className={`formSelect${
                                        errors.ehr ? " formSelect--error" : ""
                                      }`}
                                      value={form.ehr}
                                      onChange={(e) =>
                                        set("ehr", e.target.value)
                                      }
                                    >
                                      <option value="">Please select</option>
                                      {EHR_OPTIONS.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                    {errors.ehr && (
                                      <span className="fieldError">
                                        {errors.ehr}
                                      </span>
                                    )}
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label field-label-required"
                                      htmlFor="msfu-specialty"
                                    >
                                      What's Your Specialty?
                                    </label>
                                    <select
                                      id="msfu-specialty"
                                      className={`formSelect${
                                        errors.specialty
                                          ? " formSelect--error"
                                          : ""
                                      }`}
                                      value={form.specialty}
                                      onChange={(e) =>
                                        set("specialty", e.target.value)
                                      }
                                    >
                                      <option value="">Please select</option>
                                      {SPECIALTY_OPTIONS.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                    {errors.specialty && (
                                      <span className="fieldError">
                                        {errors.specialty}
                                      </span>
                                    )}
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label field-label-required"
                                      htmlFor="msfu-providers"
                                    >
                                      How Many Providers Do You Have?
                                    </label>
                                    <input
                                      id="msfu-providers"
                                      className={`formInput${
                                        errors.num_providers
                                          ? " formInput--error"
                                          : ""
                                      }`}
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="e.g. 10"
                                      value={form.num_providers}
                                      onChange={(e) =>
                                        set(
                                          "num_providers",
                                          e.target.value.replace(/[^\d]/g, ""),
                                        )
                                      }
                                    />
                                    {errors.num_providers && (
                                      <span className="fieldError">
                                        {errors.num_providers}
                                      </span>
                                    )}
                                  </div>
                                  <div className="hsf__col">
                                    <label
                                      className="field-label"
                                      htmlFor="msfu-hear"
                                    >
                                      How Did You Hear About Us?
                                    </label>
                                    <textarea
                                      id="msfu-hear"
                                      className="formTextarea"
                                      placeholder="How did you hear about us?"
                                      rows={3}
                                      value={form.how_did_you_hear}
                                      onChange={(e) =>
                                        set("how_did_you_hear", e.target.value)
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="hsf__nav">
                      {formStep < 3 ? (
                        <button
                          className="defaultButton"
                          type="button"
                          onClick={() => {
                            pushEvent(eventStepTwo);
                            handleNext();
                          }}
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          className="defaultButton"
                          type="button"
                          onClick={() => {
                            pushEvent(eventStepThree);
                            void submit();
                          }}
                          disabled={submitting}
                        >
                          {submitting ? "Submitting…" : "Submit"}
                        </button>
                      )}
                    </div>

                    {apiError && <p className="hsf__api-error">{apiError}</p>}
                  </div>
                )}

                {/* ── Complete view ── */}
                {phase === "complete" && (
                  <div className="hsf__success">
                    <svg
                      viewBox="0 0 200 200"
                      width="100"
                      height="100"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        stroke="#3d3d3e"
                        strokeWidth="1.5"
                        fill="#fafafb"
                        d="m74.096 91.818 9.01 38.806L190 4 74.09 91.818z"
                      />
                      <path
                        stroke="#3d3d3e"
                        strokeWidth="1.5"
                        fill="#e8e3ff"
                        d="m33.12 76.396 40.976 15.422L190 4 33.04 73.624c-1.227.544-1.172 2.303.08 2.772Z"
                      />
                      <path
                        stroke="#3d3d3e"
                        strokeWidth="1.5"
                        fill="#7638fa"
                        d="m89.186 97.008-6.08 33.616 43.42-44.99z"
                      />
                      <path
                        stroke="#3d3d3e"
                        strokeWidth="1.5"
                        fill="#e8e3ff"
                        d="m89.186 97.008 58.212 22.006a1.494 1.494 0 0 0 1.935-.899L190 4z"
                      />
                    </svg>
                    <p className="hsf__success-headline">
                      Your submission has been received!
                    </p>
                    <p className="hsf__success-thanks">
                      Someone from our team will be in touch shortly.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
