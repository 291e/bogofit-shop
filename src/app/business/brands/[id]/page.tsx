"use client";

import { Building2 } from "lucide-react";

export default function BrandDashboardPage() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          섹션을 선택하세요
        </h3>
        <p className="text-gray-500">
          왼쪽 사이드바에서 원하는 기능을 선택하세요.
        </p>
      </div>
    </div>
  );
}