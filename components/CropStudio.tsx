"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import smartcrop from "smartcrop";
import { formatBytes } from "@/lib/convert";

type Rect = { x: number; y: number; w: number; h: number };
type OutFmt = "png" | "jpg" | "webp";

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
  { label: "9:16", value: 9 / 16 },
];

const MIME: Record<OutFmt, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Fit a rectangle to a target aspect, centred on the current one, inside bounds.
function fitAspect(crop: Rect, aspect: number, W: number, H: number): Rect {
  const cx = crop.x + crop.w / 2;
  const cy = crop.y + crop.h / 2;
  let w = crop.w;
  let h = w / aspect;
  if (h > crop.h) {
    h = crop.h;
    w = h * aspect;
  }
  // shrink to fit the image
  w = Math.min(w, W);
  h = Math.min(h, H);
  if (w / h > aspect) w = h * aspect;
  else h = w / aspect;
  let x = cx - w / 2;
  let y = cy - h / 2;
  x = clamp(x, 0, W - w);
  y = clamp(y, 0, H - h);
  return { x, y, w, h };
}

export default function CropStudio() {
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState<number | null>(null);
  const [outFmt, setOutFmt] = useState<OutFmt>("png");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{
    mode: "move" | "resize";
    corner?: "nw" | "ne" | "sw" | "se";
    startX: number;
    startY: number;
    start: Rect;
    scale: number;
  } | null>(null);

  const loadFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    setNatural({ w: W, h: H });
    // Initial crop: centred 85%.
    const w = W * 0.85;
    const h = H * 0.85;
    setCrop({ x: (W - w) / 2, y: (H - h) / 2, w, h });
    setAspect(null);
  }

  const scale = () => {
    const img = imgRef.current;
    if (!img || !natural) return 1;
    return img.getBoundingClientRect().width / natural.w;
  };

  // ── pointer interactions ──────────────────────────────────────────
  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !natural) return;
      const W = natural.w;
      const H = natural.h;
      const dx = (e.clientX - d.startX) / d.scale;
      const dy = (e.clientY - d.startY) / d.scale;

      if (d.mode === "move") {
        setCrop({
          ...d.start,
          x: clamp(d.start.x + dx, 0, W - d.start.w),
          y: clamp(d.start.y + dy, 0, H - d.start.h),
        });
        return;
      }

      // resize: anchor = opposite corner
      const s = d.start;
      const anchorX = d.corner === "nw" || d.corner === "sw" ? s.x + s.w : s.x;
      const anchorY = d.corner === "nw" || d.corner === "ne" ? s.y + s.h : s.y;
      const px = clamp(
        d.corner === "nw" || d.corner === "sw" ? s.x + dx : s.x + s.w + dx,
        0,
        W,
      );
      const py = clamp(
        d.corner === "nw" || d.corner === "ne" ? s.y + dy : s.y + s.h + dy,
        0,
        H,
      );
      const signX = px >= anchorX ? 1 : -1;
      const signY = py >= anchorY ? 1 : -1;
      let w = Math.abs(px - anchorX);
      let h = Math.abs(py - anchorY);
      const maxW = signX > 0 ? W - anchorX : anchorX;
      const maxH = signY > 0 ? H - anchorY : anchorY;

      if (aspect) {
        h = w / aspect;
        if (w > maxW) {
          w = maxW;
          h = w / aspect;
        }
        if (h > maxH) {
          h = maxH;
          w = h * aspect;
        }
      } else {
        w = Math.min(w, maxW);
        h = Math.min(h, maxH);
      }
      w = Math.max(w, 16);
      h = Math.max(h, 16);
      const x = signX > 0 ? anchorX : anchorX - w;
      const y = signY > 0 ? anchorY : anchorY - h;
      setCrop({ x, y, w, h });
    },
    [natural, aspect],
  );

  const endDrag = useCallback(() => {
    drag.current = null;
    setDragging(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", endDrag);
  }, [onPointerMove]);

  function startDrag(
    e: React.PointerEvent,
    mode: "move" | "resize",
    corner?: "nw" | "ne" | "sw" | "se",
  ) {
    e.preventDefault();
    e.stopPropagation();
    drag.current = {
      mode,
      corner,
      startX: e.clientX,
      startY: e.clientY,
      start: crop,
      scale: scale(),
    };
    setDragging(true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  }

  useEffect(() => () => endDrag(), [endDrag]);

  // ── aspect + smart crop ───────────────────────────────────────────
  function chooseAspect(a: number | null) {
    setAspect(a);
    if (a && natural) setCrop((c) => fitAspect(c, a, natural.w, natural.h));
  }

  async function runSmart() {
    if (!imgRef.current || !natural || busy) return;
    setBusy(true);
    try {
      const a = aspect ?? natural.w / natural.h;
      const base = 100;
      const res = await smartcrop.crop(imgRef.current, {
        width: Math.max(1, Math.round(base * a)),
        height: base,
      });
      const t = res.topCrop;
      setCrop({ x: t.x, y: t.y, w: t.width, h: t.height });
    } catch {
      /* smartcrop failed — leave crop as-is */
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setNatural(null);
  }

  async function download() {
    const img = imgRef.current;
    if (!img || !natural) return;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(crop.w));
    canvas.height = Math.max(1, Math.round(crop.h));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (outFmt === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(
      img,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cropped.${outFmt}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      MIME[outFmt],
      0.92,
    );
  }

  const s = scale();

  // ── empty state (dropzone) ────────────────────────────────────────
  if (!src) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          loadFile(e.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong px-6 py-20 text-center transition-colors hover:border-accent"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          hidden
          onChange={(e) => loadFile(e.target.files?.[0])}
        />
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-muted">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V4.5m0 0L7.5 9M12 4.5 16.5 9M4.5 15v3A1.5 1.5 0 0 0 6 19.5h12a1.5 1.5 0 0 0 1.5-1.5v-3" />
        </svg>
        <p className="text-base font-medium">Drop an image, or click to browse</p>
        <p className="mt-1 text-sm text-muted">
          A product or portrait works great · nothing is uploaded
        </p>
      </div>
    );
  }

  // ── editor ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface p-1">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              onClick={() => chooseAspect(a.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                aspect === a.value
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          onClick={runSmart}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent disabled:opacity-60"
        >
          <span aria-hidden>✨</span>
          {busy ? "Finding subject…" : "Smart crop"}
        </button>
        <button
          onClick={reset}
          className="ml-auto rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
        >
          Replace image
        </button>
      </div>

      {/* Canvas / crop surface */}
      <div className="relative select-none overflow-hidden rounded-2xl border border-line bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt="Crop preview"
          onLoad={onImgLoad}
          draggable={false}
          className="block max-h-[70vh] w-full object-contain"
        />
        {natural && (
          <div
            onPointerDown={(e) => startDrag(e, "move")}
            style={{
              position: "absolute",
              left: crop.x * s,
              top: crop.y * s,
              width: crop.w * s,
              height: crop.h * s,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
              cursor: dragging ? "grabbing" : "grab",
            }}
            className="border border-white/90"
          >
            {/* rule-of-thirds guides */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/30" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/30" />
              <div className="absolute left-0 top-1/3 h-px w-full bg-white/30" />
              <div className="absolute left-0 top-2/3 h-px w-full bg-white/30" />
            </div>
            {(["nw", "ne", "sw", "se"] as const).map((corner) => (
              <span
                key={corner}
                onPointerDown={(e) => startDrag(e, "resize", corner)}
                style={{
                  position: "absolute",
                  ...(corner[0] === "n" ? { top: -6 } : { bottom: -6 }),
                  ...(corner[1] === "w" ? { left: -6 } : { right: -6 }),
                  cursor: corner === "nw" || corner === "se" ? "nwse-resize" : "nesw-resize",
                }}
                className="h-3.5 w-3.5 rounded-full border-2 border-accent bg-white"
              />
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {natural && (
          <span className="font-mono text-xs text-muted">
            {Math.round(crop.w)} × {Math.round(crop.h)} px
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="cropfmt" className="text-sm text-muted">
            Save as
          </label>
          <select
            id="cropfmt"
            value={outFmt}
            onChange={(e) => setOutFmt(e.target.value as OutFmt)}
            className="rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-sm font-medium text-ink focus:border-accent focus:outline-none"
          >
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WebP</option>
          </select>
          <button
            onClick={download}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Download crop
          </button>
        </div>
      </div>
    </div>
  );
}
