"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
import { Loader2, Package, MapPin, CreditCard, Calendar, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatOrderItemOptions, OrderStatus, OrderItem, Order, OrderGroup } from "@/types/order";

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    orderType: 'order' | 'group';
}

export default function OrderDetailModal({ isOpen, onClose, orderId, orderType }: OrderDetailModalProps) {
    const router = useRouter();
    const [orderData, setOrderData] = useState<Order | OrderGroup | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && orderId) {
            loadOrderDetail();
        }
    }, [isOpen, orderId]);

    const loadOrderDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("로그인이 필요합니다");
                return;
            }

            const response = await fetch(`/api/order/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (data.success) {
                setOrderData(data.data);
            } else {
                setError(data.message || "주문 정보를 불러올 수 없습니다");
            }
        } catch (err) {
            console.error("Failed to load order detail:", err);
            setError("주문 정보 로드 실패");
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = () => {
        if (orderData) {
            const order = 'orders' in orderData ? orderData.orders[0] : orderData as Order;
            router.push(`/payment/${order.groupId || order.id}`);
        }
    };

    const handleCancel = () => {
        if (!orderData) return;

        const order = 'orders' in orderData ? orderData.orders[0] : orderData as Order;
        const status = order.status;

        // Check cancellation conditions
        if (status === 'pending') {
            // Pending orders can be cancelled anytime
            if (confirm("정말로 이 주문을 취소하시겠습니까?")) {
                cancelOrder();
            }
        } else if (status === 'confirmed') {
            // Confirmed orders can be cancelled within 24 hours
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                alert("확인된 주문은 24시간 이내에만 취소 가능합니다.");
                return;
            }

            if (confirm("확인된 주문을 취소하시겠습니까? 환불은 3-5일 소요됩니다.")) {
                cancelOrder();
            }
        } else if (status === 'processing') {
            // Processing orders can only be cancelled if not shipped
            alert("처리 중인 주문은 배송 시작 전에만 취소 가능합니다. 고객센터에 문의하세요.");
            return;
        } else {
            alert("이 주문은 취소할 수 없습니다.");
            return;
        }
    };

    const canCancelOrder = (order: Order): boolean => {
        const status = order.status;

        if (status === 'pending') {
            return true; // Pending orders can always be cancelled
        }

        if (status === 'confirmed') {
            // Check if within 24 hours
            const orderDate = new Date(order.createdAt);
            const now = new Date();
            const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff <= 24;
        }

        if (status === 'processing') {
            // Processing orders can only be cancelled if not shipped
            // This would need additional logic to check shipping status
            // For now, we'll allow it but show a warning in handleCancel
            return true;
        }

        return false; // completed, canceled orders cannot be cancelled
    };

    const cancelOrder = async () => {
        if (!orderData) return;

        try {
            const order = 'orders' in orderData ? orderData.orders[0] : orderData as Order;

            // Call customer cancel API
            const response = await fetch(`/api/order/${order.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    reason: '구매자 요청'
                })
            });

            const result = await response.json();

            if (result.success) {
                alert("주문이 취소되었습니다.");
                onClose();
                // Refresh the page to update order list
                window.location.reload();
            } else {
                alert(`취소 실패: ${result.message}`);
            }
        } catch (error) {
            console.error('Cancel order error:', error);
            alert("주문 취소 중 오류가 발생했습니다.");
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">주문 상세 정보</DialogTitle>
                </DialogHeader>

                {loading && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
                        <p className="text-gray-600">주문 정보를 불러오는 중...</p>
                    </div>
                )}

                {error && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
                        <p className="text-gray-500 mb-6">{error}</p>
                        <Button onClick={loadOrderDetail}>다시 시도</Button>
                    </div>
                )}

                {orderData && (
                    <div className="space-y-6">
                        {/* Order Header */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            {orderType === 'group' ? '주문 그룹' : '주문'}
                                        </h3>
                                        <p className="font-mono text-sm text-gray-600 mt-1">
                                            {orderType === 'group' ? (orderData as OrderGroup).groupNo : (orderData as Order).orderNo}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(orderData.createdAt).toLocaleDateString("ko-KR", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                    <Badge className={ORDER_STATUS_COLORS[orderData.status as OrderStatus]}>
                                        {ORDER_STATUS_LABELS[orderData.status as OrderStatus]}
                                    </Badge>
                                </div>

                                {/* Total Amount */}
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="text-lg font-semibold">총 결제금액</span>
                                    <span className="text-2xl font-bold text-pink-600">
                                        ₩{((orderData as OrderGroup).finalAmount || (orderData as Order).items?.reduce((sum: number, item: OrderItem) => sum + item.rowTotal, 0) || 0).toLocaleString()}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        {orderType === 'group' && (orderData as OrderGroup).shippingName && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MapPin className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold">배송 정보</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">{(orderData as OrderGroup).shippingName}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {(orderData as OrderGroup).shippingPhone}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {(orderData as OrderGroup).shippingAddress}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {(orderData as OrderGroup).shippingCity} {(orderData as OrderGroup).shippingPostalCode}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Package className="w-5 h-5 text-gray-600" />
                                    <h3 className="text-lg font-semibold">주문 상품</h3>
                                </div>

                                {orderType === 'group' ? (
                                    // Group orders
                                    <div className="space-y-4">
                                        {(orderData as OrderGroup).orders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {order.brand?.logoUrl && (
                                                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={order.brand.logoUrl}
                                                                alt={order.brand.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-semibold">{order.brand?.name || "브랜드"}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{order.orderNo}</div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    {order.items.map((item) => (
                                                        <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                            {item.imageUrl && (
                                                                <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                                                                    <Image
                                                                        src={item.imageUrl}
                                                                        alt={item.productTitle}
                                                                        fill
                                                                        className="object-cover rounded"
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{item.productTitle}</p>
                                                                {item.optionsJson && item.optionsJson.length > 0 && (
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatOrderItemOptions(item.optionsJson)}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-gray-600">
                                                                    {item.quantity}개 × ₩{item.unitPrice.toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-semibold">₩{item.rowTotal.toLocaleString()}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Single order
                                    <div className="space-y-2">
                                        {(orderData as Order).items?.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                                                {item.imageUrl && (
                                                    <div className="relative w-12 h-12 bg-gray-100 rounded flex-shrink-0">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.productTitle}
                                                            fill
                                                            className="object-cover rounded"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{item.productTitle}</p>
                                                    {item.optionsJson && item.optionsJson.length > 0 && (
                                                        <p className="text-xs text-gray-500">
                                                            {formatOrderItemOptions(item.optionsJson)}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-600">
                                                        {item.quantity}개 × ₩{item.unitPrice.toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm font-semibold">₩{item.rowTotal.toLocaleString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        {orderType === 'group' && (orderData as OrderGroup).paidAt && (
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <h3 className="text-lg font-semibold">결제 정보</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">
                                                결제일: {new Date((orderData as OrderGroup).paidAt!).toLocaleDateString("ko-KR")}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            결제방법: 카드 결제
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            {(orderData as Order).status === "pending" && (
                                <Button
                                    onClick={handlePayment}
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                >
                                    결제하기
                                </Button>
                            )}

                            {canCancelOrder(orderData as Order) && (
                                <Button
                                    onClick={handleCancel}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    주문 취소
                                </Button>
                            )}

                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                            >
                                닫기
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
