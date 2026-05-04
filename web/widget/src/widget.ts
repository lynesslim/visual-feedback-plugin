import {
  fetchFeedback,
  fetchFeedbackComments,
  fetchFeedbackDetail,
  markFeedbackResolved,
  postThreadComment,
  submitFeedback,
  uploadFeedbackImage,
  verifyFeedbackPasscode,
} from "./api-client";
import { readConfig } from "./config";
import { elementToCssPath } from "./css-path";
import type { CommentAuthorType, CommentRow, FeedbackRow, WidgetConfig } from "./types";
import tailwindCss from "./_widget-tailwind.css";

const HOST_ID = "af-vf-host";
const MAX_ATTACHMENTS = 8;

function authorTypeFromLabel(label: string): CommentAuthorType | null {
  if (label === "Client") return "client";
  if (label === "Supercraft") return "agency";
  return null;
}

function injectPinStyles(): void {
  if (document.getElementById("af-vf-pin-styles")) return;
  const s = document.createElement("style");
  s.id = "af-vf-pin-styles";
  s.textContent = `
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
  `;
  document.head.appendChild(s);
}

function metadataPayload(): Record<string, unknown> {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
      visualViewport: window.visualViewport
        ? {
            width: window.visualViewport.width,
            height: window.visualViewport.height,
            scale: window.visualViewport.scale,
          }
        : undefined,
    },
  };
}

function setHidden(el: HTMLElement, hidden: boolean): void {
  el.classList.toggle("hidden", hidden);
}

