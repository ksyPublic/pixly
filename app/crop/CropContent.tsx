"use client";

import CropStudio from "@/components/CropStudio";
import { AdSlot } from "@/components/AdSense";
import { useI18n } from "@/lib/i18n";

export default function CropContent() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        {t("cropPage.h1")}
      </h1>
      <p className="mt-3 max-w-2xl text-muted">{t("cropPage.intro")}</p>

      <div className="mt-8">
        <CropStudio />
      </div>

      <ul className="mt-8 grid grid-cols-3 gap-3 text-center text-xs text-muted">
        {(
          [
            ["cropPage.f1t", "cropPage.f1d"],
            ["cropPage.f2t", "cropPage.f2d"],
            ["cropPage.f3t", "cropPage.f3d"],
          ] as const
        ).map(([tk, sk]) => (
          <li key={tk} className="rounded-xl border border-line bg-surface px-2 py-3">
            <p className="font-semibold text-ink">{t(tk)}</p>
            <p className="mt-0.5">{t(sk)}</p>
          </li>
        ))}
      </ul>

      <AdSlot className="mt-10" />

      <section className="mt-12 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="font-display text-xl font-bold text-ink">
          {t("cropPage.howH2")}
        </h2>
        <ol className="ml-5 list-decimal space-y-1">
          <li>{t("cropPage.s1")}</li>
          <li>{t("cropPage.s2")}</li>
          <li>{t("cropPage.s3")}</li>
          <li>{t("cropPage.s4")}</li>
          <li>{t("cropPage.s5")}</li>
        </ol>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("cropPage.whatH2")}
        </h2>
        <p>{t("cropPage.whatP")}</p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("cropPage.privH2")}
        </h2>
        <p>{t("cropPage.privP")}</p>
      </section>
    </main>
  );
}
