import VimeoVideoGrid from "./VimeoVideoGrid";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(VimeoVideoGrid, {
  name: "Vimeo Video Grid",
  description:
    "Displays all videos from a Vimeo folder in a paginated grid with lightbox playback.",
  group: "Media",

  props: {
    backendBase: props.Text({
      name: "Backend base URL",
      defaultValue: "https://upload-vimeo-server.vercel.app",
      tooltip:
        "Base URL for your backend that exposes /api/vimeo/folder-videos.",
    }),

    perPage: props.Number({
      name: "Videos per page",
      defaultValue: 12,
      min: 3,
      max: 48,
      tooltip: "How many videos to show per page.",
    }),
  },
});
