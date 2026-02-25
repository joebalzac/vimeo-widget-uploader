type Props = {
  value: string;
  onChange: (val: string) => void;
};

export const SearchBar = ({ value, onChange }: Props) => (
  <div
    style={{
      padding: 12,
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.05)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      top: 0,
      zIndex: 1000,
      gap: 0,
      maxWidth: 500,
      margin: "0 auto",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      style={{
        position: "absolute",
        left: 12,
        top: 12,
      }}
    >
      <circle
        cx="7.68333"
        cy="7.68333"
        r="6.93333"
        stroke="white"
        stroke-width="1.5"
      />
      <path
        d="M13.0171 13.0166L16.7504 16.7499"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search by name or description"
      style={{
        width: "100%",
        height: "100%",
        maxWidth: 500,
        borderRadius: 8,
        paddingLeft: 32,
        position: "relative",
        left: 0,
        right: 0,
        background: "transparent",
        border: "none",
        color: "#fafafb",
      }}
      onFocus={(e) => (e.target.style.outline = "none")}
      onBlur={(e) => (e.target.style.outline = "none")}
    />
  </div>
);
