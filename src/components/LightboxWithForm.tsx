/**
 * LightboxWithForm.tsx
 *
 * Wrapper component that composes LightboxModal and MultiStepForm together.
 * MultiStepForm is portaled into document.body so it is never clipped
 * by the lightbox's overflow or z-index constraints.
 */

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import LightboxModal from "./LightboxModal";
import MultiStepForm from "./MultiStepForm";

interface LightboxWithFormProps {
  // LightboxModal props
  headline?: string;
  bodyText?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  termsUrl?: string;
  className?: string;
  defaultOpen?: boolean;

  // MultiStepForm props — pass through whatever your form accepts
  portalId?: string;
  formGuid?: string;
  enableNavTrigger?: boolean;
}

export default function LightboxWithForm({
  headline,
  bodyText,
  heroImageUrl,
  heroImageAlt,
  termsUrl,
  className,
  defaultOpen = false,
  portalId,
  formGuid,
  enableNavTrigger,
}: LightboxWithFormProps): React.ReactElement {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  const portalAnchorRef = useRef<HTMLElement | null>(null);
  const [anchorReady, setAnchorReady] = useState<boolean>(false);

  // Once the lightbox mounts, find the portal anchor div inside it
  useEffect(() => {
    if (open) {
      // Wait one tick for the lightbox DOM to render
      const frame = requestAnimationFrame(() => {
        const anchor = document.getElementById("lb-form-portal-anchor");
        if (anchor) {
          portalAnchorRef.current = anchor;
          setAnchorReady(true);
        }
      });
      return () => cancelAnimationFrame(frame);
    } else {
      portalAnchorRef.current = null;
      setAnchorReady(false);
    }
  }, [open]);

  const handleClose = (): void => {
    setOpen(false);
  };

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
          <LightboxModal
            headline={headline}
            bodyText={bodyText}
            heroImageUrl={heroImageUrl}
            heroImageAlt={heroImageAlt}
            termsUrl={termsUrl}
            className={className}
            onClose={handleClose}
          />

          {/* Portal MultiStepForm into the anchor div inside the lightbox.
              This keeps it visually in-place but outside overflow: hidden. */}
          {anchorReady &&
            portalAnchorRef.current &&
            createPortal(
              <MultiStepForm
                portalId={portalId}
                formGuid={formGuid}
                enableNavTrigger={enableNavTrigger}
              />,
              portalAnchorRef.current,
            )}
        </>
      )}
    </>
  );
}
