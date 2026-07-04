"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { pdfToImages, type PdfImageFormat, type RenderedPage } from "@/lib/pdf";
import { dedupeName, makeZip } from "@/lib/zip";
import { useI18n } from "@/lib/i18n";

type ScaleKey = "standard" | "high" | "max";
const SCALE: Record<ScaleKey, number> = { standard: 1.5, high: 2, max: 3 };

interface Page extends RenderedPage {
  url: string;
}

interface Doc {
  id: string;
  file: File;
  status: "rendering" | "done" | "error";
  done: number;
  total: number;
  pages: Page[];
  error?: string;
}

function isPdf(file: File): boolean {
  return /pdf/i.test(file.type) || /\.pdf$/i.test(file.name);
}

export default function PdfToImages({ format }: { format: PdfImageFormat }) {
  const { t } = useI18n();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [scaleKey, setScaleKey] = useState<ScaleKey>("high");
  const [quality, setQuality] = useState(0.92);
  const [zipping, setZipping] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live ref for cleanup — revoke every page URL on unmount.
  const docsRef = useRef(docs);
  docsRef.current = docs;
  useEffect(() => {
    return () => {
      docsRef.current.forEach((d) =>
        d.pages.forEach((p) => URL.revokeObjectURL(p.url)),
      );
    };
  }, []);

  // Per-doc generation token: a render that finishes after a newer one was
  // kicked off (e.g. resolution changed) is stale — its blobs are dropped.
  const genRef = useRef(new Map<string, number>());

  const renderDoc = useCallback(
    async (id: string, file: File, scale: number, q: number, gen: number) => {
      try {
        const pages = await pdfToImages(file, format, {
          scale,
          quality: q,
          onProgress: (done, total) => {
            if (genRef.current.get(id) !== gen) return;
            setDocs((prev) =>
              prev.map((d) =>
                d.id === id ? { ...d, done, total } : d,
              ),
            );
          },
          shouldCancel: () => genRef.current.get(id) !== gen,
        });
        if (genRef.current.get(id) !== gen) return; // superseded
        const withUrls: Page[] = pages.map((p) => ({
          ...p,
          url: URL.createObjectURL(p.blob),
        }));
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "done",
                  pages: withUrls,
                  done: withUrls.length,
                  total: withUrls.length,
                }
              : d,
          ),
        );
      } catch (e) {
        if (genRef.current.get(id) !== gen) return;
        setDocs((prev) =>
          prev.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: "error",
                  error: e instanceof Error ? e.message : t("pdf.errRender"),
                }
              : d,
          ),
        );
      }
    },
    [format, t],
  );

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const scale = SCALE[scaleKey];
      const newDocs: Doc[] = files.map((file) => {
        const ok = isPdf(file);
        return {
          id: crypto.randomUUID(),
          file,
          status: ok ? "rendering" : "error",
          done: 0,
          total: 0,
          pages: [],
          error: ok ? undefined : t("conv.unsupported"),
        };
      });
      setDocs((prev) => [...prev, ...newDocs]);
      newDocs.forEach((d) => {
        if (d.status === "error") return;
        genRef.current.set(d.id, 1);
        renderDoc(d.id, d.file, scale, quality, 1);
      });
    },
    [scaleKey, quality, renderDoc, t],
  );

  // Re-render everything with fresh settings. Side effects (revoke, kick off)
  // run outside the state updater so StrictMode's double-invoke can't leak URLs.
  const rerenderAll = useCallback(
    (scale: number, q: number) => {
      const current = docsRef.current;
      current.forEach((d) => d.pages.forEach((p) => URL.revokeObjectURL(p.url)));
      const bumped = new Map<string, number>();
      current.forEach((d) => {
        if (d.status === "error" && d.pages.length === 0 && !isPdf(d.file))
          return; // permanently-unsupported file
        const g = (genRef.current.get(d.id) ?? 0) + 1;
        genRef.current.set(d.id, g);
        bumped.set(d.id, g);
      });
      setDocs((prev) =>
        prev.map((d) =>
          bumped.has(d.id)
            ? { ...d, status: "rendering", done: 0, total: 0, pages: [], error: undefined }
            : d,
        ),
      );
      current.forEach((d) => {
        const g = bumped.get(d.id);
        if (g != null) renderDoc(d.id, d.file, scale, q, g);
      });
    },
    [renderDoc],
  );

  const hasDocs = docs.length > 0;

  function changeScale(next: ScaleKey) {
    if (next === scaleKey) return;
    setScaleKey(next);
    if (hasDocs) rerenderAll(SCALE[next], quality);
  }

  function applyQuality() {
    if (hasDocs && format === "jpg") rerenderAll(SCALE[scaleKey], quality);
  }

  function clearAll() {
    docs.forEach((d) => d.pages.forEach((p) => URL.revokeObjectURL(p.url)));
    setDocs([]);
  }

  const allPages = docs.flatMap((d) => d.pages);

  async function downloadAllZip() {
    const pages = docsRef.current.flatMap((d) => d.pages);
    if (pages.length === 0) return;
    setZipping(true);
    try {
      const used = new Set<string>();
      const entries = await Promise.all(
        pages.map(async (p) => {
          const name = dedupeName(p.name, used);
          const res = await fetch(p.url);
          return { name, data: new Uint8Array(await res.arrayBuffer()) };
        }),
      );
      const zip = makeZip(entries);
      const url = URL.createObjectURL(zip);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixly-${format}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // A page URL may have been revoked mid-zip (re-rendered). Per-page
      // downloads still work — swallow it.
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
          accept=".pdf,application/pdf"
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
        <p className="text-base font-medium">{t("pdf.dropPdf")}</p>
        <p className="mt-1 text-sm text-muted">{t("pdf.dropPdfSub")}</p>
      </div>

      {/* Options: resolution + (JPG) quality */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="pdf-res" className="text-sm text-muted">
            {t("pdf.resolution")}
          </label>
          <select
            id="pdf-res"
            value={scaleKey}
            onChange={(e) => changeScale(e.target.value as ScaleKey)}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="standard">{t("pdf.resStandard")}</option>
            <option value="high">{t("pdf.resHigh")}</option>
            <option value="max">{t("pdf.resMax")}</option>
          </select>
        </div>

        {format === "jpg" && (
          <div className="flex flex-1 items-center gap-3">
            <label htmlFor="pdf-quality" className="text-sm text-muted">
              {t("conv.quality")}
            </label>
            <input
              id="pdf-quality"
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
      {hasDocs && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              {t("pdf.renderedPages", {
                done: allPages.length,
                total: docs.reduce((n, d) => n + Math.max(d.total, d.pages.length), 0),
              })}
            </span>
            <div className="flex items-center gap-4">
              {allPages.length >= 2 && (
                <button
                  onClick={downloadAllZip}
                  disabled={zipping}
                  className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {zipping
                    ? t("conv.zipping")
                    : t("conv.downloadAll", { n: allPages.length })}
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

          <div className="flex flex-col gap-4">
            {docs.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-line bg-surface p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium">
                    {d.file.name}
                  </p>
                  {d.status === "rendering" && (
                    <span className="shrink-0 text-xs text-muted">
                      {d.total > 0
                        ? t("pdf.renderedPages", { done: d.done, total: d.total })
                        : t("pdf.readingPdf")}
                    </span>
                  )}
                  {d.status === "error" && (
                    <span className="max-w-[55%] shrink-0 truncate text-xs text-red-500">
                      {d.error}
                    </span>
                  )}
                </div>

                {d.pages.length > 0 && (
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {d.pages.map((p, i) => (
                      <li
                        key={p.name}
                        className="overflow-hidden rounded-lg border border-line bg-surface-2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.url}
                          alt=""
                          className="aspect-[3/4] w-full bg-white object-contain"
                        />
                        <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                          <span className="truncate text-xs text-muted">
                            {t("pdf.page", { n: i + 1 })}
                          </span>
                          <a
                            href={p.url}
                            download={p.name}
                            className="shrink-0 rounded-md bg-accent px-2.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
                          >
                            {t("conv.download")}
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
