"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResizeOption } from "@/lib/conversions";
import { formatBytes } from "@/lib/convert";
import { dedupeName, makeZip } from "@/lib/zip";
import { useI18n, type TKey } from "@/lib/i18n";
import {
  convertVideo,
  getSupportedTargets,
  hasVideoDecoder,
  videoOutputName,
  GIF_DEFAULT_FPS,
  GIF_MAX_DURATION,
  GIF_MAX_WIDTH,
  VIDEO_TARGETS,
  type VideoOptions,
  type VideoQuality,
  type VideoTarget,
} from "@/lib/video";

// A queued/encoded output. Each item snapshots the settings it was enqueued
// with, so changing the panel afterwards never mutates an in-flight result.
interface VidItem {
  id: string;
  file: File;
  status: "queued" | "encoding" | "done" | "error";
  /** 0..1 encode completion (drives the progress bar). */
  progress: number;
  opts: VideoOptions;
  outUrl?: string;
  outName?: string;
  outSize?: number;
  error?: string;
}

type ResizeMode = ResizeOption["mode"];

// One unit of encode work. Carries its own file + settings snapshot so the
// queue never depends on component state (which is stale right after enqueue).
interface Job {
  id: string;
  file: File;
  opts: VideoOptions;
}

const QUALITIES: VideoQuality[] = ["low", "medium", "high"];
// Approximate HD size used to probe encoder support up front, before any file
// is added. Per-file sizes rarely change the answer.
const PROBE_W = 1280;
const PROBE_H = 720;

// Map an engine error code to a user-facing i18n key.
function errorKey(e: unknown): TKey {
  const msg = e instanceof Error ? e.message : "";
  if (msg === "no-video-track" || msg === "no-frames") return "vid.probeError";
  if (msg === "unsupported-target" || msg === "conversion-invalid")
    return "vid.unsupportedTarget";
  return "vid.convertError";
}

