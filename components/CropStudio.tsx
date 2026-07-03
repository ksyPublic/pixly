"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import smartcrop from "smartcrop";
import { useI18n } from "@/lib/i18n";

type Rect = { x: number; y: number; w: number; h: number };
type OutFmt = "png" | "jpg" | "webp";
type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

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

const HANDLES: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const CURSOR: Record<Handle, string> = {
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
};

// Handle position within the crop box, as a percentage anchor.
const POS: Record<Handle, { cx: string; cy: string }> = {
  nw: { cx: "0%", cy: "0%" },
  n: { cx: "50%", cy: "0%" },
  ne: { cx: "100%", cy: "0%" },
  e: { cx: "100%", cy: "50%" },
  se: { cx: "100%", cy: "100%" },
  s: { cx: "50%", cy: "100%" },
  sw: { cx: "0%", cy: "100%" },
  w: { cx: "0%", cy: "50%" },
};

const MIN = 16; // minimum crop size in image px
const MAX_PREVIEW = 1600; // cap preview canvas backing resolution

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Oriented (post-90°-rotation) frame dimensions.
function orientedDims(natural: { w: number; h: number }, rotation: number) {
  const quarter = (Math.round(rotation / 90) % 4 + 4) % 4;
  return quarter % 2 === 1
    ? { oW: natural.h, oH: natural.w }
    : { oW: natural.w, oH: natural.h };
}

// Zoom needed so a straighten rotation never exposes empty corners.
function coverScale(oW: number, oH: number, theta: number) {
  const c = Math.abs(Math.cos(theta));
  const s = Math.abs(Math.sin(theta));
  return Math.max(c + (oH / oW) * s, (oW / oH) * s + c);
}

