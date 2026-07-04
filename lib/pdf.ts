// Client-side PDF engine. Everything here runs in the browser — nothing is ever
// uploaded. Two directions:
//   • imagesToPdf  — combine JPG/PNG images into one PDF via pdf-lib (pure JS,
//     no DOM, no worker). Lazy-imported so its weight only loads on use.
//   • pdfToImages  — render each PDF page to a JPG/PNG via pdfjs-dist, which
//     needs a Web Worker. THIS IS BROWSER-ONLY: pdfjs-dist is dynamically
//     imported inside the call path so it never touches a server/module top
//     level (which would break `output: "export"`).
//
// pdf.js worker (static-export / Cloudflare Workers Static Assets):
//   The worker is served from /public as a same-origin absolute path
//   (`/pdf.worker.min.mjs`) so Cloudflare serves it with a real .mjs extension
//   and correct JS MIME type. We deliberately DON'T use
//   `new URL("...", import.meta.url)` — that isn't guaranteed to be emitted to
//   out/ under Turbopack + output:export, whereas the public/ copy always is.
//
//   IMPORTANT: public/pdf.worker.min.mjs is a pinned copy of
//   node_modules/pdfjs-dist/build/pdf.worker.min.mjs for pdfjs-dist 6.1.200 and
//   MUST match the installed pdfjs-dist version. On upgrade, re-copy it
//   (`node scripts/copy-pdf-worker.mjs`, also wired as an npm postinstall).

import type { PDFImage } from "pdf-lib";

// ── Image → PDF ──────────────────────────────────────────────────────────────

export type PdfPageSize = "fit" | "a4" | "letter";
export type PdfOrientation = "auto" | "portrait" | "landscape";

export interface ImagesToPdfOptions {
  /** Page geometry: match each image ("fit"), or a fixed A4/Letter sheet. */
  pageSize?: PdfPageSize;
  /** Only meaningful for a4/letter. "auto" picks per image aspect ratio. */
  orientation?: PdfOrientation;
  /** Uniform margin in PDF points (1pt = 1/72 inch). */
  margin?: number;
}

// Standard sheet sizes in PDF points (portrait).
const SHEETS: Record<Exclude<PdfPageSize, "fit">, { w: number; h: number }> = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
};

/** Sniff PNG/JPEG from the leading magic bytes; fall back to name/type. */
function sniffImageKind(bytes: Uint8Array, file: File): "png" | "jpg" | null {
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return "jpg";
  const name = file.name.toLowerCase();
  if (/png/.test(file.type) || name.endsWith(".png")) return "png";
  if (/jpe?g/.test(file.type) || /\.jpe?g$/.test(name)) return "jpg";
  return null;
}

/** Combine one or more JPG/PNG images into a single PDF (one image per page). */
export async function imagesToPdf(
  files: File[],
  opts: ImagesToPdfOptions = {},
): Promise<Blob> {
  if (files.length === 0) throw new Error("No images to combine.");
  const { pageSize = "fit", orientation = "auto", margin = 0 } = opts;

  // Lazy — pdf-lib only loads when a PDF is actually built.
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImageKind(bytes, file);

    let image: PDFImage;
    try {
      image =
        kind === "png"
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
    } catch {
      // Extension/type lied about the real bytes — try the other decoder.
      try {
        image =
          kind === "png"
            ? await pdf.embedJpg(bytes)
            : await pdf.embedPng(bytes);
      } catch {
        throw new Error(`"${file.name}" isn't a valid JPG or PNG image.`);
      }
    }

    const iw = image.width;
    const ih = image.height;

    let pageW: number;
    let pageH: number;
    let drawW: number;
    let drawH: number;
    let x: number;
    let y: number;

    if (pageSize === "fit") {
      // Page equals the image plus an optional uniform margin.
      drawW = iw;
      drawH = ih;
      pageW = iw + margin * 2;
      pageH = ih + margin * 2;
      x = margin;
      y = margin;
    } else {
      const sheet = SHEETS[pageSize];
      let w = sheet.w;
      let h = sheet.h;
      const landscape =
        orientation === "landscape"
          ? true
          : orientation === "portrait"
            ? false
            : iw > ih; // auto
      if (landscape) [w, h] = [h, w];
      pageW = w;
      pageH = h;
      // Scale the image to fit inside the printable area, preserving aspect.
      const availW = Math.max(1, w - margin * 2);
      const availH = Math.max(1, h - margin * 2);
      const scale = Math.min(availW / iw, availH / ih);
      drawW = iw * scale;
      drawH = ih * scale;
      x = (w - drawW) / 2;
      y = (h - drawH) / 2;
    }

    const page = pdf.addPage([pageW, pageH]);
    page.drawImage(image, { x, y, width: drawW, height: drawH });
  }

  const out = await pdf.save();
  // `out` is a Uint8Array backed by a real ArrayBuffer → valid BlobPart.
  return new Blob([out as BlobPart], { type: "application/pdf" });
}

// ── PDF → Images ─────────────────────────────────────────────────────────────

export type PdfImageFormat = "jpg" | "png";

export interface PdfToImagesOptions {
  /** Render scale (canvas px per PDF point). ~2 ≈ 144 DPI. Default 2. */
  scale?: number;
  /** JPG encode quality 0..1 (ignored for PNG). Default 0.92. */
  quality?: number;
  /** Called after each page finishes, for progress UI. */
  onProgress?: (done: number, total: number) => void;
  /** Return true to stop early (e.g. a newer render superseded this one). */
  shouldCancel?: () => boolean;
}

export interface RenderedPage {
  name: string;
  blob: Blob;
}

// Configure the worker exactly once per session.
let workerConfigured = false;

/** Render every page of a PDF to a JPG or PNG image (one blob per page). */
export async function pdfToImages(
  file: File,
  format: PdfImageFormat,
  opts: PdfToImagesOptions = {},
): Promise<RenderedPage[]> {
  const { scale = 2, quality = 0.92, onProgress, shouldCancel } = opts;

  // Dynamic import keeps pdfjs-dist (and its browser-only worker wiring) out of
  // any server/build module graph — required for `output: "export"`.
  const pdfjs = await import("pdfjs-dist");
  if (!workerConfigured) {
    // Same-origin absolute path → served from /public with a real .mjs
    // extension by Cloudflare (correct JS MIME + module worker support).
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data });

  const mime = format === "png" ? "image/png" : "image/jpeg";
  const q = format === "jpg" ? quality : undefined;
  const base = file.name.replace(/\.[^./\\]+$/, "") || "page";

  const results: RenderedPage[] = [];
  try {
    const doc = await loadingTask.promise;
    const total = doc.numPages;
    const pad = String(total).length;

    for (let i = 1; i <= total; i++) {
      if (shouldCancel?.()) break;

      const page = await doc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));

      try {
        // Pass the canvas element (v6 API); pdf.js paints on a white
        // background by default, so JPG pages never come out with black fills.
        await page.render({
          canvas,
          viewport,
          background: "#ffffff",
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, mime, q),
        );
        if (!blob) throw new Error("Your browser could not encode the page.");

        const num = String(i).padStart(pad, "0");
        results.push({ name: `${base}-${num}.${format}`, blob });
        onProgress?.(i, total);
      } finally {
        page.cleanup();
        // Free the backing store promptly on long documents.
        canvas.width = 0;
        canvas.height = 0;
      }
    }
  } finally {
    // Tear down the worker/transport so memory + threads are released.
    await loadingTask.destroy();
  }

  return results;
}
