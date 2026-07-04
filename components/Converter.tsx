"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Format } from "@/lib/conversions";
import { FORMATS, detectFormat } from "@/lib/conversions";
import { convertImage, formatBytes, outputFilename } from "@/lib/convert";
import { compressToTargetSize, supportsTargetSize } from "@/lib/compress";
import { dedupeName, makeZip } from "@/lib/zip";
import { useI18n } from "@/lib/i18n";

// Every file carries its OWN encode settings, so each row is tuned independently
// (quality slider vs. target-size — and both are only offered when the target
// format supports them).
interface Item {
  id: string;
  file: File;
  sourceFmt: Format | null;
  status: "converting" | "done" | "error";
  outUrl?: string;
  outName?: string;
  outSize?: number;
  error?: string;
  /** Per-file encode mode. `size` is only reachable for jpg/webp targets. */
  mode: "quality" | "size";
  /** 0..1 encode quality (used by lossy targets). */
  quality: number;
  /** Target size in KB (used in `size` mode). */
  targetKB: number;
}

type Settings =
  | { mode: "quality"; quality: number }
  | { mode: "size"; targetBytes: number };

const DEFAULT_QUALITY = 0.92;
const DEFAULT_TARGET_KB = 300;

export default function Converter({ from, to }: { from: Format; to: Format }) {
  const [items, setItems] = useState<Item[]>([]);
  const [zipping, setZipping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  // The output is fixed to `to`. These page-level flags decide which per-row
  // control (if any) each file gets: size-targeting is only meaningful for
  // jpg/webp, a quality slider only for lossy targets, and nothing at all for
  // lossless ones (png/gif/…), where quality has no effect.
  const canSize = supportsTargetSize(to);
  const lossy = FORMATS[to].lossy;

  // A file is convertible on this focused page only when it decoded to exactly
  // this page's source format. Written as a type guard so `it.sourceFmt`
  // narrows to `Format` at the call sites.
  const isConvertible = useCallback(
    (fmt: Format | null): fmt is Format => fmt === from,
    [from],
  );

  // Revoke object URLs on unmount to avoid leaking blob memory.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
    };
  }, []);

  // Per-item generation token. Every (re)conversion bumps the item's gen; a
  // conversion that finishes after a newer one was kicked off is stale and its
  // result is discarded (and its blob revoked) instead of clobbering the fresh
  // output and leaking the URL.
  const genRef = useRef(new Map<string, number>());

  const runConvert = useCallback(
    async (id: string, file: File, settings: Settings, gen: number) => {
      try {
        const blob =
          settings.mode === "size" && supportsTargetSize(to)
            ? (await compressToTargetSize(file, to, settings.targetBytes)).blob
            : await convertImage(file, to, {
                quality: settings.mode === "quality" ? settings.quality : undefined,
              });
        if (genRef.current.get(id) !== gen) return; // superseded — drop it
        const outUrl = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: "done",
                  outUrl,
                  outName: outputFilename(file.name, to),
                  outSize: blob.size,
                }
              : it,
          ),
        );
      } catch (e) {
        if (genRef.current.get(id) !== gen) return; // superseded — ignore error
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: "error",
                  error: e instanceof Error ? e.message : "Conversion failed.",
                }
              : it,
          ),
        );
      }
    },
    [to],
  );

  // Translate a row's mode/quality/targetKB into the engine's Settings. Size
  // mode is clamped away for targets that can't do it, falling back to quality.
  const settingsFor = useCallback(
    (mode: "quality" | "size", quality: number, targetKB: number): Settings =>
      canSize && mode === "size"
        ? { mode: "size", targetBytes: Math.max(1, targetKB) * 1024 }
        : { mode: "quality", quality },
    [canSize],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const newItems: Item[] = files.map((file) => {
        const sourceFmt = detectFormat(file);
        const ok = isConvertible(sourceFmt);
        return {
          id: crypto.randomUUID(),
          file,
          sourceFmt,
          status: ok ? "converting" : "error",
          // Focused pages reject files that aren't this page's source format.
          error: ok ? undefined : t("conv.unsupported"),
          mode: "quality" as const,
          quality: DEFAULT_QUALITY,
          targetKB: DEFAULT_TARGET_KB,
        };
      });
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => {
        if (!isConvertible(it.sourceFmt)) return;
        genRef.current.set(it.id, 1);
        runConvert(it.id, it.file, settingsFor(it.mode, it.quality, it.targetKB), 1);
      });
    },
    [runConvert, settingsFor, t, isConvertible],
  );

  // Live-edit one numeric field of one row WITHOUT reconverting — e.g. dragging
  // a slider updates the visible % instantly; the re-encode fires on release.
  const setItemNumber = useCallback(
    (id: string, key: "quality" | "targetKB", value: number) => {
      setItems((prev) =>
        prev.map((it) => (it.id === id ? { ...it, [key]: value } : it)),
      );
    },
    [],
  );

  // Re-encode a SINGLE row with its own (optionally patched) settings. Bumps the
  // row's gen, revokes its now-stale blob, and marks it converting. Side effects
  // run OUTSIDE the state updater so StrictMode's double-invoke can't leak URLs
  // or double-fire the conversion.
  const reconvertItem = useCallback(
    (id: string, patch?: Partial<Pick<Item, "mode" | "quality" | "targetKB">>) => {
      const cur = itemsRef.current.find((x) => x.id === id);
      if (!cur || !isConvertible(cur.sourceFmt)) return;
      const mode = patch?.mode ?? cur.mode;
      const quality = patch?.quality ?? cur.quality;
      const targetKB = patch?.targetKB ?? cur.targetKB;
      if (cur.outUrl) URL.revokeObjectURL(cur.outUrl);
      const g = (genRef.current.get(id) ?? 0) + 1;
      genRef.current.set(id, g);
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? {
                ...it,
                mode,
                quality,
                targetKB,
                status: "converting" as const,
                outUrl: undefined,
                outName: undefined,
                outSize: undefined,
                error: undefined,
              }
            : it,
        ),
      );
      runConvert(id, cur.file, settingsFor(mode, quality, targetKB), g);
    },
    [isConvertible, runConvert, settingsFor],
  );

  function clearAll() {
    items.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
    setItems([]);
  }

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
      a.download = "pixly-images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // A blob URL may have been revoked mid-zip (e.g. the user reconverted a
      // row while zipping). Swallow it — the per-item downloads still work.
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="w-full">
      {/* Dropzone — accepts only this page's source format. */}
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
          accept={FORMATS[from].accept}
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
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
          />
        </svg>
        <p className="text-base font-medium">
          {t("conv.dropOpen", { fmt: FORMATS[from].label })}
        </p>
        <p className="mt-1 text-sm text-muted">{t("conv.dropSub")}</p>
      </div>

      {/* The output is fixed on a focused page, so we show a static pair label
          (e.g. "PNG → JPG") instead of an output-format picker. */}
      <div className="mt-5">
        <div
          className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-semibold text-ink"
          aria-label={`${FORMATS[from].label} → ${FORMATS[to].label}`}
        >
          <span>{FORMATS[from].label}</span>
          <span aria-hidden className="text-accent">
            →
          </span>
          <span>{FORMATS[to].label}</span>
        </div>
      </div>

      {/* Results — each row carries its own compact quality/size control. */}
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
            {items.map((it) => {
              const effMode: "quality" | "size" = canSize ? it.mode : "quality";
              const showControl = isConvertible(it.sourceFmt) && (canSize || lossy);
              return (
                <li
                  key={it.id}
                  className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {it.file.name}
                      {isConvertible(it.sourceFmt) && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          {FORMATS[it.sourceFmt].label} → {FORMATS[to].label}
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
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-end">
                    {/* Per-row quality / target-size control (lossy targets only). */}
                    {showControl && (
                      <div className="flex items-center gap-2">
                        {canSize && (
                          <div className="inline-flex rounded-md border border-line-strong p-0.5">
                            <button
                              type="button"
                              onClick={() =>
                                effMode !== "quality" &&
                                reconvertItem(it.id, { mode: "quality" })
                              }
                              aria-pressed={effMode === "quality"}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                effMode === "quality"
                                  ? "bg-accent text-white"
                                  : "text-muted hover:text-ink"
                              }`}
                            >
                              {t("conv.modeQuality")}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                effMode !== "size" &&
                                reconvertItem(it.id, { mode: "size" })
                              }
                              aria-pressed={effMode === "size"}
                              className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                                effMode === "size"
                                  ? "bg-accent text-white"
                                  : "text-muted hover:text-ink"
                              }`}
                            >
                              {t("conv.sizeShort")}
                            </button>
                          </div>
                        )}

                        {effMode === "quality" ? (
                          <label
                            className="flex items-center gap-1.5"
                            title={t("conv.quality")}
                          >
                            <span className="sr-only">{t("conv.quality")}</span>
                            <input
                              type="range"
                              min={0.4}
                              max={1}
                              step={0.01}
                              value={it.quality}
                              onChange={(e) =>
                                setItemNumber(it.id, "quality", Number(e.target.value))
                              }
                              onMouseUp={() => reconvertItem(it.id)}
                              onTouchEnd={() => reconvertItem(it.id)}
                              aria-label={t("conv.quality")}
                              className="h-1 w-20 cursor-pointer accent-[var(--accent)]"
                            />
                            <span className="w-7 text-right text-xs tabular-nums text-muted">
                              {Math.round(it.quality * 100)}
                            </span>
                          </label>
                        ) : (
                          <label
                            className="flex items-center gap-1"
                            title={t("conv.targetSize")}
                          >
                            <span className="sr-only">{t("conv.targetSize")}</span>
                            <input
                              type="number"
                              min={5}
                              step={10}
                              value={it.targetKB}
                              onChange={(e) =>
                                setItemNumber(
                                  it.id,
                                  "targetKB",
                                  Number(e.target.value) || 0,
                                )
                              }
                              onBlur={() => reconvertItem(it.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                              }}
                              aria-label={t("conv.targetSize")}
                              className="w-16 rounded-md border border-line-strong bg-surface px-2 py-1 text-xs font-medium tabular-nums text-ink focus:border-accent focus:outline-none"
                            />
                            <span className="text-xs text-muted">KB</span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Status / download */}
                    <div className="flex shrink-0 items-center">
                      {it.status === "converting" && (
                        <span className="text-xs text-muted">
                          {t("conv.converting")}
                        </span>
                      )}
                      {it.status === "error" && (
                        <span className="max-w-[12rem] truncate text-xs text-red-500">
                          {it.error}
                        </span>
                      )}
                      {it.status === "done" && it.outUrl && (
                        <a
                          href={it.outUrl}
                          download={it.outName}
                          className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                          {t("conv.download")}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
