import { useState, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  email: string;
  firstname: string;
  lastname: string;
  company: string;
  phone: string;
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

const UNITS_MANAGED_OPTIONS = ["1-50", "51-100", "101-250", "251-500", "500+"];

const PMS_OPTIONS = [
  "Yardi",
  "RealPage",
  "AppFolio",
  "Buildium",
  "Entrata",
  "ResMan",
  "Other",
];

const INITIAL_FORM: FormData = {
  email: "",
  firstname: "",
  lastname: "",
  company: "",
  phone: "",
  units_managed: "",
  pms_compatability: "",
  in_which_areas_of_your_operations_are_you_looking_to_implement_ai_: "",
};

const TOTAL_STEPS = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getParam(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : "";
}

function validateEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
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

  // ── Validation per step ─────────────────────────────────────────────────────

  const validateStep = useCallback((): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};

    if (step === 1) {
      if (!form.email) errs.email = "Email is required.";
      else if (!validateEmail(form.email)) errs.email = "Enter a valid email.";
    }
    if (step === 2) {
      if (!form.firstname) errs.firstname = "First name is required.";
      if (!form.lastname) errs.lastname = "Last name is required.";
    }
    if (step === 3) {
      if (!form.company) errs.company = "Company name is required.";
      if (!form.phone) errs.phone = "Phone number is required.";
    }
    if (step === 4) {
      if (!form.units_managed) errs.units_managed = "Please select an option.";
      if (!form.pms_compatability)
        errs.pms_compatability = "Please select an option.";
    }
    if (step === 5) {
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
      { name: "company", value: form.company },
      { name: "phone", value: form.phone },
      { name: "units_managed", value: form.units_managed },
      { name: "pms_compatability", value: form.pms_compatability },
      {
        name: "in_which_areas_of_your_operations_are_you_looking_to_implement_ai_",
        value:
          form.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_,
      },
    ];

    // Hidden UTM fields — only append if present
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

  // ── Key handler — advance on Enter ─────────────────────────────────────────

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") step < TOTAL_STEPS ? next() : submit();
    },
    [step, next, submit],
  );

  // ── Progress ────────────────────────────────────────────────────────────────

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  // ─── Render ────────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className={`hsf ${className} hsf--success`}>
        <motion.div
          className="hsf__success"
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

  return (
    <div className={`hsf ${className}`} onKeyDown={onKeyDown}>
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

      {/* Step counter */}
      <p className="hsf__step-count">
        {step} / {TOTAL_STEPS}
      </p>

      {/* Slide area */}
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
            {/* ── Step 1: Email ── */}
            {step === 1 && (
              <div className="hsf__fields">
                <label className="hsf__label" htmlFor="hsf-email">
                  What&apos;s your email address?
                </label>
                <input
                  id="hsf-email"
                  className={`hsf__input ${
                    errors.email ? "hsf__input--error" : ""
                  }`}
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoFocus
                />
                {errors.email && (
                  <span className="hsf__error">{errors.email}</span>
                )}
              </div>
            )}

            {/* ── Step 2: Name ── */}
            {step === 2 && (
              <div className="hsf__fields">
                <label className="hsf__label">What&apos;s your name?</label>
                <div className="hsf__row">
                  <div className="hsf__col">
                    <input
                      className={`hsf__input ${
                        errors.firstname ? "hsf__input--error" : ""
                      }`}
                      type="text"
                      placeholder="First name"
                      value={form.firstname}
                      onChange={(e) => set("firstname", e.target.value)}
                      autoFocus
                    />
                    {errors.firstname && (
                      <span className="hsf__error">{errors.firstname}</span>
                    )}
                  </div>
                  <div className="hsf__col">
                    <input
                      className={`hsf__input ${
                        errors.lastname ? "hsf__input--error" : ""
                      }`}
                      type="text"
                      placeholder="Last name"
                      value={form.lastname}
                      onChange={(e) => set("lastname", e.target.value)}
                    />
                    {errors.lastname && (
                      <span className="hsf__error">{errors.lastname}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Company + Phone ── */}
            {step === 3 && (
              <div className="hsf__fields">
                <label className="hsf__label">
                  Tell us about your company.
                </label>
                <input
                  className={`hsf__input ${
                    errors.company ? "hsf__input--error" : ""
                  }`}
                  type="text"
                  placeholder="Company name"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  autoFocus
                />
                {errors.company && (
                  <span className="hsf__error">{errors.company}</span>
                )}
                <input
                  className={`hsf__input ${
                    errors.phone ? "hsf__input--error" : ""
                  }`}
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {errors.phone && (
                  <span className="hsf__error">{errors.phone}</span>
                )}
              </div>
            )}

            {/* ── Step 4: Units Managed + PMS ── */}
            {step === 4 && (
              <div className="hsf__fields">
                <label className="hsf__label">A couple quick questions.</label>
                <select
                  className={`hsf__select ${
                    errors.units_managed ? "hsf__input--error" : ""
                  }`}
                  value={form.units_managed}
                  onChange={(e) => set("units_managed", e.target.value)}
                >
                  <option value="">Units managed — please select</option>
                  {UNITS_MANAGED_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.units_managed && (
                  <span className="hsf__error">{errors.units_managed}</span>
                )}

                <select
                  className={`hsf__select ${
                    errors.pms_compatability ? "hsf__input--error" : ""
                  }`}
                  value={form.pms_compatability}
                  onChange={(e) => set("pms_compatability", e.target.value)}
                >
                  <option value="">PMS compatibility — please select</option>
                  {PMS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                {errors.pms_compatability && (
                  <span className="hsf__error">{errors.pms_compatability}</span>
                )}
              </div>
            )}

            {/* ── Step 5: AI Areas ── */}
            {step === 5 && (
              <div className="hsf__fields">
                <label className="hsf__label" htmlFor="hsf-ai">
                  In which areas of your operations are you looking to implement
                  AI?
                </label>
                <textarea
                  id="hsf-ai"
                  className={`hsf__textarea ${
                    errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
                      ? "hsf__input--error"
                      : ""
                  }`}
                  placeholder="Tell us a bit about your goals..."
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
                  autoFocus
                />
                {errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_ && (
                  <span className="hsf__error">
                    {
                      errors.in_which_areas_of_your_operations_are_you_looking_to_implement_ai_
                    }
                  </span>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="hsf__nav">
        {step > 1 && (
          <button
            className="hsf__btn hsf__btn--back"
            type="button"
            onClick={prev}
          >
            Back
          </button>
        )}
        {step < TOTAL_STEPS ? (
          <button
            className="hsf__btn hsf__btn--next"
            type="button"
            onClick={next}
          >
            Next
          </button>
        ) : (
          <button
            className="hsf__btn hsf__btn--submit"
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
