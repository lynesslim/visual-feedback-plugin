"use strict";(()=>{function Se(){let t=location.pathname||"/";return`${t!=="/"&&t.endsWith("/")?t.slice(0,-1):t}${location.search}`}async function Te(t){let c=new URLSearchParams({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey,urlPath:Se(),includeResolved:"1"}),i=await fetch(`${t.apiBase}/api/public/feedback?${c}`,{method:"GET",headers:{Accept:"application/json"}});return i.ok?(await i.json()).feedback??[]:(console.error("[AgencyFeedback] GET failed",i.status),[])}async function ge(t,c){let i=new URLSearchParams({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey}),l=await fetch(`${t.apiBase}/api/public/feedback/${c}?${i}`,{headers:{Accept:"application/json"}});if(!l.ok)return null;let a=await l.json();return a.feedback?{feedback:a.feedback,comments:a.comments??[]}:null}async function Me(t,c){let i=await fetch(`${t.apiBase}/api/public/feedback`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey,selector:c.selector,coordinates:c.coordinates,commentText:c.commentText,imageUrls:c.imageUrls,author:c.author,priority:c.priority,urlPath:Se(),metadata:c.metadata})});if(!i.ok){let l=`HTTP ${i.status}`;try{let a=await i.json();a.error&&(l=a.error)}catch{}return{ok:!1,error:l}}return{ok:!0}}async function je(t,c,i,l,a){let u=await fetch(`${t.apiBase}/api/public/feedback/${c}/comments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey,authorType:i,body:l,imageUrls:a})});if(!u.ok){let h="Could not post comment";try{let w=await u.json();w.error&&(h=w.error)}catch{}return{ok:!1,error:h}}return{ok:!0}}async function Pe(t,c){let i=new FormData;i.set("projectSlug",t.projectSlug),i.set("embedPublicKey",t.embedPublicKey),i.set("file",c);let l=await fetch(`${t.apiBase}/api/public/feedback/upload`,{method:"POST",body:i});if(!l.ok){let u="Upload failed";try{let h=await l.json();h.error&&(u=h.error)}catch{}return{ok:!1,error:u}}let a=await l.json();return a.url?{ok:!0,url:a.url}:{ok:!1,error:"Upload failed"}}async function He(t,c){let i=await fetch(`${t.apiBase}/api/public/feedback/${c}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey,status:"resolved"})});if(!i.ok){let l="Could not update";try{let a=await i.json();a.error&&(l=a.error)}catch{}return{ok:!1,error:l}}return{ok:!0}}async function Fe(t,c){let i=await fetch(`${t.apiBase}/api/public/feedback/verify-pin`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({projectSlug:t.projectSlug,embedPublicKey:t.embedPublicKey,passcode:c})});if(!i.ok){let l="Invalid code";try{let a=await i.json();a.error&&(l=a.error)}catch{}return{ok:!1,error:l}}return{ok:!0}}function tt(t){return t.replace(/\/+$/,"")}function Ae(t){let c=t.getAttribute("data-af-project")?.trim()||t.getAttribute("data-project")?.trim()||"",i=t.getAttribute("data-af-api")?.trim()||t.getAttribute("data-api")?.trim()||"",l=t.getAttribute("data-af-key")?.trim()||t.getAttribute("data-key")?.trim()||"";return!c||!i||!l?(console.error("[AgencyFeedback] Missing data-project, data-api, or data-key on script tag."),null):{apiBase:tt(i),projectSlug:c,embedPublicKey:l}}function rt(t,c){let i=[],l=c;for(;l&&l!==t;){let a=l.parentElement;if(!a)return[];let u=l.tagName.toLowerCase(),h=l,S=Array.from(a.children).filter(k=>k.tagName===h.tagName).indexOf(h)+1;i.unshift(`${u}:nth-of-type(${S})`),l=a}return l===t?i:[]}function ot(t){let c=t.trim();return c?`[data-id="${c.replace(/\\/g,"\\\\").replace(/"/g,'\\"')}"]`:""}function at(t){let c=t;for(;c&&c!==document.body;){if(c.getAttribute("data-id")?.trim())return c;c=c.parentElement}return null}function it(t){let c=[],i=t;for(;i&&i!==document.body;){let l=i.tagName.toLowerCase(),a=i.parentElement;if(!a)break;let u=i,w=Array.from(a.children).filter(S=>S.tagName===u.tagName).indexOf(u)+1;c.unshift(`${l}:nth-of-type(${w})`),i=a}return c.length?`body > ${c.join(" > ")}`:"body"}function qe(t){if(t===document.body||t===document.documentElement)return t.tagName.toLowerCase();let c=at(t);if(c){let i=c.getAttribute("data-id"),l=i?ot(i):"";if(l){let a=rt(c,t);return a.length?`${l} > ${a.join(" > ")}`:l}}return it(t)}var Be=`/*! tailwindcss v4.2.2 | MIT License | https://tailwindcss.com */
@layer properties;
@layer theme, base, components, utilities;
@layer theme {
  :root, :host {
    --font-sans: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
      "Courier New", monospace;
    --color-red-50: oklch(97.1% 0.013 17.38);
    --color-red-200: oklch(88.5% 0.062 18.334);
    --color-red-400: oklch(70.4% 0.191 22.216);
    --color-red-600: oklch(57.7% 0.245 27.325);
    --color-red-700: oklch(50.5% 0.213 27.518);
    --color-red-800: oklch(44.4% 0.177 26.899);
    --color-red-950: oklch(25.8% 0.092 26.042);
    --color-amber-50: oklch(98.7% 0.022 95.277);
    --color-amber-100: oklch(96.2% 0.059 95.617);
    --color-amber-200: oklch(92.4% 0.12 95.746);
    --color-amber-500: oklch(76.9% 0.188 70.08);
    --color-amber-600: oklch(66.6% 0.179 58.318);
    --color-amber-700: oklch(55.5% 0.163 48.998);
    --color-amber-900: oklch(41.4% 0.112 45.904);
    --color-emerald-50: oklch(97.9% 0.021 166.113);
    --color-emerald-100: oklch(95% 0.052 163.051);
    --color-emerald-200: oklch(90.5% 0.093 164.15);
    --color-emerald-600: oklch(59.6% 0.145 163.225);
    --color-emerald-700: oklch(50.8% 0.118 165.612);
    --color-emerald-800: oklch(43.2% 0.095 166.913);
    --color-emerald-900: oklch(37.8% 0.077 168.94);
    --color-sky-50: oklch(97.7% 0.013 236.62);
    --color-sky-100: oklch(95.1% 0.026 236.824);
    --color-sky-200: oklch(90.1% 0.058 230.902);
    --color-sky-500: oklch(68.5% 0.169 237.323);
    --color-sky-800: oklch(44.3% 0.11 240.79);
    --color-sky-900: oklch(39.1% 0.09 240.876);
    --color-zinc-50: oklch(98.5% 0 0);
    --color-zinc-100: oklch(96.7% 0.001 286.375);
    --color-zinc-200: oklch(92% 0.004 286.32);
    --color-zinc-300: oklch(87.1% 0.006 286.286);
    --color-zinc-400: oklch(70.5% 0.015 286.067);
    --color-zinc-500: oklch(55.2% 0.016 285.938);
    --color-zinc-600: oklch(44.2% 0.017 285.786);
    --color-zinc-700: oklch(37% 0.013 285.805);
    --color-zinc-800: oklch(27.4% 0.006 286.033);
    --color-zinc-900: oklch(21% 0.006 285.885);
    --color-zinc-950: oklch(14.1% 0.005 285.823);
    --color-white: #fff;
    --spacing: 0.25rem;
    --container-sm: 24rem;
    --container-md: 28rem;
    --container-lg: 32rem;
    --container-5xl: 64rem;
    --text-xs: 0.75rem;
    --text-xs--line-height: calc(1 / 0.75);
    --text-sm: 0.875rem;
    --text-sm--line-height: calc(1.25 / 0.875);
    --text-base: 1rem;
    --text-base--line-height: calc(1.5 / 1);
    --text-lg: 1.125rem;
    --text-lg--line-height: calc(1.75 / 1.125);
    --text-xl: 1.25rem;
    --text-xl--line-height: calc(1.75 / 1.25);
    --text-2xl: 1.5rem;
    --text-2xl--line-height: calc(2 / 1.5);
    --text-3xl: 1.875rem;
    --text-3xl--line-height: calc(2.25 / 1.875);
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --tracking-tight: -0.025em;
    --tracking-wide: 0.025em;
    --tracking-wider: 0.05em;
    --leading-tight: 1.25;
    --leading-snug: 1.375;
    --leading-relaxed: 1.625;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --default-transition-duration: 150ms;
    --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    --default-font-family: var(--font-sans);
    --default-mono-font-family: var(--font-mono);
  }
}
@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid;
  }
  html, :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    font-family: var(--default-font-family, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji");
    font-feature-settings: var(--default-font-feature-settings, normal);
    font-variation-settings: var(--default-font-variation-settings, normal);
    -webkit-tap-highlight-color: transparent;
  }
  hr {
    height: 0;
    color: inherit;
    border-top-width: 1px;
  }
  abbr:where([title]) {
    -webkit-text-decoration: underline dotted;
    text-decoration: underline dotted;
  }
  h1, h2, h3, h4, h5, h6 {
    font-size: inherit;
    font-weight: inherit;
  }
  a {
    color: inherit;
    -webkit-text-decoration: inherit;
    text-decoration: inherit;
  }
  b, strong {
    font-weight: bolder;
  }
  code, kbd, samp, pre {
    font-family: var(--default-mono-font-family, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace);
    font-feature-settings: var(--default-mono-font-feature-settings, normal);
    font-variation-settings: var(--default-mono-font-variation-settings, normal);
    font-size: 1em;
  }
  small {
    font-size: 80%;
  }
  sub, sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }
  sub {
    bottom: -0.25em;
  }
  sup {
    top: -0.5em;
  }
  table {
    text-indent: 0;
    border-color: inherit;
    border-collapse: collapse;
  }
  :-moz-focusring {
    outline: auto;
  }
  progress {
    vertical-align: baseline;
  }
  summary {
    display: list-item;
  }
  ol, ul, menu {
    list-style: none;
  }
  img, svg, video, canvas, audio, iframe, embed, object {
    display: block;
    vertical-align: middle;
  }
  img, video {
    max-width: 100%;
    height: auto;
  }
  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  :where(select:is([multiple], [size])) optgroup {
    font-weight: bolder;
  }
  :where(select:is([multiple], [size])) optgroup option {
    padding-inline-start: 20px;
  }
  ::file-selector-button {
    margin-inline-end: 4px;
  }
  ::placeholder {
    opacity: 1;
  }
  @supports (not (-webkit-appearance: -apple-pay-button))  or (contain-intrinsic-size: 1px) {
    ::placeholder {
      color: currentcolor;
      @supports (color: color-mix(in lab, red, red)) {
        color: color-mix(in oklab, currentcolor 50%, transparent);
      }
    }
  }
  textarea {
    resize: vertical;
  }
  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }
  ::-webkit-date-and-time-value {
    min-height: 1lh;
    text-align: inherit;
  }
  ::-webkit-datetime-edit {
    display: inline-flex;
  }
  ::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }
  ::-webkit-datetime-edit, ::-webkit-datetime-edit-year-field, ::-webkit-datetime-edit-month-field, ::-webkit-datetime-edit-day-field, ::-webkit-datetime-edit-hour-field, ::-webkit-datetime-edit-minute-field, ::-webkit-datetime-edit-second-field, ::-webkit-datetime-edit-millisecond-field, ::-webkit-datetime-edit-meridiem-field {
    padding-block: 0;
  }
  ::-webkit-calendar-picker-indicator {
    line-height: 1;
  }
  :-moz-ui-invalid {
    box-shadow: none;
  }
  button, input:where([type="button"], [type="reset"], [type="submit"]), ::file-selector-button {
    appearance: button;
  }
  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button {
    height: auto;
  }
  [hidden]:where(:not([hidden="until-found"])) {
    display: none !important;
  }
}
@layer utilities {
  .pointer-events-auto {
    pointer-events: auto;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border-width: 0;
  }
  .fixed {
    position: fixed;
  }
  .relative {
    position: relative;
  }
  .static {
    position: static;
  }
  .inset-0 {
    inset: calc(var(--spacing) * 0);
  }
  .start {
    inset-inline-start: var(--spacing);
  }
  .right-\\[max\\(1rem\\,env\\(safe-area-inset-right\\,0px\\)\\)\\] {
    right: max(1rem, env(safe-area-inset-right,0px));
  }
  .bottom-\\[max\\(1rem\\,env\\(safe-area-inset-bottom\\,0px\\)\\)\\] {
    bottom: max(1rem, env(safe-area-inset-bottom,0px));
  }
  .z-\\[1\\] {
    z-index: 1;
  }
  .z-\\[2\\] {
    z-index: 2;
  }
  .container {
    width: 100%;
    @media (width >= 40rem) {
      max-width: 40rem;
    }
    @media (width >= 48rem) {
      max-width: 48rem;
    }
    @media (width >= 64rem) {
      max-width: 64rem;
    }
    @media (width >= 80rem) {
      max-width: 80rem;
    }
    @media (width >= 96rem) {
      max-width: 96rem;
    }
  }
  .mx-auto {
    margin-inline: auto;
  }
  .mt-0 {
    margin-top: calc(var(--spacing) * 0);
  }
  .mt-0\\.5 {
    margin-top: calc(var(--spacing) * 0.5);
  }
  .mt-1 {
    margin-top: calc(var(--spacing) * 1);
  }
  .mt-1\\.5 {
    margin-top: calc(var(--spacing) * 1.5);
  }
  .mt-2 {
    margin-top: calc(var(--spacing) * 2);
  }
  .mt-3 {
    margin-top: calc(var(--spacing) * 3);
  }
  .mt-4 {
    margin-top: calc(var(--spacing) * 4);
  }
  .mt-5 {
    margin-top: calc(var(--spacing) * 5);
  }
  .mt-6 {
    margin-top: calc(var(--spacing) * 6);
  }
  .mt-8 {
    margin-top: calc(var(--spacing) * 8);
  }
  .mt-10 {
    margin-top: calc(var(--spacing) * 10);
  }
  .mb-1 {
    margin-bottom: calc(var(--spacing) * 1);
  }
  .mb-1\\.5 {
    margin-bottom: calc(var(--spacing) * 1.5);
  }
  .mb-2 {
    margin-bottom: calc(var(--spacing) * 2);
  }
  .mb-3 {
    margin-bottom: calc(var(--spacing) * 3);
  }
  .block {
    display: block;
  }
  .flex {
    display: flex;
  }
  .grid {
    display: grid;
  }
  .hidden {
    display: none;
  }
  .inline-flex {
    display: inline-flex;
  }
  .table {
    display: table;
  }
  .h-7 {
    height: calc(var(--spacing) * 7);
  }
  .h-8 {
    height: calc(var(--spacing) * 8);
  }
  .h-14 {
    height: calc(var(--spacing) * 14);
  }
  .h-20 {
    height: calc(var(--spacing) * 20);
  }
  .h-full {
    height: 100%;
  }
  .max-h-\\[min\\(90dvh\\,560px\\)\\] {
    max-height: min(90dvh, 560px);
  }
  .max-h-\\[min\\(94dvh\\,720px\\)\\] {
    max-height: min(94dvh, 720px);
  }
  .min-h-0 {
    min-height: calc(var(--spacing) * 0);
  }
  .min-h-\\[2\\.25rem\\] {
    min-height: 2.25rem;
  }
  .min-h-\\[5\\.5rem\\] {
    min-height: 5.5rem;
  }
  .min-h-full {
    min-height: 100%;
  }
  .w-7 {
    width: calc(var(--spacing) * 7);
  }
  .w-8 {
    width: calc(var(--spacing) * 8);
  }
  .w-full {
    width: 100%;
  }
  .max-w-5xl {
    max-width: var(--container-5xl);
  }
  .max-w-\\[8\\.5rem\\] {
    max-width: 8.5rem;
  }
  .max-w-\\[calc\\(100vw-2rem\\)\\] {
    max-width: calc(100vw - 2rem);
  }
  .max-w-lg {
    max-width: var(--container-lg);
  }
  .max-w-md {
    max-width: var(--container-md);
  }
  .max-w-sm {
    max-width: var(--container-sm);
  }
  .min-w-0 {
    min-width: calc(var(--spacing) * 0);
  }
  .flex-1 {
    flex: 1;
  }
  .flex-shrink {
    flex-shrink: 1;
  }
  .shrink-0 {
    flex-shrink: 0;
  }
  .border-collapse {
    border-collapse: collapse;
  }
  .transform {
    transform: var(--tw-rotate-x,) var(--tw-rotate-y,) var(--tw-rotate-z,) var(--tw-skew-x,) var(--tw-skew-y,);
  }
  .cursor-pointer {
    cursor: pointer;
  }
  .resize {
    resize: both;
  }
  .resize-y {
    resize: vertical;
  }
  .appearance-none {
    appearance: none;
  }
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .flex-col {
    flex-direction: column;
  }
  .flex-col-reverse {
    flex-direction: column-reverse;
  }
  .flex-wrap {
    flex-wrap: wrap;
  }
  .items-baseline {
    align-items: baseline;
  }
  .items-center {
    align-items: center;
  }
  .items-start {
    align-items: flex-start;
  }
  .justify-between {
    justify-content: space-between;
  }
  .justify-center {
    justify-content: center;
  }
  .justify-end {
    justify-content: flex-end;
  }
  .gap-1 {
    gap: calc(var(--spacing) * 1);
  }
  .gap-1\\.5 {
    gap: calc(var(--spacing) * 1.5);
  }
  .gap-2 {
    gap: calc(var(--spacing) * 2);
  }
  .gap-2\\.5 {
    gap: calc(var(--spacing) * 2.5);
  }
  .gap-3 {
    gap: calc(var(--spacing) * 3);
  }
  .gap-4 {
    gap: calc(var(--spacing) * 4);
  }
  .space-y-2 {
    :where(& > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 2) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 2) * calc(1 - var(--tw-space-y-reverse)));
    }
  }
  .space-y-3 {
    :where(& > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 3) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 3) * calc(1 - var(--tw-space-y-reverse)));
    }
  }
  .space-y-4 {
    :where(& > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 4) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 4) * calc(1 - var(--tw-space-y-reverse)));
    }
  }
  .space-y-5 {
    :where(& > :not(:last-child)) {
      --tw-space-y-reverse: 0;
      margin-block-start: calc(calc(var(--spacing) * 5) * var(--tw-space-y-reverse));
      margin-block-end: calc(calc(var(--spacing) * 5) * calc(1 - var(--tw-space-y-reverse)));
    }
  }
  .gap-x-2 {
    column-gap: calc(var(--spacing) * 2);
  }
  .gap-y-0 {
    row-gap: calc(var(--spacing) * 0);
  }
  .overflow-hidden {
    overflow: hidden;
  }
  .overflow-y-auto {
    overflow-y: auto;
  }
  .rounded {
    border-radius: 0.25rem;
  }
  .rounded-2xl {
    border-radius: var(--radius-2xl);
  }
  .rounded-full {
    border-radius: calc(infinity * 1px);
  }
  .rounded-lg {
    border-radius: var(--radius-lg);
  }
  .rounded-md {
    border-radius: var(--radius-md);
  }
  .rounded-xl {
    border-radius: var(--radius-xl);
  }
  .border {
    border-style: var(--tw-border-style);
    border-width: 1px;
  }
  .border-0 {
    border-style: var(--tw-border-style);
    border-width: 0px;
  }
  .border-t {
    border-top-style: var(--tw-border-style);
    border-top-width: 1px;
  }
  .border-b {
    border-bottom-style: var(--tw-border-style);
    border-bottom-width: 1px;
  }
  .border-dashed {
    --tw-border-style: dashed;
    border-style: dashed;
  }
  .border-emerald-200 {
    border-color: var(--color-emerald-200);
  }
  .border-red-200 {
    border-color: var(--color-red-200);
  }
  .border-zinc-100 {
    border-color: var(--color-zinc-100);
  }
  .border-zinc-200 {
    border-color: var(--color-zinc-200);
  }
  .border-zinc-200\\/80 {
    border-color: color-mix(in srgb, oklch(92% 0.004 286.32) 80%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklab, var(--color-zinc-200) 80%, transparent);
    }
  }
  .border-zinc-200\\/90 {
    border-color: color-mix(in srgb, oklch(92% 0.004 286.32) 90%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklab, var(--color-zinc-200) 90%, transparent);
    }
  }
  .border-zinc-300 {
    border-color: var(--color-zinc-300);
  }
  .border-zinc-700 {
    border-color: var(--color-zinc-700);
  }
  .border-zinc-700\\/20 {
    border-color: color-mix(in srgb, oklch(37% 0.013 285.805) 20%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      border-color: color-mix(in oklab, var(--color-zinc-700) 20%, transparent);
    }
  }
  .border-l-amber-500 {
    border-left-color: var(--color-amber-500);
  }
  .border-l-sky-500 {
    border-left-color: var(--color-sky-500);
  }
  .bg-amber-50 {
    background-color: var(--color-amber-50);
  }
  .bg-amber-100 {
    background-color: var(--color-amber-100);
  }
  .bg-amber-600 {
    background-color: var(--color-amber-600);
  }
  .bg-emerald-50 {
    background-color: var(--color-emerald-50);
  }
  .bg-emerald-100 {
    background-color: var(--color-emerald-100);
  }
  .bg-emerald-600 {
    background-color: var(--color-emerald-600);
  }
  .bg-red-50 {
    background-color: var(--color-red-50);
  }
  .bg-sky-50 {
    background-color: var(--color-sky-50);
  }
  .bg-sky-100 {
    background-color: var(--color-sky-100);
  }
  .bg-white {
    background-color: var(--color-white);
  }
  .bg-zinc-50 {
    background-color: var(--color-zinc-50);
  }
  .bg-zinc-50\\/50 {
    background-color: color-mix(in srgb, oklch(98.5% 0 0) 50%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-zinc-50) 50%, transparent);
    }
  }
  .bg-zinc-50\\/80 {
    background-color: color-mix(in srgb, oklch(98.5% 0 0) 80%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-zinc-50) 80%, transparent);
    }
  }
  .bg-zinc-100 {
    background-color: var(--color-zinc-100);
  }
  .bg-zinc-200 {
    background-color: var(--color-zinc-200);
  }
  .bg-zinc-900 {
    background-color: var(--color-zinc-900);
  }
  .bg-zinc-950 {
    background-color: var(--color-zinc-950);
  }
  .bg-zinc-950\\/55 {
    background-color: color-mix(in srgb, oklch(14.1% 0.005 285.823) 55%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--color-zinc-950) 55%, transparent);
    }
  }
  .object-cover {
    object-fit: cover;
  }
  .p-1 {
    padding: calc(var(--spacing) * 1);
  }
  .p-2 {
    padding: calc(var(--spacing) * 2);
  }
  .p-3 {
    padding: calc(var(--spacing) * 3);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  .p-6 {
    padding: calc(var(--spacing) * 6);
  }
  .p-8 {
    padding: calc(var(--spacing) * 8);
  }
  .px-1 {
    padding-inline: calc(var(--spacing) * 1);
  }
  .px-1\\.5 {
    padding-inline: calc(var(--spacing) * 1.5);
  }
  .px-2 {
    padding-inline: calc(var(--spacing) * 2);
  }
  .px-2\\.5 {
    padding-inline: calc(var(--spacing) * 2.5);
  }
  .px-3 {
    padding-inline: calc(var(--spacing) * 3);
  }
  .px-4 {
    padding-inline: calc(var(--spacing) * 4);
  }
  .px-5 {
    padding-inline: calc(var(--spacing) * 5);
  }
  .px-6 {
    padding-inline: calc(var(--spacing) * 6);
  }
  .py-0 {
    padding-block: calc(var(--spacing) * 0);
  }
  .py-0\\.5 {
    padding-block: calc(var(--spacing) * 0.5);
  }
  .py-1 {
    padding-block: calc(var(--spacing) * 1);
  }
  .py-2 {
    padding-block: calc(var(--spacing) * 2);
  }
  .py-2\\.5 {
    padding-block: calc(var(--spacing) * 2.5);
  }
  .py-3 {
    padding-block: calc(var(--spacing) * 3);
  }
  .py-4 {
    padding-block: calc(var(--spacing) * 4);
  }
  .py-5 {
    padding-block: calc(var(--spacing) * 5);
  }
  .py-8 {
    padding-block: calc(var(--spacing) * 8);
  }
  .py-16 {
    padding-block: calc(var(--spacing) * 16);
  }
  .pt-0 {
    padding-top: calc(var(--spacing) * 0);
  }
  .pt-1 {
    padding-top: calc(var(--spacing) * 1);
  }
  .pt-1\\.5 {
    padding-top: calc(var(--spacing) * 1.5);
  }
  .pt-2 {
    padding-top: calc(var(--spacing) * 2);
  }
  .pt-3 {
    padding-top: calc(var(--spacing) * 3);
  }
  .pt-4 {
    padding-top: calc(var(--spacing) * 4);
  }
  .pt-5 {
    padding-top: calc(var(--spacing) * 5);
  }
  .pt-6 {
    padding-top: calc(var(--spacing) * 6);
  }
  .pr-5 {
    padding-right: calc(var(--spacing) * 5);
  }
  .pb-1 {
    padding-bottom: calc(var(--spacing) * 1);
  }
  .pb-1\\.5 {
    padding-bottom: calc(var(--spacing) * 1.5);
  }
  .pb-2 {
    padding-bottom: calc(var(--spacing) * 2);
  }
  .pb-4 {
    padding-bottom: calc(var(--spacing) * 4);
  }
  .pl-1 {
    padding-left: calc(var(--spacing) * 1);
  }
  .pl-1\\.5 {
    padding-left: calc(var(--spacing) * 1.5);
  }
  .text-center {
    text-align: center;
  }
  .text-left {
    text-align: left;
  }
  .font-mono {
    font-family: var(--font-mono);
  }
  .font-sans {
    font-family: var(--font-sans);
  }
  .text-2xl {
    font-size: var(--text-2xl);
    line-height: var(--tw-leading, var(--text-2xl--line-height));
  }
  .text-3xl {
    font-size: var(--text-3xl);
    line-height: var(--tw-leading, var(--text-3xl--line-height));
  }
  .text-base {
    font-size: var(--text-base);
    line-height: var(--tw-leading, var(--text-base--line-height));
  }
  .text-lg {
    font-size: var(--text-lg);
    line-height: var(--tw-leading, var(--text-lg--line-height));
  }
  .text-sm {
    font-size: var(--text-sm);
    line-height: var(--tw-leading, var(--text-sm--line-height));
  }
  .text-xl {
    font-size: var(--text-xl);
    line-height: var(--tw-leading, var(--text-xl--line-height));
  }
  .text-xs {
    font-size: var(--text-xs);
    line-height: var(--tw-leading, var(--text-xs--line-height));
  }
  .text-\\[10px\\] {
    font-size: 10px;
  }
  .text-\\[11px\\] {
    font-size: 11px;
  }
  .text-\\[13px\\] {
    font-size: 13px;
  }
  .leading-relaxed {
    --tw-leading: var(--leading-relaxed);
    line-height: var(--leading-relaxed);
  }
  .leading-snug {
    --tw-leading: var(--leading-snug);
    line-height: var(--leading-snug);
  }
  .leading-tight {
    --tw-leading: var(--leading-tight);
    line-height: var(--leading-tight);
  }
  .font-bold {
    --tw-font-weight: var(--font-weight-bold);
    font-weight: var(--font-weight-bold);
  }
  .font-medium {
    --tw-font-weight: var(--font-weight-medium);
    font-weight: var(--font-weight-medium);
  }
  .font-normal {
    --tw-font-weight: var(--font-weight-normal);
    font-weight: var(--font-weight-normal);
  }
  .font-semibold {
    --tw-font-weight: var(--font-weight-semibold);
    font-weight: var(--font-weight-semibold);
  }
  .tracking-\\[0\\.35em\\] {
    --tw-tracking: 0.35em;
    letter-spacing: 0.35em;
  }
  .tracking-tight {
    --tw-tracking: var(--tracking-tight);
    letter-spacing: var(--tracking-tight);
  }
  .tracking-wide {
    --tw-tracking: var(--tracking-wide);
    letter-spacing: var(--tracking-wide);
  }
  .tracking-wider {
    --tw-tracking: var(--tracking-wider);
    letter-spacing: var(--tracking-wider);
  }
  .break-words {
    overflow-wrap: break-word;
  }
  .whitespace-pre-wrap {
    white-space: pre-wrap;
  }
  .text-amber-900 {
    color: var(--color-amber-900);
  }
  .text-emerald-800 {
    color: var(--color-emerald-800);
  }
  .text-emerald-900 {
    color: var(--color-emerald-900);
  }
  .text-red-600 {
    color: var(--color-red-600);
  }
  .text-red-700 {
    color: var(--color-red-700);
  }
  .text-red-800 {
    color: var(--color-red-800);
  }
  .text-sky-800 {
    color: var(--color-sky-800);
  }
  .text-sky-900 {
    color: var(--color-sky-900);
  }
  .text-white {
    color: var(--color-white);
  }
  .text-zinc-400 {
    color: var(--color-zinc-400);
  }
  .text-zinc-500 {
    color: var(--color-zinc-500);
  }
  .text-zinc-600 {
    color: var(--color-zinc-600);
  }
  .text-zinc-700 {
    color: var(--color-zinc-700);
  }
  .text-zinc-800 {
    color: var(--color-zinc-800);
  }
  .text-zinc-900 {
    color: var(--color-zinc-900);
  }
  .normal-case {
    text-transform: none;
  }
  .uppercase {
    text-transform: uppercase;
  }
  .tabular-nums {
    --tw-numeric-spacing: tabular-nums;
    font-variant-numeric: var(--tw-ordinal,) var(--tw-slashed-zero,) var(--tw-numeric-figure,) var(--tw-numeric-spacing,) var(--tw-numeric-fraction,);
  }
  .underline {
    text-decoration-line: underline;
  }
  .underline-offset-2 {
    text-underline-offset: 2px;
  }
  .antialiased {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  .shadow {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-2xl {
    --tw-shadow: 0 25px 50px -12px var(--tw-shadow-color, rgb(0 0 0 / 0.25));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-lg {
    --tw-shadow: 0 10px 15px -3px var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 4px 6px -4px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-sm {
    --tw-shadow: 0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1));
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .ring-1 {
    --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
    box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
  }
  .shadow-zinc-900 {
    --tw-shadow-color: oklch(21% 0.006 285.885);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-shadow-color: color-mix(in oklab, var(--color-zinc-900) var(--tw-shadow-alpha), transparent);
    }
  }
  .shadow-zinc-900\\/15 {
    --tw-shadow-color: color-mix(in srgb, oklch(21% 0.006 285.885) 15%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-shadow-color: color-mix(in oklab, color-mix(in oklab, var(--color-zinc-900) 15%, transparent) var(--tw-shadow-alpha), transparent);
    }
  }
  .shadow-zinc-900\\/25 {
    --tw-shadow-color: color-mix(in srgb, oklch(21% 0.006 285.885) 25%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-shadow-color: color-mix(in oklab, color-mix(in oklab, var(--color-zinc-900) 25%, transparent) var(--tw-shadow-alpha), transparent);
    }
  }
  .ring-amber-200 {
    --tw-ring-color: var(--color-amber-200);
  }
  .ring-amber-200\\/80 {
    --tw-ring-color: color-mix(in srgb, oklch(92.4% 0.12 95.746) 80%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-ring-color: color-mix(in oklab, var(--color-amber-200) 80%, transparent);
    }
  }
  .ring-sky-200 {
    --tw-ring-color: var(--color-sky-200);
  }
  .ring-sky-200\\/80 {
    --tw-ring-color: color-mix(in srgb, oklch(90.1% 0.058 230.902) 80%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-ring-color: color-mix(in oklab, var(--color-sky-200) 80%, transparent);
    }
  }
  .ring-zinc-200 {
    --tw-ring-color: var(--color-zinc-200);
  }
  .ring-zinc-400 {
    --tw-ring-color: var(--color-zinc-400);
  }
  .ring-zinc-900 {
    --tw-ring-color: var(--color-zinc-900);
  }
  .ring-zinc-900\\/10 {
    --tw-ring-color: color-mix(in srgb, oklch(21% 0.006 285.885) 10%, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      --tw-ring-color: color-mix(in oklab, var(--color-zinc-900) 10%, transparent);
    }
  }
  .outline {
    outline-style: var(--tw-outline-style);
    outline-width: 1px;
  }
  .backdrop-blur-\\[3px\\] {
    --tw-backdrop-blur: blur(3px);
    -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .backdrop-filter {
    -webkit-backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
    backdrop-filter: var(--tw-backdrop-blur,) var(--tw-backdrop-brightness,) var(--tw-backdrop-contrast,) var(--tw-backdrop-grayscale,) var(--tw-backdrop-hue-rotate,) var(--tw-backdrop-invert,) var(--tw-backdrop-opacity,) var(--tw-backdrop-saturate,) var(--tw-backdrop-sepia,);
  }
  .transition {
    transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, --tw-gradient-from, --tw-gradient-via, --tw-gradient-to, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events;
    transition-timing-function: var(--tw-ease, var(--default-transition-timing-function));
    transition-duration: var(--tw-duration, var(--default-transition-duration));
  }
  .ease-out {
    --tw-ease: var(--ease-out);
    transition-timing-function: var(--ease-out);
  }
  .outline-none {
    --tw-outline-style: none;
    outline-style: none;
  }
  .\\[-webkit-overflow-scrolling\\:touch\\] {
    -webkit-overflow-scrolling: touch;
  }
  .placeholder\\:text-zinc-400 {
    &::placeholder {
      color: var(--color-zinc-400);
    }
  }
  .hover\\:bg-amber-700 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-amber-700);
      }
    }
  }
  .hover\\:bg-emerald-100 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-emerald-100);
      }
    }
  }
  .hover\\:bg-zinc-50 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-zinc-50);
      }
    }
  }
  .hover\\:bg-zinc-100 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-zinc-100);
      }
    }
  }
  .hover\\:bg-zinc-800 {
    &:hover {
      @media (hover: hover) {
        background-color: var(--color-zinc-800);
      }
    }
  }
  .hover\\:text-zinc-800 {
    &:hover {
      @media (hover: hover) {
        color: var(--color-zinc-800);
      }
    }
  }
  .hover\\:text-zinc-900 {
    &:hover {
      @media (hover: hover) {
        color: var(--color-zinc-900);
      }
    }
  }
  .hover\\:underline {
    &:hover {
      @media (hover: hover) {
        text-decoration-line: underline;
      }
    }
  }
  .focus\\:border-zinc-300 {
    &:focus {
      border-color: var(--color-zinc-300);
    }
  }
  .focus\\:bg-white {
    &:focus {
      background-color: var(--color-white);
    }
  }
  .focus\\:ring-1 {
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus\\:ring-2 {
    &:focus {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus\\:ring-zinc-300 {
    &:focus {
      --tw-ring-color: var(--color-zinc-300);
    }
  }
  .focus\\:ring-zinc-900\\/10 {
    &:focus {
      --tw-ring-color: color-mix(in srgb, oklch(21% 0.006 285.885) 10%, transparent);
      @supports (color: color-mix(in lab, red, red)) {
        --tw-ring-color: color-mix(in oklab, var(--color-zinc-900) 10%, transparent);
      }
    }
  }
  .focus\\:outline-none {
    &:focus {
      --tw-outline-style: none;
      outline-style: none;
    }
  }
  .focus-visible\\:ring-2 {
    &:focus-visible {
      --tw-ring-shadow: var(--tw-ring-inset,) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color, currentcolor);
      box-shadow: var(--tw-inset-shadow), var(--tw-inset-ring-shadow), var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow);
    }
  }
  .focus-visible\\:ring-zinc-400 {
    &:focus-visible {
      --tw-ring-color: var(--color-zinc-400);
    }
  }
  .disabled\\:cursor-not-allowed {
    &:disabled {
      cursor: not-allowed;
    }
  }
  .disabled\\:border-zinc-200 {
    &:disabled {
      border-color: var(--color-zinc-200);
    }
  }
  .disabled\\:bg-zinc-100 {
    &:disabled {
      background-color: var(--color-zinc-100);
    }
  }
  .disabled\\:text-zinc-400 {
    &:disabled {
      color: var(--color-zinc-400);
    }
  }
  .disabled\\:opacity-50 {
    &:disabled {
      opacity: 50%;
    }
  }
  .sm\\:grid-cols-3 {
    @media (width >= 40rem) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .sm\\:flex-row {
    @media (width >= 40rem) {
      flex-direction: row;
    }
  }
  .sm\\:justify-center {
    @media (width >= 40rem) {
      justify-content: center;
    }
  }
  .sm\\:p-3 {
    @media (width >= 40rem) {
      padding: calc(var(--spacing) * 3);
    }
  }
  .dark\\:border-zinc-600 {
    @media (prefers-color-scheme: dark) {
      border-color: var(--color-zinc-600);
    }
  }
  .dark\\:border-zinc-700 {
    @media (prefers-color-scheme: dark) {
      border-color: var(--color-zinc-700);
    }
  }
  .dark\\:border-zinc-800 {
    @media (prefers-color-scheme: dark) {
      border-color: var(--color-zinc-800);
    }
  }
  .dark\\:bg-red-950\\/50 {
    @media (prefers-color-scheme: dark) {
      background-color: color-mix(in srgb, oklch(25.8% 0.092 26.042) 50%, transparent);
      @supports (color: color-mix(in lab, red, red)) {
        background-color: color-mix(in oklab, var(--color-red-950) 50%, transparent);
      }
    }
  }
  .dark\\:bg-zinc-100 {
    @media (prefers-color-scheme: dark) {
      background-color: var(--color-zinc-100);
    }
  }
  .dark\\:bg-zinc-800 {
    @media (prefers-color-scheme: dark) {
      background-color: var(--color-zinc-800);
    }
  }
  .dark\\:bg-zinc-900 {
    @media (prefers-color-scheme: dark) {
      background-color: var(--color-zinc-900);
    }
  }
  .dark\\:bg-zinc-950 {
    @media (prefers-color-scheme: dark) {
      background-color: var(--color-zinc-950);
    }
  }
  .dark\\:text-red-200 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-red-200);
    }
  }
  .dark\\:text-red-400 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-red-400);
    }
  }
  .dark\\:text-zinc-50 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-50);
    }
  }
  .dark\\:text-zinc-100 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-100);
    }
  }
  .dark\\:text-zinc-200 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-200);
    }
  }
  .dark\\:text-zinc-300 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-300);
    }
  }
  .dark\\:text-zinc-400 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-400);
    }
  }
  .dark\\:text-zinc-500 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-500);
    }
  }
  .dark\\:text-zinc-900 {
    @media (prefers-color-scheme: dark) {
      color: var(--color-zinc-900);
    }
  }
  .dark\\:hover\\:bg-zinc-200 {
    @media (prefers-color-scheme: dark) {
      &:hover {
        @media (hover: hover) {
          background-color: var(--color-zinc-200);
        }
      }
    }
  }
  .dark\\:hover\\:bg-zinc-800 {
    @media (prefers-color-scheme: dark) {
      &:hover {
        @media (hover: hover) {
          background-color: var(--color-zinc-800);
        }
      }
    }
  }
  .dark\\:hover\\:text-zinc-100 {
    @media (prefers-color-scheme: dark) {
      &:hover {
        @media (hover: hover) {
          color: var(--color-zinc-100);
        }
      }
    }
  }
  .dark\\:hover\\:text-zinc-300 {
    @media (prefers-color-scheme: dark) {
      &:hover {
        @media (hover: hover) {
          color: var(--color-zinc-300);
        }
      }
    }
  }
}
@layer base {
  :host,
  :host * {
    font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
@property --tw-rotate-x {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-y {
  syntax: "*";
  inherits: false;
}
@property --tw-rotate-z {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-x {
  syntax: "*";
  inherits: false;
}
@property --tw-skew-y {
  syntax: "*";
  inherits: false;
}
@property --tw-space-y-reverse {
  syntax: "*";
  inherits: false;
  initial-value: 0;
}
@property --tw-border-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-leading {
  syntax: "*";
  inherits: false;
}
@property --tw-font-weight {
  syntax: "*";
  inherits: false;
}
@property --tw-tracking {
  syntax: "*";
  inherits: false;
}
@property --tw-ordinal {
  syntax: "*";
  inherits: false;
}
@property --tw-slashed-zero {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-figure {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-spacing {
  syntax: "*";
  inherits: false;
}
@property --tw-numeric-fraction {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-inset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-shadow-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-shadow-alpha {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 100%;
}
@property --tw-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-inset-ring-color {
  syntax: "*";
  inherits: false;
}
@property --tw-inset-ring-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-ring-inset {
  syntax: "*";
  inherits: false;
}
@property --tw-ring-offset-width {
  syntax: "<length>";
  inherits: false;
  initial-value: 0px;
}
@property --tw-ring-offset-color {
  syntax: "*";
  inherits: false;
  initial-value: #fff;
}
@property --tw-ring-offset-shadow {
  syntax: "*";
  inherits: false;
  initial-value: 0 0 #0000;
}
@property --tw-outline-style {
  syntax: "*";
  inherits: false;
  initial-value: solid;
}
@property --tw-backdrop-blur {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-brightness {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-contrast {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-grayscale {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-hue-rotate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-invert {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-opacity {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-saturate {
  syntax: "*";
  inherits: false;
}
@property --tw-backdrop-sepia {
  syntax: "*";
  inherits: false;
}
@property --tw-ease {
  syntax: "*";
  inherits: false;
}
@layer properties {
  @supports ((-webkit-hyphens: none) and (not (margin-trim: inline))) or ((-moz-orient: inline) and (not (color:rgb(from red r g b)))) {
    *, ::before, ::after, ::backdrop {
      --tw-rotate-x: initial;
      --tw-rotate-y: initial;
      --tw-rotate-z: initial;
      --tw-skew-x: initial;
      --tw-skew-y: initial;
      --tw-space-y-reverse: 0;
      --tw-border-style: solid;
      --tw-leading: initial;
      --tw-font-weight: initial;
      --tw-tracking: initial;
      --tw-ordinal: initial;
      --tw-slashed-zero: initial;
      --tw-numeric-figure: initial;
      --tw-numeric-spacing: initial;
      --tw-numeric-fraction: initial;
      --tw-shadow: 0 0 #0000;
      --tw-shadow-color: initial;
      --tw-shadow-alpha: 100%;
      --tw-inset-shadow: 0 0 #0000;
      --tw-inset-shadow-color: initial;
      --tw-inset-shadow-alpha: 100%;
      --tw-ring-color: initial;
      --tw-ring-shadow: 0 0 #0000;
      --tw-inset-ring-color: initial;
      --tw-inset-ring-shadow: 0 0 #0000;
      --tw-ring-inset: initial;
      --tw-ring-offset-width: 0px;
      --tw-ring-offset-color: #fff;
      --tw-ring-offset-shadow: 0 0 #0000;
      --tw-outline-style: solid;
      --tw-backdrop-blur: initial;
      --tw-backdrop-brightness: initial;
      --tw-backdrop-contrast: initial;
      --tw-backdrop-grayscale: initial;
      --tw-backdrop-hue-rotate: initial;
      --tw-backdrop-invert: initial;
      --tw-backdrop-opacity: initial;
      --tw-backdrop-saturate: initial;
      --tw-backdrop-sepia: initial;
      --tw-ease: initial;
    }
  }
}
`;var Re="af-vf-host",ct=8;function lt(t){return t==="Client"?"client":t==="Supercraft"?"agency":null}function st(){if(document.getElementById("af-vf-pin-styles"))return;let t=document.createElement("style");t.id="af-vf-pin-styles",t.textContent=`
    .af-vf-pin {
      position: absolute;
      z-index: 2147483645;
      width: clamp(18px, 5vmin, 24px);
      height: clamp(18px, 5vmin, 24px);
      border-radius: 999px;
      background: #dc2626;
      color: #fff;
      font: 600 clamp(10px, 2.8vmin, 12px) / clamp(18px, 5vmin, 24px) system-ui, -apple-system, sans-serif;
      text-align: center;
      pointer-events: auto;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,.25);
      border: 2px solid #fff;
    }
    .af-vf-pin-resolved {
      background: #16a34a !important;
      opacity: 0.55;
    }
    .af-vf-pin--pulse { animation: af-vf-pulse 0.8s ease-out 2; }
    @keyframes af-vf-pulse {
      0% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.15); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
    html.af-vf-comment-mode, html.af-vf-comment-mode * {
      cursor: crosshair !important;
    }
    html.af-vf-comment-mode .af-vf-pin {
      cursor: pointer !important;
    }
  `,document.head.appendChild(t)}function dt(){return{userAgent:navigator.userAgent,platform:navigator.platform,viewport:{width:window.innerWidth,height:window.innerHeight,visualViewport:window.visualViewport?{width:window.visualViewport.width,height:window.visualViewport.height,scale:window.visualViewport.scale}:void 0}}}function m(t,c){t.classList.toggle("hidden",c)}function Ie(t){let c=Ae(t);if(!c)return;let i=c;st();let l=document.createElement("div");l.id=Re,l.setAttribute("data-af-vf-ui",""),l.style.cssText="all:initial;position:fixed;top:0;left:0;width:100%;height:0;pointer-events:none;z-index:2147483646;",document.documentElement.appendChild(l);let a=l.attachShadow({mode:"open"});a.innerHTML=`
    <style>${Be}</style>
    <div class="af-root font-sans antialiased text-zinc-900">
    <button type="button" class="pointer-events-auto fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] right-[max(1rem,env(safe-area-inset-right,0px))] z-[1] max-w-[calc(100vw-2rem)] rounded-full border border-zinc-700/20 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-900/25 transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 fab">Feedback</button>

    <div class="af-backdrop pin-bd pointer-events-auto fixed inset-0 z-[2] hidden items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[3px]">
      <div class="af-modal w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-900/15 max-h-[min(90dvh,560px)] [-webkit-overflow-scrolling:touch]">
        <label for="af-pin" class="block text-sm font-medium text-zinc-600">Code</label>
        <input id="af-pin" class="af-pin-field mt-2 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-center text-2xl font-medium tracking-[0.35em] text-zinc-900 tabular-nums outline-none ring-zinc-900/10 focus:border-zinc-300 focus:bg-white focus:ring-2" type="password" inputmode="numeric" autocomplete="one-time-code" maxlength="4" pattern="[0-9]*" />
        <p class="af-pin-err mt-2 hidden text-sm text-red-600"></p>
        <div class="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" class="af-pin-cancel rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50">Cancel</button>
          <button type="button" class="af-pin-confirm rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800">Continue</button>
        </div>
      </div>
    </div>

    <div class="af-backdrop feedback-bd pointer-events-auto fixed inset-0 z-[2] hidden items-center justify-center bg-zinc-950/55 p-4 backdrop-blur-[3px]">
      <div class="af-modal w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl shadow-zinc-900/15 max-h-[min(90dvh,560px)] [-webkit-overflow-scrolling:touch]">
        <div class="af-new-author-group flex gap-1 rounded-xl border border-zinc-200 bg-zinc-100 p-1" role="group" aria-label="From">
          <button type="button" class="af-new-author-btn flex-1 rounded-lg px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400" data-value="Client">Client</button>
          <button type="button" class="af-new-author-btn flex-1 rounded-lg px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400" data-value="Supercraft">Supercraft</button>
        </div>
        <textarea id="af-msg" required rows="4" class="mt-4 min-h-[5.5rem] w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10" placeholder="What\u2019s wrong?"></textarea>
        <div class="mt-2 flex items-center justify-between gap-2">
          <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
            <input id="af-files" type="file" accept="image/*" multiple class="hidden" />
            <span>Add images</span>
          </label>
          <span class="text-[11px] text-zinc-400">Up to 8 images</span>
        </div>
        <div class="af-files-preview mt-2 hidden"></div>
        <select id="af-pri" class="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10" aria-label="Priority">
          <option value="">Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <p class="af-form-err mt-4 hidden rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"></p>
        <div class="mt-6 flex flex-wrap justify-end gap-2 border-t border-zinc-100 pt-5">
          <button type="button" class="af-cancel rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:bg-zinc-50">Cancel</button>
          <button type="button" class="af-save rounded-xl bg-zinc-900 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800">Save</button>
        </div>
      </div>
    </div>

    <div class="af-backdrop detail-bd pointer-events-auto fixed inset-0 z-[2] hidden items-center justify-center bg-zinc-950/55 p-2 backdrop-blur-[3px] sm:p-3">
      <div class="af-modal flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15 max-h-[min(94dvh,720px)]">
        <div class="shrink-0 flex justify-end px-4 pb-1.5 pt-3">
          <p class="detail-status"></p>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-2 [-webkit-overflow-scrolling:touch]">
          <div class="detail-original"></div>
          <div class="af-replies-section mt-3 hidden border-t border-zinc-100 pt-3">
            <div class="detail-thread space-y-2"></div>
          </div>
        </div>

        <div class="shrink-0 border-t border-zinc-200 bg-zinc-50/80 px-3 py-2">
          <p class="af-detail-err mb-1.5 hidden rounded border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-800"></p>

          <button type="button" class="af-reply-toggle rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50">Reply</button>

          <div class="af-reply-composer mt-1.5 hidden">
            <div class="relative rounded-md border border-zinc-200 bg-white px-2 pb-1 pt-1 shadow-sm">
              <div class="flex justify-end">
                <label for="af-thread-author" class="sr-only">Speaking as</label>
                <select id="af-thread-author" class="max-w-[8.5rem] cursor-pointer rounded border border-zinc-200 bg-zinc-50 py-0.5 pl-1.5 pr-5 text-[11px] font-medium leading-tight text-zinc-800 outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300">
                  <option value="Client">Client</option>
                  <option value="Supercraft">Supercraft</option>
                </select>
              </div>
              <textarea id="af-thread-body" rows="2" class="mt-1 min-h-[2.25rem] w-full resize-y rounded border border-zinc-200 px-2 py-1 text-xs leading-snug text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300" placeholder="Write a reply\u2026"></textarea>
              <div class="mt-1 flex items-center justify-between gap-2">
                <label class="inline-flex cursor-pointer items-center gap-1 rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50">
                  <input id="af-thread-files" type="file" accept="image/*" multiple class="hidden" />
                  <span>Add images</span>
                </label>
                <span class="text-[10px] text-zinc-400">Max 8</span>
              </div>
              <div class="af-thread-files-preview mt-1 hidden"></div>
              <div class="mt-1 flex items-center justify-end gap-1.5">
                <button type="button" class="af-reply-collapse text-[11px] font-medium text-zinc-500 hover:text-zinc-800">Cancel</button>
                <button type="button" class="af-thread-post rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-zinc-800">Send</button>
              </div>
            </div>
          </div>

          <div class="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200/80 pt-1.5">
            <button type="button" class="af-detail-close text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline">Close</button>
            <button type="button" class="af-resolve rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400">Mark resolved</button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;let u=a.querySelector(".fab"),h=a.querySelector(".pin-bd"),w=a.querySelector(".feedback-bd"),S=a.querySelector(".detail-bd"),k=a.querySelector("#af-pin"),y=a.querySelector(".af-pin-err"),De=a.querySelector(".af-pin-cancel"),re=a.querySelector(".af-pin-confirm"),fe=a.querySelectorAll(".af-new-author-btn"),oe=a.querySelector("#af-msg"),q=a.querySelector("#af-files"),$e=a.querySelector(".af-files-preview"),he=a.querySelector("#af-pri"),z=a.querySelector(".af-form-err"),We=a.querySelector(".af-cancel"),O=a.querySelector(".af-save"),B=a.querySelector(".detail-status"),_=a.querySelector(".detail-original"),K=a.querySelector(".af-replies-section"),V=a.querySelector(".detail-thread"),Ue=a.querySelector(".af-reply-composer"),be=a.querySelector(".af-reply-toggle"),Oe=a.querySelector(".af-reply-collapse"),R=a.querySelector("#af-thread-author"),P=a.querySelector("#af-thread-body"),T=a.querySelector("#af-thread-files"),_e=a.querySelector(".af-thread-files-preview"),b=a.querySelector(".af-detail-err"),Ke=a.querySelector(".af-detail-close"),M=a.querySelector(".af-resolve"),J=a.querySelector(".af-thread-post"),I="Client";function X(){fe.forEach(e=>{let r=e.dataset.value,o=(r==="Client"||r==="Supercraft")&&r===I;e.setAttribute("aria-pressed",o?"true":"false"),e.classList.toggle("bg-white",o),e.classList.toggle("shadow-sm",o),e.classList.toggle("ring-1",o),e.classList.toggle("ring-zinc-200",o),e.classList.toggle("text-zinc-900",o),e.classList.toggle("font-semibold",o),e.classList.toggle("text-zinc-500",!o),e.classList.toggle("font-medium",!o)})}function N(e){Ue.classList.toggle("hidden",!e),be.classList.toggle("hidden",e),e&&window.setTimeout(()=>P.focus(),0)}function G(){we($e,C,e=>{C=C.filter((r,o)=>o!==e),G()})}function H(){we(_e,v,e=>{v=v.filter((r,o)=>o!==e),H()})}function ve(e,r){let o=[...e];if(!r)return o;for(let n of Array.from(r))if(n.type.startsWith("image/")&&(o.push(n),o.length>=ct))break;return o}function we(e,r,o){if(e.textContent="",r.length===0){e.classList.add("hidden");return}e.classList.remove("hidden");let n=document.createElement("div");n.className="flex flex-wrap gap-1.5",r.forEach((p,s)=>{let d=document.createElement("div");d.className="flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] text-zinc-700";let g=document.createElement("span");g.textContent=p.name;let f=document.createElement("button");f.type="button",f.className="text-zinc-500 hover:text-zinc-800",f.textContent="\xD7",f.addEventListener("click",()=>o(s)),d.appendChild(g),d.appendChild(f),n.appendChild(d)}),e.appendChild(n)}function xe(e,r){if(!r.length)return;let o=document.createElement("div");o.className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3";for(let n of r){let p=document.createElement("a");p.href=n,p.target="_blank",p.rel="noreferrer noopener";let s=document.createElement("img");s.src=n,s.loading="lazy",s.alt="attachment",s.className="h-20 w-full rounded-md border border-zinc-200 object-cover",p.appendChild(s),o.appendChild(p)}e.appendChild(o)}async function ke(e){if(e.length===0)return{ok:!0,urls:[]};let r=[];for(let o of e){let n=await Pe(i,o);if(!n.ok||!n.url)return{ok:!1,error:n.error??"Image upload failed"};r.push(n.url)}return{ok:!0,urls:r}}fe.forEach(e=>{e.addEventListener("click",()=>{let r=e.dataset.value;(r==="Client"||r==="Supercraft")&&(I=r,X())})}),X(),be.addEventListener("click",()=>N(!0)),Oe.addEventListener("click",()=>{N(!1),P.value="",R.value="Client",v=[],T.value="",H()}),q.addEventListener("change",()=>{C=ve(C,q.files),q.value="",G()}),T.addEventListener("change",()=>{v=ve(v,T.files),T.value="",H()});function ae(e){e.classList.remove("hidden"),e.classList.add("flex")}function ie(e){e.classList.add("hidden"),e.classList.remove("flex")}let D=!1,j=[],C=[],v=[],F=new Map,Y=new Map,Q=new Map,$=null,E=null,ye=0;function ne(){window.clearTimeout(ye),ye=window.setTimeout(()=>{le(j)},120)}function ze(e){D=e,document.documentElement.classList.toggle("af-vf-comment-mode",e),u.classList.toggle("bg-amber-600",e),u.classList.toggle("hover:bg-amber-700",e),u.classList.toggle("bg-zinc-900",!e),u.classList.toggle("hover:bg-zinc-800",!e),u.textContent=e?"Exit mode":"Feedback",e?le(j):ce()}function ce(){for(let e of Q.values())e.remove();Q.clear()}function Ve(e,r){let o=null,n=(()=>{let f=[],L=x=>{let U=x.trim();!U||f.includes(U)||f.push(U)},A=e.selector,ue=A.replace(/:nth-of-type\(\d+\)/g,""),Qe=A.replace(/\s*>\s*/g," "),Ze=ue.replace(/\s*>\s*/g," ");L(A),L(ue),L(Qe),L(Ze);let W=ue.split(">").map(x=>x.trim()).filter(Boolean).filter(x=>x!=="body");for(let x=1;x<W.length;x+=1){let U=W.slice(x).join(" > "),et=W.slice(x).join(" ");L(U),L(et)}let Le=W[W.length-1];return Le&&L(Le),f})();try{for(let f of n)if(o=document.querySelector(f),o)break}catch{return null}if(!o||!(o instanceof HTMLElement))return null;getComputedStyle(o).position==="static"&&(o.style.position="relative");let s=document.createElement("span");s.className="af-vf-pin",e.status==="resolved"&&s.classList.add("af-vf-pin-resolved"),s.dataset.afPinId=e.id,s.textContent=String(r+1);let d=e.coordinates?.x??.5,g=e.coordinates?.y??.5;return s.style.left=`${d*100}%`,s.style.top=`${g*100}%`,s.style.transform="translate(-50%, -50%)",o.appendChild(s),s}function le(e){ce(),e.forEach((r,o)=>{let n=Ve(r,o);n&&Q.set(r.id,n)})}async function Z(){j=await Te(i);for(let r of j){let o=F.get(r.id);o&&F.set(r.id,{...o,feedback:r})}D?le(j):ce();let e=new URLSearchParams(location.search).get("af_pin");e&&D&&Je(e);for(let r of j){if(F.has(r.id)||Y.has(r.id))continue;let o=ge(i,r.id).then(n=>(n&&F.set(r.id,n),n)).finally(()=>{Y.delete(r.id)});Y.set(r.id,o)}}function Je(e){let r=Q.get(e)??document.querySelector(`[data-af-pin-id="${e}"]`);r&&(r.scrollIntoView({behavior:"smooth",block:"center"}),r.classList.add("af-vf-pin--pulse"),window.setTimeout(()=>r.classList.remove("af-vf-pin--pulse"),1600))}function se(e){return e==="resolved"?'<span class="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Resolved</span>':e==="in_progress"?'<span class="inline-flex items-center rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">In progress</span>':'<span class="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Open</span>'}function Ce(e,r){let o=document.createElement("div");return o.setAttribute("aria-hidden","true"),o.className=r?"flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800 ring-1 ring-sky-200/80":"flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900 ring-1 ring-amber-200/80",o.textContent=e,o}function Ee(e){if(V.textContent="",e.length===0){K.classList.add("hidden");return}K.classList.remove("hidden");for(let r of e){let o=r.author_type==="agency",n=document.createElement("div");n.className="flex gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-2 shadow-sm";let p=Ce(o?"S":"C",o),s=document.createElement("div");s.className="min-w-0 flex-1";let d=document.createElement("div");d.className="text-[11px] text-zinc-400",d.textContent=new Date(r.created_at).toLocaleString();let g=document.createElement("div");g.className="mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-snug text-zinc-900",g.textContent=r.body,s.appendChild(d),r.body&&s.appendChild(g),xe(s,r.image_urls??[]),n.appendChild(p),n.appendChild(s),V.appendChild(n)}}function de(e,r,o){_.textContent="";let n=e==="Supercraft",p=document.createElement("div");p.className="flex gap-2.5 rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2.5 shadow-sm";let s=Ce(n?"S":"C",n),d=document.createElement("div");d.className="min-w-0 flex-1";let g=document.createElement("p");g.className="whitespace-pre-wrap break-words text-[13px] leading-snug text-zinc-900",g.textContent=r,r&&d.appendChild(g),xe(d,o??[]),p.appendChild(s),p.appendChild(d),_.appendChild(p)}async function pe(e){E=e;let r=e;m(b,!0),b.textContent="",V.textContent="",K.classList.add("hidden"),P.value="",R.value="Client",v=[],T.value="",H(),N(!1),ae(S);let o=j.find(f=>f.id===e);o?(B.innerHTML=se(o.status),de(o.author,o.comment_text,o.image_urls??[]),M.disabled=o.status==="resolved"):(_.innerHTML='<div class="rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500">Loading...</div>',B.textContent="",M.disabled=!1);let n=F.get(e);n&&(B.innerHTML=se(n.feedback.status),de(n.feedback.author,n.feedback.comment_text,n.feedback.image_urls??[]),Ee(n.comments),M.disabled=n.feedback.status==="resolved");let p=Y.get(e),s=p?await p:await ge(i,e);if(E!==r)return;if(!s){b.textContent="Could not refresh thread.",m(b,!1);return}F.set(e,s);let{feedback:d,comments:g}=s;B.innerHTML=se(d.status),de(d.author,d.comment_text,d.image_urls??[]),Ee(g),M.disabled=d.status==="resolved"}function me(){ie(S),E=null,m(b,!0),_.textContent="",V.textContent="",K.classList.add("hidden"),B.textContent="",P.value="",R.value="Client",v=[],T.value="",H(),N(!1)}function Xe(){m(z,!0),z.textContent="",I="Client",X(),C=[],q.value="",G(),ae(w),oe.focus()}function ee(){ie(w),$=null,I="Client",X(),oe.value="",C=[],q.value="",G(),he.value=""}function Ge(){m(y,!0),y.textContent="",k.value="",ae(h),k.focus()}function te(){ie(h),m(y,!0),y.textContent="",k.value=""}u.addEventListener("click",e=>{if(e.stopPropagation(),D){ze(!1),ee(),te(),me();return}Ge()}),k.addEventListener("input",()=>{k.value=k.value.replace(/\D/g,"").slice(0,4)}),De.addEventListener("click",()=>te()),re.addEventListener("click",async()=>{let e=k.value.replace(/\D/g,"").slice(0,4);if(e.length!==4){y.textContent="Enter all 4 digits.",m(y,!1);return}m(y,!0),re.disabled=!0;let r=await Fe(i,e);if(re.disabled=!1,!r.ok){y.textContent=r.error??"Invalid code.",m(y,!1);return}te(),ze(!0)}),h.addEventListener("click",e=>{e.target===h&&te()}),We.addEventListener("click",()=>ee()),w.addEventListener("click",e=>{e.target===w&&ee()}),Ke.addEventListener("click",()=>me()),S.addEventListener("click",e=>{e.target===S&&me()}),M.addEventListener("click",async()=>{if(!E)return;M.disabled=!0;let e=await He(i,E);if(M.disabled=!1,!e.ok){b.textContent=e.error??"Could not resolve.",m(b,!1);return}await pe(E),await Z()}),J.addEventListener("click",async()=>{if(!E)return;let e=lt(R.value),r=P.value.trim();if(!e||!r&&v.length===0){b.textContent="Choose role and add text or images.",m(b,!1);return}m(b,!0),J.disabled=!0;let o=await ke(v);if(!o.ok){J.disabled=!1,b.textContent=o.error,m(b,!1);return}let n=await je(i,E,e,r,o.urls);if(J.disabled=!1,!n.ok){b.textContent=n.error??"Could not post.",m(b,!1);return}P.value="",R.value="Client",v=[],T.value="",H(),N(!1),await pe(E),await Z()}),O.addEventListener("click",async()=>{if(!$)return;let e=I,r=oe.value.trim();if(!r.trim()&&C.length===0){z.textContent="Add text or at least one image.",m(z,!1);return}O.disabled=!0;let o=await ke(C);if(!o.ok){O.disabled=!1,z.textContent=o.error,m(z,!1);return}let n=he.value||null;m(z,!0);let p=await Me(i,{selector:$.selector,coordinates:$.coordinates,commentText:r,imageUrls:o.urls,author:e,priority:n,metadata:dt()});if(O.disabled=!1,!p.ok){z.textContent=p.error??"Could not save.",m(z,!1);return}ee(),await Z()});function Ye(e){if(e.button!==0)return;let r=e.target.closest?.(".af-vf-pin");if(r instanceof HTMLElement&&r.dataset.afPinId){e.preventDefault(),e.stopPropagation(),pe(r.dataset.afPinId);return}if(!D)return;let o=e.composedPath();for(let A of o)if(A instanceof Element&&A.id===Re)return;let n=e.target;if(!(n instanceof Element))return;let p=n.nodeType===Node.TEXT_NODE?n.parentElement:n;if(!p||!(p instanceof Element))return;let s=p.closest("a,button,input,textarea,select,label,[contenteditable=true]")??p,d=s.getBoundingClientRect();if(!d.width||!d.height)return;let g=(e.clientX-d.left)/d.width,f=(e.clientY-d.top)/d.height,L={x:Math.min(1,Math.max(0,g)),y:Math.min(1,Math.max(0,f))};$={element:s,selector:qe(s),coordinates:L},e.preventDefault(),e.stopPropagation(),Xe()}document.addEventListener("pointerdown",Ye,!0),window.addEventListener("resize",ne,{passive:!0}),window.visualViewport?.addEventListener("resize",ne,{passive:!0}),window.addEventListener("orientationchange",ne,{passive:!0}),Z().catch(e=>console.error("[AgencyFeedback]",e))}var Ne=document.currentScript??document.querySelector("script[data-af-api][data-af-project][data-af-key], script[data-api][data-project][data-key]");Ne?Ie(Ne):console.error("[AgencyFeedback] Add agency-feedback.js with data-project, data-api, and data-key on the script tag.");})();
