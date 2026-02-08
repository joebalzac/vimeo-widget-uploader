import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload } from "tus-js-client";

declare global {
  interface Window {
    hbspt?: any;
    __lastTusUpload?: any;
  }
}

type CreateUploadResponse = {
  upload_link: string;
  video_id: string;
  video_uri?: string;
  video_url?: string;
  folder_add_ok?: boolean;
  privacy?: string;

  // backend-generated token to confirm later
  pending_token: string;
};

type Props = {
  backendBase: string;
  portalId: string;
  formId: string;
  region?: string;
  questionText?: string;
  maxMB?: number;
};

export default function HubSpotVimeoWidget({
  backendBase,
  portalId,
  formId,
  region = "na1",
  questionText = "“How has working with EliseAI improved your work experience?”",
  maxMB = 100,
}: Props) {
  const formHostRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tusUploadRef = useRef<Upload | null>(null);

  const lightMountId = useMemo(
    () =>
      `hs-light-mount-${portalId}-${formId}-${Math.random()
        .toString(36)
        .slice(2, 9)}`,
    [portalId, formId],
  );

  const base = useMemo(
    () => (backendBase || "").replace(/\/$/, ""),
    [backendBase],
  );

  const [status, setStatus] = useState<string>("");
  const [pct, setPct] = useState<number | null>(null);

  const [video, setVideo] = useState<{ id: string } | null>(null);
  const [pendingToken, setPendingToken] = useState<string | null>(null);

  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    name: string;
    sizeBytes: number;
  } | null>(null);

  const [submitted, setSubmitted] = useState(false);

  const videoRef = useRef<{ id: string } | null>(null);
  const pendingTokenRef = useRef<string | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const [videoErrorMessage, setVideoErrorMessage] = useState<string | null>(
    null,
  );

  useEffect(() => {
    videoRef.current = video;
  }, [video]);

  useEffect(() => {
    pendingTokenRef.current = pendingToken;
  }, [pendingToken]);

  // -------------------------
  // HubSpot hidden fields
  // -------------------------
  const VIMEO_URL_NAME = "vimeo_video_url";
  const VIMEO_ID_NAME = "vimeo_video_id";
  const PENDING_TOKEN_NAME = "pending_token";

  function findFields(formEl: HTMLFormElement, name: string) {
    const nodes = Array.from(
      formEl.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`),
    );
    if (nodes.length === 0) {
      const byId = formEl.querySelector<HTMLInputElement>(`#${name}`);
      if (byId) nodes.push(byId);
    }
    return nodes;
  }

  function ensureHiddenField(formEl: HTMLFormElement, name: string) {
    let nodes = Array.from(
      formEl.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`),
    );
    if (nodes.length === 0) {
      const hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = name;
      formEl.appendChild(hidden);
      nodes = [hidden];
    }
    return nodes;
  }

  function setFieldValueAndNotify(el: HTMLInputElement, value: string) {
    try {
      el.value = value;
    } catch {}
    try {
      el.defaultValue = value;
    } catch {}
    try {
      el.setAttribute("value", value);
    } catch {}

    try {
      const inputEvt = new InputEvent("input", {
        bubbles: true,
        composed: true,
      });
      el.dispatchEvent(inputEvt);
    } catch {
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }

    try {
      el.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    } catch {
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  function applyVideoToForm(formEl: HTMLFormElement, v: { id: string } | null) {
    const id = v?.id || "";
    const url = id ? `https://vimeo.com/${id}` : "";
    const token = pendingTokenRef.current || "";

    let urlFields = findFields(formEl, VIMEO_URL_NAME);
    if (urlFields.length === 0)
      urlFields = ensureHiddenField(formEl, VIMEO_URL_NAME);

    let idFields = findFields(formEl, VIMEO_ID_NAME);
    if (idFields.length === 0)
      idFields = ensureHiddenField(formEl, VIMEO_ID_NAME);

    let tokenFields = findFields(formEl, PENDING_TOKEN_NAME);
    if (tokenFields.length === 0)
      tokenFields = ensureHiddenField(formEl, PENDING_TOKEN_NAME);

    urlFields.forEach((f) => setFieldValueAndNotify(f, url));
    idFields.forEach((f) => setFieldValueAndNotify(f, id));
    tokenFields.forEach((f) => setFieldValueAndNotify(f, token));
  }

  // Confirm ONLY after HubSpot says the form was submitted
  async function confirmUploadAfterSubmit() {
    const token = pendingTokenRef.current;
    const v = videoRef.current;
    if (!base || !token || !v?.id) return;

    try {
      await fetch(`${base}/api/vimeo/confirm-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pending_token: token,
          video_id: v.id,
          confirmed_at: new Date().toISOString(),
        }),
      });
    } catch {}
  }

  async function checkUploadLinkCors(uploadLink: string) {
    try {
      const resp = await fetch(uploadLink, { method: "OPTIONS", mode: "cors" });
      const headers: Record<string, string> = {};
      resp.headers.forEach((v, k) => (headers[k] = v));
      return { ok: resp.ok, status: resp.status, headers };
    } catch (err: any) {
      return { ok: false, error: String(err?.message || err) };
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function startUpload(file: File) {
    if (!base) {
      setStatus("Missing backend base URL.");
      return;
    }

    if (file.size > maxMB * 1024 * 1024) {
      setStatus(`File too large. Max ${maxMB}MB.`);
      setPct(null);
      return;
    }

    // Abort in-progress upload if replacing
    try {
      tusUploadRef.current?.abort(true);
    } catch {}
    tusUploadRef.current = null;

    // Reset state (replace flow)
    setVideo(null);
    videoRef.current = null;
    setPendingToken(null);
    pendingTokenRef.current = null;

    setUploadedFileMeta({ name: file.name, sizeBytes: file.size });

    setIsUploading(true);
    setVideoErrorMessage(null);
    setStatus("Preparing upload…");
    setPct(null);

    try {
      const resp = await fetch(`${base}/api/vimeo/create-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          name: file.name,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        setStatus(`Couldn't start upload: ${text}`);
        return;
      }

      const data: CreateUploadResponse = await resp.json();

      if (!data.upload_link || !data.video_id || !data.pending_token) {
        setStatus(
          "Backend response missing upload_link/video_id/pending_token.",
        );
        return;
      }

      setPendingToken(data.pending_token);
      pendingTokenRef.current = data.pending_token;

      if (!/^https:\/\//i.test(data.upload_link)) {
        setStatus(
          "Upload link returned by backend is not an absolute HTTPS URL.",
        );
        return;
      }

      setStatus("Checking upload endpoint CORS...");
      await checkUploadLinkCors(data.upload_link);

      setStatus("Uploading…");
      await new Promise<void>((resolve, reject) => {
        const upload = new Upload(file, {
          uploadUrl: data.upload_link,
          retryDelays: [0, 1000, 3000, 5000],
          onError(err: any) {
            window.__lastTusUpload = upload;
            reject(err);
          },
          onProgress(bytesUploaded: number, bytesTotal: number) {
            const percent = Math.floor((bytesUploaded / bytesTotal) * 100);
            setPct(percent);
            setStatus(`Uploading… ${percent}%`);
          },
          onSuccess() {
            resolve();
          },
        });

        tusUploadRef.current = upload;
        window.__lastTusUpload = upload;
        upload.start();
      });

      const v = { id: data.video_id };
      setVideo(v);
      videoRef.current = v;

      // Apply to iframe form instead of regular form
      const iframe = formHostRef.current?.querySelector(
        "iframe.hs-form-iframe",
      ) as HTMLIFrameElement;
      if (iframe) {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        const formInIframe = iframeDoc?.querySelector(
          "form",
        ) as HTMLFormElement;
        if (formInIframe) {
          applyVideoToForm(formInIframe, v);
          console.log("✅ Applied video to iframe form");
        } else {
          console.warn("⚠️ Could not find form in iframe");
        }
      } else {
        console.warn("⚠️ Could not find iframe");
      }

      setPct(null);
      setStatus("");
    } catch (e: any) {
      const message = String(e?.message || e);
      setStatus(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
      tusUploadRef.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ---- HubSpot embed: render in Light DOM, then move into our component host ----
  useEffect(() => {
    let cancelled = false;
    let pollInterval: number | null = null;

    const src = "https://js.hsforms.net/forms/embed/v2.js";

    const ensureLightMount = () => {
      let mount = document.getElementById(lightMountId);
      if (!mount) {
        mount = document.createElement("div");
        mount.id = lightMountId;
        mount.style.display = "none";
        document.body.appendChild(mount);
      }
      return mount;
    };

    const ensureScript = () => {
      const existing = document.querySelector(
        `script[src="${src}"]`,
      ) as HTMLScriptElement | null;
      if (existing) return existing;

      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      document.body.appendChild(s);
      return s;
    };

    const moveRenderedFormIntoHost = () => {
      const mount = document.getElementById(lightMountId);
      const host = formHostRef.current;
      if (!mount || !host) return false;

      const injected =
        mount.querySelector(".hbspt-form") || mount.firstElementChild;
      if (!injected) return false;

      host.innerHTML = "";
      host.appendChild(injected);

      const f = host.querySelector("form") as HTMLFormElement | null;
      if (f) {
        if (videoRef.current?.id) applyVideoToForm(f, videoRef.current);

        const hostObs = new MutationObserver(() => {
          const newForm = host.querySelector("form") as HTMLFormElement | null;
          if (!newForm) return;

          try {
            hostObs.disconnect();
          } catch {}

          if (videoRef.current?.id) applyVideoToForm(newForm, videoRef.current);
        });

        hostObs.observe(host, { childList: true, subtree: true });
      }

      return true;
    };

    const renderForm = () => {
      if (cancelled) return;
      ensureLightMount();
      if (!window.hbspt?.forms?.create) return;

      const mount = document.getElementById(lightMountId);
      if (mount) mount.innerHTML = "";

      window.hbspt.forms.create({
        portalId,
        formId,
        region,
        target: `#${lightMountId}`,

        onFormReady: () => {
          setTimeout(() => {
            moveRenderedFormIntoHost();

            // Find the iframe
            const iframe = formHostRef.current?.querySelector(
              "iframe.hs-form-iframe",
            ) as HTMLIFrameElement;

            if (iframe) {
              console.log("Found iframe:", iframe);

              // Access the form inside the iframe
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
              const formInIframe = iframeDoc?.querySelector("form");

              console.log("Form in iframe:", formInIframe);

              if (formInIframe) {
                // Apply video to the iframe form when video uploads
                if (videoRef.current?.id) {
                  applyVideoToForm(formInIframe, videoRef.current);
                }

                formInIframe.addEventListener(
                  "submit",
                  function (e: Event) {
                    console.log("🔴 SUBMIT INTERCEPTED IN IFRAME!");

                    const vimeoIdField = formInIframe.querySelector(
                      'input[name="vimeo_video_id"]',
                    ) as HTMLInputElement;
                    const vimeoUrlField = formInIframe.querySelector(
                      'input[name="vimeo_video_url"]',
                    ) as HTMLInputElement;

                    console.log("Vimeo ID:", vimeoIdField?.value);
                    console.log("Vimeo URL:", vimeoUrlField?.value);

                    const hasVideo =
                      vimeoIdField?.value?.trim() &&
                      vimeoUrlField?.value?.trim();

                    if (!hasVideo) {
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      setVideoErrorMessage(
                        "Please upload a video before submitting!",
                      );
                      return false;
                    } else {
                      setVideoErrorMessage(null);
                    }

                    // Video exists, allow submission
                    console.log("✅ Video present, allowing submission");
                  },
                  true,
                );
              }
            }
          }, 500);
        },

        onFormSubmitted: async () => {
          setSubmitted(true);
          await confirmUploadAfterSubmit();
        },
      });
    };

    const waitForHubSpot = () => {
      let attempts = 0;
      const maxAttempts = 120;
      const interval = 100;

      pollInterval = window.setInterval(() => {
        if (cancelled) {
          if (pollInterval) window.clearInterval(pollInterval);
          pollInterval = null;
          return;
        }

        attempts++;

        if (window.hbspt?.forms?.create) {
          if (pollInterval) window.clearInterval(pollInterval);
          pollInterval = null;
          renderForm();
          return;
        }

        if (attempts >= maxAttempts) {
          if (pollInterval) window.clearInterval(pollInterval);
          pollInterval = null;
          console.error(
            "[HubSpot] Timeout waiting for window.hbspt.forms.create",
          );
        }
      }, interval);
    };

    const script = ensureScript();

    if (window.hbspt?.forms?.create) renderForm();
    else {
      const onLoad = () => {
        if (window.hbspt?.forms?.create) renderForm();
        else waitForHubSpot();
      };
      script.addEventListener("load", onLoad);
      waitForHubSpot();
      return () => script.removeEventListener("load", onLoad);
    }

    return () => {
      cancelled = true;
      if (pollInterval) window.clearInterval(pollInterval);
      document.getElementById(lightMountId)?.remove();
    };
  }, [portalId, formId, region, lightMountId]);

  function formatMB(bytes: number) {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)}MB`;
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        {!submitted ? (
          <div style={styles.uploadSection}>
            <div style={styles.prompt}>
              <div style={styles.promptHeader}>
                <div style={styles.promptLabel}>
                  Submit a video answering one question:
                </div>
                <div style={styles.promptMaxMB}>Max {maxMB}MB.</div>
              </div>
              <div style={styles.promptQuestion}>{questionText}</div>
            </div>
            {videoErrorMessage && (
              <div style={styles.errorMessage}>{videoErrorMessage}</div>
            )}
            <div style={styles.uploadBox}>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-m4v"
                disabled={isUploading}
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) startUpload(f);
                }}
              />

              {!video?.id ? (
                <div style={styles.uploadBtnContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <g clipPath="url(#clip0_461_528)">
                      <path
                        d="M15.3334 12.1453V13.4207C15.3332 13.9279 15.1317 14.4143 14.773 14.7729C14.4144 15.1316 13.928 15.3331 13.4207 15.3333H2.57941C2.07214 15.3333 1.58565 15.1318 1.22696 14.7731C0.868261 14.4144 0.666748 13.9279 0.666748 13.4207V12.1453"
                        stroke="#7638FA"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M8 0.666687V12.072"
                        stroke="#7638FA"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3.33325 5.33335L7.99992 0.666687L12.6666 5.33335"
                        stroke="#7638FA"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_461_528">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <button
                    type="button"
                    style={{
                      ...styles.uploadBtn,
                      opacity: isUploading ? 0.6 : 1,
                      cursor: isUploading ? "not-allowed" : "pointer",
                    }}
                    disabled={isUploading}
                    onClick={openFilePicker}
                  >
                    Upload a file
                  </button>
                </div>
              ) : (
                <div style={styles.fileRow}>
                  <div style={styles.fileThumb} aria-hidden="true">
                    <div style={styles.fileThumbInner} />
                  </div>

                  <div style={styles.fileMeta}>
                    <div style={styles.fileName} title={uploadedFileMeta?.name}>
                      {uploadedFileMeta?.name}
                    </div>

                    <div style={styles.fileReplaceBtnContainer}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_629_325)">
                          <path
                            d="M4.25587 10.58V13.7428H1.09302"
                            stroke="#7638FA"
                            strokeWidth="1.13143"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.7441 7.41713V4.25427H16.907"
                            stroke="#7638FA"
                            strokeWidth="1.13143"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.9423 4.2522C15.033 5.38842 15.699 6.86556 15.8285 8.43517C15.958 10.0048 15.5429 11.5711 14.6532 12.8707C13.7636 14.1702 12.4535 15.1238 10.9433 15.5709C9.43318 16.018 7.81513 15.9314 6.36133 15.3257"
                            stroke="#7638FA"
                            strokeWidth="1.13143"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M4.05677 13.7449C2.96852 12.6081 2.30455 11.1315 2.17635 9.56303C2.04816 7.99454 2.46355 6.42971 3.35276 5.13129C4.24197 3.83288 5.55086 2.87995 7.05964 2.43254C8.56842 1.98512 10.1852 2.07046 11.6385 2.67423"
                            stroke="#7638FA"
                            strokeWidth="1.13143"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_629_325">
                            <rect width="18" height="18" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <button
                        type="button"
                        style={{
                          ...styles.fileReplaceBtn,
                          opacity: isUploading ? 0.6 : 1,
                          cursor: isUploading ? "not-allowed" : "pointer",
                        }}
                        onClick={openFilePicker}
                        disabled={isUploading}
                      >
                        Replace Video
                      </button>
                    </div>
                  </div>

                  <div style={styles.fileSize}>
                    {uploadedFileMeta?.sizeBytes
                      ? formatMB(uploadedFileMeta.sizeBytes)
                      : ""}
                  </div>
                </div>
              )}

              <div style={styles.uploadStatusContainer}>
                {isUploading && pct !== null && (
                  <div style={styles.loadingBarContainer}>
                    <div style={{ ...styles.loadingBar, width: `${pct}%` }} />
                  </div>
                )}
                <div style={styles.uploadStatus}>
                  {pct !== null ? ` ${pct}%` : ""}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div style={styles.formSection} className="hsFormWrap">
          <div ref={formHostRef} />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    padding: 20,
    background: "transparent",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    maxWidth: 720,
    minHeight: 400,
    margin: "0 auto",
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 24,
  },
  promptHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  uploadSection: {
    marginBottom: 24,
  },
  formSection: { borderTop: "1px solid #e5e7eb", paddingTop: 24 },
  prompt: { marginBottom: 12 },
  promptLabel: {
    fontFamily: "Inter Tight",
    fontSize: 18,
    color: "#515152",
    fontWeight: 400,
    lineHeight: 1.2,
    marginBottom: 6,
    textAlign: "left",
    paddingBottom: 4,
  },
  promptMaxMB: {
    fontSize: 18,
    color: "#515152",
    lineHeight: 1.3,
    fontFamily: "Inter",
    fontWeight: 400,
    letterSpacing: -0.18,
    whiteSpace: "nowrap",
  },
  promptQuestion: {
    fontFamily: "Inter Tight",
    color: "#181819",
    fontSize: 20,
    fontWeight: 450,
    lineHeight: 1.3,
    textAlign: "left",
  },
  uploadBox: {
    border: "1px dashed #A594FF",
    borderRadius: 10,
    padding: 18,
    textAlign: "center",
    background: "rgba(242, 241, 255, 0.50)",
  },
  uploadBtn: {
    border: 0,
    background: "transparent",
    color: "#7638fa",
    fontWeight: 400,
    fontSize: 16,
    fontFamily: "Inter",
    lineHeight: 1.5,
    padding: 0,
  },
  uploadBtnContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  uploadStatusContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  uploadStatus: {
    fontSize: 18,
    fontFamily: "Inter Tight",
    color: "#181819",
    fontWeight: 450,
    lineHeight: 1.3,
  },
  fileRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    padding: "10px 12px",
    textAlign: "left",
    border: "1px solid rgba(118, 56, 250, 0.20)",
    background: "rgba(255, 255, 255, 0.75)",
    minWidth: 0,
  },
  fileThumb: {
    width: 44,
    height: 32,
    borderRadius: 8,
    background: "#EDE9FE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  fileThumbInner: {
    width: 26,
    height: 18,
    borderRadius: 6,
    background: "rgba(118, 56, 250, 0.25)",
  },
  fileMeta: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  fileName: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#181819",
    fontWeight: 450,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "clamp(150px, 40vw, 320px)",
  },
  fileSize: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#515152",
    fontWeight: 400,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  fileReplaceBtnContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 2,
    minWidth: 0,
    overflow: "hidden",
  },
  fileReplaceBtn: {
    border: 0,
    background: "transparent",
    color: "#7638fa",
    fontWeight: 400,
    fontSize: 16,
    fontFamily: "Inter",
    lineHeight: 1.5,
    padding: 0,
    flexShrink: 0,
  },
  errorMessage: {
    color: "#f2545b",
    fontSize: 14,
    fontFamily: "Inter",
    fontWeight: 400,
    lineHeight: 1.5,
    marginBottom: 10,
    textAlign: "center",
  },

  loadingBarContainer: {
    width: "100%",
    height: 10,
    backgroundColor: "#f5f5f7",
    borderRadius: 100,
    overflow: "hidden",
  },
  loadingBar: {
    height: "100%",
    backgroundColor: "#7638FA",
    borderRadius: 100,
    transition: "width 0.3s ease",
  },
};
