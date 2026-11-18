import "./shared.css";

/**
 * "NEW" tag: Plex Mono 12, 25 tall, no fill, 1px #DDDCDA stroke, #6B4FFF text. A soft
 * conic streak (#C1BAFE → #99CEFF) travels around the border every 2.8s (Attio style).
 */
export default function NewTag({ label = "NEW" }: { label?: string }) {
  return (
    <span className="g2-new">
      <span className="g2-new__beam" aria-hidden />
      {label}
    </span>
  );
}
