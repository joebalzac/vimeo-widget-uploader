type Props = {
  value: string;
  onChange: (val: string) => void;
};

export const SearchBar = ({ value, onChange }: Props) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Search videos"
    style={{
      width: "100%",
      maxWidth: 1440,
      padding: 12,
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.05)",
    }}
  />
);
