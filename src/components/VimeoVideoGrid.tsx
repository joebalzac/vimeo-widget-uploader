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
  if (!desc) return { company: "", jobTitle: "" };
  const [company = "", jobTitle = ""] = desc.split(",").map((s) => s.trim());
  return { company, jobTitle };
};

const LIKED_KEY = (id: string) => `liked:${id}`;

// ── spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
    <div
      style={{
        width: 36,
        height: 36,
        border: "3px solid rgba(255,255,255,0.1)",
        borderTop: "3px solid #7638fa",
        borderRadius: "50%",
        animation: "vg-spin 0.8s linear infinite",
      }}
    />
    <style>{`@keyframes vg-spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── heart button ──────────────────────────────────────────────────────────────

const HeartButton = ({
  videoId,
  backendBase,
}: {
  videoId: string;
  backendBase: string;
}) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const wasLiked = localStorage.getItem(LIKED_KEY(videoId)) === "1";
    setLiked(wasLiked);

    const fetchCount = async () => {
      try {
        const res = await fetch(
          `${backendBase}/api/vimeo/likes?video_id=${videoId}`,
        );
        const data = await res.json();
        setCount(data.count ?? 0);
      } catch {}
    };
    fetchCount();
  }, [videoId, backendBase]);

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);

    const next = !liked;
    setLiked(next);
    setCount((c) => (c ?? 0) + (next ? 1 : -1));
    localStorage.setItem(LIKED_KEY(videoId), next ? "1" : "0");

    try {
      await fetch(`${backendBase}/api/vimeo/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: videoId,
          action: next ? "like" : "unlike",
        }),
      });
    } catch {
      setLiked(!next);
      setCount((c) => (c ?? 0) + (next ? -1 : 1));
      localStorage.setItem(LIKED_KEY(videoId), next ? "0" : "1");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={liked ? "Unlike" : "Like"}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        opacity: loading ? 0.6 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="29"
        height="24"
        viewBox="0 0 29 24"
        fill="none"
        style={{ transition: "fill 0.2s", flexShrink: 0 }}
      >
        <path
          d="M20.4756 0.786133C21.6118 0.786133 22.7649 1.07212 23.8389 1.67676L24.0527 1.80273C27.5069 3.90607 28.7197 8.60116 26.7021 12.2871C26.3049 13.0127 25.5536 13.9252 24.5566 14.9424C23.57 15.9491 22.3829 17.0177 21.1572 18.0547C19.3191 19.6099 17.4128 21.0775 15.9971 22.1338L14.7656 23.041C14.6082 23.1556 14.4215 23.2139 14.2324 23.2139C14.0431 23.2138 13.8567 23.1551 13.7002 23.041H13.6992C12.3311 22.0457 9.75902 20.1282 7.30859 18.0547C6.08309 17.0177 4.89675 15.949 3.91016 14.9424C2.91304 13.925 2.16094 13.0128 1.76367 12.2871C-0.254184 8.60121 0.958517 3.90611 4.41211 1.80273C5.5462 1.112 6.77755 0.786199 7.98926 0.786133C10.1161 0.786511 12.206 1.7892 13.6074 3.62695L14.2324 4.44727L14.8584 3.62695C16.2607 1.78819 18.3492 0.786136 20.4756 0.786133Z"
          fill={liked ? "#FF3040" : "none"}
          stroke={liked ? "#FF3040" : "white"}
          strokeWidth="1.57296"
        />
      </svg>
      {count !== null && (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 14,
            fontWeight: 400,
            color: liked ? "#FF3040" : "rgba(255,255,255,0.6)",
            transition: "color 0.2s",
            lineHeight: 1,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
};

// ── lightbox ──────────────────────────────────────────────────────────────────

const Lightbox = ({
  video,
  onClose,
  backendBase,
}: {
  video: VimeoVideo;
  onClose: () => void;
  backendBase: string;
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const { company, jobTitle } = parseDescription(video.description);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(24,24,25,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1a1b",
          borderRadius: 16,
          width: "100%",
          maxWidth: 840,
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 10,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
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
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            background: "#000",
          }}
        >
          <iframe
            src={`${video.embed_url}?autoplay=1&title=0&byline=0&portrait=0`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>

        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "Inter Tight, Inter, sans-serif",
                fontSize: 16,
                fontWeight: 500,
                color: "#FAFAFB",
                marginBottom: 4,
              }}
            >
              {video.title}
            </div>
            {(company || jobTitle) && (
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {[company, jobTitle].filter(Boolean).join(", ")}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexShrink: 0,
            }}
          >
            <HeartButton videoId={video.id} backendBase={backendBase} />
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              {fmtDate(video.created_time)}
              {video.duration ? ` · ${fmtDuration(video.duration)}` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── video card ────────────────────────────────────────────────────────────────

const VideoCard = ({
  v,
  onClick,
  backendBase,
}: {
  v: VimeoVideo;
  onClick: () => void;
  backendBase: string;
}) => {
  const [imgErr, setImgErr] = useState(false);
  const { company, jobTitle } = parseDescription(v.description);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {/* thumbnail */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "56.25%",
          overflow: "hidden",
        }}
      >
        {!imgErr && v.thumbnail ? (
          <img
            src={v.thumbnail}
            alt={v.title}
            onError={() => setImgErr(true)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(135deg,#2d1f5e 0%,#1a1a2e 100%)",
            }}
          />
        )}
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

      {/* meta */}
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ marginBottom: 12 }} onClick={(e) => e.stopPropagation()}>
          <HeartButton videoId={v.id} backendBase={backendBase} />
        </div>

        <div
          style={{
            fontFamily: "Inter Tight, Inter, sans-serif",
            fontSize: 20,
            fontWeight: 450,
            color: "#FAFAFB",
            lineHeight: "140%",
            marginBottom: 2,
          }}
        >
          {v.title}
        </div>

        {(company || jobTitle) && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 18,
              fontWeight: 400,
              color: "rgba(255,255,255,0.60)",
              lineHeight: "140%",
              letterSpacing: "-0.18px",
            }}
          >
            {[company, jobTitle].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const VimeoVideoGrid = ({ backendBase, perPage = 12 }: Props) => {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState<VimeoVideo | null>(null);

  const base = backendBase.replace(/\/$/, "");

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${base}/api/vimeo/folder-videos?page=${p}&per_page=${perPage}`,
        );
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
    },
    [base, perPage],
  );

  useEffect(() => {
    load(page);
  }, [page, load]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div style={{ padding: 20, background: "transparent" }}>
      <style>{`
        .vg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 64px;
        }
        @media (max-width: 900px) {
          .vg-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 540px) {
          .vg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div
            style={{
              textAlign: "center",
              padding: 32,
              background: "rgba(255,48,64,0.08)",
              borderRadius: 12,
              border: "1px solid rgba(255,48,64,0.2)",
              color: "#FF3040",
            }}
          >
            <strong>Failed to load videos.</strong>
            <br />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              {error}
            </span>
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
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
            No videos found.
          </p>
        ) : (
          <>
            <div className="vg-grid">
              {videos.map((v) => (
                <VideoCard
                  key={v.id}
                  v={v}
                  onClick={() => setActive(v)}
                  backendBase={base}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  marginTop: 40,
                }}
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    padding: "8px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
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
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    padding: "8px 20px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
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

      {active && (
        <Lightbox
          video={active}
          onClose={() => setActive(null)}
          backendBase={base}
        />
      )}
    </div>
  );
};

export default VimeoVideoGrid;
