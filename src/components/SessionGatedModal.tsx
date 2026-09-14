import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { isBlockedEmail, isValidWorkEmail, WORK_EMAIL_ERROR } from "../utils/blockedEmails";
import { storeUtms, getUtmFields } from "../utils/utm";
import { SESSION_GATED_MODAL_CSS } from "./SessionGatedModal.styles";

export const GATED_SESSION_COOKIE = "elise_gated_session";
export const GATED_SESSION_EVENT = "elise-gated-session-submitted";

const PORTAL_ID = "45321630";
const FORM_ID = "94d47950-5245-4781-812a-1c0394db774c";
const STYLE_ID = "scg-gated-modal-styles";

type FormFields = {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  jobtitle: string;
  company: string;
};

type FieldName = keyof FormFields;

const EMPTY_FORM: FormFields = {
  firstname: "",
  lastname: "",
  phone: "",
  email: "",
  jobtitle: "",
  company: "",
};

export interface SessionGatedModalProps {
  title?: string;
  /** Already-submitted visitors see the confirmation copy instead of the form. */
  alreadySubmitted?: boolean;
  onClose: () => void;
  onSubmitted: () => void;
  portalId?: string;
  formId?: string;
  privacyUrl?: string;
}

export function hasGatedSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split("; ")
    .some((part) => part.startsWith(`${GATED_SESSION_COOKIE}=`));
}

export function setGatedSessionCookie(): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${GATED_SESSION_COOKIE}=1; path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(GATED_SESSION_EVENT));
}

function getHutk(): string {
  const match = document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function pushEvent(event: string) {
  const w = window as Window & { dataLayer?: Array<Record<string, string>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event });
}

function ensureStyles() {
  if (typeof document === "undefined") return;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = SESSION_GATED_MODAL_CSS;
}

function ContactLine() {
  return (
    <p className="sgm-lede">
      Questions? Reach us at{" "}
      <a href="mailto:marketing@eliseai.com">marketing@eliseai.com</a>
    </p>
  );
}

function ThanksCopy({ titleId }: { titleId: string }) {
  return (
    <div className="sgm-header">
      <h2 id={titleId} className="sgm-title">
        Thank you for your submission.
      </h2>
      <div className="sgm-copy">
        <p className="sgm-lede">You&rsquo;re all set.</p>
        <p className="sgm-lede">
          Check your inbox — the recording will arrive within the next 30 minutes.
          If you don&rsquo;t see it, check your spam folder.
        </p>
        <ContactLine />
      </div>
    </div>
  );
}

function AlreadyCopy({ titleId }: { titleId: string }) {
  return (
    <div className="sgm-header">
      <h2 id={titleId} className="sgm-title">
        We&rsquo;ve already received your request to access all exclusive
        recordings.
      </h2>
      <div className="sgm-copy">
        <p className="sgm-lede">
          Check your inbox for the recording link. If you don&rsquo;t see it, check
          your spam folder.
        </p>
        <ContactLine />
      </div>
    </div>
  );
}

