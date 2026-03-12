import { useState } from "react";
import "./LightboxModal.css";
import MultiStepForm from "./MultiStepForm";

interface LightboxModalProps {
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  termsUrl?: string;
  className?: string;
  defaultOpen?: boolean;
}

export default function LightboxModal({
  headline = "Limited time: Get a chance to win a gift card when you request a demo.",
  bodyText = "See how our product helps you save time, reduce waste, and take control — then walk away with a chance to win a gift card for your time.",
  heroImageUrl = "",
  heroImageAlt = "Gift card",
  termsUrl = "/legal/terms",
  className = "",
  defaultOpen = false,
}: LightboxModalProps): React.ReactElement {
  const [open, setOpen] = useState<boolean>(defaultOpen);

  return (
    <>
      {/* ── Preview trigger — remove in Webflow, use your own trigger ── */}
      <div className="lb-preview-trigger">
        <button onClick={() => setOpen(true)} className="lb-trigger-btn">
          Open Lightbox
        </button>
      </div>

      {open && (
        <>
          {/* Overlay */}
          <div
            data-state="open"
            onClick={() => setOpen(false)}
            className="lb-overlay"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div
            role="dialog"
            data-state="open"
            data-testid="lightbox-content"
            tabIndex={-1}
            className={`lb-dialog${className ? ` ${className}` : ""}`}
          >
            <div className="lb-container">
              {/* Inner grid */}
              <div className="lb-grid">
                {/* Copy column */}
                <div className="lb-copy">
                  <div className="lb-headline">
                    <h2>{headline}</h2>
                  </div>
                  <div className="lb-body">{bodyText}</div>
                  <div className="lb-form-area" />
                  <MultiStepForm
                    portalId="45321630"
                    formGuid="5da905fc-5b70-47ed-9f71-e54d166618ff"
                  />
                  <div className="lb-terms">
                    <a href={termsUrl}>Terms and Conditions</a> apply.
                  </div>
                </div>

                {/* Image / hero column */}
                <div className="lb-img-col">
                  <div className="lb-hero">
                    {heroImageUrl ? (
                      <img
                        src={heroImageUrl}
                        alt={heroImageAlt}
                        className="lb-hero-img"
                      />
                    ) : (
                      <span className="lb-hero-placeholder">🎁</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Close button */}
              <button
                data-testid="lightbox-close-button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="lb-close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
