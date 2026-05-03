import { mountWidget } from "./widget";

const script =
  (document.currentScript as HTMLScriptElement | null) ??
  document.querySelector<HTMLScriptElement>(
    "script[data-af-api][data-af-project][data-af-key], script[data-api][data-project][data-key]",
  );

if (script) {
  mountWidget(script);
} else {
  console.error(
    "[AgencyFeedback] Add agency-feedback.js with data-project, data-api, and data-key on the script tag.",
  );
}
