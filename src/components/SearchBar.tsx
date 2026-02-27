import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 768px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
};

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export const SearchBar = ({ value, onChange }: Props) => {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        position: "sticky",
        top: isMobile ? 0 : 56,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        padding: 20,
        background: "#000000",
        backdropFilter: "blur(12px)",
        transition: "top 0.2s ease",
      }}
    >
      <div
        style={{
          padding: "12px 20px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "transparent",
          display: "flex",
          alignItems: "center",
          position: "relative",
          width: "100%",
          maxWidth: 500,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          style={{ position: "absolute", left: 12, flexShrink: 0 }}
        >
          <circle
            cx="7.68333"
            cy="7.68333"
            r="6.93333"
            stroke="white"
            strokeWidth="1.5"
          />
          <path
            d="M13.0171 13.0166L16.7504 16.7499"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by name..."
          style={{
            width: "100%",
            paddingLeft: 36,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#fafafb",
            fontSize: 18,
            fontFamily: "Inter, sans-serif",
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: -0.18,
          }}
        />
      </div>
    </div>
  );
};
