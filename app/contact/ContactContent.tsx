"use client";

import { useI18n } from "@/lib/i18n";

export default function ContactContent() {
  const { t } = useI18n();
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        {t("contact.h1")}
      </h1>
      <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
        <p>{t("contact.p1")}</p>
        <p>
          {t("contact.emailLabel")}{" "}
          <a href="mailto:hello@pixly.app" className="text-accent underline">
            hello@pixly.app
          </a>
        </p>
        {/* TODO: replace hello@pixly.app with your real inbox before launch. */}
        <p className="text-sm text-muted">{t("contact.reply")}</p>
      </div>
    </main>
  );
}
