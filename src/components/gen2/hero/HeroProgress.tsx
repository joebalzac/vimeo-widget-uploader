import spinner from "../../../assets/gen2/hero/progress-spinner.svg";

/**
 * "Elise is acting" state (handoff 02-hero; same look as Figma 692:175277 "Sending Reminder"):
 * a 12px gradient-ring spinner + Inter 14 (12 mobile) text in a purple → blue gradient.
 * Not a tag: on a card it stands in for all of the card's tags (Calendar: the time).
 */
export default function HeroProgress({ label }: { label: string }) {
  return (
    <span className="g2h-progress">
      <span className="g2h-progress__spin" aria-hidden>
        <img src={spinner} width={13.17} height={13.17} alt="" />
      </span>
      <span className="g2h-progress__text">{label}</span>
    </span>
  );
}
