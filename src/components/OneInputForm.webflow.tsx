/**
 * OneInputForm.webflow.tsx
 *
 * Webflow Designer component wrapper using @webflow/react.
 * Registers OneInputForm as a Designer Extension component
 * with configurable props editable directly in the Webflow canvas.
 */

import OneInputForm from "./OneInputForm";
import { props } from "@webflow/data-types";
import { declareComponent } from "@webflow/react";

export default declareComponent(OneInputForm, {
  name: "One Input Form",
  description:
    "An invitation-code gate. Users enter a VIP code (format: ELISEVIP-XXXXX) and are redirected to /beyond/registration?coupon=<code> on success, or shown an inline error on failure.",
  group: "Forms",

  props: {
    className: props.Text({
      name: "CSS class",
      defaultValue: "",
      tooltip: "Optional extra CSS class to apply to the form wrapper.",
    }),
  },
});
