import GatedVimeoForm from "./GatedVimeoForm";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(GatedVimeoForm, {
  name: "Gated Vimeo Form",
  description:
    "Gated Vimeo player with a 2-step HubSpot form. Bind Vimeo ID from the CMS — HubSpot and preview length are handled in code.",
  group: "Forms",

  props: {
    vimeoId: props.Text({
      name: "Vimeo ID",
      defaultValue: "",
      tooltip:
        "Bind this from the CMS. Numeric Vimeo ID, or a full vimeo.com / player URL (include h= for unlisted videos).",
    }),
  },
});
