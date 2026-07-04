"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FORMATS } from "@/lib/conversions";
import { formatBytes } from "@/lib/convert";
import {
  imagesToPdf,
  type PdfOrientation,
  type PdfPageSize,
} from "@/lib/pdf";
import { useI18n } from "@/lib/i18n";

type Source = "jpg" | "png";

interface Item {
  id: string;
  file: File;
  /** Object URL for the thumbnail preview. */
  url: string;
}

type MarginKey = "none" | "small" | "large";
const MARGIN_PT: Record<MarginKey, number> = { none: 0, small: 24, large: 48 };

interface Result {
  url: string;
  name: string;
  size: number;
}

export default function ImagesToPdf({ source }: { source: Source }) {
  const { t } = useI18n();
  const [items, setItems] = useState<Item[]>([]);
  const [pageSize, setPageSize] = useState<PdfPageSize>("fit");
  const [orientation, setOrientation] = useState<PdfOrientation>("auto");
  const [marginKey, setMarginKey] = useState<MarginKey>("none");
  const [building, setBuilding] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const accept = FORMATS[source].accept;

  // Keep live refs (synced in an effect, not during render) so the unmount
  // cleanup can revoke every outstanding object URL.
  const itemsRef = useRef(items);
  const resultRef = useRef<Result | null>(result);
  useEffect(() => {
    itemsRef.current = items;
    resultRef.current = result;
  });
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => URL.revokeObjectURL(it.url));
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    };
  }, []);

  // Any change to the page list or layout options invalidates a built PDF.
  const clearResult = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    setError(null);
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      if (files.length === 0) return;
      const newItems: Item[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));
      setItems((prev) => [...prev, ...newItems]);
      clearResult();
    },
    [clearResult],
  );

  function move(id: string, dir: -1 | 1) {
    setItems((prev) => {
      const i = prev.findIndex((it) => it.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    clearResult();
  }

  function remove(id: string) {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((it) => it.id !== id);
    });
    clearResult();
  }

  function clearAll() {
    items.forEach((it) => URL.revokeObjectURL(it.url));
    setItems([]);
    clearResult();
  }

  // Generation guard: a build that finishes after a newer one was kicked off
  // (or after the inputs changed) is stale — discard it and revoke its blob.
  const buildGen = useRef(0);

  async function build() {
    if (items.length === 0 || building) return;
    const gen = ++buildGen.current;
    setBuilding(true);
    setError(null);
    // Drop any previous result up front.
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return null;
    });
    try {
      const files = items.map((it) => it.file);
      const blob = await imagesToPdf(files, {
        pageSize,
        orientation,
        margin: MARGIN_PT[marginKey],
      });
      if (buildGen.current !== gen) return; // superseded
      const url = URL.createObjectURL(blob);
      const first = items[0]?.file.name.replace(/\.[^./\\]+$/, "");
      const name = items.length === 1 && first ? `${first}.pdf` : "pixly.pdf";
      setResult({ url, name, size: blob.size });
    } catch (e) {
      if (buildGen.current !== gen) return;
      setError(e instanceof Error ? e.message : t("pdf.errBuild"));
    } finally {
      if (buildGen.current === gen) setBuilding(false);
    }
  }

  const hasItems = items.length > 0;
  const fmtLabel = FORMATS[source].label;

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
          accept={accept}
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
          {t("pdf.dropImages", { fmt: fmtLabel })}
        </p>
        <p className="mt-1 text-sm text-muted">{t("pdf.dropImagesSub")}</p>
      </div>

      {/* Layout options */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label htmlFor="pdf-pagesize" className="text-sm text-muted">
            {t("pdf.pageSize")}
          </label>
          <select
            id="pdf-pagesize"
            value={pageSize}
            onChange={(e) => {
              setPageSize(e.target.value as PdfPageSize);
              clearResult();
            }}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="fit">{t("pdf.sizeFit")}</option>
            <option value="a4">{t("pdf.sizeA4")}</option>
            <option value="letter">{t("pdf.sizeLetter")}</option>
          </select>
        </div>

        {pageSize !== "fit" && (
          <div className="flex items-center gap-2">
            <label htmlFor="pdf-orient" className="text-sm text-muted">
              {t("pdf.orientation")}
            </label>
            <select
              id="pdf-orient"
              value={orientation}
              onChange={(e) => {
                setOrientation(e.target.value as PdfOrientation);
                clearResult();
              }}
              className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
            >
              <option value="auto">{t("pdf.orientAuto")}</option>
              <option value="portrait">{t("pdf.portrait")}</option>
              <option value="landscape">{t("pdf.landscape")}</option>
            </select>
          </div>
        )}

        <div className="flex items-center gap-2">
          <label htmlFor="pdf-margin" className="text-sm text-muted">
            {t("pdf.margin")}
          </label>
          <select
            id="pdf-margin"
            value={marginKey}
            onChange={(e) => {
              setMarginKey(e.target.value as MarginKey);
              clearResult();
            }}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="none">{t("pdf.marginNone")}</option>
            <option value="small">{t("pdf.marginSmall")}</option>
            <option value="large">{t("pdf.marginLarge")}</option>
          </select>
        </div>
      </div>

      {/* Page list */}
      {hasItems && (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              {t("pdf.imageCount", { n: items.length })}
            </span>
            <button
              onClick={clearAll}
              className="text-sm text-muted underline-offset-2 hover:underline"
            >
              {t("conv.clear")}
            </button>
          </div>

          <p className="mb-3 text-xs text-muted">{t("pdf.reorderHint")}</p>

          <ul className="flex flex-col gap-2">
            {items.map((it, i) => (
              <li
                key={it.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-xs font-semibold tabular-nums text-muted">
                  {i + 1}
                </span>
                {/* Thumbnail (decorative preview of a local file). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.url}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-md border border-line object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{it.file.name}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(it.file.size)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(it.id, -1)}
                    disabled={i === 0}
                    aria-label={t("pdf.moveUp")}
                    title={t("pdf.moveUp")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 19V5m0 0-6 6m6-6 6 6"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(it.id, 1)}
                    disabled={i === items.length - 1}
                    aria-label={t("pdf.moveDown")}
                    title={t("pdf.moveDown")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 5v14m0 0 6-6m-6 6-6-6"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    aria-label={t("pdf.remove")}
                    title={t("pdf.remove")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-ink"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6l12 12M18 6 6 18"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {error && (
            <p className="mt-4 rounded-lg border border-line bg-surface px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* Primary action: build, then download. */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {result ? (
              <a
                href={result.url}
                download={result.name}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {t("pdf.downloadPdf")} · {formatBytes(result.size)}
              </a>
            ) : (
              <button
                onClick={build}
                disabled={building}
                className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {building ? t("pdf.making") : t("pdf.makePdf")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
