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

function pushEvent(event: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  company: string;
  units_managed: string;
  pms_compatability: string;
  in_which_areas_of_your_operations_are_you_looking_to_implement_ai_: string;
}

interface HubSpotField {
  name: string;
  value: string;
}

interface HubSpotPayload {
  fields: HubSpotField[];
  context: {
    pageUri: string;
    pageName: string;
    hutk?: string;
  };
}

interface Props {
  portalId?: string;
  formGuid?: string;
  className?: string;
  enableNavTrigger?: boolean;
  onEmailSubmit?: () => void;
  initialEmail?: string;
  initialStep?: number;
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
  onBack?: () => void;
  enableLowbrow?: boolean;
  leftAlignContent?: boolean;
  darkMode?: boolean;

  // ── Content panel props ───────────────────────────────────────────────────
  contentHeadline?: string;
  contentBody?: string;
  contentImageUrl?: string;
  contentImageAlt?: string;
  contentBackgroundColor?: string;
  contentOnlyLogoUrl?: string;
  multipleLogos?: boolean;
  contentOneLogoUrl?: string;
  contentTwoLogoUrl?: string;
  contentThreeLogoUrl?: string;
  contentLogoAlt?: string;
  mainQuote?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialTitle?: string;
  testimonialCompany?: string;
  testimonialAvatarUrl?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTAL_ID = "45321630";
const FORM_GUID = "0b77026b-30dc-4521-afc4-009261739448";
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

const INITIAL_FORM: FormData = {
  email: "",
  firstname: "",
  lastname: "",
  phone: "",
  company: "",
  units_managed: "",
  pms_compatability: "",
  in_which_areas_of_your_operations_are_you_looking_to_implement_ai_: "",
};

const TOTAL_STEPS = 3;

const STEP_META: Record<number, { eyebrow: string; heading: string }> = {
  2: { eyebrow: "Getting Started", heading: "Let's Start With the Basics" },
  3: { eyebrow: "Almost There", heading: "Tell Us About Your Operations" },
};

// ─── Blocked email domains ────────────────────────────────────────────────────

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

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
}

function validateEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  const domain = val.split("@")[1].toLowerCase();
  return !BLOCKED_DOMAINS.has(domain);
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

// ─── Content Panel ────────────────────────────────────────────────────────────

interface ContentPanelProps {
  contentHeadline?: string;
  contentBody?: string;
  contentImageUrl?: string;
  contentImageAlt?: string;
  contentBackgroundColor?: string;
  contentOnlyLogoUrl?: string;
  multipleLogos?: boolean;
  contentOneLogoUrl?: string;
  contentTwoLogoUrl?: string;
  contentThreeLogoUrl?: string;
  contentLogoAlt?: string;
  mainQuote?: string;
  testimonialQuote?: string;
  testimonialName?: string;
  testimonialTitle?: string;
  testimonialCompany?: string;
  testimonialAvatarUrl?: string;
}

