import Gen2Crm from "./Gen2Crm";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(Gen2Crm, {
  name: "Gen2 — EliseCRM",
  description:
    "Heading + subtitle over a CRM window on a lilac gradient stage. Loops while in view: inbound message, typing dots, then the AI reply fades in word by word.",
  group: "Gen2",

  props: {
    heading: props.Text({ name: "Heading", defaultValue: "EliseCRM Takes the Work Off Your Team" }),
    subtitle: props.Text({ name: "Subtitle", defaultValue: "Improve team retention as much as 50% with a CRM built around AI." }),
  },
});
