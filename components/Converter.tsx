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

export default function Converter({ from, to }: { from: Format; to: Format }) {
  const [target, setTarget] = useState<Format>(to);
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lossy = FORMATS[target].lossy;

  // Revoke object URLs on unmount to avoid leaking blob memory.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
    };
  }, []);

  const runConvert = useCallback(
    async (id: string, file: File, tgt: Format, q: number) => {
      try {
        const blob = await convertImage(file, tgt, { quality: q });
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
      const newItems: Item[] = files.map((file) => {
        const sourceFmt = detectFormat(file);
        return {
          id: crypto.randomUUID(),
          file,
          sourceFmt,
          status: sourceFmt ? "converting" : "error",
          error: sourceFmt ? undefined : "Unsupported file type.",
        };
      });
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach(
        (it) => it.sourceFmt && runConvert(it.id, it.file, target, quality),
      );
    },
    [target, quality, runConvert],
  );

  // Re-encode everything when the target format or quality changes.
  const reconvertAll = useCallback(
    (tgt: Format, q: number) => {
      setItems((prev) => {
        prev.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
        const reset = prev.map((it) =>
          it.sourceFmt
            ? { ...it, status: "converting" as const, outUrl: undefined, error: undefined }
            : it,
        );
        reset.forEach(
          (it) => it.sourceFmt && runConvert(it.id, it.file, tgt, q),
        );
        return reset;
      });
    },
    [runConvert],
  );

  function changeTarget(next: Format) {
    setTarget(next);
    if (items.length > 0) reconvertAll(next, quality);
  }

  function clearAll() {
    items.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
    setItems([]);
  }

  const doneItems = items.filter((it) => it.status === "done");

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
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
            : "border-black/15 hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
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
          className="mb-3 text-black/40 dark:text-white/40"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 16.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
          />
        </svg>
        <p className="text-base font-medium">
          Drop {FORMATS[from].label} files here, or click to browse
        </p>
        <p className="mt-1 text-sm text-black/50 dark:text-white/50">
          Converted instantly in your browser · never uploaded
        </p>
      </div>

      {/* Controls: target format + quality */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="target" className="text-sm text-black/60 dark:text-white/60">
            Convert to
          </label>
          <select
            id="target"
            value={target}
            onChange={(e) => changeTarget(e.target.value as Format)}
            className="rounded-lg border border-black/15 bg-transparent px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:outline-none dark:border-white/20"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f} value={f} className="text-black">
                {FORMATS[f].label}
              </option>
            ))}
          </select>
        </div>

        {lossy && (
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="quality" className="text-sm text-black/60 dark:text-white/60">
              Quality
            </label>
            <input
              id="quality"
              type="range"
              min={0.4}
              max={1}
              step={0.01}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              onMouseUp={() => items.length > 0 && reconvertAll(target, quality)}
              onTouchEnd={() => items.length > 0 && reconvertAll(target, quality)}
              className="h-1 flex-1 cursor-pointer accent-blue-600"
            />
            <span className="w-10 text-right text-sm tabular-nums text-black/60 dark:text-white/60">
              {Math.round(quality * 100)}
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      {items.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-black/50 dark:text-white/50">
              {doneItems.length}/{items.length} converted
            </span>
            <button
              onClick={clearAll}
              className="text-sm text-black/50 underline-offset-2 hover:underline dark:text-white/50"
            >
              Clear all
            </button>
          </div>

          <ul className="flex flex-col gap-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {it.file.name}
                    {it.sourceFmt && (
                      <span className="ml-2 text-xs font-normal text-black/40 dark:text-white/40">
                        {FORMATS[it.sourceFmt].label} → {FORMATS[target].label}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-black/50 dark:text-white/50">
                    {formatBytes(it.file.size)}
                    {it.status === "done" && it.outSize != null && (
                      <>
                        {" → "}
                        {formatBytes(it.outSize)}
                        {it.outSize < it.file.size && (
                          <span className="ml-1 text-green-600 dark:text-green-400">
                            −{Math.round((1 - it.outSize / it.file.size) * 100)}%
                          </span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {it.status === "converting" && (
                  <span className="text-xs text-black/40 dark:text-white/40">
                    Converting…
                  </span>
                )}
                {it.status === "error" && (
                  <span className="max-w-[45%] truncate text-xs text-red-600 dark:text-red-400">
                    {it.error}
                  </span>
                )}
                {it.status === "done" && it.outUrl && (
                  <a
                    href={it.outUrl}
                    download={it.outName}
                    className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Download
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
