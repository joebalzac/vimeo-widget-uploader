/**
 * LightboxWithForm.tsx
 *
 * Wrapper component that composes LightboxModal and MultiStepForm together.
 */

import React, { useState } from "react";
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

  // MultiStepForm props
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
        <LightboxModal
          headline={headline}
          bodyText={bodyText}
          heroImageUrl={heroImageUrl}
          heroImageAlt={heroImageAlt}
          termsUrl={termsUrl}
          className={className}
          onClose={handleClose}
        >
          <MultiStepForm
            portalId={portalId}
            formGuid={formGuid}
            enableNavTrigger={enableNavTrigger}
          />
        </LightboxModal>
      )}
    </>
  );
}