function ContentPanel({
  contentHeadline,
  contentBody,
  contentImageUrl,
  contentImageAlt,
  contentBackgroundColor,
  contentOnlyLogoUrl,
  multipleLogos,
  contentOneLogoUrl,
  contentTwoLogoUrl,
  contentThreeLogoUrl,
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
        {/* Headline + body */}
        {(contentHeadline || contentBody) && (
          <div className="msf__content-headline-body">
            {contentHeadline && (
              <h2 className="msf__content-headline">{contentHeadline}</h2>
            )}
            {contentBody && <p className="msf__content-body">{contentBody}</p>}
          </div>
        )}

        {/* Single logo */}
        {contentOnlyLogoUrl && !multipleLogos && (
          <img
            src={contentOnlyLogoUrl}
            alt={contentLogoAlt}
            className="msf__content-logo"
          />
        )}

        {/* Multiple logos */}
        {multipleLogos && (
          <div className="msf__content-logos">
            {contentOneLogoUrl && (
              <div className="msf__content-logo-wrap">
                <img
                  src={contentOneLogoUrl}
                  alt={contentLogoAlt}
                  className="msf__content-logo-img"
                />
              </div>
            )}
            {contentTwoLogoUrl && (
              <div className="msf__content-logo-wrap">
                <img
                  src={contentTwoLogoUrl}
                  alt={contentLogoAlt}
                  className="msf__content-logo-img"
                />
              </div>
            )}
            {contentThreeLogoUrl && (
              <div className="msf__content-logo-wrap">
                <img
                  src={contentThreeLogoUrl}
                  alt={contentLogoAlt}
                  className="msf__content-logo-img"
                />
              </div>
            )}
          </div>
        )}

        {/* Main quote */}
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

        {/* Testimonial quote */}
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function MultiStepForm({
  portalId = PORTAL_ID,
  formGuid = FORM_GUID,
  className = "",
  enableNavTrigger = false,
  onEmailSubmit,
  initialEmail,
  initialStep,
  eventEmailSubmit = "multi_form_email_submit",
  eventStepTwo = "multi_form_step_two",
  eventStepThree = "multi_form_step_three",
  eventStepBack = "multi_form_step_back",
  onStepChange,
  enableWebflowEvent = false,
  emailInputPlaceholder,
  emailCTAText,
  promoOffering = "",
  onComplete,
  onBack,
  enableLowbrow = true,
  leftAlignContent = false,
  darkMode = false,
  // content panel
  contentHeadline,
  contentBody,
  contentImageUrl,
  contentImageAlt,
  contentBackgroundColor,
  contentOnlyLogoUrl,
  multipleLogos,
  contentOneLogoUrl,
  contentTwoLogoUrl,
  contentThreeLogoUrl,
  contentLogoAlt,
  mainQuote,
  testimonialQuote,
  testimonialName,
  testimonialTitle,
  testimonialCompany,
  testimonialAvatarUrl,
}: Props) {
  const [step, setStep] = useState<number>(initialStep || 1);
  const [dir, setDir] = useState<number>(1);
  const [form, setForm] = useState<FormData>({
    ...INITIAL_FORM,
    email: initialEmail || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  useEffect(() => {
    loadDefaultSDK().catch((err) => console.warn("[Default SDK]", err));
  }, []);

  useEffect(() => {
    if (!enableNavTrigger) return;
    const navBtn = document.getElementById("requestModalOpenBtn");
    if (!navBtn) return;
    const handler = (e: Event) => {
      e.preventDefault();
      setErrors((prev) => ({
        ...prev,
        email: form.email
          ? validateEmail(form.email)
            ? ""
            : "Please use your work email address."
          : "Email is required.",
      }));
      if (form.email && validateEmail(form.email)) {
        setDir(1);
        setStep(2);
      }
    };
    navBtn.addEventListener("click", handler);
    return () => navBtn.removeEventListener("click", handler);
  }, [form.email, enableNavTrigger]);

  useEffect(() => {
    if (step > 1) {
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
  }, [step]);

  const set = useCallback(
    <K extends keyof FormData>(key: K, val: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    },
    [],
  );

  const validateStep = useCallback((): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (step === 1) {
      if (!form.email) errs.email = "Email is required.";
      else if (!validateEmail(form.email))
        errs.email = "Please use your work email address.";
    }
    if (step === 2) {
      if (!form.firstname) errs.firstname = "First name is required.";
      if (!form.lastname) errs.lastname = "Last name is required.";
      if (!form.phone) errs.phone = "Phone number is required.";
    }
    if (step === 3) {
      if (!form.company) errs.company = "Company name is required.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, form]);

  const next = useCallback(() => {
    if (!validateStep()) return;
    setDir(1);
    setStep((s) => {
      const n = Math.min(s + 1, TOTAL_STEPS);
      onStepChange?.(n);
      return n;
    });
  }, [validateStep, onStepChange]);

  const prev = useCallback(() => {
    setDir(-1);
    setStep((s) => {
      const p = Math.max(s - 1, 1);
      onStepChange?.(p);
      return p;
    });
  }, [onStepChange]);

  const submit = useCallback(async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setApiError("");

    const fields: HubSpotField[] = [
      { name: "email", value: form.email },
      { name: "firstname", value: form.firstname },
      { name: "lastname", value: form.lastname },
      { name: "phone", value: form.phone },
      { name: "company", value: form.company },
      { name: "units_managed", value: form.units_managed },
      { name: "pms_compatability", value: form.pms_compatability },
      {
        name: "in_which_areas_of_your_operations_are_you_looking_to_implement_ai_",
        value:
          form.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_,
      },
      ...(promoOffering
        ? [{ name: "promo_offering", value: promoOffering }]
        : []),
    ];

    (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((p) => {
      const v = getParam(p);
      if (v) fields.push({ name: p, value: v });
    });

    const hutk = getCookie("hubspotutk");
    const payload: HubSpotPayload = {
      fields,
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
      if (!res.ok) throw new Error(`HubSpot responded with ${res.status}`);

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
            ai_areas:
              form.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_,
          },
          questions: [
            { id: "email", name: "Email", type: "email" },
            {
              id: "firstname",
              name: "First Name",
              type: "input",
              lead_attribute: "first_name",
            },
            {
              id: "lastname",
              name: "Last Name",
              type: "input",
              lead_attribute: "last_name",
            },
            {
              id: "phone",
              name: "Phone Number",
              type: "tel",
              lead_attribute: "phone",
            },
            {
              id: "company",
              name: "Company Name",
              type: "input",
              lead_attribute: "company",
            },
            {
              id: "units_managed",
              name: "Units Managed",
              type: "select",
              options: UNITS_MANAGED_OPTIONS,
            },
            {
              id: "pms_compatability",
              name: "PMS Compatibility",
              type: "select",
              options: PMS_OPTIONS,
            },
            {
              id: "ai_areas",
              name: "AI Implementation Areas",
              type: "textarea",
            },
          ],
        },
        {
          onSuccess: (d) => console.log("[Default] success", d),
          onError: (e) => console.error("[Default] error", e),
          onSchedulerDisplayed: (d) =>
            console.log("[Default] scheduler displayed", d),
          onSchedulerClosed: (d) =>
            console.log("[Default] scheduler closed", d),
          onMeetingBooked: (d) =>
            console.log("[Default] meeting booked", d.payload),
        },
      );

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [validateStep, form, portalId, formGuid]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") step < TOTAL_STEPS ? next() : void submit();
    },
    [step, next, submit],
  );

  const flowStep = step - 1;
  const flowTotal = TOTAL_STEPS - 1;
  const progress = step === 1 ? 0 : Math.round((flowStep / flowTotal) * 100);
  const meta = STEP_META[step];

  useEffect(() => {
    if (submitted) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      onComplete?.();
      setStep(1);
      setForm(INITIAL_FORM);
      setErrors({});
      setSubmitted(false);
    }
  }, [submitted]);

  const contentPanelProps: ContentPanelProps = {
    contentHeadline,
    contentBody,
    contentImageUrl,
    contentImageAlt,
    contentBackgroundColor,
    contentOnlyLogoUrl,
    multipleLogos,
    contentOneLogoUrl,
    contentTwoLogoUrl,
    contentThreeLogoUrl,
    contentLogoAlt,
    mainQuote,
    testimonialQuote,
    testimonialName,
    testimonialTitle,
    testimonialCompany,
    testimonialAvatarUrl,
  };

  const hasContentPanel = !!(
    contentImageUrl ||
    contentBackgroundColor ||
    contentHeadline ||
    contentBody ||
    contentOnlyLogoUrl ||
    multipleLogos ||
    mainQuote ||
    testimonialQuote
  );

  return (
    <>
      {/* ── Step 1: Email — inline on page ── */}
      <div
        className={`hsf ${
          leftAlignContent ? "hsf--left-align" : ""
        } ${className}`}
        onKeyDown={onKeyDown}
      >
        {step === 1 && (
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
                  id="hsf-email"
                  className="emailCapture__input"
                  type="email"
                  placeholder={emailInputPlaceholder}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
                <button
                  className="defaultButton emailCapture__btn"
                  type="button"
                  onClick={() => {
                    pushEvent(eventEmailSubmit);
                    if ((window as any).wf) {
                      (window as any).wf.ready(() => (window as any).wf.sendEvent("email_capture_optimize"));
                    }
                    if (form.email && validateEmail(form.email))
                      void createContact(form.email);
                    next();
                  }}
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
                  <g clipPath="url(#g2_clip)">
                    <mask
                      id="g2_mask"
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="16"
                      height="16"
                    >
                      <path d="M16 0H0V16H16V0Z" fill="white" />
                    </mask>
                    <g mask="url(#g2_mask)">
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
                    <clipPath id="g2_clip">
                      <rect width="16" height="16" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span
                  className={`hsf__separator ${
                    darkMode ? "hsf__separator--dark" : ""
                  }`}
                ></span>
                <div className="lowbrow-check-wrapper">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill={darkMode ? "#fafafb" : "none"}
                  >
                    <g clipPath="url(#soc2_clip)">
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
                      <clipPath id="soc2_clip">
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

      {/* ── Steps 2 & 3: Split layout overlay ── */}
      <AnimatePresence>
        {step > 1 && (
          <motion.div
            className="hsf__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`hsf__split${
                hasContentPanel ? " hsf__split--with-panel" : ""
              }`}
            >
              {/* Left — Content panel */}
              {hasContentPanel && <ContentPanel {...contentPanelProps} />}

              {/* Right — Form */}
              <div className="hsf__form-col" onKeyDown={onKeyDown}>
                <div className="hsf__overlay-inner">
                  {/* Progress bar */}
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

                  {/* Back + step count */}
                  <div className="hsf__nav-back-container">
                    <div
                      className="hsf__nav-back"
                      onClick={() => {
                        pushEvent(eventStepBack);
                        if (step === 2 && onBack) onBack();
                        else prev();
                      }}
                    >
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

                  {/* Eyebrow + heading */}
                  {meta && (
                    <div
                      style={{
                        textAlign: "center",
                        marginBottom: "8px",
                        marginTop: "16px",
                      }}
                    >
                      <p className="above-eye-brow">{meta.eyebrow}</p>
                      <h2 className="step-heading">{meta.heading}</h2>
                    </div>
                  )}

                  {/* Slides */}
                  <div className="hsf__slide-wrap">
                    <AnimatePresence mode="wait" custom={dir}>
                      <motion.div
                        key={step}
                        className="hsf__slide"
                        custom={dir}
                        variants={slideVariants as unknown as Variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                      >
                        {/* Step 2 */}
                        {step === 2 && (
                          <div className="hsf__fields">
                            <div className="hsf__row">
                              <div className="hsf__col">
                                <label
                                  className="field-label field-label-required"
                                  htmlFor="hsf-firstname"
                                >
                                  First Name
                                </label>
                                <input
                                  id="hsf-firstname"
                                  className={`formInput${
                                    errors.firstname ? " formInput--error" : ""
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
                                  htmlFor="hsf-lastname"
                                >
                                  Last Name
                                </label>
                                <input
                                  id="hsf-lastname"
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
                                htmlFor="hsf-phone"
                              >
                                Phone Number
                              </label>
                              <input
                                id="hsf-phone"
                                className={`formInput${
                                  errors.phone ? " formInput--error" : ""
                                }`}
                                type="tel"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="Phone number"
                                value={form.phone}
                                onChange={(e) =>
                                  set(
                                    "phone",
                                    e.target.value.replace(/[^\d-]/g, ""),
                                  )
                                }
                              />
                              {errors.phone && (
                                <span className="fieldError">
                                  {errors.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Step 3 */}
                        {step === 3 && (
                          <div className="hsf__fields">
                            <div className="hsf__col">
                              <label
                                className="field-label field-label-required"
                                htmlFor="hsf-company"
                              >
                                Company Name
                              </label>
                              <input
                                id="hsf-company"
                                className={`formInput${
                                  errors.company ? " formInput--error" : ""
                                }`}
                                type="text"
                                placeholder="Company name"
                                value={form.company}
                                onChange={(e) => set("company", e.target.value)}
                                autoFocus
                              />
                              {errors.company && (
                                <span className="fieldError">
                                  {errors.company}
                                </span>
                              )}
                            </div>
                            <div className="hsf__col">
                              <label
                                className="field-label"
                                htmlFor="hsf-units"
                              >
                                Units Managed
                              </label>
                              <select
                                id="hsf-units"
                                className={`formSelect${
                                  errors.units_managed
                                    ? " formSelect--error"
                                    : ""
                                }`}
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
                              {errors.units_managed && (
                                <span className="fieldError">
                                  {errors.units_managed}
                                </span>
                              )}
                            </div>
                            <div className="hsf__col">
                              <label className="field-label" htmlFor="hsf-pms">
                                PMS Compatibility
                              </label>
                              <select
                                id="hsf-pms"
                                className={`formSelect${
                                  errors.pms_compatability
                                    ? " formSelect--error"
                                    : ""
                                }`}
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
                              {errors.pms_compatability && (
                                <span className="fieldError">
                                  {errors.pms_compatability}
                                </span>
                              )}
                            </div>
                            <div className="hsf__col">
                              <label className="field-label" htmlFor="hsf-ai">
                                In which areas of your operations are you
                                looking to implement AI?
                              </label>
                              <textarea
                                id="hsf-ai"
                                className={`formTextarea${
                                  errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
                                    ? " formTextarea--error"
                                    : ""
                                }`}
                                placeholder="Tell us about your goals..."
                                rows={4}
                                value={
                                  form.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
                                }
                                onChange={(e) =>
                                  set(
                                    "in_which_areas_of_your_operations_are_you_looking_to_implement_ai_",
                                    e.target.value,
                                  )
                                }
                              />
                              {errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_ && (
                                <span className="fieldError">
                                  {
                                    errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation */}
                  <div className="hsf__nav">
                    {step < TOTAL_STEPS ? (
                      <button
                        className="defaultButton"
                        type="button"
                        onClick={() => {
                          pushEvent(eventStepTwo);
                          onEmailSubmit?.();
                          if (validateStep())
                            void updateContact(form.email, {
                              firstname: form.firstname,
                              lastname: form.lastname,
                              phone: form.phone,
                            });
                          next();
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
                          if (enableWebflowEvent && (window as any).wf) {
                            (window as any).wf.ready(() =>
                              (window as any).wf.sendEvent(
                                "form_submitted",
                              ),
                            );
                          }
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
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
