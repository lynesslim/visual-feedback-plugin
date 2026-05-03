import { mountWidget } from "./widget";

const script =
  (document.currentScript as HTMLScriptElement | null) ??
  document.querySelector<HTMLScriptElement>(
    "script[data-af-api][data-af-key], script[data-api][data-key]",
  );

if (script) {
  mountWidget(script);
} else {
  console.error(
    "[AgencyFeedback] Add agency-feedback.js with data-api and data-key on the script tag.",
  );
}
