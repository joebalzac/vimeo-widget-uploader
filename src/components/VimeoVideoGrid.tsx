import { useCallback, useEffect, useState } from "react";

// ── types ────────────────────────────────────────────────────────────────────

type VimeoVideo = {
  id: string;
  title: string;
  duration: number;
  created_time: string;
  thumbnail: string;
  embed_url: string;
  description: string;
};

type Props = {
  backendBase: string;
  perPage?: number;
  heading?: string;
};

// ── helpers ───────────────────────────────────────────────────────────────────

const fmtDuration = (secs: number) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const fmtDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const parseDescription = (desc: string) => {
  if (!desc) return { name: "", jobTitle: "", company: "" };
  const [name = "", jobTitle = "", company = ""] = desc.split("|").map(s => s.trim());
  return { name, jobTitle, company };
};

// ── spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid #ede9fe",
        borderTop: "3px solid #7638fa",
        borderRadius: "50%",
        animation: "vg-spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes vg-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── play icon ─────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
    <circle cx="22" cy="22" r="22" fill="rgba(255,255,255,0.92)" />
    <polygon points="17,13 35,22 17,31" fill="#7638FA" />
  </svg>
);

// ── lightbox ──────────────────────────────────────────────────────────────────

const Lightbox = ({ video, onClose }: { video: VimeoVideo; onClose: () => void }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const { name, jobTitle, company } = parseDescription(video.description);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(24,24,25,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 840,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            padding: 0,
          }}
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="#515152" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000" }}>
          <iframe
            src={`${video.embed_url}?autoplay=1&title=0&byline=0&portrait=0`}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontFamily: "Inter Tight, Inter, sans-serif", fontSize: 16, fontWeight: 500, color: "#181819" }}>
              {video.title}
            </div>
            {name && (
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: "#181819", marginTop: 2 }}>
                {name}
              </div>
            )}
            {(jobTitle || company) && (
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#515152" }}>
                {[jobTitle, company].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#515152", whiteSpace: "nowrap" }}>
            {fmtDate(video.created_time)}
            {video.duration ? ` · ${fmtDuration(video.duration)}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

// ── video card ────────────────────────────────────────────────────────────────

const VideoCard = ({ v, onClick }: { v: VimeoVideo; onClick: () => void }) => {
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { name, jobTitle, company } = parseDescription(v.description);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Play ${v.title}`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
        textAlign: "left",
        width: "100%",
        boxShadow: hovered ? "0 8px 24px rgba(118,56,250,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: "#ede9fe", overflow: "hidden" }}>
        {!imgErr && v.thumbnail ? (
          <img
            src={v.thumbnail}
            alt={v.title}
            onError={() => setImgErr(true)}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#ede9fe 0%,#c4b5fd 100%)" }} />
        )}

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(118,56,250,0.12)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <PlayIcon />
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            background: "rgba(24,24,25,0.75)",
            color: "#fff",
            fontFamily: "Inter, sans-serif",
            fontSize: 12,
            fontWeight: 500,
            padding: "2px 7px",
            borderRadius: 6,
          }}
        >
          {fmtDuration(v.duration)}
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <div
          style={{
            fontFamily: "Inter Tight, Inter, sans-serif",
            fontSize: 15,
            fontWeight: 500,
            color: "#181819",
            lineHeight: 1.35,
            marginBottom: 6,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {v.title}
        </div>

        {name && (
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 500, color: "#181819" }}>
            {name}
          </div>
        )}
        {(jobTitle || company) && (
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#515152", marginBottom: 4 }}>
            {[jobTitle, company].filter(Boolean).join(" · ")}
          </div>
        )}

        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#515152" }}>
          {fmtDate(v.created_time)}
        </div>
      </div>
    </button>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const VimeoVideoGrid = ({ backendBase, perPage = 12, heading = "Customer Stories" }: Props) => {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState<VimeoVideo | null>(null);

  const base = backendBase.replace(/\/$/, "");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${base}/api/vimeo/folder-videos?page=${p}&per_page=${perPage}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideos(data.videos ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [base, perPage]);

  useEffect(() => { load(page); }, [page, load]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ padding: 20, background: "transparent" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "Inter Tight, Inter, sans-serif",
            fontSize: 32,
            fontWeight: 600,
            color: "#181819",
            margin: "0 0 4px",
          }}
        >
          {heading}
        </h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 15, color: "#515152", margin: "0 0 32px" }}>
          {total > 0 ? `${total} video${total !== 1 ? "s" : ""}` : ""}
        </p>

        {loading ? (
          <Spinner />
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              background: "#fff1f2",
              borderRadius: 12,
              border: "1px solid #fecdd3",
              color: "#be123c",
            }}
          >
            <strong>Failed to load videos.</strong>
            <br />
            <span style={{ fontSize: 13, color: "#515152" }}>{error}</span>
            <br />
            <button
              onClick={() => load(page)}
              style={{
                marginTop: 12,
                padding: "8px 20px",
                background: "#7638fa",
                color: "#fff",
                border: 0,
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
                fontSize: 14,
              }}
            >
              Retry
            </button>
          </div>
        ) : videos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#515152" }}>No videos found.</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 24,
              }}
            >
              {videos.map(v => (
                <VideoCard key={v.id} v={v} onClick={() => setActive(v)} />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 40 }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{
                    padding: "8px 20px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#7638fa",
                    fontWeight: 500,
                    opacity: page === 1 ? 0.4 : 1,
                  }}
                >
                  ← Prev
                </button>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "#515152" }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{
                    padding: "8px 20px",
                    background: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    cursor: page === totalPages ? "not-allowed" : "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "#7638fa",
                    fontWeight: 500,
                    opacity: page === totalPages ? 0.4 : 1,
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {active && <Lightbox video={active} onClose={() => setActive(null)} />}
    </div>
  );
};

export default VimeoVideoGrid;