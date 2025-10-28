"use client";

/**
 * AllOrdersSubSection - Seller Order Management
 * 
 * Features:
 * - View all orders for seller's brand
 * - Filter by status (all, pending, confirmed, processing, completed, canceled)
 * - Update order status through simplified workflow (5 status values)
 * - Pagination support (20 items per page)
 * 
 * Requirements (per backend):
 * - User must have approved SellApplication (status = 'approved')
 * - Brand must be approved (status = 'approved')
 * - Ownership chain: User → SellApplication → Brand → Orders
 * 
 * Business Rules:
 * - Cannot delete orders (only update status)
 * - Status transitions must follow valid flow
 * - Only see orders containing seller's brand products
 * 
 * @see Order Module Documentation for complete API reference
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSellerOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { useAuth } from "@/providers/authProvider";
import { Loader2, Package } from "lucide-react";
import { Order } from "@/types/order";
import OrderDetailModal from "./OrderDetailModal";

interface AllOrdersSubSectionProps {
    brandId?: string;
    defaultStatus?: string;
}

export default function AllOrdersSubSection({ brandId, defaultStatus }: AllOrdersSubSectionProps) {
    const searchParams = useSearchParams();
    const [statusFilter, setStatusFilter] = useState<string>(defaultStatus || "all");
    const [page, setPage] = useState(1);
    const pageSize = 20;
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Get status from URL query params
    useEffect(() => {
        const statusFromUrl = searchParams.get('status');
        if (statusFromUrl) {
            setStatusFilter(statusFromUrl);
        } else {
            setStatusFilter('all'); // Default to 'all' when no status param
        }
    }, [searchParams]);

    const { token, isAuthenticated } = useAuth();

    // For "전체 주문관리" page, always fetch all orders regardless of statusFilter
    const shouldFilterByStatus = statusFilter !== "all" && statusFilter !== undefined;
    const { data, isLoading, error } = useSellerOrders(
        shouldFilterByStatus ? statusFilter : undefined,
        page,
        pageSize
    );
    const updateStatus = useUpdateOrderStatus();

    const orders = data?.orders || [];
    const pagination = data?.pagination;

    /**
     * Open order detail modal
     */
    const handleViewDetail = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    /**
     * Close order detail modal
     */
    const handleCloseDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedOrder(null);
    };

    /**
     * Update order status
     * 
     * Valid status flow (SIMPLIFIED - 5 status values):
     * - pending → confirmed (payment confirmed by system)
     * - confirmed → processing (seller starts preparing)
     * - processing → completed (order fulfilled)
     * 
     * Exception flows:
     * - Any → canceled (before completion)
     * - Check Payment.status for payment/refund details
     * 
     * Note: Cannot delete orders, only update status
     */
    const handleStatusUpdate = async (orderNo: string, newStatus: string) => {
        try {
            await updateStatus.mutateAsync({
                orderId: orderNo,
                status: newStatus,
                note: `Status updated to ${newStatus}`
            });
            // Close modal after successful update
            handleCloseDetail();
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';    // 1️⃣ Chờ thanh toán
            case 'confirmed': return 'bg-green-100 text-green-800';    // 2️⃣ Đã thanh toán
            case 'processing': return 'bg-blue-100 text-blue-800';     // 3️⃣ Đang xử lý
            case 'completed': return 'bg-gray-100 text-gray-800';      // 4️⃣ Hoàn tất
            case 'canceled': return 'bg-red-100 text-red-800';         // 5️⃣ Đã hủy
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return '결제 대기';      // 1️⃣ Chờ thanh toán
            case 'confirmed': return '결제 완료';    // 2️⃣ Đã thanh toán
            case 'processing': return '배송 준비 중'; // 3️⃣ Đang xử lý
            case 'completed': return '배송 완료';    // 4️⃣ Hoàn tất
            case 'canceled': return '취소됨';        // 5️⃣ Đã hủy
            default: return status;
        }
    };

    if (!isAuthenticated || !token) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-red-500 text-6xl mb-4">🔒</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">인증이 필요합니다</h3>
                    <p className="text-gray-500 mb-6">주문을 보려면 로그인해주세요</p>
                    <Button onClick={() => window.location.href = '/login'}>
                        로그인하기
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
                    <p className="text-gray-600">주문 목록을 불러오는 중...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        const isBrandError = error.message.includes('Brand not found') ||
            error.message.includes('not active') ||
            error.message.includes('not approved');

        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                    {isBrandError ? (
                        <div className="text-center">
                            <p className="text-gray-500 mb-4">브랜드가 없거나 승인되지 않았습니다</p>
                            <p className="text-sm text-gray-400 mb-2">
                                브랜드 ID: {brandId}
                            </p>
                            <p className="text-xs text-gray-400 mb-6">
                                판매자 신청서와 브랜드가 모두 승인되어야 합니다
                            </p>
                            <div className="space-y-2">
                                <Button
                                    onClick={() => window.location.href = '/business/brands'}
                                    className="w-full"
                                >
                                    브랜드 관리로 이동
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    다시 시도
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-500 mb-6">{error.message}</p>
                            <Button onClick={() => window.location.reload()}>다시 시도</Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    // Don't return early - keep the UI structure even when no orders

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <div className="space-y-6">
                    {/* Header with Filter and Actions */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">주문 관리</h2>
                                <p className="text-gray-600">총 {pagination?.totalCount || 0}건의 주문</p>
                            </div>
                        </div>

                        {/* Action Buttons Only */}
                        <div className="flex items-center justify-end">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.reload()}
                                    className="text-xs"
                                >
                                    새로고침
                                </Button>

                                <Button
                                    size="sm"
                                    onClick={() => setPage(1)}
                                    className="text-xs"
                                >
                                    첫 페이지
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {orders.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        className="rounded"
                                        onChange={(e) => {
                                            // TODO: Implement select all
                                            console.log('Select all:', e.target.checked);
                                        }}
                                    />
                                    <span className="text-sm text-gray-600">전체 선택</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => {
                                            // TODO: Implement bulk status update
                                            console.log('Bulk status update');
                                        }}
                                    >
                                        일괄 상태변경
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs"
                                        onClick={() => {
                                            // TODO: Implement export orders
                                            console.log('Export orders');
                                        }}
                                    >
                                        엑셀 다운로드
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Table or No Orders Message */}
                    {orders.length === 0 ? (
                        <div className="bg-white rounded-lg border">
                            <div className="flex flex-col items-center justify-center py-16">
                                <Package className="w-16 h-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">주문이 없습니다</h3>
                                <p className="text-gray-500">
                                    {statusFilter !== "all"
                                        ? `'${getStatusLabel(statusFilter)}' 상태의 주문이 없습니다`
                                        : "아직 주문이 없어요"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                                주문번호
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                                상품금액
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                                배송비
                                            </th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                                총주문액
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                                주문상태
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                                주문자
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                                                결제방법
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                                주문일시
                                            </th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                                                액션
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                {/* 주문번호 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-xs font-mono text-gray-900">
                                                    <div className="truncate" title={order.orderNo}>
                                                        {order.orderNo}
                                                    </div>
                                                </td>

                                                {/* 상품금액 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                    ₩{order.items.reduce((sum, item) => sum + item.rowTotal, 0).toLocaleString()}
                                                </td>

                                                {/* 배송비 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                                                    ₩0
                                                </td>

                                                {/* 총주문액 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                                                    ₩{order.items.reduce((sum, item) => sum + item.rowTotal, 0).toLocaleString()}
                                                </td>

                                                {/* 주문상태 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                                    <Badge className={getStatusColor(order.status)}>
                                                        {getStatusLabel(order.status)}
                                                    </Badge>
                                                </td>

                                                {/* 주문자 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">{order.shippingName}</div>
                                                        <div className="text-xs text-gray-500">{order.shippingPhone}</div>
                                                    </div>
                                                </td>

                                                {/* 결제방법 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                                                    카드
                                                </td>

                                                {/* 주문일시 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>
                                                        <div className="font-medium">
                                                            {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(order.createdAt).toLocaleTimeString('ko-KR', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* 액션 */}
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex gap-1">
                                                        {/* 2️⃣ confirmed → 3️⃣ processing */}
                                                        {order.status === 'confirmed' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order.orderNo, 'processing')}
                                                                disabled={updateStatus.isPending}
                                                                className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-6"
                                                            >
                                                                배송 준비 시작
                                                            </Button>
                                                        )}
                                                        {/* 3️⃣ processing → 4️⃣ completed */}
                                                        {order.status === 'processing' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order.orderNo, 'completed')}
                                                                disabled={updateStatus.isPending}
                                                                className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1 h-6"
                                                            >
                                                                배송 완료
                                                            </Button>
                                                        )}
                                                        {/* Cancel buttons for non-final states */}
                                                        {['pending', 'confirmed', 'processing'].includes(order.status) && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleStatusUpdate(order.orderNo, 'canceled')}
                                                                disabled={updateStatus.isPending}
                                                                className="bg-red-600 hover:bg-red-700 text-xs px-2 py-1 h-6"
                                                            >
                                                                취소
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs px-2 py-1 h-6"
                                                            onClick={() => handleViewDetail(order)}
                                                        >
                                                            상세
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalCount > pageSize && (
                        <div className="flex justify-center items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                이전
                            </Button>
                            <span className="text-sm text-gray-600">
                                {page} / {Math.ceil(pagination.totalCount / pageSize)}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={page >= Math.ceil(pagination.totalCount / pageSize)}
                            >
                                다음
                            </Button>
                        </div>
                    )}

                    {/* Order Detail Modal */}
                    <OrderDetailModal
                        order={selectedOrder}
                        isOpen={isDetailModalOpen}
                        onClose={handleCloseDetail}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </div>
            </div>
        </div>
    );
}

