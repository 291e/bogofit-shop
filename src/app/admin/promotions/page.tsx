"use client";

import { useState } from "react";
import { Search, Filter, Plus, Eye, Edit, Trash2, Power, PowerOff } from "lucide-react";

// Mock data
const mockPromotions = [
    {
        id: "1",
        name: "여름 세일",
        type: "percentage",
        value: 20,
        startDate: "2024-06-01",
        endDate: "2024-08-31",
        status: "active",
    },
    {
        id: "2",
        name: "신규 회원 할인",
        type: "fixed_amount",
        value: 10000,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        status: "active",
    },
    {
        id: "3",
        name: "무료 배송 이벤트",
        type: "free_shipping",
        value: 0,
        startDate: "2024-03-01",
        endDate: "2024-03-15",
        status: "expired",
    },
];

const typeConfig = {
    percentage: { label: "퍼센트 할인", suffix: "%" },
    fixed_amount: { label: "고정 금액 할인", suffix: "원" },
    free_shipping: { label: "무료 배송", suffix: "" },
};

const statusConfig = {
    active: { label: "활성", color: "green" },
    inactive: { label: "비활성", color: "gray" },
    expired: { label: "만료됨", color: "red" },
};

export default function PromotionsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredPromotions = mockPromotions.filter((promo) => {
        const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === "all" || promo.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">프로모션 관리</h1>
                    <p className="text-gray-600 mt-2">할인 및 프로모션을 관리하세요</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg">
                    <Plus className="w-5 h-5" />
                    프로모션 생성
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-700">활성 프로모션</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                        {mockPromotions.filter((p) => p.status === "active").length}
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-700">비활성 프로모션</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">
                        {mockPromotions.filter((p) => p.status === "inactive").length}
                    </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm text-red-700">만료된 프로모션</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                        {mockPromotions.filter((p) => p.status === "expired").length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="프로모션 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">전체</option>
                            <option value="active">활성</option>
                            <option value="inactive">비활성</option>
                            <option value="expired">만료됨</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Promotions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">프로모션명</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">유형</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">할인값</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">기간</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPromotions.map((promo) => {
                                const typeConf = typeConfig[promo.type as keyof typeof typeConfig];
                                const statusConf = statusConfig[promo.status as keyof typeof statusConfig];

                                return (
                                    <tr key={promo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{promo.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{typeConf.label}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-900">
                                                {promo.value > 0 ? `${promo.value.toLocaleString()}${typeConf.suffix}` : "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                {promo.startDate} ~ {promo.endDate}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusConf.color}-100 text-${statusConf.color}-700`}>
                                                {statusConf.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="보기">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="수정">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {promo.status === "active" ? (
                                                    <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="비활성화">
                                                        <PowerOff className="w-4 h-4" />
                                                    </button>
                                                ) : promo.status === "inactive" ? (
                                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="활성화">
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                ) : null}
                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="삭제">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredPromotions.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">검색 결과가 없습니다</p>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">총 {filteredPromotions.length}개의 프로모션</div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            이전
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                            다음
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
