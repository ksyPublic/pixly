"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Format } from "@/lib/conversions";
import { FORMATS } from "@/lib/conversions";
import {
  convertImage,
  formatBytes,
  outputFilename,
} from "@/lib/convert";

interface Item {
  id: string;
  file: File;
  status: "converting" | "done" | "error";
  outUrl?: string;
  outName?: string;
  outSize?: number;
  error?: string;
}

export default function Converter({ from, to }: { from: Format; to: Format }) {
  const [items, setItems] = useState<Item[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lossy = FORMATS[to].lossy;

  // Revoke object URLs on unmount to avoid leaking blob memory.
  const itemsRef = useRef(items);
  itemsRef.current = items;
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
    };
  }, []);

  const runConvert = useCallback(
    async (id: string, file: File, q: number) => {
      try {
        const blob = await convertImage(file, to, { quality: q });
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

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const newItems: Item[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        status: "converting",
      }));
      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((it) => runConvert(it.id, it.file, quality));
    },
    [quality, runConvert],
  );

  // Re-encode everything when the quality slider changes (lossy targets only).
  const reconvertAll = useCallback(
    (q: number) => {
      setItems((prev) => {
        prev.forEach((it) => it.outUrl && URL.revokeObjectURL(it.outUrl));
        const reset = prev.map((it) => ({
          ...it,
          status: "converting" as const,
          outUrl: undefined,
        }));
        reset.forEach((it) => runConvert(it.id, it.file, q));
        return reset;
      });
    },
    [runConvert],
  );

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
          Converted to {FORMATS[to].label} instantly in your browser · never uploaded
        </p>
      </div>

      {/* Quality slider */}
      {lossy && (
        <div className="mt-5 flex items-center gap-3">
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
            onMouseUp={() => items.length > 0 && reconvertAll(quality)}
            onTouchEnd={() => items.length > 0 && reconvertAll(quality)}
            className="h-1 flex-1 cursor-pointer accent-blue-600"
          />
          <span className="w-10 text-right text-sm tabular-nums text-black/60 dark:text-white/60">
            {Math.round(quality * 100)}
          </span>
        </div>
      )}

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
                  <p className="truncate text-sm font-medium">{it.file.name}</p>
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
