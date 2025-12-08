"use client";

import { useState } from "react";
import { Search, Filter, Eye, Download } from "lucide-react";

// Mock data
const mockOrders = [
    {
        id: "1",
        orderNo: "ORD-2024-001",
        user: "김철수",
        brand: "Nike Store",
        amount: 159000,
        status: "pending",
        createdAt: "2024-03-05 14:30",
    },
    {
        id: "2",
        orderNo: "ORD-2024-002",
        user: "이영희",
        brand: "Adidas Official",
        amount: 189000,
        status: "confirmed",
        createdAt: "2024-03-05 13:15",
    },
    {
        id: "3",
        orderNo: "ORD-2024-003",
        user: "박민수",
        brand: "Puma Korea",
        amount: 129000,
        status: "processing",
        createdAt: "2024-03-04 16:45",
    },
    {
        id: "4",
        orderNo: "ORD-2024-004",
        user: "최지은",
        brand: "Nike Store",
        amount: 210000,
        status: "completed",
        createdAt: "2024-03-03 10:20",
    },
];

const statusConfig = {
    pending: { label: "결제 대기", color: "yellow" },
    confirmed: { label: "결제 완료", color: "blue" },
    processing: { label: "배송 준비 중", color: "purple" },
    completed: { label: "배송 완료", color: "green" },
    canceled: { label: "취소됨", color: "red" },
};

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    const filteredOrders = mockOrders.filter((order) => {
        const matchesSearch =
            order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.brand.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterStatus === "all" || order.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const totalAmount = filteredOrders.reduce((sum, order) => sum + order.amount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">주문 관리</h1>
                <p className="text-gray-600 mt-2">전체 주문 내역을 관리하세요</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">전체 주문</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">{mockOrders.length}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="text-sm text-yellow-700">결제 대기</div>
                    <div className="text-2xl font-bold text-yellow-900 mt-1">
                        {mockOrders.filter((o) => o.status === "pending").length}
                    </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="text-sm text-blue-700">결제 완료</div>
                    <div className="text-2xl font-bold text-blue-900 mt-1">
                        {mockOrders.filter((o) => o.status === "confirmed").length}
                    </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="text-sm text-purple-700">배송 준비</div>
                    <div className="text-2xl font-bold text-purple-900 mt-1">
                        {mockOrders.filter((o) => o.status === "processing").length}
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm text-green-700">배송 완료</div>
                    <div className="text-2xl font-bold text-green-900 mt-1">
                        {mockOrders.filter((o) => o.status === "completed").length}
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
                            placeholder="주문 검색 (주문번호, 사용자, 브랜드)..."
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
                            <option value="pending">결제 대기</option>
                            <option value="confirmed">결제 완료</option>
                            <option value="processing">배송 준비 중</option>
                            <option value="completed">배송 완료</option>
                            <option value="canceled">취소됨</option>
                        </select>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="w-4 h-4" />
                        내보내기
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">사용자</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">브랜드</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">주문일</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">작업</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => {
                                const config = statusConfig[order.status as keyof typeof statusConfig];

                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.orderNo}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{order.user}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{order.brand}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ₩{order.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
                                                {config.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{order.createdAt}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end">
                                                <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                    <Eye className="w-4 h-4" />
                                                    상세보기
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">검색 결과가 없습니다</p>
                    </div>
                )}

                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <div className="text-sm text-gray-700">
                        총 {filteredOrders.length}건 · 총 금액: <span className="font-bold text-gray-900">₩{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white">
                            이전
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white">
                            다음
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
