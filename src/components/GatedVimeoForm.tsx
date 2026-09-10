import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Player from "@vimeo/player";
import type { VimeoEmbedParameters, VimeoEvent } from "@vimeo/player";
import { storeUtms, getUtmFields } from "../utils/utm";
import "./GatedVimeoForm.css";

type FormFields = {
  email: string;
  firstname: string;
  lastname: string;
  company: string;
  country: string;
};

type FieldName = keyof FormFields;

export interface GatedVimeoFormProps {
  /** Numeric Vimeo ID, or a full vimeo.com / player URL (include h= for unlisted). */
  vimeoId?: string;
  /** First N seconds of the video, via Vimeo's `end_time` embed param. */
  previewSeconds?: number;
  portalId?: string;
  formGuid?: string;
  privacyUrl?: string;
  brandName?: string;
  className?: string;
}

const PORTAL_ID = "45321630";
const FORM_GUID = "89c343f5-4dc8-435c-a2ab-96e0e3759756";
const API_BASE = "https://contact-checker-backend.vercel.app";
const THUMB_WIDTH = 1280;

const BLOCKED_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "gmx.com",
  "fastmail.com",
]);

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "India",
  "Ireland",
  "Netherlands",
  "New Zealand",
  "Singapore",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Arab Emirates",
  "Brazil",
  "Mexico",
  "Japan",
  "South Korea",
  "Italy",
  "Other",
];

function parseVimeoId(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  const m = v.match(/(\d{6,})/);
  return m ? m[1] : v;
}

function playerOptions(vimeoId: string, previewSeconds: number, unlocked: boolean): VimeoEmbedParameters {
  const id = parseVimeoId(vimeoId);
  const hash = vimeoId.match(/[?&]h=([a-z0-9]+)/i)?.[1];
  const unlisted = vimeoId.match(/vimeo\.com\/(\d{6,})\/([a-z0-9]+)/i);
  const clip = Math.max(1, previewSeconds);

  const options: VimeoEmbedParameters = {
    autoplay: true,
    title: false,
    byline: false,
    portrait: false,
    color: "7638FA",
    playsinline: true,
    responsive: false,
    dnt: false,
  };

  if (hash && id) {
    options.url = `https://player.vimeo.com/video/${id}?h=${hash}`;
  } else if (unlisted) {
    options.url = `https://vimeo.com/${unlisted[1]}/${unlisted[2]}`;
  } else if (id) {
    options.id = id;
  }

  if (!unlocked) {
    options.end_time = clip;
    options.watch_full_video = false;
    options.skipping_forward = false;
  }

  return options;
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function validateWorkEmail(val: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return false;
  return !BLOCKED_DOMAINS.has(val.split("@")[1].toLowerCase());
}

function pushEvent(event: string) {
  const w = window as Window & { dataLayer?: Array<Record<string, string>> };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event });
}

async function createContact(email: string): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/create-contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // same silent fail as the other HubSpot forms
  }
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 2.2v9.6L12 7 3 2.2Z" fill="currentColor" />
    </svg>
  );
}

function RewatchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.2 8A4.8 4.8 0 1 1 8 12.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.2 4.4V8H6.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5 2.5 10 7 5 11.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="gvf__error-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="0.8" fill="currentColor" />
    </svg>
  );
}

function FieldRow({
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
    <div className={`gvf__row${error ? " gvf__row--error" : ""}`}>
      <label className="gvf__label" htmlFor={id}>
        {label}
      </label>
      <div className="gvf__control">
        {children}
        {error && <ErrorIcon />}
      </div>
    </div>
  );
}

