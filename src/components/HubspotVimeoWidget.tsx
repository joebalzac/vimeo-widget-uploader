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
    [portalId, formId]
  );

  const base = useMemo(
    () => (backendBase || "").replace(/\/$/, ""),
    [backendBase]
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

  const detachStickySyncRef = useRef<null | (() => void)>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    videoRef.current = video;
  }, [video]);

  useEffect(() => {
    pendingTokenRef.current = pendingToken;
  }, [pendingToken]);

  function setSubmitEnabled(enabled: boolean) {
    const formEl = formHostRef.current?.querySelector(
      "form"
    ) as HTMLFormElement | null;
    const submit = formEl?.querySelector<HTMLInputElement>(
      'input[type="submit"],button[type="submit"]'
    );
    if (submit) {
      submit.disabled = !enabled;
      submit.style.opacity = enabled ? "1" : "0.6";
      submit.style.cursor = enabled ? "pointer" : "not-allowed";
    }
  }

  // -------------------------
  // HubSpot hidden fields
  // -------------------------
  const VIMEO_URL_NAME = "vimeo_video_url";
  const VIMEO_ID_NAME = "vimeo_video_id";
  const PENDING_TOKEN_NAME = "pending_token"; // <-- ADD THIS FIELD IN HUBSPOT (hidden)

  function findFields(formEl: HTMLFormElement, name: string) {
    const nodes = Array.from(
      formEl.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)
    );
    if (nodes.length === 0) {
      const byId = formEl.querySelector<HTMLInputElement>(`#${name}`);
      if (byId) nodes.push(byId);
    }
    return nodes;
  }

  function ensureHiddenField(formEl: HTMLFormElement, name: string) {
    let nodes = Array.from(
      formEl.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)
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

    urlFields.forEach((f) => setFieldValueAndNotify(f, url));
    idFields.forEach((f) => setFieldValueAndNotify(f, id));

    // NEW: pending_token hidden field
    let tokenFields = findFields(formEl, PENDING_TOKEN_NAME);
    if (tokenFields.length === 0)
      tokenFields = ensureHiddenField(formEl, PENDING_TOKEN_NAME);

    tokenFields.forEach((f) => setFieldValueAndNotify(f, token));
  }

  function clearVideoFieldsOnForm() {
    const f = formHostRef.current?.querySelector(
      "form"
    ) as HTMLFormElement | null;
    if (!f) return;

    // clear video + token
    const oldToken = pendingTokenRef.current;
    pendingTokenRef.current = null;
    applyVideoToForm(f, null);
    pendingTokenRef.current = oldToken; // restore ref; state handles actual value
  }

  // HubSpot public submissions endpoint fallback (non-blocking)
  async function submitToHubspotApi(formEl: HTMLFormElement) {
    if (!portalId || !formId) return;

    try {
      const fd = new FormData(formEl);
      const fields: Array<{ name: string; value: any }> = [];

      for (const [k, v] of fd.entries()) {
        if (v == null || String(v).trim() === "") continue;
        fields.push({ name: k, value: String(v) });
      }

      const hubspotutk = (document.cookie || "")
        .split("; ")
        .find((c) => c.startsWith("hubspotutk="))
        ?.split("=")[1];

      const body: any = {
        fields,
        context: {
          hutk: hubspotutk || undefined,
          pageUri: window.location.href,
          pageName: document.title,
        },
      };

      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2500);

      const endpoint = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

      await fetch(endpoint, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }).catch(() => {});

      window.clearTimeout(timeout);
    } catch {}
  }

  // Confirm ONLY after HubSpot says “submitted successfully”
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

  function attachStickySync(formEl: HTMLFormElement) {
    let submitBtn: HTMLButtonElement | HTMLInputElement | null = null;

    const ensureUploadPresentOrBlock = (e?: Event) => {
      const v = videoRef.current;
      if (!v?.id) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
          // @ts-ignore
          e.stopImmediatePropagation?.();
        }
        alert("Please upload your video before submitting.");
        return false;
      }

      // ensure HS sees the latest values (INCLUDING pending_token)
      applyVideoToForm(formEl, v);
      return true;
    };

    const onSubmitCapture = (e: Event) => {
      const ok = ensureUploadPresentOrBlock(e);
      if (!ok) return;

      // DO NOT confirm here. Confirm only in onFormSubmitted.
      submitToHubspotApi(formEl).catch(() => {});
    };

    const onClickCapture = (e: Event) => {
      const ok = ensureUploadPresentOrBlock(e);
      if (!ok) return;

      // DO NOT confirm here. Confirm only in onFormSubmitted.
      submitToHubspotApi(formEl).catch(() => {});
    };

    formEl.addEventListener("submit", onSubmitCapture, true);

    submitBtn =
      formEl.querySelector<HTMLButtonElement>('button[type="submit"]') ||
      formEl.querySelector<HTMLInputElement>('input[type="submit"]');

    if (submitBtn) submitBtn.addEventListener("click", onClickCapture, true);

    const obs = new MutationObserver(() => {
      if (videoRef.current?.id) applyVideoToForm(formEl, videoRef.current);
    });
    obs.observe(formEl, { subtree: true, childList: true, attributes: true });

    return () => {
      formEl.removeEventListener("submit", onSubmitCapture, true);
      if (submitBtn)
        submitBtn.removeEventListener("click", onClickCapture, true);
      obs.disconnect();
    };
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
    if (submitted || isUploading) return;
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

    try {
      tusUploadRef.current?.abort(true);
    } catch {}
    tusUploadRef.current = null;

    setVideo(null);
    videoRef.current = null;
    setPendingToken(null);
    pendingTokenRef.current = null;
    clearVideoFieldsOnForm();

    setUploadedFileMeta({ name: file.name, sizeBytes: file.size });

    setSubmitEnabled(false);
    setIsUploading(true);
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
        setStatus(`Couldn’t start upload: ${text}`);
        return;
      }

      const data: CreateUploadResponse = await resp.json();

      if (!data.upload_link || !data.video_id || !data.pending_token) {
        setStatus(
          "Backend response missing upload_link/video_id/pending_token."
        );
        return;
      }

      setPendingToken(data.pending_token);
      pendingTokenRef.current = data.pending_token;

      if (!/^https:\/\//i.test(data.upload_link)) {
        setStatus(
          "Upload link returned by backend is not an absolute HTTPS URL."
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

      const f = formHostRef.current?.querySelector(
        "form"
      ) as HTMLFormElement | null;
      if (f) applyVideoToForm(f, v);

      setPct(null);
      setSubmitEnabled(true);
    } catch (e: any) {
      const message = String(e?.message || e);
      setStatus(`Upload failed: ${message}`);
      setSubmitEnabled(false);
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
        `script[src="${src}"]`
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
        const detachForForm = attachStickySync(f);

        if (videoRef.current?.id) applyVideoToForm(f, videoRef.current);
        setSubmitEnabled(!!videoRef.current?.id);

        const hostObs = new MutationObserver(() => {
          const newForm = host.querySelector("form") as HTMLFormElement | null;
          if (!newForm) return;

          try {
            detachForForm();
          } catch {}

          const newDetach = attachStickySync(newForm);
          detachStickySyncRef.current = () => {
            try {
              newDetach();
            } catch {}
            hostObs.disconnect();
          };

          if (videoRef.current?.id) applyVideoToForm(newForm, videoRef.current);
          setSubmitEnabled(!!videoRef.current?.id);
        });

        hostObs.observe(host, { childList: true, subtree: true });

        detachStickySyncRef.current = () => {
          try {
            detachForForm();
          } catch {}
          try {
            hostObs.disconnect();
          } catch {}
        };
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
          moveRenderedFormIntoHost();
        },

        onBeforeFormSubmit: (formEl: HTMLFormElement) => {
          const v = videoRef.current;
          if (!v?.id) {
            alert("Please upload your video before submitting.");
            return false;
          }

          // ensure HS sees hidden fields (including pending_token)
          applyVideoToForm(formEl, v);

          // DO NOT confirm here (only after successful submit)
          submitToHubspotApi(formEl).catch(() => {});
          return true;
        },

        onFormSubmitted: async () => {
          setSubmitted(true);
          await confirmUploadAfterSubmit(); // <- THIS is the key
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
            "[HubSpot] Timeout waiting for window.hbspt.forms.create"
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
      detachStickySyncRef.current?.();
      detachStickySyncRef.current = null;
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
                  {/* ... unchanged UI ... */}
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
                  {/* ... unchanged UI ... */}
                  <div style={styles.fileSize}>
                    {uploadedFileMeta?.sizeBytes
                      ? formatMB(uploadedFileMeta.sizeBytes)
                      : ""}
                  </div>
                </div>
              )}

              <div style={styles.uploadStatus}>
                {status}
                {pct !== null ? ` (${pct}%)` : ""}
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
  // (unchanged — keep your styles object as-is)
  wrap: {
    padding: 20,
    background: "transparent",
    display: "flex",
    justifyContent: "center",
  },
  card: {
    maxWidth: 720,
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
  uploadSection: { marginBottom: 24 },
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
  uploadStatus: {
    marginTop: 10,
    fontSize: 13,
    color: "#475569",
    minHeight: 18,
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
  fileSize: {
    fontFamily: "Inter",
    fontSize: 14,
    color: "#515152",
    fontWeight: 400,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
};
