"use client";

import { Building2 } from "lucide-react";
import { useLanguage } from "@/providers/languageProvider";

export default function BrandDashboardPage() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Building2 className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          {t("header.business.brandDetail.selectSection")}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t("header.business.brandDetail.selectSectionDescription")}
        </p>
      </div>
    </div>
  );
}