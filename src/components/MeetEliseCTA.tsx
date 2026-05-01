import { useState, useEffect, useRef } from "react";
import "./MeetEliseCTA.css";
import "./MultiFormStyling.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  portalId?: string;
  formGuid?: string;
  ctaLabel?: string;
  ctaVariant?: "primary" | "outline";
  eventModalOpen?: string;
  eventFormSubmit?: string;
  phoneDisplay?: string;
  qrCodeSrc?: string;
}

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_QUESTIONS = [
  "Do you have any 1 bedroom apartments available for move in next month?",
  "What utilities are included in the rent?",
  "Are pets allowed? If so, are there any pet fees?",
  "Is there parking or public transportation close by?",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "German",
  "Polish",
  "Italian",
  "French",
  "Portuguese",
];

const EMPTY_FORM: FormData = {
  firstname: "",
  lastname: "",
  email: "",
  phone: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getUtm(key: string): string {
  return new URLSearchParams(window.location.search).get(key) ?? "";
}

function getHutk(): string {
  const m = document.cookie.match(/hubspotutk=([^;]+)/);
  return m ? m[1] : "";
}

function pushEvent(name: string) {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: name });
}

async function submitToHubSpot(
  portalId: string,
  formGuid: string,
  data: FormData,
): Promise<boolean> {
  const hutk = getHutk();
  try {
    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields: [
            { name: "firstname", value: data.firstname },
            { name: "lastname", value: data.lastname },
            { name: "email", value: data.email },
            { name: "phone", value: data.phone },
            { name: "utm_source", value: getUtm("utm_source") },
            { name: "utm_medium", value: getUtm("utm_medium") },
            { name: "utm_campaign", value: getUtm("utm_campaign") },
          ],
          context: {
            pageUri: window.location.href,
            pageName: document.title,
            ...(hutk ? { hutk } : {}),
          },
        }),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PhoneIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.6 10.8C7.8 13.2 9.8 15.2 12.2 16.4L14 14.6C14.3 14.3 14.7 14.2 15 14.4C16.1 14.8 17.3 15 18.5 15C19 15 19.5 15.5 19.5 16V18.5C19.5 19 19 19.5 18.5 19.5C10 19.5 4.5 14 4.5 5.5C4.5 5 5 4.5 5.5 4.5H8C8.5 4.5 9 5 9 5.5C9 6.7 9.2 7.9 9.6 9C9.7 9.3 9.6 9.7 9.4 10L6.6 10.8Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function WaveIcon() {
  return (
    <svg
      width="36"
      height="14"
      viewBox="0 0 36 14"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {[0, 5, 10, 15, 20, 25, 30].map((x, i) => (
        <rect
          key={i}
          x={x}
          y={i % 2 === 0 ? 3 : 1}
          width="3"
          height={i % 2 === 0 ? 8 : 12}
          rx="1.5"
          fill="#7638fa"
          opacity={0.3 + i * 0.1}
        />
      ))}
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MeetEliseCTA({
  portalId = "45321630",
  formGuid = "5dcb9ea1-2310-4d8c-a3e8-4e20efed8fff",
  ctaLabel = "Try Elise VoiceAI",
  ctaVariant = "primary",
  eventModalOpen = "meetelise_cta_clicked",
  eventFormSubmit = "meetelise_lead_submitted",
  phoneDisplay = "(888) 315-2945",
  qrCodeSrc = "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/69e923490d2027c0e66d0c17_meetelise-qr-code.png",
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [copied, setCopied] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Auto-focus first input
  useEffect(() => {
    if (open && !submitted)
      setTimeout(() => firstInputRef.current?.focus(), 50);
  }, [open, submitted]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) closeModal();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function openModal() {
    pushEvent(eventModalOpen);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setTimeout(() => {
      setForm(EMPTY_FORM);
      setErrors({});
      setApiError("");
      setSubmitted(false);
      setCopied(false);
    }, 250);
  }

  function setField(key: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<FormData> = {};
    if (!form.firstname.trim()) errs.firstname = "First name is required.";
    if (!form.lastname.trim()) errs.lastname = "Last name is required.";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Please enter a valid work email.";
    if (!form.phone.trim()) errs.phone = "Phone number is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setApiError("");
    setLoading(true);
    const ok = await submitToHubSpot(portalId, formGuid, form);
    setLoading(false);
    if (ok) {
      pushEvent(eventFormSubmit);
      setSubmitted(true);
    } else {
      setApiError("Something went wrong. Please try again.");
    }
  }

  function copyPhone() {
    navigator.clipboard.writeText(phoneDisplay).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSubmit();
  };

  // Raw digits for tel: link
  const phoneDigits = phoneDisplay.replace(/\D/g, "");

  return (
    <>
      {/* ── CTA button ──────────────────────────────────────────────────── */}
      <button
        type="button"
        className={
          ctaVariant === "outline"
            ? "me-cta-btn me-cta-btn--outline"
            : "defaultButton me-cta-btn"
        }
        onClick={openModal}
        data-meetelise-open
      >
        <PhoneIcon size={16} />
        {ctaLabel}
      </button>

      {/* ── Modal ───────────────────────────────────────────────────────── */}
      {open && (
        <div
          ref={overlayRef}
          className="me-overlay"
          onClick={(e) => {
            if (e.target === overlayRef.current) closeModal();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Try Elise VoiceAI"
        >
          <div className="me-modal" onKeyDown={onKeyDown}>
            {/* Close — always visible */}
            <button
              type="button"
              className="me-close"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {!submitted ? (
              /* ── FORM ─────────────────────────────────────────────────── */
              <>
                <div className="me-header">
                  <p
                    className="above-eye-brow"
                    style={{ textAlign: "left", marginBottom: "6px" }}
                  >
                    hear elise in action
                  </p>
                  <h2
                    className="step-heading"
                    style={{
                      textAlign: "left",
                      fontSize: "32px",
                      marginBottom: "4px",
                    }}
                  >
                    Try Elise VoiceAI
                  </h2>
                  <p
                    style={{
                      fontFamily: "Inter",
                      fontSize: "15px",
                      color: "#6a6a6b",
                      margin: 0,
                      lineHeight: "1.55",
                    }}
                  >
                    Leave your info and we'll unlock the demo line.
                  </p>
                </div>

                <div className="hsf__fields">
                  {/* First + Last */}
                  <div className="hsf__row">
                    <div className="hsf__col">
                      <label
                        className="field-label field-label-required"
                        htmlFor="me-firstname"
                      >
                        First Name
                      </label>
                      <input
                        id="me-firstname"
                        ref={firstInputRef}
                        type="text"
                        className={`formInput${
                          errors.firstname ? " formInput--error" : ""
                        }`}
                        placeholder="Jane"
                        value={form.firstname}
                        onChange={(e) => setField("firstname", e.target.value)}
                      />
                      {errors.firstname && (
                        <span className="fieldError">{errors.firstname}</span>
                      )}
                    </div>
                    <div className="hsf__col">
                      <label
                        className="field-label field-label-required"
                        htmlFor="me-lastname"
                      >
                        Last Name
                      </label>
                      <input
                        id="me-lastname"
                        type="text"
                        className={`formInput${
                          errors.lastname ? " formInput--error" : ""
                        }`}
                        placeholder="Smith"
                        value={form.lastname}
                        onChange={(e) => setField("lastname", e.target.value)}
                      />
                      {errors.lastname && (
                        <span className="fieldError">{errors.lastname}</span>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="hsf__col">
                    <label
                      className="field-label field-label-required"
                      htmlFor="me-email"
                    >
                      Work Email
                    </label>
                    <input
                      id="me-email"
                      type="email"
                      className={`formInput${
                        errors.email ? " formInput--error" : ""
                      }`}
                      placeholder="jane@company.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                    {errors.email && (
                      <span className="fieldError">{errors.email}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="hsf__col">
                    <label
                      className="field-label field-label-required"
                      htmlFor="me-phone"
                    >
                      Phone
                    </label>
                    <input
                      id="me-phone"
                      type="tel"
                      inputMode="numeric"
                      className={`formInput${
                        errors.phone ? " formInput--error" : ""
                      }`}
                      placeholder="(555) 000-0000"
                      value={form.phone}
                      onChange={(e) =>
                        setField(
                          "phone",
                          e.target.value.replace(/[^\d\s\-().+]/g, ""),
                        )
                      }
                    />
                    {errors.phone && (
                      <span className="fieldError">{errors.phone}</span>
                    )}
                  </div>

                  {/* API error */}
                  {apiError && <p className="hsf__api-error">{apiError}</p>}

                  {/* Submit */}
                  <div className="me-submit-wrap">
                    <button
                      type="button"
                      className="defaultButton"
                      onClick={handleSubmit}
                      disabled={loading}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                      }}
                      data-meetelise-submit
                    >
                      {loading ? (
                        <span className="me-spinner" />
                      ) : (
                        "Unlock the Demo Line →"
                      )}
                    </button>
                    <p className="me-privacy">
                      We'll never share your info. By submitting you agree to
                      our{" "}
                      <a
                        href="/policy"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </>
            ) : (
              /* ── CONFIRMATION ─────────────────────────────────────────── */
              <div className="me-confirm">
                {/* Check + heading */}
                <div className="me-confirm__check">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12.5L9.5 17L19 7"
                      stroke="#7638fa"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="me-confirm__header">
                  <p
                    className="above-eye-brow"
                    style={{ textAlign: "left", marginBottom: "6px" }}
                  >
                    you're in
                  </p>
                  <h2
                    className="step-heading"
                    style={{
                      textAlign: "left",
                      fontSize: "32px",
                      marginBottom: "8px",
                    }}
                  >
                    Ready to hear Elise?
                  </h2>
                  <p
                    style={{
                      fontFamily: "Inter",
                      fontSize: "15px",
                      color: "#6a6a6b",
                      margin: 0,
                      lineHeight: "1.55",
                    }}
                  >
                    Give her a ring — she handles 90% of leasing conversations
                    and is ready right now.
                  </p>
                </div>

                {/* Phone number display + actions */}
                <div className="me-phone-card">
                  <div className="me-phone-card__number">
                    <PhoneIcon size={20} />
                    <span>{phoneDisplay}</span>
                  </div>
                  <div className="me-phone-card__actions">
                    <a
                      href={`tel:+1${phoneDigits}`}
                      className="defaultButton me-call-btn"
                      data-meetelise-call
                    >
                      Call now
                    </a>
                    <button
                      type="button"
                      className="me-copy-btn"
                      onClick={copyPhone}
                      title="Copy number"
                    >
                      {copied ? <CheckIcon /> : <CopyIcon />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* QR code — desktop nudge */}
                <div className="me-qr-block">
                  <img
                    src={qrCodeSrc}
                    alt="Scan to call Elise from your phone"
                    className="me-qr-img"
                  />
                  <div className="me-qr-text">
                    <p className="me-qr-title">On your computer?</p>
                    <p className="me-qr-sub">
                      Scan this QR code with your phone to dial Elise directly —
                      no typing needed.
                    </p>
                  </div>
                </div>

                <div className="me-divider" />

                {/* Sample questions */}
                <p className="me-section-label">Things to ask Elise:</p>
                <ul className="me-questions">
                  {SAMPLE_QUESTIONS.map((q, i) => (
                    <li key={i} className="me-question">
                      <WaveIcon />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>

                <div className="me-divider" />

                {/* Languages */}
                <p className="me-section-label">Elise speaks your language</p>
                <div className="me-langs">
                  {LANGUAGES.map((l) => (
                    <span key={l} className="me-lang-pill">
                      {l}
                    </span>
                  ))}
                </div>

                {/* Dismiss */}
                <button
                  type="button"
                  className="me-dismiss"
                  onClick={closeModal}
                >
                  Maybe later
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
