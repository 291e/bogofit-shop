"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/languageProvider";

interface ShippingPolicySubSectionProps {
  className?: string;
  subsectionName?: string;
}

export default function ShippingPolicySubSection({ className, subsectionName }: ShippingPolicySubSectionProps) {
  const { t } = useLanguage();
  const defaultSubsectionName = t("header.business.brandDetail.settings.shippingPolicy.title");
  const finalSubsectionName = subsectionName || defaultSubsectionName;
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="border-b border-red-200">
        <div className="px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">{t("header.business.brandDetail.home")}</span>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-gray-500">{t("header.business.brandDetail.business")}</span>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-gray-900 font-medium">{finalSubsectionName}</span>
          </nav>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{finalSubsectionName}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {t("header.business.brandDetail.settings.shippingPolicy.edit")}
            </Button>
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t("header.business.brandDetail.settings.shippingPolicy.export")}
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">{t("header.business.brandDetail.settings.shippingPolicy.description")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
