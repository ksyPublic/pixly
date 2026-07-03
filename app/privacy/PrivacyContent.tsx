"use client";

import { useI18n } from "@/lib/i18n";

export default function PrivacyContent() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {t("privacy.h1")}
      </h1>
      <p className="mt-2 text-sm text-muted">{t("privacy.updated")}</p>

      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <h2 className="font-display text-xl font-bold text-ink">
          {t("privacy.imagesTitle")}
        </h2>
        <p>
          {t("privacy.imagesA")}
          <strong>{t("privacy.imagesStrong")}</strong>
          {t("privacy.imagesB")}
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("privacy.analyticsTitle")}
        </h2>
        <p>{t("privacy.analytics")}</p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("privacy.adsTitle")}
        </h2>
        <p>
          {t("privacy.adsA")}
          <a
            href="https://www.google.com/settings/ads"
            className="text-accent underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            {t("privacy.adsLink")}
          </a>
          {t("privacy.adsB")}
        </p>

        <h2 className="pt-2 font-display text-xl font-bold text-ink">
          {t("privacy.contactTitle")}
        </h2>
        <p>
          {t("privacy.contactA")}
          <a href="/contact/" className="text-accent underline">
            {t("privacy.contactLink")}
          </a>
          {t("privacy.contactB")}
        </p>
      </div>
    </main>
  );
}
