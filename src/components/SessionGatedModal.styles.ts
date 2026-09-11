/** Injected into document.head so the portaled modal is styled outside shadow DOM. */
export const SESSION_GATED_MODAL_CSS = `
.sgm-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(24, 24, 25, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  animation: sgmOverlayIn 0.2s ease forwards;
}

@keyframes sgmOverlayIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.sgm-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 40px 36px 36px;
  border-radius: 12px;
  background: #fff;
  box-shadow:
    0 24px 64px rgba(0, 0, 0, 0.16),
    0 4px 16px rgba(0, 0, 0, 0.07);
  font-family: Inter, "Intervariable", system-ui, sans-serif;
  color: #181819;
  animation: sgmModalIn 0.28s cubic-bezier(0.34, 1.3, 0.64, 1) forwards;
  scrollbar-width: thin;
  scrollbar-color: #eaeaed #fff;
}

@keyframes sgmModalIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.sgm-close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin: 0;
  padding: 0;
  border-radius: 50%;
  border: 1px solid #eaeaed;
  background: #fafafb;
  color: #6a6a6b;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.sgm-close:hover {
  background: #eaeaed;
  border-color: #dedee1;
}

.sgm-header {
  margin-bottom: 24px;
  padding-right: 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sgm-title {
  margin: 0;
  color: #0d0d0c;
  font-family: "Intervariable", "Inter Variable", Inter, sans-serif;
  font-size: 36px;
  font-style: normal;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -1.44px;
  font-feature-settings: "ss07" 1, "ss08" 1;
}

.sgm-lede a {
  color: #7638fa;
  text-decoration: none;
}

.sgm-lede a:hover {
  text-decoration: underline;
}

.sgm-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sgm-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sgm-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.sgm-label {
  margin: 0;
  color: #181819;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: -0.14px;
}

.sgm-label--required::after {
  content: " *";
  color: #d7234a;
}

.sgm-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #eaeaed;
  border-radius: 4px;
  background: #fff;
  color: #181819;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.16px;
  appearance: none;
}

.sgm-input::placeholder {
  color: #6a6a6b;
}

.sgm-input:focus {
  outline: none;
  border-color: #7638fa;
}

.sgm-input--error {
  border-color: #d7234a;
}

.sgm-error {
  margin: 0;
  color: #d7234a;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 1.4;
}

.sgm-api-error {
  margin: 4px 0 0;
  color: #d7234a;
  font-family: Inter, sans-serif;
  font-size: 14px;
  text-align: center;
}

.sgm-submit-wrap {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.sgm-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  margin: 0;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  background: #7638fa;
  color: #fafafb;
  font-family: Inter, sans-serif;
  font-size: 16px;
  font-weight: 450;
  line-height: 1.5;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.sgm-submit:hover:not(:disabled) {
  background: #5e2bd4;
}

.sgm-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sgm-spinner {
  display: inline-block;
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: sgmSpin 0.65s linear infinite;
}

@keyframes sgmSpin {
  to { transform: rotate(360deg); }
}

.sgm-privacy {
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  color: #6a6a6b;
}

.sgm-privacy a {
  color: #7638fa;
  text-decoration: none;
}

.sgm-privacy a:hover {
  text-decoration: underline;
}

.sgm-thanks {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  animation: sgmThanksIn 0.3s ease forwards;
}

@keyframes sgmThanksIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sgm-thanks .sgm-header {
  margin-bottom: 24px;
  padding-right: 32px;
}

.sgm-thanks-btn {
  width: auto;
  min-width: 140px;
}

@media (max-width: 520px) {
  .sgm-modal {
    padding: 32px 20px 28px;
    border-radius: 10px;
  }

  .sgm-title {
    font-size: 24px;
    letter-spacing: -0.96px;
  }

  .sgm-lede {
    font-size: 16px;
    letter-spacing: -0.32px;
  }

  .sgm-row {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sgm-overlay,
  .sgm-modal,
  .sgm-thanks,
  .sgm-submit,
  .sgm-close {
    animation: none;
    transition: none;
  }
}
`;
