import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import "./MultiFormStyling.css";

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
    hutk: string;
  };
}

interface Props {
  portalId?: string;
  formGuid?: string;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTAL_ID = "45321630";
const FORM_GUID = "a68880cf-aa3e-4845-9822-f863608bed1f";

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

// ─── Step meta ────────────────────────────────────────────────────────────────

const STEP_META: Record<number, { eyebrow: string; heading: string }> = {
  2: { eyebrow: "Getting Started", heading: "Let's Start With the Basics" },
  3: { eyebrow: "Almost There", heading: "Tell Us About Your Operations" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
}

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

function validateEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  const domain = val.split("@")[1].toLowerCase();
  return !BLOCKED_DOMAINS.has(domain);
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function MultiStepForm({
  portalId = PORTAL_ID,
  formGuid = FORM_GUID,
  className = "",
}: Props) {
  const [step, setStep] = useState<number>(1);
  const [dir, setDir] = useState<number>(1);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  // ── Field update ────────────────────────────────────────────────────────────

  const set = useCallback(
    <K extends keyof FormData>(key: K, val: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
    },
    [],
  );

  // ── Validation ──────────────────────────────────────────────────────────────

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
      if (!form.units_managed) errs.units_managed = "Please select an option.";
      if (!form.pms_compatability)
        errs.pms_compatability = "Please select an option.";
      if (
        !form.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
      )
        errs.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_ =
          "Please tell us a bit about your operations.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [step, form]);

  // ── Navigation ──────────────────────────────────────────────────────────────

  const next = useCallback(() => {
    if (!validateStep()) return;
    setDir(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, [validateStep]);

  const prev = useCallback(() => {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Submit ──────────────────────────────────────────────────────────────────

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
    ];

    (["utm_source", "utm_medium", "utm_campaign"] as const).forEach((p) => {
      const v = getParam(p);
      if (v) fields.push({ name: p, value: v });
    });

    const payload: HubSpotPayload = {
      fields,
      context: {
        pageUri: window.location.href,
        pageName: document.title,
        hutk: getCookie("hubspotutk"),
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
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [validateStep, form, portalId, formGuid]);

  // ── Key handler ─────────────────────────────────────────────────────────────

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") step < TOTAL_STEPS ? next() : void submit();
    },
    [step, next, submit],
  );

  // ── Progress ────────────────────────────────────────────────────────────────

  const flowStep = step - 1;
  const flowTotal = TOTAL_STEPS - 1;
  const progress = step === 1 ? 0 : Math.round((flowStep / flowTotal) * 100);
  const showProgress = step > 1;
  const meta = STEP_META[step];

  // ─── Success ───────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className={`hsf hsf--success ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="hsf__success-message">
            Thank you! We&apos;ll be in touch shortly.
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`hsf ${className}`} onKeyDown={onKeyDown}>
      {/* Progress bar — flow steps only */}
      {showProgress && (
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
      )}
      {showProgress && (
        <p className="hsf__step-count">
          {flowStep} / {flowTotal}
        </p>
      )}

      {/* Eyebrow + heading — flow steps only */}
      {meta && (
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p className="above-eye-brow">{meta.eyebrow}</p>
          <h2 className="step-heading">{meta.heading}</h2>
        </div>
      )}

      {/* ── Step 1: Email — no animation, just renders inline ── */}
      {step === 1 && (
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
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoFocus
            />
            <button
              className="defaultButton emailCapture__btn"
              type="button"
              onClick={next}
            >
              Get A Demo
            </button>
          </div>
          {errors.email && <span className="fieldError">{errors.email}</span>}
        </div>
      )}

      {/* ── Steps 2 & 3: Framer Motion slides ── */}
      {step > 1 && (
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
              {/* ── Step 2: Name + Phone ── */}
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
                        onChange={(e) => set("firstname", e.target.value)}
                        autoFocus
                      />
                      {errors.firstname && (
                        <span className="fieldError">{errors.firstname}</span>
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
                        onChange={(e) => set("lastname", e.target.value)}
                      />
                      {errors.lastname && (
                        <span className="fieldError">{errors.lastname}</span>
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
                      placeholder="Phone number"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                    {errors.phone && (
                      <span className="fieldError">{errors.phone}</span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 3: Company + Units + PMS + AI ── */}
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
                      <span className="fieldError">{errors.company}</span>
                    )}
                  </div>

                  <div className="hsf__col">
                    <label
                      className="field-label field-label-required"
                      htmlFor="hsf-units"
                    >
                      Units Managed
                    </label>
                    <select
                      id="hsf-units"
                      className={`formSelect${
                        errors.units_managed ? " formSelect--error" : ""
                      }`}
                      value={form.units_managed}
                      onChange={(e) => set("units_managed", e.target.value)}
                    >
                      <option value="">Please select</option>
                      {UNITS_MANAGED_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                    {errors.units_managed && (
                      <span className="fieldError">{errors.units_managed}</span>
                    )}
                  </div>

                  <div className="hsf__col">
                    <label
                      className="field-label field-label-required"
                      htmlFor="hsf-pms"
                    >
                      PMS Compatibility
                    </label>
                    <select
                      id="hsf-pms"
                      className={`formSelect${
                        errors.pms_compatability ? " formSelect--error" : ""
                      }`}
                      value={form.pms_compatability}
                      onChange={(e) => set("pms_compatability", e.target.value)}
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
                    <label
                      className="field-label field-label-required"
                      htmlFor="hsf-ai"
                    >
                      In which areas of your operations are you looking to
                      implement AI?
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
      )}

      {/* Navigation */}
      <div className="hsf__nav">
        {step > 1 && (
          <button
            className="defaultButton hsf__btn--back"
            type="button"
            onClick={prev}
          >
            Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          step === 1 ? null : (
            <button className="defaultButton" type="button" onClick={next}>
              Continue
            </button>
          )
        ) : (
          <button
            className="defaultButton"
            type="button"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        )}
      </div>

      {apiError && <p className="hsf__api-error">{apiError}</p>}
    </div>
  );
}
