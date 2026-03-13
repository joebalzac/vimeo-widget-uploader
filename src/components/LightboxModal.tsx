import React from "react";
import "./LightboxModal.css";

interface LightboxModalProps {
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  termsUrl?: string;
  className?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function LightboxModal({
  headline = "Limited time: Get a chance to win a gift card when you request a demo.",
  bodyText = "See how our product helps you save time, reduce waste, and take control — then walk away with a chance to win a gift card for your time.",
  heroImageUrl = "",
  heroImageAlt = "Gift card",
  termsUrl = "/legal/terms",
  className = "",
  onClose,
  children,
}: LightboxModalProps): React.ReactElement {
  return (
    <>
      {/* Overlay */}
      <div
        data-state="open"
        onClick={onClose}
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
          <div className="lb-grid">
            {/* Copy column */}
            <div className="lb-copy">
              <div className="lb-headline">
                <h2>{headline}</h2>
              </div>

              <div className="lb-body">{bodyText}</div>

              {/* MultiStepForm renders here as children */}
              <div className="lb-form-area">{children}</div>

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
            onClick={onClose}
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
