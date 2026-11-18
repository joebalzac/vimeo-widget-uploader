import ApolloShowcase, { DEFAULT_CARD_COPY } from "./ApolloShowcase";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

type StartTab = "Leasing Agents" | "Managers" | "Executives";

interface AdapterProps {
  heading?: string;
  startTab?: StartTab;
  agentsTitle?: string;
  agentsSubtitle?: string;
  managersTitle?: string;
  managersSubtitle?: string;
  execTitle?: string;
  execSubtitle?: string;
}

function ApolloShowcaseAdapter(p: AdapterProps) {
  const pick = (v: string | undefined, d: string) => (v?.trim() ? v : d);
  const [a, m, e] = DEFAULT_CARD_COPY;
  return (
    <ApolloShowcase
      heading={p.heading}
      startTab={p.startTab}
      cardCopy={[
        { title: pick(p.agentsTitle, a.title), subtitle: pick(p.agentsSubtitle, a.subtitle) },
        { title: pick(p.managersTitle, m.title), subtitle: pick(p.managersSubtitle, m.subtitle) },
        { title: pick(p.execTitle, e.title), subtitle: pick(p.execSubtitle, e.subtitle) },
      ]}
    />
  );
}

export default declareComponent(ApolloShowcaseAdapter, {
  name: "Tour Intelligence — Ask Apollo",
  description:
    "Apollo showcase: Leasing Agents / Managers / Executives tabs auto-cycle through animated conversations. The card title and subtitle change with the tab. Clear the heading to use a separate Section Heading instead.",
  group: "Tour Intelligence",

  props: {
    heading: props.Text({
      name: "Heading",
      defaultValue: "Ask Apollo Anything About Your Tours",
      tooltip: "Shown left of the tabs. Leave empty to right-align the tabs and use a separate Section Heading.",
    }),
    startTab: props.Variant({
      name: "Start Tab",
      options: ["Leasing Agents", "Managers", "Executives"],
      defaultValue: "Leasing Agents",
      tooltip: "Which tab shows first. The auto-cycle continues from there.",
    }),
    agentsTitle: props.Text({ name: "Leasing Agents — Card Title", defaultValue: DEFAULT_CARD_COPY[0].title }),
    agentsSubtitle: props.Text({ name: "Leasing Agents — Card Subtitle", defaultValue: DEFAULT_CARD_COPY[0].subtitle }),
    managersTitle: props.Text({ name: "Managers — Card Title", defaultValue: DEFAULT_CARD_COPY[1].title }),
    managersSubtitle: props.Text({ name: "Managers — Card Subtitle", defaultValue: DEFAULT_CARD_COPY[1].subtitle }),
    execTitle: props.Text({ name: "Executives — Card Title", defaultValue: DEFAULT_CARD_COPY[2].title }),
    execSubtitle: props.Text({ name: "Executives — Card Subtitle", defaultValue: DEFAULT_CARD_COPY[2].subtitle }),
  },
});
