"use client";

import { useState } from "react";
import { Search, Filter, CheckCircle, XCircle, Eye, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

// Mock data
const mockProducts = [
    {
        id: "1",
        name: "에어맥스 270",
        brand: "Nike Store",
        price: 159000,
        status: "pending",
        thumbUrl: null,
        createdAt: "2024-03-05",
    },
    {
        id: "2",
        name: "울트라부스트 22",
        brand: "Adidas Official",
        price: 189000,
        status: "approved",
        thumbUrl: null,
        createdAt: "2024-03-01",
    },
    {
        id: "3",
        name: "RS-X 트랙",
        brand: "Puma Korea",
        price: 129000,
        status: "rejected",
        thumbUrl: null,
        createdAt: "2024-02-28",
    },
];

const statusConfig = {
    pending: { label: "대기중", color: "yellow" },
    approved: { label: "승인됨", color: "green" },
    rejected: { label: "거부됨", color: "red" },
};

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredProducts = mockProducts.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === "all" || product.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">상품 관리</h1>
                <p className="text-gray-600 mt-2">상품 등록을 검토하고 승인하세요</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-sm text-yellow-700">대기중</div>
                    <div className="text-2xl font-bold text-yellow-900 mt-1">
                        {mockProducts.filter((p) => p.status === "pending").length}
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-700">승인됨</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                        {mockProducts.filter((p) => p.status === "approved").length}
                    </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="text-sm text-red-700">거부됨</div>
                    <div className="text-2xl font-bold text-red-900 mt-1">
                        {mockProducts.filter((p) => p.status === "rejected").length}
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
                            placeholder="상품 검색 (이름, 브랜드)..."
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
                            <option value="pending">대기중</option>
                            <option value="approved">승인됨</option>
                            <option value="rejected">거부됨</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">가격</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">등록일</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredProducts.map((product) => {
                                const config = statusConfig[product.status as keyof typeof statusConfig];

                                return (
                                    <tr key={product.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                                    {product.thumbUrl ? (
                                                        <Image src={product.thumbUrl} alt={product.name} width={64} height={64} />
                                                    ) : (
                                                        <ImageIcon className="w-8 h-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="font-medium text-gray-900">{product.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.brand}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ₩{product.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{product.createdAt}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    보기
                                                </button>
                                                {product.status === "pending" && (
                                                    <>
                                                        <button className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1">
                                                            <CheckCircle className="w-4 h-4" />
                                                            승인
                                                        </button>
                                                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1">
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

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">검색 결과가 없습니다</p>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-500">총 {filteredProducts.length}개의 상품</div>
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
