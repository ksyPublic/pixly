import type { Metadata } from "next";
import CropStudio from "@/components/CropStudio";
import { AdSlot } from "@/components/AdSense";

export const metadata: Metadata = {
  title: "Smart Image Cropper — Free, Private, No Upload | Pixly",
  description:
    "Crop images online for free. Smart crop auto-finds the subject (product or person) for any aspect ratio. 100% in your browser — nothing is uploaded.",
  alternates: { canonical: "/crop/" },
};

export default function CropPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        Smart Image Cropper
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Drop in a photo, then crop, rotate, straighten, and flip it to any aspect
        ratio. Hit <span className="font-medium text-ink">Smart crop</span> and
        Pixly finds the subject — a product or a face — and frames it for you.
        Everything runs in your browser; your image is never uploaded.
      </p>

      <div className="mt-8">
        <CropStudio />
      </div>

      <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
        {[
          ["Subject-aware", "Finds the product or face"],
          ["Any ratio", "1:1, 4:5, 16:9, and more"],
          ["100% private", "Nothing leaves your device"],
        ].map(([t, s]) => (
          <li key={t} className="rounded-xl border border-line bg-surface px-2 py-3">
            <p className="font-semibold text-ink">{t}</p>
            <p className="mt-0.5">{s}</p>
          </li>
        ))}
      </ul>

      <AdSlot className="mt-10" />

      <section className="mt-12 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="font-display text-xl font-bold text-ink">
          How to crop an image
        </h2>
        <ol className="ml-5 list-decimal space-y-1">
          <li>Drop your image into the box above, or click to browse.</li>
          <li>
            Pick an aspect ratio, or drag any of the 8 handles — corners and edge
            midpoints — to crop by hand.
          </li>
          <li>
            Rotate 90°, flip, or nudge the straighten slider to level a tilted
            horizon. Everything previews live.
          </li>
          <li>
            Click <strong>Smart crop</strong> to auto-frame the subject, then
            fine-tune if you want.
          </li>
          <li>
            Choose a format and download. Your rotation, straighten, flips, and
            crop are all baked in at full resolution. Nothing is uploaded.
          </li>
        </ol>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          What is smart crop?
        </h2>
        <p>
          Most croppers just chop the middle of the image. Smart crop looks at
          the picture — edges, contrast, and skin tones — to find the region
          that actually matters, then centers the frame there. It&apos;s handy
          for product shots, profile pictures, and thumbnails where the subject
          isn&apos;t dead center.
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          Is it private?
        </h2>
        <p>
          Yes. The cropping and subject detection both run locally in your
          browser using Canvas. Your photo is never sent to a server, so it
          works even offline once the page has loaded.
        </p>
      </section>
    </main>
  );
}
