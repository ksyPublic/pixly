"use client";

import { useEffect, useRef } from "react";

/**
 * HeroMotion — a soft, warm "aurora" glow rendered on <canvas>.
 *
 * Direction: a slow, luminous field of tangerine/amber light that drifts
 * behind the hero headline, giving a premium ambient feel with zero heavy
 * libs. Colours are read live from the design tokens (--accent / --bg), so it
 * adapts to light paper and dark ink themes, and to the `data-theme` toggle.
 *
 * It must read as a *glow that dissolves into the page*, never as a hard-edged
 * panel. That's why the layer is masked with a centred oval vignette that fades
 * fully to transparent well before the section edges, the alphas stay low so
 * the headline keeps its contrast, and there is deliberately NO film grain
 * (grain over a warm gradient reads as TV static — the opposite of premium).
 *
 * Usage: drop it INSIDE the hero <section> (which is `relative`), before the
 * headline markup. It renders its own absolutely-positioned, pointer-events-none
 * layer at `-z-10` and never captures clicks or shifts layout.
 *
 * Performance: DPR capped at 2, sub-pixel internal buffer (soft + cheap),
 * ~30fps budget, paused when the tab is hidden or the layer is scrolled off
 * screen, rAF cancelled on unmount. Honours prefers-reduced-motion with a
 * single static frame.
 */

type RGB = { r: number; g: number; b: number };
type Role = "accent" | "gold" | "ember" | "peach" | "rose";

type Blob = {
  role: Role;
  cx: number; // base centre (unit space, 0..1)
  cy: number;
  ax: number; // drift amplitude
  ay: number;
  r: number; // radius as a fraction of the canvas diagonal
  rPulse: number; // radius breathing amplitude
  speed: number; // radians / second (kept small = slow, cinematic)
  ratio: number; // x/y frequency ratio for a lissajous path
  depth: number; // parallax response to pointer
  weight: number; // per-blob intensity multiplier
  phX: number;
  phY: number;
  phR: number;
  color: RGB;
};

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function parseColor(input: string): RGB | null {
  const s = input.trim();
  if (!s) return null;
  if (s[0] === "#") {
    let hex = s.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
        return { r, g, b };
      }
    }
    return null;
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }
  }
  return null;
}

function rgbToHsl({ r, g, b }: RGB): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const hue = ((h % 1) + 1) % 1;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = (t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: Math.round(hk(hue + 1 / 3) * 255),
    g: Math.round(hk(hue) * 255),
    b: Math.round(hk(hue - 1 / 3) * 255),
  };
}

