// Copies the pdf.js worker into /public so it ships with the static export.
//
// pdfjs-dist renders PDFs in a Web Worker. Under `output: "export"` (served by
// Cloudflare Workers Static Assets) the safest way to load it is a same-origin
// absolute path — /pdf.worker.min.mjs — set via
// `pdfjsLib.GlobalWorkerOptions.workerSrc` in lib/pdf.ts. That file must be a
// copy of the worker from the *installed* pdfjs-dist build, so this script
// re-copies it. Wired as an npm "postinstall" so the copy stays in sync on
// every install/upgrade. Defensive: never throws (won't break installs).

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const destDir = join(root, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

try {
  if (!existsSync(src)) {
    console.warn(`[copy-pdf-worker] source not found, skipped: ${src}`);
  } else {
    mkdirSync(destDir, { recursive: true });
    copyFileSync(src, dest);
    console.log("[copy-pdf-worker] copied pdf.worker.min.mjs → public/");
  }
} catch (err) {
  console.warn(`[copy-pdf-worker] skipped: ${err?.message ?? err}`);
}