export default function SessionGatedModal({
  title = "Thank you for your interest.",
  alreadySubmitted = false,
  onClose,
  onSubmitted,
  portalId = PORTAL_ID,
  formId = FORM_ID,
  privacyUrl = "/policy",
}: SessionGatedModalProps) {
  const uid = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormFields>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    ensureStyles();
    storeUtms();
    pushEvent(
      alreadySubmitted
        ? "gated_session_already_open"
        : "gated_session_form_open"
    );
  }, [alreadySubmitted]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    if (!submitted && !alreadySubmitted) firstInputRef.current?.focus();
  }, [submitted, alreadySubmitted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setField = (name: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Partial<Record<FieldName, string>> = {};
    if (!form.firstname.trim()) next.firstname = "First name is required.";
    if (!form.lastname.trim()) next.lastname = "Last name is required.";
    if (!form.phone.trim()) next.phone = "Phone number is required.";
    if (!form.email.trim()) next.email = "Email is required.";
    else if (!isValidWorkEmail(form.email.trim()))
      next.email = isBlockedEmail(form.email.trim())
        ? WORK_EMAIL_ERROR
        : "Please enter a valid email.";
    if (!form.jobtitle.trim()) next.jobtitle = "Job title is required.";
    if (!form.company.trim()) next.company = "Company name is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    setApiError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const hutk = getHutk();
      const res = await fetch(
        `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: [
              { name: "firstname", value: form.firstname.trim() },
              { name: "lastname", value: form.lastname.trim() },
              { name: "phone", value: form.phone.trim() },
              { name: "email", value: form.email.trim() },
              { name: "jobtitle", value: form.jobtitle.trim() },
              { name: "company", value: form.company.trim() },
              ...getUtmFields(),
            ],
            context: {
              pageUri: window.location.href,
              pageName: document.title,
              ...(hutk && { hutk }),
            },
          }),
        }
      );
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("[SessionGatedModal] HubSpot submit failed", res.status, detail);
        throw new Error(String(res.status));
      }
      setGatedSessionCookie();
      pushEvent("gated_session_form_submit");
      onSubmitted();
      setSubmitted(true);
    } catch {
      setApiError("We couldn't submit the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ids: Record<FieldName, string> = {
    firstname: `${uid}-firstname`,
    lastname: `${uid}-lastname`,
    phone: `${uid}-phone`,
    email: `${uid}-email`,
    jobtitle: `${uid}-jobtitle`,
    company: `${uid}-company`,
  };

  const dialog = (
    <div
      ref={overlayRef}
      className="sgm-overlay"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${uid}-title`}
      data-testid="session-gated-modal"
    >
      <div className="sgm-modal">
        <button
          type="button"
          className="sgm-close"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <title>Close</title>
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {alreadySubmitted || submitted ? (
          <div className="sgm-thanks">
            {alreadySubmitted ? (
              <AlreadyCopy titleId={`${uid}-title`} />
            ) : (
              <ThanksCopy titleId={`${uid}-title`} />
            )}
            <button
              type="button"
              className="sgm-submit sgm-thanks-btn"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            noValidate
          >
            <div className="sgm-header">
              <h2 id={`${uid}-title`} className="sgm-title">
                {title}
              </h2>
              <p className="sgm-lede">
                Enter your details below and we&rsquo;ll send the exclusive
                recording straight to your inbox.
              </p>
              <p className="sgm-lede">
                If approved, you&rsquo;ll receive the link within 30 minutes.
              </p>
            </div>

            <div className="sgm-fields">
              <div className="sgm-row">
                <Field
                  id={ids.firstname}
                  label="First name"
                  error={errors.firstname}
                >
                  <input
                    ref={firstInputRef}
                    id={ids.firstname}
                    className={`sgm-input${errors.firstname ? " sgm-input--error" : ""}`}
                    type="text"
                    autoComplete="given-name"
                    value={form.firstname}
                    onChange={(e) => setField("firstname", e.target.value)}
                  />
                </Field>
                <Field
                  id={ids.lastname}
                  label="Last name"
                  error={errors.lastname}
                >
                  <input
                    id={ids.lastname}
                    className={`sgm-input${errors.lastname ? " sgm-input--error" : ""}`}
                    type="text"
                    autoComplete="family-name"
                    value={form.lastname}
                    onChange={(e) => setField("lastname", e.target.value)}
                  />
                </Field>
              </div>

              <div className="sgm-row">
                <Field
                  id={ids.phone}
                  label="Phone number"
                  error={errors.phone}
                >
                  <input
                    id={ids.phone}
                    className={`sgm-input${errors.phone ? " sgm-input--error" : ""}`}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setField(
                        "phone",
                        e.target.value.replace(/[^\d\s\-().+]/g, "")
                      )
                    }
                  />
                </Field>
                <Field id={ids.email} label="Email" error={errors.email}>
                  <input
                    id={ids.email}
                    className={`sgm-input${errors.email ? " sgm-input--error" : ""}`}
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                  />
                </Field>
              </div>

              <div className="sgm-row">
                <Field
                  id={ids.jobtitle}
                  label="Job title"
                  error={errors.jobtitle}
                >
                  <input
                    id={ids.jobtitle}
                    className={`sgm-input${errors.jobtitle ? " sgm-input--error" : ""}`}
                    type="text"
                    autoComplete="organization-title"
                    value={form.jobtitle}
                    onChange={(e) => setField("jobtitle", e.target.value)}
                  />
                </Field>
                <Field
                  id={ids.company}
                  label="Company name"
                  error={errors.company}
                >
                  <input
                    id={ids.company}
                    className={`sgm-input${errors.company ? " sgm-input--error" : ""}`}
                    type="text"
                    autoComplete="organization"
                    value={form.company}
                    onChange={(e) => setField("company", e.target.value)}
                  />
                </Field>
              </div>
            </div>

            {apiError && <p className="sgm-api-error">{apiError}</p>}

            <div className="sgm-submit-wrap">
              <button
                type="submit"
                className="sgm-submit"
                disabled={submitting}
              >
                {submitting ? <span className="sgm-spinner" /> : "Submit"}
              </button>
              <p className="sgm-privacy">
                By submitting you agree to our{" "}
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="sgm-col">
      <label className="sgm-label sgm-label--required" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <p className="sgm-error">{error}</p>}
    </div>
  );
}
