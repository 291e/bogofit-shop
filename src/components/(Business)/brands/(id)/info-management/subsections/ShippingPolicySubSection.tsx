"use client";

import { Button } from "@/components/ui/button";

interface ShippingPolicySubSectionProps {
  className?: string;
  subsectionName?: string;
}

export default function ShippingPolicySubSection({ className, subsectionName = "업체 배송정책" }: ShippingPolicySubSectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Breadcrumb Navigation */}
      <div className="border-b border-red-200">
        <div className="px-6 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">HOME</span>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-gray-500">비즈니스</span>
            <span className="text-gray-400">{'>'}</span>
            <span className="text-gray-900 font-medium">{subsectionName}</span>
          </nav>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">{subsectionName}</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              수정
            </Button>
            <Button size="sm" variant="outline">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              내보내기
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">배송 정책을 설정할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
