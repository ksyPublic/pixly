"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Format } from "@/lib/conversions";
import {
  FORMATS,
  INPUT_ACCEPT,
  OUTPUT_FORMATS,
  detectFormat,
} from "@/lib/conversions";
import { convertImage, formatBytes, outputFilename } from "@/lib/convert";
import { compressToTargetSize, supportsTargetSize } from "@/lib/compress";
import { dedupeName, makeZip } from "@/lib/zip";
import { useI18n } from "@/lib/i18n";

interface Item {
  id: string;
  file: File;
  sourceFmt: Format | null;
  status: "converting" | "done" | "error";
  outUrl?: string;
  outName?: string;
  outSize?: number;
  error?: string;
}

type Settings =
  | { mode: "quality"; quality: number }
  | { mode: "size"; targetBytes: number };

export default function Converter({ from, to }: { from: Format; to: Format }) {
  const [target, setTarget] = useState<Format>(to);
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [mode, setMode] = useState<"quality" | "size">("quality");
  const [targetKB, setTargetKB] = useState(300);
  const [zipping, setZipping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lossy = FORMATS[target].lossy;
  const canSize = supportsTargetSize(target);
  const effMode: "quality" | "size" = canSize ? mode : "quality";
  const { t } = useI18n();

  const buildSettings = useCallback(
    (): Settings =>
      effMode === "size"
        ? { mode: "size", targetBytes: Math.max(1, targetKB) * 1024 }
        : { mode: "quality", quality },
    [effMode, targetKB, quality],
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
    async (id: string, file: File, tgt: Format, settings: Settings, gen: number) => {
      try {
        const blob =
          settings.mode === "size" && supportsTargetSize(tgt)
            ? (await compressToTargetSize(file, tgt, settings.targetBytes)).blob
            : await convertImage(file, tgt, {
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
                  outName: outputFilename(file.name, tgt),
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
    [],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const settings = buildSettings();
      const newItems: Item[] = files.map((file) => {
        const sourceFmt = detectFormat(file);
        return {
          id: crypto.randomUUID(),
          file,
          sourceFmt,
          status: sourceFmt ? "converting" : "error",
          error: sourceFmt ? undefined : t("conv.unsupported"),
        };
      });
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => {
        if (!it.sourceFmt) return;
        genRef.current.set(it.id, 1);
        runConvert(it.id, it.file, target, settings, 1);
      });
    },
    [target, buildSettings, runConvert, t],
  );

  // Re-encode everything when the target format, quality, or mode changes.
  // Side effects (URL revoke, kicking off conversions) run OUTSIDE the state
  // updater so React StrictMode's double-invoke can't leak URLs or double-fire.
  const reconvertAll = useCallback(
    (tgt: Format, settings: Settings) => {
      const current = itemsRef.current;
      current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
      const bumped = new Map<string, number>();
      current.forEach((it) => {
        if (!it.sourceFmt) return;
        const g = (genRef.current.get(it.id) ?? 0) + 1;
        genRef.current.set(it.id, g);
        bumped.set(it.id, g);
      });
      setItems((prev) =>
        prev.map((it) =>
          it.sourceFmt
            ? {
                ...it,
                status: "converting" as const,
                outUrl: undefined,
                outSize: undefined,
                error: undefined,
              }
            : it,
        ),
      );
      current.forEach(
        (it) =>
          it.sourceFmt &&
          runConvert(it.id, it.file, tgt, settings, bumped.get(it.id) as number),
      );
    },
    [runConvert],
  );

  const hasItems = items.length > 0;

  function changeTarget(next: Format) {
    setTarget(next);
    if (hasItems) {
      const nextEff = supportsTargetSize(next) ? mode : "quality";
      const settings: Settings =
        nextEff === "size"
          ? { mode: "size", targetBytes: Math.max(1, targetKB) * 1024 }
          : { mode: "quality", quality };
      reconvertAll(next, settings);
    }
  }

  function switchMode(next: "quality" | "size") {
    if (next === mode) return;
    setMode(next);
    if (hasItems) {
      const settings: Settings =
        next === "size"
          ? { mode: "size", targetBytes: Math.max(1, targetKB) * 1024 }
          : { mode: "quality", quality };
      reconvertAll(target, settings);
    }
  }

  function applyTargetSize() {
    if (hasItems && effMode === "size") {
      reconvertAll(target, {
        mode: "size",
        targetBytes: Math.max(1, targetKB) * 1024,
      });
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
      a.download = "pixly-images.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // A blob URL may have been revoked mid-zip (e.g. the user reconverted
      // while zipping). Swallow it — the per-item downloads still work.
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
        <p className="text-base font-medium">
          {t("conv.dropOpen", { fmt: FORMATS[from].label })}
        </p>
        <p className="mt-1 text-sm text-muted">{t("conv.dropSub")}</p>
      </div>

      {/* Controls: target format + quality / target size */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="target" className="text-sm text-muted">
            {t("conv.to")}
          </label>
          <select
            id="target"
            value={target}
            onChange={(e) => changeTarget(e.target.value as Format)}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f} value={f}>
                {FORMATS[f].label}
              </option>
            ))}
          </select>
        </div>

        {/* Quality ↔ Target size toggle (only where size targeting is possible) */}
        {canSize && (
          <div className="inline-flex rounded-lg border border-line-strong p-0.5">
            <button
              type="button"
              onClick={() => switchMode("quality")}
              aria-pressed={effMode === "quality"}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                effMode === "quality"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t("conv.modeQuality")}
            </button>
            <button
              type="button"
              onClick={() => switchMode("size")}
              aria-pressed={effMode === "size"}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                effMode === "size"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {t("conv.modeSize")}
            </button>
          </div>
        )}

        {effMode === "quality" && lossy && (
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="quality" className="text-sm text-muted">
              {t("conv.quality")}
            </label>
            <input
              id="quality"
              type="range"
              min={0.4}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              onMouseUp={() =>
                hasItems && reconvertAll(target, { mode: "quality", quality })
              }
              onTouchEnd={() =>
                hasItems && reconvertAll(target, { mode: "quality", quality })
              }
              className="h-1 flex-1 cursor-pointer accent-[var(--accent)]"
            />
            <span className="w-10 text-right text-sm tabular-nums text-muted">
              {Math.round(quality * 100)}
            </span>
          </div>
        )}

        {effMode === "size" && (
          <div className="flex items-center gap-2">
            <label htmlFor="targetkb" className="text-sm text-muted">
              {t("conv.targetSize")}
            </label>
            <input
              id="targetkb"
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
      </div>

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
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {it.file.name}
                    {it.sourceFmt && (
                      <span className="ml-2 text-xs font-normal text-muted">
                        {FORMATS[it.sourceFmt].label} → {FORMATS[target].label}
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

                {it.status === "converting" && (
                  <span className="text-xs text-muted">
                    {t("conv.converting")}
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
