import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Pixly",
  description:
    "Pixly is a free, privacy-first image converter that runs entirely in your browser.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">About Pixly</h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>
          Pixly is a free image converter built on a simple idea: your photos
          are yours. Most online converters upload your files to a server to
          process them. Pixly doesn&apos;t. Every conversion happens locally, in
          your own browser, using the same image engine your browser already
          ships with.
        </p>
        <p>
          That means your images never travel across the internet, never sit on
          someone else&apos;s server, and never get logged. It&apos;s also
          faster — there&apos;s no upload or download round-trip — and it works
          even if your connection drops after the page loads.
        </p>
        <p>
          We support common everyday formats like HEIC (the photo format iPhones
          use), JPG, PNG, and WebP, with more on the way. There are no accounts,
          no watermarks, and no limits on how many files you convert.
        </p>
        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          How it stays free
        </h2>
        <p>
          Pixly is supported by unobtrusive advertising. Because there are no
          servers processing your images, running costs are low — so we can keep
          the tools free for everyone.
        </p>
      </div>
    </main>
  );
}
