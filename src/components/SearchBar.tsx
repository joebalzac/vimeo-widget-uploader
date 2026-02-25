type Props = {
  value: string;
  onChange: (val: string) => void;
  isSticky: boolean;
};

export const SearchBar = ({ value, onChange, isSticky }: Props) => (
  <div
    style={{
      position: isSticky ? "sticky" : "relative",
      top: 64,
      zIndex: 100,
      display: "flex",
      justifyContent: "center",
      padding: "12px 20px",
      background: "transparent",
      backdropFilter: isSticky ? "blur(12px)" : "none",
      WebkitBackdropFilter: isSticky ? "blur(12px)" : "none",
      transition: "background 0.3s ease",
    }}
  >
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
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
        placeholder="Search by name or description"
        style={{
          width: "100%",
          borderRadius: 8,
          paddingLeft: 36,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "#fafafb",
          fontSize: 14,
          fontFamily: "Inter, sans-serif",
        }}
      />
    </div>
  </div>
);
