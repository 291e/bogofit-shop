"use client";

import { useLanguage } from "@/providers/languageProvider";

export default function ShippingPolicyPage() {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {t("header.business.brandDetail.settings.shippingPolicy.underDevelopment")}
            </h3>
            <p className="text-gray-500">
              {t("header.business.brandDetail.settings.shippingPolicy.underDevelopmentDescription")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}