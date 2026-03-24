import React from "react";
import "./LightboxModal.css";

interface LightboxModalProps {
  eyebrow?: string;
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  termsUrl?: string;
  className?: string;
  onClose: () => void;
  children?: React.ReactNode;
  pushEvent: (event: string) => void;
}

export default function LightboxModal({
  eyebrow = "Limited time offer",
  headline = "Limited time: Get a chance to win a gift card when you request a demo.",
  bodyText = "See how our product helps you save time, reduce waste, and take control — then walk away with a chance to win a gift card for your time.",
  heroImageUrl = "https://cdn.prod.website-files.com/63cc1eef179b054a9306598d/69c2be6281ae91e2facc6951_GC_200.avif",
  heroImageAlt = "Gift card",
  termsUrl = "/legal/demo-incentive-program",
  className = "",
  onClose,
  pushEvent,
  children,
}: LightboxModalProps): React.ReactElement {
  return (
    <>
      {/* Overlay */}
      <div
        data-state="open"
        onClick={() => {
          pushEvent("incentive_lightbox_dismissed_overlay");
          onClose();
        }}
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
          <div className="lb-flex">
            {/* Copy column */}
            <div className="lb-copy">
              <div className="lb-eyebrow">{eyebrow}</div>
              <div className="lb-headline">
                <h2>{headline}</h2>
              </div>

              <div className="lb-body">{bodyText}</div>

              {/* MultiStepForm renders here as children */}
              <div className="lb-form-area">{children}</div>

              <div className="lb-body-terms">
                <a className="lb-terms" href={termsUrl}>
                  Terms and Conditions
                </a>{" "}
                apply.
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
            onClick={() => {
              pushEvent("incentive_lightbox_dismissed_button");
              onClose();
            }}
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
  );
}
