"use client";

import { useI18n } from "@/providers/I18nProvider";

export default function LoadingText({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div className={`py-20 text-center ${className}`}>{t("common.loading")}</div>
  );
}