export default function GatedVimeoForm({
  vimeoId = "",
  previewSeconds = 30,
  portalId = PORTAL_ID,
  formGuid = FORM_GUID,
  privacyUrl = "/policy",
  brandName = "EliseAI",
  className = "",
}: GatedVimeoFormProps) {
  const uid = useId();
  const mountRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [thumb, setThumb] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormFields>({
    email: "",
    firstname: "",
    lastname: "",
    company: "",
    country: "United States",
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  const id = parseVimeoId(vimeoId);
  const showPlayer = unlocked || playing || ended;

  useEffect(() => {
    storeUtms();
  }, []);

  useEffect(() => {
    if (!id) {
      setThumb("");
      return;
    }
    let cancelled = false;
    fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}&width=${THUMB_WIDTH}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled || !data?.thumbnail_url) return;
        setThumb(
          data.thumbnail_url
            .replace(/_\d+x\d+(?=\.\w+($|\?)|$|\?)/, `_${THUMB_WIDTH}`)
            .replace(/([?&](?:w|mw)=)\d+/, `$1${THUMB_WIDTH}`)
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!showPlayer || !mountRef.current || !vimeoId.trim()) return;

    const clip = Math.max(1, previewSeconds);
    const player = new Player(mountRef.current, playerOptions(vimeoId, clip, unlocked));
    let stopped = false;

    const stopPreview = () => {
      if (stopped || unlocked) return;
      stopped = true;
      void player.pause();
      void player.setCurrentTime(clip);
      setPlaying(false);
      setEnded(true);
    };

    if (!unlocked) {
      player.on("timeupdate", (data: VimeoEvent) => {
        if (data.seconds >= clip) stopPreview();
      });
      player.on("ended", stopPreview);

      const poll = window.setInterval(() => {
        if (stopped) return;
        void player.getCurrentTime().then((seconds) => {
          if (seconds >= clip) stopPreview();
        });
      }, 200);

      return () => {
        window.clearInterval(poll);
        player.off("timeupdate");
        player.off("ended");
        void player.destroy();
      };
    }

    return () => {
      void player.destroy();
    };
  }, [showPlayer, unlocked, vimeoId, previewSeconds, previewKey]);

  const setField = (name: FieldName, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleContinue = async () => {
    setApiError("");
    if (step === 1) {
      const next: Partial<Record<FieldName, string>> = {};
      if (!form.email.trim()) next.email = "Work email is required.";
      else if (!validateWorkEmail(form.email.trim()))
        next.email = "Please use your work email address.";
      setErrors(next);
      if (Object.keys(next).length) return;
      void createContact(form.email.trim());
      pushEvent("gated_vimeo_email_submit");
      setStep(2);
      return;
    }

    const next: Partial<Record<FieldName, string>> = {};
    if (!form.firstname.trim()) next.firstname = "First name is required.";
    if (!form.lastname.trim()) next.lastname = "Last name is required.";
    if (!form.company.trim()) next.company = "Company is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      if (formGuid) {
        const hutk = getCookie("hubspotutk");
        const res = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fields: [
                { name: "email", value: form.email.trim() },
                { name: "firstname", value: form.firstname.trim() },
                { name: "lastname", value: form.lastname.trim() },
                { name: "company", value: form.company.trim() },
                { name: "country", value: form.country },
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
        if (!res.ok) throw new Error(String(res.status));
      }
      pushEvent("gated_vimeo_form_complete");
      setUnlocked(true);
    } catch {
      setApiError("We couldn't submit the form. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const ids: Record<FieldName, string> = {
    email: `${uid}-email`,
    firstname: `${uid}-firstname`,
    lastname: `${uid}-lastname`,
    company: `${uid}-company`,
    country: `${uid}-country`,
  };

  const showOverlay = !unlocked && !playing;

  return (
    <div className={["gvf", unlocked ? "gvf--unlocked" : "", className].filter(Boolean).join(" ")}>
      <div className="gvf__player">
        <div className="gvf__frame">
          {showPlayer && (
            <div
              key={unlocked ? "full" : `preview-${previewKey}`}
              ref={mountRef}
              className="gvf__embed"
            />
          )}
          {showOverlay && !showPlayer && thumb && (
            <img className="gvf__poster" src={thumb} alt="" />
          )}
          {showOverlay && !showPlayer && !thumb && (
            <div className="gvf__poster gvf__poster--empty" />
          )}
          {showOverlay && (
            <div className="gvf__overlay">
              <button
                type="button"
                className="gvf__preview-btn"
                onClick={() => {
                  setEnded(false);
                  setPlaying(true);
                  setPreviewKey((k) => k + 1);
                }}
              >
                {ended ? <RewatchIcon /> : <PlayIcon />}
                {ended ? "Rewatch preview" : "Watch preview"}
              </button>
              <p className="gvf__overlay-copy">Complete form to watch full video.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!unlocked && (
          <motion.form
            className="gvf__form"
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            onSubmit={(e) => {
              e.preventDefault();
              void handleContinue();
            }}
            noValidate
          >
            <div className="gvf__fields">
              <FieldRow id={ids.email} label="Work email" error={errors.email}>
                <input
                  id={ids.email}
                  className="gvf__input"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                />
              </FieldRow>

              <AnimatePresence initial={false}>
                {step === 2 && (
                  <motion.div
                    className="gvf__more"
                    key="more"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                  >
                    <FieldRow id={ids.firstname} label="First name" error={errors.firstname}>
                      <input
                        id={ids.firstname}
                        className="gvf__input"
                        type="text"
                        autoComplete="given-name"
                        autoFocus
                        value={form.firstname}
                        onChange={(e) => setField("firstname", e.target.value)}
                      />
                    </FieldRow>
                    <FieldRow id={ids.lastname} label="Last name" error={errors.lastname}>
                      <input
                        id={ids.lastname}
                        className="gvf__input"
                        type="text"
                        autoComplete="family-name"
                        value={form.lastname}
                        onChange={(e) => setField("lastname", e.target.value)}
                      />
                    </FieldRow>
                    <FieldRow id={ids.company} label="Company" error={errors.company}>
                      <input
                        id={ids.company}
                        className="gvf__input"
                        type="text"
                        autoComplete="organization"
                        value={form.company}
                        onChange={(e) => setField("company", e.target.value)}
                      />
                    </FieldRow>
                    <FieldRow id={ids.country} label="Country/Region">
                      <select
                        id={ids.country}
                        className="gvf__input gvf__select"
                        value={form.country}
                        onChange={(e) => setField("country", e.target.value)}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    <p className="gvf__disclaimer">
                      You may receive marketing communications from {brandName}. You can opt
                      out at any time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {apiError && <p className="gvf__api-error">{apiError}</p>}

            <div className="gvf__footer">
              <p className="gvf__legal">
                {brandName} will handle your data pursuant to its{" "}
                <a href={privacyUrl} target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                .
              </p>
              <button type="submit" className="gvf__continue" disabled={submitting}>
                {submitting ? "Submitting…" : "Continue"}
                {!submitting && <ChevronIcon />}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