export default function VideoConverter() {
  const { t } = useI18n();

  const [items, setItems] = useState<VidItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [zipping, setZipping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Feature detection. `decoderOk` false ⇒ nothing works (very old browsers).
  const [decoderOk, setDecoderOk] = useState(true);
  const [supported, setSupported] = useState<Record<VideoTarget, boolean> | null>(
    null,
  );

  // Page-level output settings (snapshotted per item at enqueue time).
  const [target, setTarget] = useState<VideoTarget>("webm");
  const [quality, setQuality] = useState<VideoQuality>("medium");
  const [advOpen, setAdvOpen] = useState(false);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("none");
  const [wDraft, setWDraft] = useState("");
  const [hDraft, setHDraft] = useState("");
  const [pDraft, setPDraft] = useState("");
  const [fps, setFps] = useState(GIF_DEFAULT_FPS);

  // Detect what this browser can produce, and land on a supported default.
  // Runs client-only after mount, so the prerendered HTML shows the tool
  // (decoderOk defaults true) and no hydration mismatch occurs.
  useEffect(() => {
    let alive = true;
    void (async () => {
      if (!hasVideoDecoder()) {
        if (alive) setDecoderOk(false);
        return;
      }
      try {
        const s = await getSupportedTargets(PROBE_W, PROBE_H);
        if (!alive) return;
        setSupported(s);
        setTarget((cur) => (s[cur] ? cur : VIDEO_TARGETS.find((f) => s[f]) ?? cur));
      } catch {
        // Probing failed — assume gif-only (decoder present, encoders unknown).
        if (alive) setSupported({ webm: false, mp4: false, gif: true });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // A live mirror of `items` for reads in async/event code (never read during
  // render). Updated in an effect — after commit — so cleanup reads see the
  // latest list. The encode queue does NOT rely on this (it carries its own
  // job payloads), so there's no stale-lookup window.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Revoke object URLs on unmount to avoid leaking blob memory.
  useEffect(() => {
    return () => {
      itemsRef.current.forEach(
        (it) => it.outUrl && URL.revokeObjectURL(it.outUrl),
      );
    };
  }, []);

  const buildResize = useCallback((): ResizeOption => {
    const n = (s: string) => {
      const v = parseInt(s, 10);
      return Number.isFinite(v) && v > 0 ? v : undefined;
    };
    switch (resizeMode) {
      case "width":
        return { mode: "width", width: n(wDraft) };
      case "height":
        return { mode: "height", height: n(hDraft) };
      case "dimensions":
        return { mode: "dimensions", width: n(wDraft), height: n(hDraft) };
      case "percent":
        return { mode: "percent", percent: n(pDraft) };
      default:
        return { mode: "none" };
    }
  }, [resizeMode, wDraft, hDraft, pDraft]);

  const currentOpts = useCallback(
    (): VideoOptions => ({
      target,
      quality,
      resize: buildResize(),
      fps,
    }),
    [target, quality, buildResize, fps],
  );

  // --- Sequential encode queue --------------------------------------------
  // Video encoding is heavy, so we run ONE file at a time (unlike the image
  // converter, which fires everything in parallel). Each queued job carries its
  // OWN file + settings snapshot, so the pump never has to look an item up in
  // state (which would be stale right after enqueue, before React commits).
  // Removed/cleared ids land in `canceledRef` so an in-flight or pending job is
  // dropped cleanly.
  const queueRef = useRef<Job[]>([]);
  const runningRef = useRef(false);
  const canceledRef = useRef<Set<string>>(new Set());

  const patch = useCallback((id: string, next: Partial<VidItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...next } : it)),
    );
  }, []);

  const pump = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      // Take each job OFF the front before awaiting, and never touch the queue
      // front again this iteration. That way clearAll/removeItem reassigning the
      // queue mid-encode can only affect OTHER pending jobs — the in-flight job
      // is already dequeued and its cancellation is tracked solely via
      // canceledRef, so we can never blind-shift an unrelated job off the queue.
      let job: Job | undefined;
      while ((job = queueRef.current.shift())) {
        const current = job;
        const dropped = () => canceledRef.current.delete(current.id);
        if (canceledRef.current.has(current.id)) {
          dropped();
          continue;
        }
        patch(current.id, { status: "encoding", progress: 0 });
        try {
          const blob = await convertVideo(current.file, current.opts, (p) => {
            if (!canceledRef.current.has(current.id))
              patch(current.id, { progress: p });
          });
          if (canceledRef.current.has(current.id)) {
            dropped();
          } else {
            const url = URL.createObjectURL(blob);
            patch(current.id, {
              status: "done",
              progress: 1,
              outUrl: url,
              outName: videoOutputName(current.file.name, current.opts.target),
              outSize: blob.size,
            });
          }
        } catch (e) {
          if (canceledRef.current.has(current.id)) dropped();
          else patch(current.id, { status: "error", error: t(errorKey(e)) });
        }
      }
    } finally {
      runningRef.current = false;
      // Queue is drained; no pending job references these ids, so drop them all
      // to keep the cancellation set from growing across clear/reconvert cycles.
      canceledRef.current.clear();
    }
  }, [patch, t]);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const opts = currentOpts();
      const created = files.map((file) => {
        const isVideo =
          file.type.startsWith("video/") ||
          /\.(mp4|mov|webm|m4v|avi|mkv)$/i.test(file.name);
        const item: VidItem = {
          id: crypto.randomUUID(),
          file,
          status: isVideo ? "queued" : "error",
          progress: 0,
          opts,
          error: isVideo ? undefined : t("vid.notVideo"),
        };
        return { item, isVideo };
      });
      setItems((prev) => [...prev, ...created.map((c) => c.item)]);
      queueRef.current.push(
        ...created
          .filter((c) => c.isVideo)
          .map((c) => ({ id: c.item.id, file: c.item.file, opts })),
      );
      void pump();
    },
    [currentOpts, pump, t],
  );

  const reconvertItem = useCallback(
    (id: string) => {
      const cur = itemsRef.current.find((x) => x.id === id);
      if (!cur) return;
      if (cur.outUrl) URL.revokeObjectURL(cur.outUrl);
      canceledRef.current.delete(id);
      const opts = currentOpts();
      patch(id, {
        status: "queued",
        progress: 0,
        opts,
        outUrl: undefined,
        outName: undefined,
        outSize: undefined,
        error: undefined,
      });
      queueRef.current.push({ id, file: cur.file, opts });
      void pump();
    },
    [currentOpts, patch, pump],
  );

  const removeItem = useCallback((id: string) => {
    const cur = itemsRef.current.find((x) => x.id === id);
    if (cur?.outUrl) URL.revokeObjectURL(cur.outUrl);
    canceledRef.current.add(id);
    queueRef.current = queueRef.current.filter((j) => j.id !== id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    itemsRef.current.forEach((it) => {
      if (it.outUrl) URL.revokeObjectURL(it.outUrl);
      canceledRef.current.add(it.id);
    });
    queueRef.current = [];
    setItems([]);
  }, []);

  const doneItems = items.filter((it) => it.status === "done");

  async function downloadAllZip() {
    const done = itemsRef.current.filter(
      (it) => it.status === "done" && it.outUrl && it.outName,
    );
    if (done.length === 0) return;
    setZipping(true);
    try {
      const used = new Set<string>();
      const named = done.map((it) => ({
        it,
        name: dedupeName(it.outName as string, used),
      }));
      const entries = await Promise.all(
        named.map(async ({ it, name }) => {
          const res = await fetch(it.outUrl as string);
          return { name, data: new Uint8Array(await res.arrayBuffer()) };
        }),
      );
      const zip = makeZip(entries);
      const url = URL.createObjectURL(zip);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pixly-videos.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // A blob URL may have been revoked mid-zip — per-item downloads still work.
    } finally {
      setZipping(false);
    }
  }

  const selectClass =
    "rounded-md border border-line-strong bg-surface px-2 py-1 text-xs font-medium text-ink focus:border-accent focus:outline-none";
  const numClass =
    "w-20 rounded-md border border-line-strong bg-surface px-2 py-1 text-xs font-medium tabular-nums text-ink focus:border-accent focus:outline-none";

  const targetHint: Record<VideoTarget, string> = {
    webm: t("vid.hintWebm"),
    mp4: t("vid.hintMp4"),
    gif: t("vid.hintGif"),
  };
  const targetSupported = (f: VideoTarget) => supported == null || supported[f];

  // Hard block: the browser can't decode video at all.
  if (!decoderOk) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-5 py-8 text-center">
        <p className="font-medium text-ink">{t("vid.noSupportTitle")}</p>
        <p className="mt-1 text-sm text-muted">{t("vid.noSupportBody")}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong hover:border-accent"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="mb-3 text-muted"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
          />
        </svg>
        <p className="text-base font-medium">{t("vid.dropOpen")}</p>
        <p className="mt-1 text-sm text-muted">{t("vid.dropSub")}</p>
      </div>

      {/* Output format selector */}
      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-ink">{t("vid.format")}</p>
        <div className="flex flex-wrap gap-2">
          {VIDEO_TARGETS.map((f) => {
            const active = target === f;
            const ok = targetSupported(f);
            return (
              <button
                key={f}
                type="button"
                disabled={!ok}
                onClick={() => setTarget(f)}
                aria-pressed={active}
                className={`flex min-w-[7.5rem] flex-col items-start gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-accent bg-accent-soft"
                    : "border-line-strong hover:border-accent"
                } ${!ok ? "cursor-not-allowed opacity-40" : ""}`}
              >
                <span className="text-sm font-semibold text-ink">
                  {f.toUpperCase()}
                </span>
                <span className="text-xs text-muted">
                  {ok ? targetHint[f] : t("vid.formatUnavailable")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quality (webm/mp4 only) + advanced toggle */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {target !== "gif" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">{t("vid.quality")}</span>
            <div className="inline-flex rounded-md border border-line-strong p-0.5">
              {QUALITIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuality(q)}
                  aria-pressed={quality === q}
                  className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    quality === q
                      ? "bg-accent text-white"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {t(`vid.quality.${q}`)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="max-w-md text-xs text-muted">
            {t("vid.gifNote", { sec: GIF_MAX_DURATION, px: GIF_MAX_WIDTH })}
          </p>
        )}

        <button
          type="button"
          onClick={() => setAdvOpen((v) => !v)}
          aria-expanded={advOpen}
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
        >
          {t("conv.advanced")}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
            className={`transition-transform ${advOpen ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Advanced settings */}
      {advOpen && (
        <div className="mt-3 rounded-xl border border-line bg-surface p-4">
          <p className="mb-3 text-xs text-muted">{t("vid.advancedSub")}</p>
          <div className="flex flex-col gap-4">
            {/* Resize */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="w-28 shrink-0 text-sm font-medium">
                {t("conv.resize")}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={resizeMode}
                  onChange={(e) => setResizeMode(e.target.value as ResizeMode)}
                  aria-label={t("conv.resize")}
                  className={selectClass}
                >
                  <option value="none">{t("conv.resizeNone")}</option>
                  <option value="width">{t("conv.resizeWidth")}</option>
                  <option value="height">{t("conv.resizeHeight")}</option>
                  <option value="dimensions">{t("conv.resizeDims")}</option>
                  <option value="percent">{t("conv.resizePercent")}</option>
                </select>

                {(resizeMode === "width" || resizeMode === "dimensions") && (
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder={t("conv.width")}
                    aria-label={t("conv.width")}
                    value={wDraft}
                    onChange={(e) => setWDraft(e.target.value)}
                    className={numClass}
                  />
                )}
                {resizeMode === "dimensions" && (
                  <span aria-hidden className="text-xs text-muted">
                    ×
                  </span>
                )}
                {(resizeMode === "height" || resizeMode === "dimensions") && (
                  <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    placeholder={t("conv.height")}
                    aria-label={t("conv.height")}
                    value={hDraft}
                    onChange={(e) => setHDraft(e.target.value)}
                    className={numClass}
                  />
                )}
                {resizeMode === "percent" && (
                  <input
                    type="number"
                    min={1}
                    max={400}
                    inputMode="numeric"
                    placeholder={t("conv.percent")}
                    aria-label={t("conv.percent")}
                    value={pDraft}
                    onChange={(e) => setPDraft(e.target.value)}
                    className={numClass}
                  />
                )}
              </div>
            </div>

            {/* FPS — GIF only */}
            {target === "gif" && (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="w-28 shrink-0 text-sm font-medium">
                  {t("vid.fps")}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    inputMode="numeric"
                    aria-label={t("vid.fps")}
                    value={fps}
                    onChange={(e) =>
                      setFps(Math.min(30, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className={numClass}
                  />
                  <span className="text-xs text-muted">{t("vid.fpsHint")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              {t("conv.converted", { done: doneItems.length, total: items.length })}
            </span>
            <div className="flex items-center gap-4">
              {doneItems.length >= 2 && (
                <button
                  onClick={downloadAllZip}
                  disabled={zipping}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {zipping
                    ? t("conv.zipping")
                    : t("conv.downloadAll", { n: doneItems.length })}
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-sm text-muted underline-offset-2 hover:underline"
              >
                {t("conv.clear")}
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {it.file.name}
                    {it.status !== "error" && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        → {it.opts.target.toUpperCase()}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted">
                    {formatBytes(it.file.size)}
                    {it.status === "done" && it.outSize != null && (
                      <>
                        {" → "}
                        {formatBytes(it.outSize)}
                        {it.outSize < it.file.size && (
                          <span className="ml-1 text-good">
                            −{Math.round((1 - it.outSize / it.file.size) * 100)}%
                          </span>
                        )}
                      </>
                    )}
                  </p>

                  {/* Progress bar while encoding */}
                  {it.status === "encoding" && (
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-accent transition-[width] duration-200 motion-reduce:transition-none"
                        style={{ width: `${Math.round(it.progress * 100)}%` }}
                      />
                    </div>
                  )}

                  {/* Error message — in the info column so it can wrap fully. */}
                  {it.status === "error" && it.error && (
                    <p className="mt-1 text-xs text-red-500">{it.error}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {it.status === "queued" && (
                    <span className="text-xs text-muted">{t("vid.queued")}</span>
                  )}
                  {it.status === "encoding" && (
                    <span className="text-xs tabular-nums text-muted">
                      {Math.round(it.progress * 100)}%
                    </span>
                  )}
                  {it.status === "error" && (
                    <button
                      type="button"
                      onClick={() => reconvertItem(it.id)}
                      className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                    >
                      {t("vid.reconvert")}
                    </button>
                  )}
                  {it.status === "done" && it.outUrl && (
                    <>
                      <button
                        type="button"
                        onClick={() => reconvertItem(it.id)}
                        className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        {t("vid.reconvert")}
                      </button>
                      <a
                        href={it.outUrl}
                        download={it.outName}
                        className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                      >
                        {t("conv.download")}
                      </a>
                    </>
                  )}
                  {(it.status === "error" || it.status === "queued") && (
                    <button
                      type="button"
                      onClick={() => removeItem(it.id)}
                      aria-label={t("vid.remove")}
                      className="text-muted transition-colors hover:text-ink"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
