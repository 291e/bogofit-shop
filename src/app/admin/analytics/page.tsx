"use client";

import { BarChart3, TrendingUp, Users, ShoppingCart } from "lucide-react";

export default function AnalyticsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">분석</h1>
                <p className="text-gray-600 mt-2">비즈니스 인사이트와 통계를 확인하세요</p>
            </div>

            {/* Placeholder */}
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100">
                <div className="max-w-2xl mx-auto text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">분석 기능 개발 중</h2>
                    <p className="text-gray-600 mb-8">
                        매출 추이, 사용자 행동 분석, 상품 성과 등 다양한 분석 기능이 곧 제공될 예정입니다.
                    </p>

                    {/* Preview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">매출 분석</p>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">사용자 분석</p>
                        </div>
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
                            <ShoppingCart className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-700">상품 성과</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
