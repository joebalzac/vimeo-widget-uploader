import { useCallback, useEffect, useRef, useState } from "react";
import { SearchBar } from "./SearchBar";

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
  isMobile: boolean;
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
  if (!desc) return { jobTitle: "", company: "" };
  const [jobTitle = "", company = ""] = desc.split(",").map((s) => s.trim());
  return { jobTitle, company };
};

const LIKED_KEY = (id: string) => `liked:${id}`;

const matchesSearch = (v: VimeoVideo, q: string) => {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    v.title.toLowerCase().includes(lower) ||
    v.description.toLowerCase().includes(lower)
  );
};

// ── spinner ───────────────────────────────────────────────────────────────────

const Spinner = () => (
  <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
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
            fontSize: 20,
            fontWeight: 450,
            color: liked ? "#FF3040" : "#FFFFFF",
            transition: "color 0.2s",
            lineHeight: 1.4,
            letterSpacing: -0.2,
            textTransform: "uppercase",
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

  const { jobTitle, company } = parseDescription(video.description);

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
            paddingBottom: "100%",
            background: "#000",
          }}
        >
          <iframe
            data-vimeo
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
            {(jobTitle || company) && (
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13,
                  fontWeight: 400,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                {[jobTitle, company].filter(Boolean).join(", ")}
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

// ── mobile hook ───────────────────────────────────────────────────────────────

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 540px)").matches,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 540px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return isMobile;
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
  const { jobTitle, company } = parseDescription(v.description);
  const isMobile = useIsMobile();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // send postMessage commands to Vimeo iframe
  const sendCmd = (cmd: "play" | "pause", value?: number) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ method: cmd, value }),
      "https://player.vimeo.com",
    );
  };

  useEffect(() => {
    if (!isMobile || !cardRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.intersectionRatio >= 0.7) {
          // pause all other iframes on the page first
          document.querySelectorAll("iframe[data-vimeo]").forEach((el) => {
            if (el !== iframeRef.current) {
              (el as HTMLIFrameElement).contentWindow?.postMessage(
                JSON.stringify({ method: "pause" }),
                "https://player.vimeo.com",
              );
            }
          });
          sendCmd("play");
        } else if (entry.intersectionRatio < 0.3) {
          sendCmd("pause");
          setTimeout(() => sendCmd("play", 0), 50);
          setTimeout(() => sendCmd("pause"), 100);
        }
        // between 0.3–0.7 → do nothing, let it keep playing
      },
      { threshold: [0.3, 0.7] },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <div
      ref={cardRef}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 8,
        overflow: "hidden",
        cursor: isMobile ? "default" : "pointer",
      }}
      onClick={isMobile ? undefined : onClick}
    >
      {/* thumbnail (desktop) / inline player (mobile) */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: isMobile ? "100%" : "56.25%",
          overflow: "hidden",
        }}
      >
        {isMobile ? (
          <iframe
            ref={iframeRef}
            data-vimeo
            src={`${v.embed_url}?autoplay=0&muted=1&title=0&byline=0&portrait=0&muted=1`}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={v.title}
          />
        ) : (
          <>
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
                  background: "#000000",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                background: "#000000",
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
          </>
        )}
      </div>

      <div style={{ padding: "12px 0px 0px", background: "#000000", borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}>
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
        {(jobTitle || company) && (
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: isMobile ? 16 : 18,
              fontWeight: 400,
              color: "rgba(255,255,255,0.60)",
              lineHeight: "140%",
              letterSpacing: "-0.18px",
            }}
          >
            {[jobTitle, company].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    </div>
  );
};
// ── main component ────────────────────────────────────────────────────────────

const VimeoVideoGrid = ({ backendBase, perPage = 9, isMobile }: Props) => {
  const [videos, setVideos] = useState<VimeoVideo[]>([]);
  const allVideos = useRef<VimeoVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [active, setActive] = useState<VimeoVideo | null>(null);

  const [isSticky, setIsSticky] = useState(true);

  const base = backendBase.replace(/\/$/, "");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${base}/api/vimeo/folder-videos?page=1&per_page=100`,
      );
      const data = await res.json();
      allVideos.current = data.videos ?? [];
      setHasMore(allVideos.current.length > perPage);
      setVideos(allVideos.current.slice(0, perPage));
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, [base, perPage]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const filtered = allVideos.current.filter((v) =>
      matchesSearch(v, searchQuery),
    );
    setVideos(filtered.slice(0, perPage));
    setHasMore(filtered.length > perPage);
  }, [searchQuery, perPage]);

  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => setIsSticky(entries[0].isIntersecting),
      { threshold: 0 },
    );
    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        isSticky={isSticky}
        isMobile={isMobile}
      />
      <div style={{ marginTop: 64, background: "transparent" }}>
        <style>{`
        .vg-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 64px;
          
        }
        @media (max-width: 900px) {
          .vg-grid { grid-template-columns: repeat(2, 1fr); align-items: start; }
        }
        @media (max-width: 540px) {
          .vg-grid { grid-template-columns: 1fr; align-items: start; gap: 24px; }
        }
      `}</style>

        <div
          style={{
            maxWidth: 1440,
            margin: "0 auto",
          }}
        >
          {loading ? (
            <Spinner />
          ) : error ? (
            <div
              style={{
                textAlign: "center",
                padding: 32,
                borderRadius: 12,
                border: "1px solid rgba(255,48,64,0.2)",
                color: "#FF3040",
              }}
            >
              <strong>Failed to load videos.</strong>

              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {error}
              </span>

              <button
                onClick={() => {
                  loadAll();
                }}
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
              ref={gridRef}
            >
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

              {hasMore && (
                <button
                  onClick={() => {
                    const next = videos.length + perPage;
                    const filtered = allVideos.current.filter((v) =>
                      matchesSearch(v, searchQuery),
                    );
                    setVideos(filtered.slice(0, next));
                    setHasMore(filtered.length > next);
                  }}
                  style={{
                    marginTop: 64,
                    padding: "12px 24px",
                    background: "#ffffff",
                    color: "#181819",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 16,
                    fontWeight: 450,
                    lineHeight: 1.5,
                    textAlign: "center",
                    letterSpacing: "-0.16px",
                    border: "none",
                  }}
                >
                  Load more
                </button>
              )}

              {!hasMore && videos.length > 0 && (
                <p
                  style={{
                    textAlign: "center",
                    marginTop: 40,
                    fontFamily: "Inter, sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  All videos loaded
                </p>
              )}
            </div>
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
    </div>
  );
};

export default VimeoVideoGrid;
