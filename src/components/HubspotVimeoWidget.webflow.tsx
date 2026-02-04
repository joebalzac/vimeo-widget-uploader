// HubSpotVimeoWidget.webflow.tsx
import HubSpotVimeoWidget from "./HubspotVimeoWidget";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(HubSpotVimeoWidget, {
  name: "HubSpot + Vimeo Upload Widget",
  description:
    "Embeds a HubSpot form and requires a Vimeo (tus) upload before submission.",
  group: "Forms",

  props: {
    // IMPORTANT: set backend base to your production API origin (no trailing path needed)
    backendBase: props.Text({
      name: "Backend base URL",
      defaultValue: "https://upload-vimeo-server.vercel.app/", // <- change to your production backend origin
      tooltip:
        "Base URL for your backend that exposes /api/vimeo/create-upload and /api/vimeo/record-upload.",
    }),

    // Provide the HubSpot portal & form defaults so the shared component renders without manual prop entry
    portalId: props.Text({
      name: "HubSpot Portal ID",
      defaultValue: "45321630", // <- your portal id
      tooltip: "Your HubSpot portalId (string).",
    }),

    formId: props.Text({
      name: "HubSpot Form ID",
      defaultValue: "5da905fc-5b70-47ed-9f71-e54d166618ff", // <- your form id
      tooltip: "Your HubSpot formId (string).",
    }),

    region: props.Text({
      name: "HubSpot Region",
      defaultValue: "na1",
      tooltip:
        'HubSpot region for the embedded form script (e.g. "na1", "eu1").',
    }),

    questionText: props.Text({
      name: "Question prompt",
      defaultValue:
        "“How has working with EliseAI improved your work experience?”",
      tooltip: "Shown above the upload button.",
    }),

    maxMB: props.Number({
      name: "Max upload size (MB)",
      defaultValue: 100,
      min: 1,
      max: 2048,
      tooltip: "Maximum allowed upload size before blocking upload.",
    }),
  },
});
