import "./OfficeLocations.css";

export interface OfficeLocation {
  /** City / office name, e.g. "San Francisco". */
  city: string;
  /** First address line, e.g. "55 2nd Street". */
  addressLine1?: string;
  /** Second address line, e.g. "San Francisco, CA 94105". */
  addressLine2?: string;
  /** Destination for the "View Roles" link. */
  href?: string;
  /** Link label. Defaults to "View Roles". */
  ctaLabel?: string;
  /** Optional background image. When set, the cell renders as a photo card with a dark overlay. */
  imageSrc?: string;
}

export interface OfficeLocationsProps {
  eyebrow?: string;
  heading?: string;
  items?: OfficeLocation[];
  /** Max cells per row before wrapping to the next row. Default 3 (Figma). */
  perRow?: number;
}

// Images are supplied per-instance (an `imageSrc` URL); when set, the cell
// reveals the photo + dark overlay on hover.
const PLACEHOLDER_ITEMS: OfficeLocation[] = [
  { city: "San Francisco", addressLine1: "55 2nd Street", addressLine2: "San Francisco, CA 94105" },
  { city: "New York City", addressLine1: "55 2nd Street", addressLine2: "San Francisco, CA 94105" },
  { city: "Chicago", addressLine1: "55 2nd Street", addressLine2: "San Francisco, CA 94105" },
  { city: "Boston", addressLine1: "55 2nd Street", addressLine2: "San Francisco, CA 94105" },
  { city: "Toronto", addressLine1: "55 2nd Street", addressLine2: "San Francisco, CA 94105" },
];

function PinIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 4.418-8 12-8 12s-8-7.582-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

function LocationCell({ item }: { item: OfficeLocation }) {
  const isImage = !!item.imageSrc;
  return (
    <div className={`ol__cell${isImage ? " ol__cell--image" : ""}`}>
      {isImage && (
        <>
          <div
            className="ol__cell-bg"
            style={{ backgroundImage: `url(${item.imageSrc})` }}
            aria-hidden="true"
          />
          <div className="ol__cell-overlay" aria-hidden="true" />
        </>
      )}
      <div className="ol__cell-inner">
        <div className="ol__cell-top">
          <div className="ol__cell-icon">
            <PinIcon />
          </div>
          <div className="ol__cell-text">
            <p className="ol__cell-city">{item.city}</p>
            {(item.addressLine1 || item.addressLine2) && (
              <div className="ol__cell-address">
                {item.addressLine1 && <p>{item.addressLine1}</p>}
                {item.addressLine2 && <p>{item.addressLine2}</p>}
              </div>
            )}
          </div>
        </div>
        <a className="ol__cta" href={item.href || "#"}>
          <span>{item.ctaLabel || "View Roles"}</span>
          <ArrowIcon />
        </a>
      </div>
    </div>
  );
}

export default function OfficeLocations({
  eyebrow = "Built by people from",
  heading = "In Person, By Design",
  items = PLACEHOLDER_ITEMS,
  perRow = 3,
}: OfficeLocationsProps) {
  // Chunk into rows of `perRow`, but put the partial (remainder) row first so
  // for 5 items you get a 2 + 3 layout: the two wide rectangles on top and the
  // three squares on the bottom. Each row's cells are equal-width (flex: 1).
  const rows: OfficeLocation[][] = [];
  const remainder = items.length % perRow;
  let i = 0;
  if (remainder) {
    rows.push(items.slice(0, remainder));
    i = remainder;
  }
  for (; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow));
  }

  return (
    <section className="ol">
      <div className="ol__header">
        <div className="ol__eyebrow">
          <span className="ol__eyebrow-dot" aria-hidden="true" />
          <span>{eyebrow}</span>
        </div>
        <h2 className="ol__heading">{heading}</h2>
      </div>

      <div className="ol__grid">
        {rows.map((row, r) => (
          <div className="ol__row" key={r}>
            {row.map((item, c) => (
              <LocationCell item={item} key={c} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
