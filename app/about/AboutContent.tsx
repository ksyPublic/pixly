"use client";

import { useI18n, type TKey } from "@/lib/i18n";

const TOOLS: ReadonlyArray<readonly [TKey, TKey]> = [
  ["about.toolConvert", "about.toolConvertDesc"],
  ["about.toolCompress", "about.toolCompressDesc"],
  ["about.toolCrop", "about.toolCropDesc"],
  ["about.toolPdf", "about.toolPdfDesc"],
];

export default function AboutContent() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {t("about.h1")}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-ink">{t("about.lead")}</p>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>{t("about.p1")}</p>

        <h2 className="pt-4 font-display text-xl font-bold text-ink">
          {t("about.doTitle")}
        </h2>
        <p>{t("about.do")}</p>
        <ul className="space-y-3">
          {TOOLS.map(([name, desc]) => (
            <li
              key={name}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <span className="font-semibold text-ink">{t(name)}</span>
              <p className="mt-1 text-muted">{t(desc)}</p>
            </li>
          ))}
        </ul>
        <p>{t("about.doNote")}</p>

        <h2 className="pt-4 font-display text-xl font-bold text-ink">
          {t("about.privacyTitle")}
        </h2>
        <p>{t("about.privacy")}</p>

        <h2 className="pt-4 font-display text-xl font-bold text-ink">
          {t("about.freeTitle")}
        </h2>
        <p>{t("about.free")}</p>

        <p className="pt-2 text-ink">{t("about.closing")}</p>
      </div>
    </main>
  );
}
