"use client";

import { useI18n } from "@/lib/i18n";

export default function AboutContent() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {t("about.h1")}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
        <p>{t("about.p3")}</p>
        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("about.freeTitle")}
        </h2>
        <p>{t("about.free")}</p>
      </div>
    </main>
  );
}
