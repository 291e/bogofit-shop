"use client";

import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Ban, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Mock data
const mockBrands = [
    {
        id: "1",
        name: "Nike Store",
        slug: "nike-store",
        status: "pending",
        logoUrl: null,
        owner: "김철수",
        productsCount: 0,
        createdAt: "2024-03-01",
    },
    {
        id: "2",
        name: "Adidas Official",
        slug: "adidas-official",
        status: "approved",
        logoUrl: null,
        owner: "이영희",
        productsCount: 45,
        createdAt: "2024-02-15",
    },
    {
        id: "3",
        name: "Puma Korea",
        slug: "puma-korea",
        status: "rejected",
        logoUrl: null,
        owner: "박민수",
        productsCount: 0,
        createdAt: "2024-02-28",
    },
];

const statusConfig = {
    pending: { label: "대기중", color: "yellow", icon: null },
    approved: { label: "승인됨", color: "green", icon: CheckCircle },
    rejected: { label: "거부됨", color: "red", icon: XCircle },
    banned: { label: "차단됨", color: "gray", icon: Ban },
};

export default function BrandsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredBrands = mockBrands.filter((brand) => {
        const matchesSearch =
            brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
            brand.owner.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === "all" || brand.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">브랜드 관리</h1>
                <p className="text-gray-600 mt-2">브랜드 신청을 검토하고 승인하세요</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">전체 브랜드</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{mockBrands.length}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-sm text-yellow-700">대기중</div>
                    <div className="text-2xl font-bold text-yellow-900 mt-1">
                        {mockBrands.filter((b) => b.status === "pending").length}
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-700">승인됨</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                        {mockBrands.filter((b) => b.status === "approved").length}
                    </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm text-red-700">거부됨</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                        {mockBrands.filter((b) => b.status === "rejected").length}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="브랜드 검색 (이름, 슬러그, 소유자)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">전체</option>
                            <option value="pending">대기중</option>
                            <option value="approved">승인됨</option>
                            <option value="rejected">거부됨</option>
                            <option value="banned">차단됨</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Brands Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    브랜드
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    소유자
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상태
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    상품 수
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    등록일
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    작업
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredBrands.map((brand) => {
                                const config = statusConfig[brand.status as keyof typeof statusConfig];
                                const StatusIcon = config.icon;

                                return (
                                    <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {brand.logoUrl ? (
                                                        <Image
                                                            src={brand.logoUrl}
                                                            alt={brand.name}
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{brand.name}</div>
                                                    <div className="text-sm text-gray-500">{brand.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {brand.owner}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}
                                            >
                                                {StatusIcon && <StatusIcon className="w-3 h-3" />}
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {brand.productsCount}개
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {brand.createdAt}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    보기
                                                </button>
                                                {brand.status === "pending" && (
                                                    <>
                                                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            승인
                                                        </button>
                                                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1">
                                                            <XCircle className="w-4 h-4" />
                                                            거부
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Empty State */}
                {filteredBrands.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">검색 결과가 없습니다</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        총 {filteredBrands.length}개의 브랜드
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
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