function clampRect(c: Rect, W: number, H: number): Rect {
  const w = clamp(c.w, MIN, W);
  const h = clamp(c.h, MIN, H);
  return {
    w,
    h,
    x: clamp(c.x, 0, W - w),
    y: clamp(c.y, 0, H - h),
  };
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

// Remap a crop when the frame is turned 90°. dir 1 = clockwise (rotate right).
function rotateCrop(c: Rect, OW: number, OH: number, dir: 1 | -1): Rect {
  return dir > 0
    ? { x: OH - (c.y + c.h), y: c.x, w: c.h, h: c.w }
    : { x: c.y, y: OW - (c.x + c.w), w: c.h, h: c.w };
}

// Resize the crop from one of the 8 handles. Keeps aspect when locked.
function computeResize(
  h: Handle,
  s: Rect,
  dx: number,
  dy: number,
  aspect: number | null,
  W: number,
  H: number,
): Rect {
  const hasN = h.includes("n");
  const hasS = h.includes("s");
  const hasW = h.includes("w");
  const hasE = h.includes("e");
  const isCorner = (hasN || hasS) && (hasW || hasE);

  if (!aspect) {
    let left = s.x;
    let right = s.x + s.w;
    let top = s.y;
    let bottom = s.y + s.h;
    if (hasW) left = clamp(s.x + dx, 0, right - MIN);
    if (hasE) right = clamp(s.x + s.w + dx, left + MIN, W);
    if (hasN) top = clamp(s.y + dy, 0, bottom - MIN);
    if (hasS) bottom = clamp(s.y + s.h + dy, top + MIN, H);
    return { x: left, y: top, w: right - left, h: bottom - top };
  }

  if (isCorner) {
    const anchorX = hasW ? s.x + s.w : s.x;
    const anchorY = hasN ? s.y + s.h : s.y;
    const px = clamp(hasW ? s.x + dx : s.x + s.w + dx, 0, W);
    const py = clamp(hasN ? s.y + dy : s.y + s.h + dy, 0, H);
    const signX = px >= anchorX ? 1 : -1;
    const signY = py >= anchorY ? 1 : -1;
    let w = Math.abs(px - anchorX);
    let hh = w / aspect;
    const maxW = signX > 0 ? W - anchorX : anchorX;
    const maxH = signY > 0 ? H - anchorY : anchorY;
    if (w > maxW) {
      w = maxW;
      hh = w / aspect;
    }
    if (hh > maxH) {
      hh = maxH;
      w = hh * aspect;
    }
    if (w < MIN || hh < MIN) {
      w = Math.max(MIN, MIN * aspect);
      hh = w / aspect;
    }
    return {
      x: signX > 0 ? anchorX : anchorX - w,
      y: signY > 0 ? anchorY : anchorY - hh,
      w,
      h: hh,
    };
  }

  if (hasN || hasS) {
    // vertical edge — grows the perpendicular axis centred horizontally
    const anchorY = hasN ? s.y + s.h : s.y;
    const py = clamp(hasN ? s.y + dy : s.y + s.h + dy, 0, H);
    let hh = Math.abs(py - anchorY);
    let w = hh * aspect;
    const cx = s.x + s.w / 2;
    const maxH = hasN ? anchorY : H - anchorY;
    if (hh > maxH) {
      hh = maxH;
      w = hh * aspect;
    }
    const maxW = 2 * Math.min(cx, W - cx);
    if (w > maxW) {
      w = maxW;
      hh = w / aspect;
    }
    hh = Math.max(hh, MIN);
    w = hh * aspect;
    return {
      x: clamp(cx - w / 2, 0, W - w),
      y: hasN ? anchorY - hh : anchorY,
      w,
      h: hh,
    };
  }

  // horizontal edge — grows the perpendicular axis centred vertically
  const anchorX = hasW ? s.x + s.w : s.x;
  const px = clamp(hasW ? s.x + dx : s.x + s.w + dx, 0, W);
  let w = Math.abs(px - anchorX);
  let hh = w / aspect;
  const cy = s.y + s.h / 2;
  const maxW = hasW ? anchorX : W - anchorX;
  if (w > maxW) {
    w = maxW;
    hh = w / aspect;
  }
  const maxH = 2 * Math.min(cy, H - cy);
  if (hh > maxH) {
    hh = maxH;
    w = hh * aspect;
  }
  w = Math.max(w, MIN);
  hh = w / aspect;
  return {
    x: hasW ? anchorX - w : anchorX,
    y: clamp(cy - hh / 2, 0, H - hh),
    w,
    h: hh,
  };
}

type Xform = {
  img: CanvasImageSource;
  nW: number;
  nH: number;
  rotation: number;
  straighten: number;
  flipH: boolean;
  flipV: boolean;
  oW: number;
  oH: number;
};

// Bake orientation + straighten + flips onto ctx, then draw the source.
// k scales the frame; (offX, offY) shift the frame origin (for cropped export).
function paint(
  ctx: CanvasRenderingContext2D,
  xf: Xform,
  k: number,
  offX: number,
  offY: number,
) {
  const theta = (xf.straighten * Math.PI) / 180;
  const cover = coverScale(xf.oW, xf.oH, theta);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(-offX * k, -offY * k);
  ctx.scale(k, k);
  ctx.translate(xf.oW / 2, xf.oH / 2);
  ctx.scale(xf.flipH ? -1 : 1, xf.flipV ? -1 : 1); // display-space mirror
  ctx.scale(cover, cover);
  ctx.rotate(theta); // fine straighten
  ctx.rotate((xf.rotation * Math.PI) / 180); // 90° orientation
  ctx.drawImage(xf.img, -xf.nW / 2, -xf.nH / 2, xf.nW, xf.nH);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

// ── small presentational button used for the transform tools ──────────
function IconButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors motion-reduce:transition-none ${
        active
          ? "bg-accent-soft text-accent-ink"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export default function CropStudio() {
  const { t } = useI18n();
  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [crop, setCrop] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [aspect, setAspect] = useState<number | null>(null);
  const [outFmt, setOutFmt] = useState<OutFmt>("png");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  // transforms
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [straighten, setStraighten] = useState(0); // -45..45
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // displayed width of the preview canvas, in CSS px (drives overlay mapping)
  const [dispW, setDispW] = useState(0);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewScaleRef = useRef(1);
  const drag = useRef<{
    mode: "move" | "resize";
    handle?: Handle;
    startX: number;
    startY: number;
    start: Rect;
    s: number; // CSS px per image px at drag start
  } | null>(null);

  // Memoized so its identity is stable across renders (e.g. while dragging,
  // which only changes `crop`). An unstable `orient` would recreate the drag
  // callbacks every render and let the unmount-cleanup effect tear an active
  // drag down mid-gesture.
  const orient = useMemo(
    () => (natural ? orientedDims(natural, rotation) : null),
    [natural, rotation],
  );

  const loadFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  function resetTransforms() {
    setRotation(0);
    setStraighten(0);
    setFlipH(false);
    setFlipV(false);
  }

  function onImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const W = img.naturalWidth;
    const H = img.naturalHeight;
    setNatural({ w: W, h: H });
    resetTransforms();
    setAspect(null);
    // Start with the whole frame selected so the crop area reads large; the
    // user pulls a handle inward to trim.
    setCrop({ x: 0, y: 0, w: W, h: H });
  }

  // ── draw the transformed preview whenever anything changes ──────────
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !natural || !orient) return;
    if (!img.complete || !img.naturalWidth) return;
    const { oW, oH } = orient;
    const ps = Math.min(1, MAX_PREVIEW / Math.max(oW, oH));
    previewScaleRef.current = ps;
    canvas.width = Math.max(1, Math.round(oW * ps));
    canvas.height = Math.max(1, Math.round(oH * ps));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(
      ctx,
      { img, nW: natural.w, nH: natural.h, rotation, straighten, flipH, flipV, oW, oH },
      ps,
      0,
      0,
    );
    // sync displayed width for the overlay right away
    const measure = () => setDispW(canvas.getBoundingClientRect().width);
    measure();
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, natural, rotation, straighten, flipH, flipV]);

  // keep the overlay aligned on layout / viewport changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setDispW(e.contentRect.width);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [src]);

  const s = orient && dispW > 0 ? dispW / orient.oW : 0;

  // ── pointer interactions ────────────────────────────────────────────
  // Window listeners must be added and removed by the *same* reference, but the
  // live logic depends on `orient`/`aspect`. So `onPointerMove`/`endDrag` are
  // permanently-stable wrappers that delegate to refs, and the refs are
  // refreshed in an effect (never during render). This lets a drag started
  // under one `orient`/`aspect` still tear down with the exact references it
  // registered — and avoids `endDrag` referencing its own name.
  const moveImpl = useRef<(e: PointerEvent) => void>(() => {});
  const upImpl = useRef<() => void>(() => {});

  const onPointerMove = useCallback((e: PointerEvent) => moveImpl.current(e), []);
  const endDrag = useCallback(() => upImpl.current(), []);

  useEffect(() => {
    moveImpl.current = (e: PointerEvent) => {
      const d = drag.current;
      if (!d || !orient || d.s <= 0) return;
      const { oW, oH } = orient;
      const dx = (e.clientX - d.startX) / d.s;
      const dy = (e.clientY - d.startY) / d.s;
      if (d.mode === "move") {
        setCrop({
          ...d.start,
          x: clamp(d.start.x + dx, 0, oW - d.start.w),
          y: clamp(d.start.y + dy, 0, oH - d.start.h),
        });
        return;
      }
      if (d.handle) {
        setCrop(computeResize(d.handle, d.start, dx, dy, aspect, oW, oH));
      }
    };
    upImpl.current = () => {
      drag.current = null;
      setDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
    };
  });

  function startDrag(
    e: React.PointerEvent,
    mode: "move" | "resize",
    handle?: Handle,
  ) {
    e.preventDefault();
    e.stopPropagation();
    if (s <= 0) return;
    drag.current = {
      mode,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      start: crop,
      s,
    };
    setDragging(true);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
  }

  useEffect(() => () => endDrag(), [endDrag]);

  // ── transforms ──────────────────────────────────────────────────────
  function rotate(dir: 1 | -1) {
    if (!natural || !orient) return;
    const { oW, oH } = orient;
    const nOW = oH;
    const nOH = oW;
    setCrop((c) => {
      let out = clampRect(rotateCrop(c, oW, oH, dir), nOW, nOH);
      if (aspect) out = fitAspect(out, aspect, nOW, nOH);
      return out;
    });
    setRotation((r) => ((r + (dir > 0 ? 90 : 270)) % 360 + 360) % 360);
  }

  // ── aspect + smart crop ─────────────────────────────────────────────
  function chooseAspect(a: number | null) {
    setAspect(a);
    if (a && orient) setCrop((c) => fitAspect(c, a, orient.oW, orient.oH));
  }

  async function runSmart() {
    const canvas = canvasRef.current;
    if (!canvas || !orient || busy) return;
    setBusy(true);
    try {
      const a = aspect ?? orient.oW / orient.oH;
      const base = 100;
      const res = await smartcrop.crop(canvas, {
        width: Math.max(1, Math.round(base * a)),
        height: base,
      });
      const ps = previewScaleRef.current || 1;
      const t = res.topCrop;
      setCrop(
        clampRect(
          { x: t.x / ps, y: t.y / ps, w: t.width / ps, h: t.height / ps },
          orient.oW,
          orient.oH,
        ),
      );
    } catch {
      /* smartcrop failed — leave crop as-is */
    } finally {
      setBusy(false);
    }
  }

  function resetAll() {
    if (!natural) return;
    resetTransforms();
    setAspect(null);
    setCrop({ x: 0, y: 0, w: natural.w, h: natural.h });
  }

  function replaceImage() {
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
    setNatural(null);
    setDispW(0);
  }

  async function download() {
    const img = imgRef.current;
    if (!img || !natural || !orient) return;
    const outW = Math.max(1, Math.round(crop.w));
    const outH = Math.max(1, Math.round(crop.h));
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (outFmt === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outW, outH);
    }
    paint(
      ctx,
      {
        img,
        nW: natural.w,
        nH: natural.h,
        rotation,
        straighten,
        flipH,
        flipV,
        oW: orient.oW,
        oH: orient.oH,
      },
      1, // native resolution
      crop.x,
      crop.y,
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

  const straightenLabel = `${straighten > 0 ? "+" : ""}${straighten.toFixed(1)}°`;

  // ── empty state (dropzone) ──────────────────────────────────────────
  if (!src) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && fileRef.current?.click()
        }
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          loadFile(e.dataTransfer.files[0]);
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line-strong px-6 py-20 text-center transition-colors hover:border-accent motion-reduce:transition-none"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.heic,.heif"
          hidden
          onChange={(e) => loadFile(e.target.files?.[0])}
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
        <p className="text-base font-medium">{t("crop.dropOpen")}</p>
        <p className="mt-1 text-sm text-muted">{t("crop.dropSub")}</p>
      </div>
    );
  }

  // ── editor ──────────────────────────────────────────────────────────
  return (
    <div>
      {/* hidden source image — provides native pixels for the canvas */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt=""
        onLoad={onImgLoad}
        draggable={false}
        className="hidden"
      />

      {/* Aspect presets + smart crop */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-surface p-1">
          {ASPECTS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => chooseAspect(a.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none ${
                aspect === a.value
                  ? "bg-accent text-white"
                  : "text-muted hover:text-ink"
              }`}
            >
              {a.value === null ? t("crop.free") : a.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={runSmart}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface px-3.5 py-2 text-sm font-medium transition-colors hover:border-accent disabled:opacity-60 motion-reduce:transition-none"
        >
          <span aria-hidden>✨</span>
          {busy ? t("crop.smartBusy") : t("crop.smart")}
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={resetAll}
            className="rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-ink motion-reduce:transition-none"
          >
            {t("crop.reset")}
          </button>
          <button
            type="button"
            onClick={replaceImage}
            className="rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:text-ink motion-reduce:transition-none"
          >
            {t("crop.replace")}
          </button>
        </div>
      </div>

      {/* Transform tools */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
          <IconButton onClick={() => rotate(-1)} label={t("crop.rotateL")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6.5 4 10l3.5 3.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h9a6 6 0 0 1 6 6v1.5" />
            </svg>
          </IconButton>
          <IconButton onClick={() => rotate(1)} label={t("crop.rotateR")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.5 20 10l-3.5 3.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 10h-9a6 6 0 0 0-6 6v1.5" />
            </svg>
          </IconButton>
          <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
          <IconButton onClick={() => setFlipH((v) => !v)} active={flipH} label={t("crop.flipH")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16" strokeDasharray="2 2.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 8 5 12l4 4V8Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 8l4 4-4 4V8Z" />
            </svg>
          </IconButton>
          <IconButton onClick={() => setFlipV((v) => !v)} active={flipV} label={t("crop.flipV")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" strokeDasharray="2 2.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9 12 5l4 4H8Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 15l4 4 4-4H8Z" />
            </svg>
          </IconButton>
        </div>

        <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
          <span className="shrink-0 text-xs font-medium text-muted">{t("crop.straighten")}</span>
          <input
            type="range"
            min={-45}
            max={45}
            step={0.5}
            value={straighten}
            onChange={(e) => setStraighten(parseFloat(e.target.value))}
            aria-label={t("crop.straightenAria")}
            className="h-1.5 min-w-0 flex-1 cursor-pointer"
            style={{ accentColor: "var(--accent)" }}
          />
          <button
            type="button"
            onClick={() => setStraighten(0)}
            title={t("crop.straightenReset")}
            className="w-14 shrink-0 rounded-md px-1.5 py-0.5 text-right font-mono text-xs tabular-nums text-ink transition-colors hover:bg-surface-2 motion-reduce:transition-none"
          >
            {straightenLabel}
          </button>
        </div>
      </div>

      {/* Canvas / crop surface */}
      <div className="flex justify-center overflow-hidden rounded-2xl border border-line bg-surface-2 p-2 sm:p-3">
        <div className="relative w-fit select-none" style={{ lineHeight: 0 }}>
          <canvas
            ref={canvasRef}
            className="block max-h-[68vh] max-w-full rounded-md"
          />
          {orient && s > 0 && (
            <div
              onPointerDown={(e) => startDrag(e, "move")}
              style={{
                position: "absolute",
                left: crop.x * s,
                top: crop.y * s,
                width: crop.w * s,
                height: crop.h * s,
                boxShadow:
                  "0 0 0 9999px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.92)",
                cursor: dragging ? "grabbing" : "grab",
                touchAction: "none",
              }}
            >
              {/* rule-of-thirds guides */}
              <div className="pointer-events-none absolute inset-0">
                <span style={{ position: "absolute", left: "33.33%", top: 0, height: "100%", width: 1, background: "rgba(255,255,255,0.4)" }} />
                <span style={{ position: "absolute", left: "66.66%", top: 0, height: "100%", width: 1, background: "rgba(255,255,255,0.4)" }} />
                <span style={{ position: "absolute", top: "33.33%", left: 0, width: "100%", height: 1, background: "rgba(255,255,255,0.4)" }} />
                <span style={{ position: "absolute", top: "66.66%", left: 0, width: "100%", height: 1, background: "rgba(255,255,255,0.4)" }} />
              </div>

              {/* 8 resize handles (min 24px touch target) */}
              {HANDLES.map((handle) => {
                const isEdge = handle.length === 1;
                const vertical = handle === "n" || handle === "s";
                return (
                  <span
                    key={handle}
                    onPointerDown={(e) => startDrag(e, "resize", handle)}
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: POS[handle].cx,
                      top: POS[handle].cy,
                      width: 26,
                      height: 26,
                      transform: "translate(-50%, -50%)",
                      cursor: CURSOR[handle],
                      touchAction: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      className="border-2 border-accent"
                      style={{
                        display: "block",
                        background: "#fff",
                        boxShadow: "0 0 2px rgba(0,0,0,0.5)",
                        ...(isEdge
                          ? vertical
                            ? { width: 22, height: 7, borderRadius: 999 }
                            : { width: 7, height: 22, borderRadius: 999 }
                          : { width: 13, height: 13, borderRadius: 999 }),
                      }}
                    />
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {orient && (
          <span className="font-mono text-xs text-muted">
            {Math.round(crop.w)} × {Math.round(crop.h)} px
          </span>
        )}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="cropfmt" className="text-sm text-muted">
            {t("crop.saveAs")}
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
            type="button"
            onClick={download}
            className="rounded-xl bg-accent px-5 py-2.5 font-medium text-white transition-opacity hover:opacity-90 motion-reduce:transition-none"
          >
            {t("crop.download")}
          </button>
        </div>
      </div>
    </div>
  );
}