export default function HeroMotion() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    const darkMQ = window.matchMedia("(prefers-color-scheme: dark)");

    // Blob field — concentrated in the upper-centre (behind the headline) and
    // fading toward the lower edges, so the glow reads as light *behind* the
    // words rather than a filled rectangle. The vignette mask erases whatever
    // reaches the corners.
    const blobs: Blob[] = [
      { role: "accent", cx: 0.32, cy: 0.34, ax: 0.09, ay: 0.06, r: 0.4, rPulse: 0.04, speed: 0.05, ratio: 0.8, depth: 0.05, weight: 1.0, phX: 0.0, phY: 1.7, phR: 0.4, color: { r: 255, g: 90, b: 44 } },
      { role: "gold", cx: 0.68, cy: 0.3, ax: 0.08, ay: 0.06, r: 0.38, rPulse: 0.04, speed: 0.043, ratio: 1.15, depth: 0.035, weight: 0.9, phX: 2.1, phY: 0.6, phR: 1.9, color: { r: 255, g: 90, b: 44 } },
      { role: "ember", cx: 0.52, cy: 0.56, ax: 0.11, ay: 0.08, r: 0.44, rPulse: 0.05, speed: 0.037, ratio: 0.9, depth: 0.06, weight: 0.9, phX: 4.2, phY: 3.3, phR: 2.7, color: { r: 255, g: 90, b: 44 } },
      { role: "peach", cx: 0.23, cy: 0.6, ax: 0.07, ay: 0.07, r: 0.3, rPulse: 0.04, speed: 0.06, ratio: 1.2, depth: 0.08, weight: 0.65, phX: 1.1, phY: 5.0, phR: 0.9, color: { r: 255, g: 90, b: 44 } },
      { role: "rose", cx: 0.79, cy: 0.56, ax: 0.06, ay: 0.07, r: 0.32, rPulse: 0.04, speed: 0.05, ratio: 0.7, depth: 0.05, weight: 0.7, phX: 5.4, phY: 2.2, phR: 3.6, color: { r: 255, g: 90, b: 44 } },
    ];

    let width = 1;
    let height = 1;
    let isDark = darkMQ.matches;
    let running = false;
    let visible = true;
    let started = false;
    let raf = 0;
    let last = 0;
    const startTime = performance.now();
    const frameInterval = 1000 / 30;

    // Soft render buffer: below native resolution for cheap, dreamy blur.
    const RENDER_SCALE = 0.7;
    const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };

    function computePalette(): Record<Role, RGB> {
      const cs = getComputedStyle(document.documentElement);
      const acc = parseColor(cs.getPropertyValue("--accent")) ?? { r: 255, g: 90, b: 44 };
      const bg = parseColor(cs.getPropertyValue("--bg"));
      if (bg) {
        const lum = (0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b) / 255;
        isDark = lum < 0.5;
      } else {
        isDark = darkMQ.matches;
      }
      const [h, s, l] = rgbToHsl(acc);
      return {
        accent: acc,
        gold: hslToRgb(h + 0.06, clamp01(s), clamp01(l + 0.08)),
        ember: hslToRgb(h - 0.03, clamp01(s), clamp01(l - 0.08)),
        peach: hslToRgb(h + 0.02, clamp01(s * 0.9), clamp01(l + 0.2)),
        rose: hslToRgb(h - 0.09, clamp01(s * 0.85), clamp01(l - 0.02)),
      };
    }

    function readTheme() {
      const palette = computePalette();
      for (const b of blobs) b.color = palette[b.role];
    }

    function resize() {
      if (!host || !canvas) return;
      const rect = host.getBoundingClientRect();
      const cssW = Math.max(1, rect.width);
      const cssH = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(cssW * dpr * RENDER_SCALE));
      height = Math.max(1, Math.round(cssH * dpr * RENDER_SCALE));
      canvas.width = width;
      canvas.height = height;
    }

    function draw(tSec: number) {
      if (!ctx) return;
      // Ease pointer toward its target for buttery parallax.
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const px = pointer.x - 0.5;
      const py = pointer.y - 0.5;

      ctx.clearRect(0, 0, width, height);
      // Light theme paints over paper; dark theme adds light on ink.
      ctx.globalCompositeOperation = isDark ? "lighter" : "source-over";
      const diag = Math.hypot(width, height);
      // Kept low so the headline never fights the glow for contrast.
      const a0 = isDark ? 0.26 : 0.24;
      const a1 = isDark ? 0.12 : 0.1;

      for (const b of blobs) {
        const phase = tSec * b.speed;
        const bx = (b.cx + Math.sin(phase + b.phX) * b.ax + px * b.depth) * width;
        const by = (b.cy + Math.cos(phase * b.ratio + b.phY) * b.ay + py * b.depth) * height;
        const rad = Math.max(1, (b.r + Math.sin(phase * 0.7 + b.phR) * b.rPulse) * diag);
        const c = b.color;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, rad);
        g.addColorStop(0, `rgba(${c.r},${c.g},${c.b},${(a0 * b.weight).toFixed(3)})`);
        g.addColorStop(0.42, `rgba(${c.r},${c.g},${c.b},${(a1 * b.weight).toFixed(3)})`);
        g.addColorStop(1, `rgba(${c.r},${c.g},${c.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(bx, by, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    }

    function drawStatic() {
      resize();
      // A pleasant frozen moment of the field.
      draw(6.5);
    }

    function frame(now: number) {
      if (!running) return;
      if (last === 0) last = now;
      const dt = now - last;
      if (dt >= frameInterval) {
        last = now - (dt % frameInterval);
        draw((now - startTime) / 1000);
      }
      raf = requestAnimationFrame(frame);
    }

    function shouldRun(): boolean {
      return !reduceMQ.matches && visible && !document.hidden;
    }

    function start() {
      if (running || !shouldRun()) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function sync() {
      if (shouldRun()) start();
      else stop();
    }

    function reveal() {
      if (started || !host) return;
      started = true;
      host.style.transition = reduceMQ.matches ? "none" : "opacity 900ms ease";
      host.style.opacity = "1";
    }

    // ── Wire up ────────────────────────────────────────────────────────────
    const onPointerMove = (e: PointerEvent) => {
      if (reduceMQ.matches) return;
      pointer.tx = e.clientX / Math.max(1, window.innerWidth);
      pointer.ty = e.clientY / Math.max(1, window.innerHeight);
    };
    const onReduceChange = () => {
      if (reduceMQ.matches) {
        stop();
        drawStatic();
      } else {
        sync();
      }
    };
    const onSchemeChange = () => {
      readTheme();
      if (!running) drawStatic();
    };
    const onVisibility = () => sync();

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) drawStatic();
    });
    ro.observe(host);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    io.observe(host);

    const mo = new MutationObserver(() => {
      readTheme();
      if (!running) drawStatic();
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    if (reduceMQ.addEventListener) reduceMQ.addEventListener("change", onReduceChange);
    if (darkMQ.addEventListener) darkMQ.addEventListener("change", onSchemeChange);

    // ── Kick off ───────────────────────────────────────────────────────────
    readTheme();
    resize();
    draw((performance.now() - startTime) / 1000);
    reveal();
    sync();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      if (reduceMQ.removeEventListener) reduceMQ.removeEventListener("change", onReduceChange);
      if (darkMQ.removeEventListener) darkMQ.removeEventListener("change", onSchemeChange);
    };
  }, []);

  // Centred oval vignette — reaches full transparency well before every edge,
  // so the aurora dissolves into the page instead of ending at a hard border.
  const edgeMask =
    "radial-gradient(ellipse 78% 72% at 50% 40%, #000 0%, rgba(0,0,0,0.55) 46%, rgba(0,0,0,0) 74%)";

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      style={{ opacity: 0, contain: "strict" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{
          display: "block",
          filter: "blur(14px) saturate(1.05)",
          WebkitMaskImage: edgeMask,
          maskImage: edgeMask,
        }}
      />
    </div>
  );
}