export function mountWidget(script: HTMLScriptElement): void {
  const parsed = readConfig(script);
  if (!parsed) return;
  const cfg: WidgetConfig = parsed;

  injectPinStyles();

  const host = document.createElement("div");
  host.id = HOST_ID;
  host.setAttribute("data-af-vf-ui", "");
  host.style.cssText =
    "all:initial;position:fixed;top:0;left:0;width:100%;height:0;pointer-events:none;z-index:2147483646;";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${tailwindCss}</style>
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
        <textarea id="af-msg" required rows="4" class="mt-4 min-h-[5.5rem] w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10" placeholder="What’s wrong?"></textarea>
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
              <textarea id="af-thread-body" rows="2" class="mt-1 min-h-[2.25rem] w-full resize-y rounded border border-zinc-200 px-2 py-1 text-xs leading-snug text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300" placeholder="Write a reply…"></textarea>
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
  `;

  const fab = shadow.querySelector(".fab") as HTMLButtonElement;
  const pinBackdrop = shadow.querySelector(".pin-bd") as HTMLDivElement;
  const feedbackBackdrop = shadow.querySelector(".feedback-bd") as HTMLDivElement;
  const detailBackdrop = shadow.querySelector(".detail-bd") as HTMLDivElement;
  const pinInput = shadow.querySelector("#af-pin") as HTMLInputElement;
  const pinErr = shadow.querySelector(".af-pin-err") as HTMLParagraphElement;
  const pinCancel = shadow.querySelector(".af-pin-cancel") as HTMLButtonElement;
  const pinConfirm = shadow.querySelector(".af-pin-confirm") as HTMLButtonElement;
  const newAuthorBtns = shadow.querySelectorAll<HTMLButtonElement>(
    ".af-new-author-btn",
  );
  const msgInput = shadow.querySelector("#af-msg") as HTMLTextAreaElement;
  const feedbackFilesInput = shadow.querySelector("#af-files") as HTMLInputElement;
  const feedbackFilesPreview = shadow.querySelector(
    ".af-files-preview",
  ) as HTMLDivElement;
  const priSelect = shadow.querySelector("#af-pri") as HTMLSelectElement;
  const formErr = shadow.querySelector(".af-form-err") as HTMLParagraphElement;
  const cancelBtn = shadow.querySelector(".af-cancel") as HTMLButtonElement;
  const saveBtn = shadow.querySelector(".af-save") as HTMLButtonElement;

  const detailStatus = shadow.querySelector(".detail-status") as HTMLParagraphElement;
  const detailOriginal = shadow.querySelector(".detail-original") as HTMLDivElement;
  const detailRepliesSection = shadow.querySelector(
    ".af-replies-section",
  ) as HTMLDivElement;
  const detailThread = shadow.querySelector(".detail-thread") as HTMLDivElement;
  const replyComposer = shadow.querySelector(".af-reply-composer") as HTMLDivElement;
  const replyToggleBtn = shadow.querySelector(".af-reply-toggle") as HTMLButtonElement;
  const replyCollapseBtn = shadow.querySelector(".af-reply-collapse") as HTMLButtonElement;
  const threadAuthorSelect = shadow.querySelector("#af-thread-author") as HTMLSelectElement;
  const threadBodyInput = shadow.querySelector("#af-thread-body") as HTMLTextAreaElement;
  const threadFilesInput = shadow.querySelector(
    "#af-thread-files",
  ) as HTMLInputElement;
  const threadFilesPreview = shadow.querySelector(
    ".af-thread-files-preview",
  ) as HTMLDivElement;
  const detailErr = shadow.querySelector(".af-detail-err") as HTMLParagraphElement;
  const detailCloseBtn = shadow.querySelector(".af-detail-close") as HTMLButtonElement;
  const resolveBtn = shadow.querySelector(".af-resolve") as HTMLButtonElement;
  const threadPostBtn = shadow.querySelector(".af-thread-post") as HTMLButtonElement;

  let newFeedbackAuthor: "Client" | "Supercraft" = "Client";
  function updateNewAuthorUI(): void {
    newAuthorBtns.forEach((btn) => {
      const v = btn.dataset.value;
      const active =
        (v === "Client" || v === "Supercraft") && v === newFeedbackAuthor;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.classList.toggle("bg-white", active);
      btn.classList.toggle("shadow-sm", active);
      btn.classList.toggle("ring-1", active);
      btn.classList.toggle("ring-zinc-200", active);
      btn.classList.toggle("text-zinc-900", active);
      btn.classList.toggle("font-semibold", active);
      btn.classList.toggle("text-zinc-500", !active);
      btn.classList.toggle("font-medium", !active);
    });
  }

  function setReplyComposerOpen(open: boolean): void {
    replyComposer.classList.toggle("hidden", !open);
    replyToggleBtn.classList.toggle("hidden", open);
    if (open) {
      window.setTimeout(() => threadBodyInput.focus(), 0);
    }
  }

  function refreshFeedbackFilesPreview(): void {
    renderSelectedFiles(feedbackFilesPreview, pendingFeedbackFiles, (idx) => {
      pendingFeedbackFiles = pendingFeedbackFiles.filter((_, i) => i !== idx);
      refreshFeedbackFilesPreview();
    });
  }

  function refreshThreadFilesPreview(): void {
    renderSelectedFiles(threadFilesPreview, pendingThreadFiles, (idx) => {
      pendingThreadFiles = pendingThreadFiles.filter((_, i) => i !== idx);
      refreshThreadFilesPreview();
    });
  }

  function clampSelectedImages(files: File[], incoming: FileList | null): File[] {
    const next = [...files];
    if (!incoming) return next;
    for (const file of Array.from(incoming)) {
      if (!file.type.startsWith("image/")) continue;
      next.push(file);
      if (next.length >= MAX_ATTACHMENTS) break;
    }
    return next;
  }

  function renderSelectedFiles(
    container: HTMLDivElement,
    files: File[],
    onRemove: (idx: number) => void,
  ): void {
    container.textContent = "";
    if (files.length === 0) {
      container.classList.add("hidden");
      return;
    }
    container.classList.remove("hidden");
    const list = document.createElement("div");
    list.className = "flex flex-wrap gap-1.5";
    files.forEach((f, idx) => {
      const item = document.createElement("div");
      item.className =
        "flex items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] text-zinc-700";
      const name = document.createElement("span");
      name.textContent = f.name;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "text-zinc-500 hover:text-zinc-800";
      remove.textContent = "×";
      remove.addEventListener("click", () => onRemove(idx));
      item.appendChild(name);
      item.appendChild(remove);
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function renderImageUrls(container: HTMLElement, urls: string[]): void {
    if (!urls.length) return;
    const grid = document.createElement("div");
    grid.className = "mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3";
    for (const url of urls) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer noopener";
      const img = document.createElement("img");
      img.src = url;
      img.loading = "lazy";
      img.alt = "attachment";
      img.className =
        "h-20 w-full rounded-md border border-zinc-200 object-cover";
      a.appendChild(img);
      grid.appendChild(a);
    }
    container.appendChild(grid);
  }

  async function uploadFiles(
    files: File[],
  ): Promise<{ ok: true; urls: string[] } | { ok: false; error: string }> {
    if (files.length === 0) return { ok: true, urls: [] };
    const urls: string[] = [];
    for (const file of files) {
      const up = await uploadFeedbackImage(cfg, file);
      if (!up.ok || !up.url) {
        return { ok: false, error: up.error ?? "Image upload failed" };
      }
      urls.push(up.url);
    }
    return { ok: true, urls };
  }

  newAuthorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.value;
      if (v === "Client" || v === "Supercraft") {
        newFeedbackAuthor = v;
        updateNewAuthorUI();
      }
    });
  });
  updateNewAuthorUI();

  replyToggleBtn.addEventListener("click", () => setReplyComposerOpen(true));
  replyCollapseBtn.addEventListener("click", () => {
    setReplyComposerOpen(false);
    threadBodyInput.value = "";
    threadAuthorSelect.value = "Client";
    pendingThreadFiles = [];
    threadFilesInput.value = "";
    refreshThreadFilesPreview();
  });

  feedbackFilesInput.addEventListener("change", () => {
    pendingFeedbackFiles = clampSelectedImages(
      pendingFeedbackFiles,
      feedbackFilesInput.files,
    );
    feedbackFilesInput.value = "";
    refreshFeedbackFilesPreview();
  });

  threadFilesInput.addEventListener("change", () => {
    pendingThreadFiles = clampSelectedImages(
      pendingThreadFiles,
      threadFilesInput.files,
    );
    threadFilesInput.value = "";
    refreshThreadFilesPreview();
  });

  function openBackdrop(el: HTMLDivElement): void {
    el.classList.remove("hidden");
    el.classList.add("flex");
  }

  function closeBackdrop(el: HTMLDivElement): void {
    el.classList.add("hidden");
    el.classList.remove("flex");
  }

  let mode = false;
  let rows: FeedbackRow[] = [];
  let pendingFeedbackFiles: File[] = [];
  let pendingThreadFiles: File[] = [];
  const detailCache = new Map<
    string,
    { feedback: FeedbackRow; comments: CommentRow[] }
  >();
  const inflightDetail = new Map<
    string,
    Promise<{ feedback: FeedbackRow; comments: CommentRow[] } | null>
  >();
  const markers = new Map<string, HTMLSpanElement>();
  let pending: {
    element: Element;
    selector: string;
    coordinates: { x: number; y: number };
  } | null = null;

  let detailFeedbackId: string | null = null;

  let resizeTimer = 0;
  function scheduleRelayout(): void {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      renderPins(rows);
    }, 120);
  }

  function setMode(on: boolean): void {
    mode = on;
    document.documentElement.classList.toggle("af-vf-comment-mode", on);
    fab.classList.toggle("bg-amber-600", on);
    fab.classList.toggle("hover:bg-amber-700", on);
    fab.classList.toggle("bg-zinc-900", !on);
    fab.classList.toggle("hover:bg-zinc-800", !on);
    fab.textContent = on ? "Exit mode" : "Feedback";
    if (on) {
      renderPins(rows);
    } else {
      clearMarkers();
    }
  }

  function clearMarkers(): void {
    for (const el of markers.values()) {
      el.remove();
    }
    markers.clear();
  }

  function placeMarker(
    row: FeedbackRow,
    index: number,
  ): HTMLSpanElement | null {
    let anchor: Element | null = null;
    const selectorCandidates = (() => {
      const out: string[] = [];
      const push = (s: string) => {
        const v = s.trim();
        if (!v || out.includes(v)) return;
        out.push(v);
      };

      const exact = row.selector;
      const relaxed = exact.replace(/:nth-of-type\(\d+\)/g, "");
      const exactDesc = exact.replace(/\s*>\s*/g, " ");
      const relaxedDesc = relaxed.replace(/\s*>\s*/g, " ");

      push(exact);
      push(relaxed);
      push(exactDesc);
      push(relaxedDesc);

      // If wrapper structure changed, suffix chains still often match.
      const relaxedParts = relaxed
        .split(">")
        .map((p) => p.trim())
        .filter(Boolean)
        .filter((p) => p !== "body");
      for (let i = 1; i < relaxedParts.length; i += 1) {
        const suffixChild = relaxedParts.slice(i).join(" > ");
        const suffixDesc = relaxedParts.slice(i).join(" ");
        push(suffixChild);
        push(suffixDesc);
      }

      const last = relaxedParts[relaxedParts.length - 1];
      if (last) push(last);

      return out;
    })();
    try {
      for (const sel of selectorCandidates) {
        anchor = document.querySelector(sel);
        if (anchor) break;
      }
    } catch {
      return null;
    }
    if (!anchor || !(anchor instanceof HTMLElement)) return null;

    const pin = document.createElement("span");
    pin.className = "af-vf-pin";
    if (row.status === "resolved") {
      pin.classList.add("af-vf-pin-resolved");
    }
    pin.dataset.afPinId = row.id;
    pin.dataset.afFeedback = JSON.stringify(row);
    pin.textContent = String(index + 1);
    const x = row.coordinates?.x ?? 0.5;
    const y = row.coordinates?.y ?? 0.5;
    const rect = anchor.getBoundingClientRect();
    pin.style.left = `${window.scrollX + rect.left + x * rect.width}px`;
    pin.style.top = `${window.scrollY + rect.top + y * rect.height}px`;
    pin.style.transform = "translate(-50%, -50%)";
    document.body.appendChild(pin);
    return pin;
  }

  function renderPins(list: FeedbackRow[]): void {
    clearMarkers();
    list.forEach((row, i) => {
      const m = placeMarker(row, i);
      if (m) markers.set(row.id, m);
    });
  }

  async function loadPins(): Promise<void> {
    rows = await fetchFeedback(cfg);
    for (const row of rows) {
      const cached = detailCache.get(row.id);
      if (cached) {
        detailCache.set(row.id, { ...cached, feedback: row });
      }
    }
    if (mode) {
      renderPins(rows);
    } else {
      clearMarkers();
    }
    const focusId = new URLSearchParams(location.search).get("af_pin");
    if (focusId && mode) focusPin(focusId);
    for (const row of rows) {
      if (detailCache.has(row.id) || inflightDetail.has(row.id)) continue;
      const p = Promise.all([
        fetchFeedbackDetail(cfg, row.id),
        fetchFeedbackComments(cfg, row.id),
      ])
        .then((data) => {
          const [detail, comments] = data;
          if (detail) {
            const merged = {
              feedback: detail.feedback,
              comments: comments.length > 0 ? comments : detail.comments,
            };
            detailCache.set(row.id, merged);
            return merged;
          }
          return null;
        })
        .finally(() => {
          inflightDetail.delete(row.id);
        });
      inflightDetail.set(row.id, p);
    }
  }

  function focusPin(id: string): void {
    const pin =
      markers.get(id) ?? document.querySelector(`[data-af-pin-id="${id}"]`);
    if (!pin) return;
    pin.scrollIntoView({ behavior: "smooth", block: "center" });
    pin.classList.add("af-vf-pin--pulse");
    window.setTimeout(() => pin.classList.remove("af-vf-pin--pulse"), 1600);
  }

  function statusBadgeHtml(status: string): string {
    if (status === "resolved") {
      return '<span class="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Resolved</span>';
    }
    if (status === "in_progress") {
      return '<span class="inline-flex items-center rounded-md bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-900">In progress</span>';
    }
    return '<span class="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Open</span>';
  }

  function avatarCircleEl(letter: "C" | "S", agency: boolean): HTMLDivElement {
    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.className = agency
      ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-800 ring-1 ring-sky-200/80"
      : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-900 ring-1 ring-amber-200/80";
    el.textContent = letter;
    return el;
  }

  function renderThreadEl(comments: CommentRow[]): void {
    detailThread.textContent = "";
    if (comments.length === 0) {
      detailRepliesSection.classList.add("hidden");
      return;
    }
    detailRepliesSection.classList.remove("hidden");
    for (const c of comments) {
      const agency = c.author_type === "agency";
      const item = document.createElement("div");
      item.className =
        "flex gap-2 rounded-lg border border-zinc-200/80 bg-white px-2.5 py-2 shadow-sm";
      const av = avatarCircleEl(agency ? "S" : "C", agency);
      const col = document.createElement("div");
      col.className = "min-w-0 flex-1";
      const meta = document.createElement("div");
      meta.className = "text-[11px] text-zinc-400";
      meta.textContent = new Date(c.created_at).toLocaleString();
      const body = document.createElement("div");
      body.className =
        "mt-0.5 whitespace-pre-wrap break-words text-[13px] leading-snug text-zinc-900";
      body.textContent = c.body;
      col.appendChild(meta);
      if (c.body) col.appendChild(body);
      renderImageUrls(col, c.image_urls ?? []);
      item.appendChild(av);
      item.appendChild(col);
      detailThread.appendChild(item);
    }
  }

  function renderOriginalCard(
    author: string,
    commentText: string,
    imageUrls: string[],
  ): void {
    detailOriginal.textContent = "";
    const origAgency = author === "Supercraft";
    const wrap = document.createElement("div");
    wrap.className =
      "flex gap-2.5 rounded-lg border border-zinc-200/90 bg-zinc-50/50 px-3 py-2.5 shadow-sm";
    const av = avatarCircleEl(origAgency ? "S" : "C", origAgency);
    const inner = document.createElement("div");
    inner.className = "min-w-0 flex-1";
    const msg = document.createElement("p");
    msg.className =
      "whitespace-pre-wrap break-words text-[13px] leading-snug text-zinc-900";
    msg.textContent = commentText;
    if (commentText) inner.appendChild(msg);
    renderImageUrls(inner, imageUrls ?? []);
    wrap.appendChild(av);
    wrap.appendChild(inner);
    detailOriginal.appendChild(wrap);
  }

  async function openDetailModal(
    id: string,
    fallbackRow: FeedbackRow | null = null,
  ): Promise<void> {
    detailFeedbackId = id;
    const requestId = id;
    setHidden(detailErr, true);
    detailErr.textContent = "";
    detailThread.textContent = "";
    detailRepliesSection.classList.add("hidden");
    threadBodyInput.value = "";
    threadAuthorSelect.value = "Client";
    pendingThreadFiles = [];
    threadFilesInput.value = "";
    refreshThreadFilesPreview();
    setReplyComposerOpen(false);
    openBackdrop(detailBackdrop);

    const quick = rows.find((row) => row.id === id) ?? fallbackRow;
    if (quick) {
      detailStatus.innerHTML = statusBadgeHtml(quick.status);
      renderOriginalCard(quick.author, quick.comment_text, quick.image_urls ?? []);
      resolveBtn.disabled = quick.status === "resolved";
    } else {
      detailOriginal.innerHTML =
        '<div class="rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-4 py-3 text-sm text-zinc-500">Loading...</div>';
      detailStatus.textContent = "";
      resolveBtn.disabled = false;
    }

    const cached = detailCache.get(id);
    if (cached) {
      detailStatus.innerHTML = statusBadgeHtml(cached.feedback.status);
      renderOriginalCard(
        cached.feedback.author,
        cached.feedback.comment_text,
        cached.feedback.image_urls ?? [],
      );
      renderThreadEl(cached.comments);
      resolveBtn.disabled = cached.feedback.status === "resolved";
    }

    const pending = inflightDetail.get(id);
    const data = pending
      ? await pending
      : await Promise.all([
          fetchFeedbackDetail(cfg, id),
          fetchFeedbackComments(cfg, id),
        ]).then(([detail, comments]) =>
          detail
            ? {
                feedback: detail.feedback,
                comments: comments.length > 0 ? comments : detail.comments,
              }
            : null,
        );
    if (detailFeedbackId !== requestId) return;
    if (!data) {
      if (!quick) {
        detailErr.textContent = "Could not refresh thread.";
        setHidden(detailErr, false);
      }
      return;
    }

    const previousComments = detailCache.get(id)?.comments ?? [];
    const comments = data.comments.length > 0 ? data.comments : previousComments;
    const fb = data.feedback;
    detailCache.set(id, { feedback: fb, comments });
    detailStatus.innerHTML = statusBadgeHtml(fb.status);
    renderOriginalCard(fb.author, fb.comment_text, fb.image_urls ?? []);

    renderThreadEl(comments);
    resolveBtn.disabled = fb.status === "resolved";
  }

  function closeDetailModal(): void {
    closeBackdrop(detailBackdrop);
    detailFeedbackId = null;
    setHidden(detailErr, true);
    detailOriginal.textContent = "";
    detailThread.textContent = "";
    detailRepliesSection.classList.add("hidden");
    detailStatus.textContent = "";
    threadBodyInput.value = "";
    threadAuthorSelect.value = "Client";
    pendingThreadFiles = [];
    threadFilesInput.value = "";
    refreshThreadFilesPreview();
    setReplyComposerOpen(false);
  }

  function openFeedbackModal(): void {
    setHidden(formErr, true);
    formErr.textContent = "";
    newFeedbackAuthor = "Client";
    updateNewAuthorUI();
    pendingFeedbackFiles = [];
    feedbackFilesInput.value = "";
    refreshFeedbackFilesPreview();
    openBackdrop(feedbackBackdrop);
    msgInput.focus();
  }

  function closeFeedbackModal(): void {
    closeBackdrop(feedbackBackdrop);
    pending = null;
    newFeedbackAuthor = "Client";
    updateNewAuthorUI();
    msgInput.value = "";
    pendingFeedbackFiles = [];
    feedbackFilesInput.value = "";
    refreshFeedbackFilesPreview();
    priSelect.value = "";
  }

  function openPinModal(): void {
    setHidden(pinErr, true);
    pinErr.textContent = "";
    pinInput.value = "";
    openBackdrop(pinBackdrop);
    pinInput.focus();
  }

  function closePinModal(): void {
    closeBackdrop(pinBackdrop);
    setHidden(pinErr, true);
    pinErr.textContent = "";
    pinInput.value = "";
  }

  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    if (mode) {
      setMode(false);
      closeFeedbackModal();
      closePinModal();
      closeDetailModal();
      return;
    }
    openPinModal();
  });

  pinInput.addEventListener("input", () => {
    pinInput.value = pinInput.value.replace(/\D/g, "").slice(0, 4);
  });

  pinCancel.addEventListener("click", () => closePinModal());

  pinConfirm.addEventListener("click", async () => {
    const code = pinInput.value.replace(/\D/g, "").slice(0, 4);
    if (code.length !== 4) {
      pinErr.textContent = "Enter all 4 digits.";
      setHidden(pinErr, false);
      return;
    }
    setHidden(pinErr, true);
    pinConfirm.disabled = true;
    const result = await verifyFeedbackPasscode(cfg, code);
    pinConfirm.disabled = false;
    if (!result.ok) {
      pinErr.textContent = result.error ?? "Invalid code.";
      setHidden(pinErr, false);
      return;
    }
    closePinModal();
    setMode(true);
  });

  pinBackdrop.addEventListener("click", (e) => {
    if (e.target === pinBackdrop) closePinModal();
  });

  cancelBtn.addEventListener("click", () => closeFeedbackModal());

  feedbackBackdrop.addEventListener("click", (e) => {
    if (e.target === feedbackBackdrop) closeFeedbackModal();
  });

  detailCloseBtn.addEventListener("click", () => closeDetailModal());

  detailBackdrop.addEventListener("click", (e) => {
    if (e.target === detailBackdrop) closeDetailModal();
  });

  resolveBtn.addEventListener("click", async () => {
    if (!detailFeedbackId) return;
    resolveBtn.disabled = true;
    const result = await markFeedbackResolved(cfg, detailFeedbackId);
    resolveBtn.disabled = false;
    if (!result.ok) {
      detailErr.textContent = result.error ?? "Could not resolve.";
      setHidden(detailErr, false);
      return;
    }
    await openDetailModal(detailFeedbackId);
    await loadPins();
  });

  threadPostBtn.addEventListener("click", async () => {
    if (!detailFeedbackId) return;
    const at = authorTypeFromLabel(threadAuthorSelect.value);
    const body = threadBodyInput.value.trim();
    if (!at || (!body && pendingThreadFiles.length === 0)) {
      detailErr.textContent = "Choose role and add text or images.";
      setHidden(detailErr, false);
      return;
    }
    setHidden(detailErr, true);
    threadPostBtn.disabled = true;
    const upload = await uploadFiles(pendingThreadFiles);
    if (!upload.ok) {
      threadPostBtn.disabled = false;
      detailErr.textContent = upload.error;
      setHidden(detailErr, false);
      return;
    }
    const result = await postThreadComment(
      cfg,
      detailFeedbackId,
      at,
      body,
      upload.urls,
    );
    threadPostBtn.disabled = false;
    if (!result.ok) {
      detailErr.textContent = result.error ?? "Could not post.";
      setHidden(detailErr, false);
      return;
    }
    const cached = detailCache.get(detailFeedbackId);
    const fallbackFeedback =
      cached?.feedback ?? rows.find((row) => row.id === detailFeedbackId);
    if (fallbackFeedback && result.comment) {
      const comments = [...(cached?.comments ?? []), result.comment];
      detailCache.set(detailFeedbackId, {
        feedback: fallbackFeedback,
        comments,
      });
      renderThreadEl(comments);
    }
    threadBodyInput.value = "";
    threadAuthorSelect.value = "Client";
    pendingThreadFiles = [];
    threadFilesInput.value = "";
    refreshThreadFilesPreview();
    setReplyComposerOpen(false);
    await loadPins();
  });

  saveBtn.addEventListener("click", async () => {
    if (!pending) return;
    const author = newFeedbackAuthor;
    const commentText = msgInput.value.trim();
    if (!commentText.trim() && pendingFeedbackFiles.length === 0) {
      formErr.textContent = "Add text or at least one image.";
      setHidden(formErr, false);
      return;
    }
    saveBtn.disabled = true;
    const upload = await uploadFiles(pendingFeedbackFiles);
    if (!upload.ok) {
      saveBtn.disabled = false;
      formErr.textContent = upload.error;
      setHidden(formErr, false);
      return;
    }
    const priority = priSelect.value || null;
    setHidden(formErr, true);
    const result = await submitFeedback(cfg, {
      selector: pending.selector,
      coordinates: pending.coordinates,
      commentText,
      imageUrls: upload.urls,
      author,
      priority,
      metadata: metadataPayload(),
    });
    saveBtn.disabled = false;
    if (!result.ok) {
      formErr.textContent = result.error ?? "Could not save.";
      setHidden(formErr, false);
      return;
    }
    closeFeedbackModal();
    await loadPins();
  });

  function onDocPointerDown(ev: PointerEvent): void {
    if (ev.button !== 0) return;

    const pinEl = (ev.target as Element).closest?.(".af-vf-pin");
    if (pinEl instanceof HTMLElement && pinEl.dataset.afPinId) {
      ev.preventDefault();
      ev.stopPropagation();
      let fallbackRow: FeedbackRow | null = null;
      const rawFeedback = pinEl.dataset.afFeedback;
      if (rawFeedback) {
        try {
          fallbackRow = JSON.parse(rawFeedback) as FeedbackRow;
        } catch {
          fallbackRow = null;
        }
      }
      void openDetailModal(pinEl.dataset.afPinId, fallbackRow);
      return;
    }

    if (!mode) return;

    const path = ev.composedPath();
    for (const n of path) {
      if (!(n instanceof Element)) continue;
      if (n.id === HOST_ID) return;
    }

    const rawTarget = ev.target;
    if (!(rawTarget instanceof Element)) return;
    const target =
      rawTarget.nodeType === Node.TEXT_NODE
        ? rawTarget.parentElement
        : rawTarget;
    if (!target || !(target instanceof Element)) return;

    const el =
      target.closest(
        "a,button,input,textarea,select,label,[contenteditable=true]",
      ) ?? target;

    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (ev.clientX - rect.left) / rect.width;
    const y = (ev.clientY - rect.top) / rect.height;
    const coordinates = {
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    };

    pending = {
      element: el,
      selector: elementToCssPath(el),
      coordinates,
    };

    ev.preventDefault();
    ev.stopPropagation();
    openFeedbackModal();
  }

  document.addEventListener("pointerdown", onDocPointerDown, true);
  window.addEventListener("resize", scheduleRelayout, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleRelayout, {
    passive: true,
  });
  window.addEventListener("orientationchange", scheduleRelayout, {
    passive: true,
  });

  loadPins().catch((err) => console.error("[AgencyFeedback]", err));
}
