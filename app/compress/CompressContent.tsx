"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Format } from "@/lib/conversions";
import { FORMATS, INPUT_ACCEPT, detectFormat } from "@/lib/conversions";
import { convertImage, formatBytes, outputFilename } from "@/lib/convert";
import { compressToTargetSize } from "@/lib/compress";
import { dedupeName, makeZip } from "@/lib/zip";
import { useI18n } from "@/lib/i18n";

// Output formats worth compressing to. Both are lossy Canvas encoders, so both
// support target-size mode (see lib/compress.ts TARGET_SIZE_FORMATS).
const OUTPUTS: Format[] = ["jpg", "webp"];

interface Item {
  id: string;
  file: File;
  supported: boolean;
  status: "working" | "done" | "error";
  outUrl?: string;
  outName?: string;
  outSize?: number;
  /** True when even the lowest quality still exceeded the target size. */
  overTarget?: boolean;
  error?: string;
}

type Settings =
  | { mode: "size"; format: Format; targetBytes: number }
  | { mode: "quality"; format: Format; quality: number };

export default function CompressContent() {
  const { t } = useI18n();
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<Format>("jpg");
  const [mode, setMode] = useState<"size" | "quality">("size");
  const [targetKB, setTargetKB] = useState(300);
  const [quality, setQuality] = useState(0.8);
  const [zipping, setZipping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const buildSettings = useCallback(
    (): Settings =>
      mode === "size"
        ? { mode: "size", format, targetBytes: Math.max(1, targetKB) * 1024 }
        : { mode: "quality", format, quality },
    [mode, format, targetKB, quality],
  );

  // Revoke object URLs on unmount so blob memory isn't leaked.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach(
        (it) => it.outUrl && URL.revokeObjectURL(it.outUrl),
      );
    };
  }, []);

  // Per-item generation token: a compression that finishes after a newer one was
  // kicked off (e.g. the user changed the target) is stale — drop it and revoke.
  const genRef = useRef(new Map<string, number>());

  const run = useCallback(
    async (id: string, file: File, settings: Settings, gen: number) => {
      try {
        let blob: Blob;
        let overTarget = false;
        if (settings.mode === "size") {
          const res = await compressToTargetSize(
            file,
            settings.format,
            settings.targetBytes,
          );
          blob = res.blob;
          overTarget = res.overTarget;
        } else {
          blob = await convertImage(file, settings.format, {
            quality: settings.quality,
          });
        }
        if (genRef.current.get(id) !== gen) return; // superseded
        const outUrl = URL.createObjectURL(blob);
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: "done",
                  outUrl,
                  outName: outputFilename(file.name, settings.format),
                  outSize: blob.size,
                  overTarget,
                  error: undefined,
                }
              : it,
          ),
        );
      } catch (e) {
        if (genRef.current.get(id) !== gen) return;
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: "error",
                  error: e instanceof Error ? e.message : "Compression failed.",
                }
              : it,
          ),
        );
      }
    },
    [],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const settings = buildSettings();
      const newItems: Item[] = files.map((file) => {
        const supported = detectFormat(file) != null;
        return {
          id: crypto.randomUUID(),
          file,
          supported,
          status: supported ? "working" : "error",
          error: supported ? undefined : t("conv.unsupported"),
        };
      });
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => {
        if (!it.supported) return;
        genRef.current.set(it.id, 1);
        run(it.id, it.file, settings, 1);
      });
    },
    [buildSettings, run, t],
  );

  // Re-compress everything with fresh settings. Side effects (revoke, kick off)
  // run outside the state updater so StrictMode's double-invoke can't leak URLs.
  const recompressAll = useCallback(
    (settings: Settings) => {
      const current = itemsRef.current;
      current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
      const bumped = new Map<string, number>();
      current.forEach((it) => {
        if (!it.supported) return;
        const g = (genRef.current.get(it.id) ?? 0) + 1;
        genRef.current.set(it.id, g);
        bumped.set(it.id, g);
      });
      setItems((prev) =>
        prev.map((it) =>
          it.supported
            ? {
                ...it,
                status: "working" as const,
                outUrl: undefined,
                outSize: undefined,
                overTarget: undefined,
                error: undefined,
              }
            : it,
        ),
      );
      current.forEach(
        (it) =>
          it.supported &&
          run(it.id, it.file, settings, bumped.get(it.id) as number),
      );
    },
    [run],
  );

  const hasItems = items.length > 0;

  function changeFormat(next: Format) {
    if (next === format) return;
    setFormat(next);
    if (hasItems) {
      recompressAll(
        mode === "size"
          ? { mode: "size", format: next, targetBytes: Math.max(1, targetKB) * 1024 }
          : { mode: "quality", format: next, quality },
      );
    }
  }

  function switchMode(next: "size" | "quality") {
    if (next === mode) return;
    setMode(next);
    if (hasItems) {
      recompressAll(
        next === "size"
          ? { mode: "size", format, targetBytes: Math.max(1, targetKB) * 1024 }
          : { mode: "quality", format, quality },
      );
    }
  }

  function applyTargetSize() {
    if (hasItems && mode === "size") {
      recompressAll({
        mode: "size",
        format,
        targetBytes: Math.max(1, targetKB) * 1024,
      });
    }
  }

  function applyQuality() {
    if (hasItems && mode === "quality") {
      recompressAll({ mode: "quality", format, quality });
    }
  }

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
      a.download = "pixly-compressed.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // A blob URL may have been revoked mid-zip (e.g. re-compressed while
      // zipping). Swallow it — the per-item downloads still work.
    } finally {
      setZipping(false);
    }
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
          accept={INPUT_ACCEPT}
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
        <p className="text-base font-medium">{t("compress.dropOpen")}</p>
        <p className="mt-1 text-sm text-muted">{t("compress.dropSub")}</p>
      </div>

      {/* Controls: output format + quality / target size */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="cformat" className="text-sm text-muted">
            {t("compress.format")}
          </label>
          <select
            id="cformat"
            value={format}
            onChange={(e) => changeFormat(e.target.value as Format)}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            {OUTPUTS.map((f) => (
              <option key={f} value={f}>
                {FORMATS[f].label}
              </option>
            ))}
          </select>
        </div>

        {/* Target size ↔ Quality toggle */}
        <div className="inline-flex rounded-lg border border-line-strong p-0.5">
          <button
            type="button"
            onClick={() => switchMode("size")}
            aria-pressed={mode === "size"}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "size" ? "bg-accent text-white" : "text-muted hover:text-ink"
            }`}
          >
            {t("conv.modeSize")}
          </button>
          <button
            type="button"
            onClick={() => switchMode("quality")}
            aria-pressed={mode === "quality"}
            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
              mode === "quality"
                ? "bg-accent text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {t("conv.modeQuality")}
          </button>
        </div>

        {mode === "size" && (
          <div className="flex items-center gap-2">
            <label htmlFor="ctargetkb" className="text-sm text-muted">
              {t("conv.targetSize")}
            </label>
            <input
              id="ctargetkb"
              type="number"
              min={5}
              step={10}
              value={targetKB}
              onChange={(e) => setTargetKB(Number(e.target.value) || 0)}
              onBlur={applyTargetSize}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyTargetSize();
                }
              }}
              className="w-20 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium tabular-nums text-ink focus:border-accent focus:outline-none"
            />
            <span className="text-sm text-muted">KB</span>
          </div>
        )}

        {mode === "quality" && (
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="cquality" className="text-sm text-muted">
              {t("conv.quality")}
            </label>
            <input
              id="cquality"
              type="range"
              min={0.4}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              onMouseUp={applyQuality}
              onTouchEnd={applyQuality}
              className="h-1 flex-1 cursor-pointer accent-[var(--accent)]"
            />
            <span className="w-10 text-right text-sm tabular-nums text-muted">
              {Math.round(quality * 100)}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              {t("compress.compressed", {
                done: doneItems.length,
                total: items.length,
              })}
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
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {it.file.name}
                    <span className="ml-2 text-xs font-normal text-muted">
                      → {FORMATS[format].label}
                    </span>
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
                        {it.overTarget && (
                          <span className="ml-1 text-muted">
                            · {t("compress.overTarget")}
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {it.status === "working" && (
                  <span className="text-xs text-muted">
                    {t("compress.working")}
                  </span>
                )}
                {it.status === "error" && (
                  <span className="max-w-[45%] truncate text-xs text-red-500">
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
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
