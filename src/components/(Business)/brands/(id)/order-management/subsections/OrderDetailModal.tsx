"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Order, formatOrderItemOptions } from "@/types/order";
import { Package, User, MapPin, Calendar, CreditCard, Phone } from "lucide-react";
import Image from "next/image";

interface OrderDetailModalProps {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
    onStatusUpdate?: (orderNo: string, newStatus: string) => void;
}

export default function OrderDetailModal({
    order,
    isOpen,
    onClose,
    onStatusUpdate
}: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'paid': return 'bg-green-100 text-green-800';
            case 'fulfilling': return 'bg-blue-100 text-blue-800';
            case 'fulfilled': return 'bg-purple-100 text-purple-800';
            case 'completed': return 'bg-gray-100 text-gray-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            case 'payment_failed': return 'bg-orange-100 text-orange-800';
            case 'refunded': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return '대기중';
            case 'paid': return '입금완료';
            case 'fulfilling': return '배송준비';
            case 'fulfilled': return '배송중';
            case 'completed': return '배송완료';
            case 'canceled': return '취소됨';
            case 'payment_failed': return '결제실패';
            case 'refunded': return '환불완료';
            default: return status;
        }
    };

    const totalAmount = order.items.reduce((sum, item) => sum + item.rowTotal, 0);
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">주문 상세 정보</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Header */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">주문번호</div>
                                <div className="text-lg font-mono font-bold text-gray-900">{order.orderNo}</div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                                    </div>
                                    {order.brand && (
                                        <div className="flex items-center gap-1">
                                            <Package className="w-3 h-3" />
                                            {order.brand.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                            </Badge>
                        </div>
                    </div>

                    {/* Customer & Shipping in 2 columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Information */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                                <User className="w-4 h-4" />
                                주문자 정보
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500">이름</div>
                                    <div className="font-medium">{order.shippingName}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">연락처</div>
                                    <div className="font-medium flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {order.shippingPhone}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                                <MapPin className="w-4 h-4" />
                                배송지 정보
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <div className="text-xs text-gray-500">주소</div>
                                    <div className="font-medium">{order.shippingAddress}</div>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500">도시</div>
                                        <div>{order.shippingCity}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">우편번호</div>
                                        <div>{order.shippingPostalCode}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-700">
                            <Package className="w-4 h-4" />
                            주문 상품 ({order.items.length}개)
                        </h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 transition">
                                    <div className="flex gap-3">
                                        {/* Product Image */}
                                        {item.imageUrl && (
                                            <div className="relative w-16 h-16 bg-gray-100 rounded flex-shrink-0">
                                                <Image
                                                    src={item.imageUrl}
                                                    alt={item.productTitle}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            </div>
                                        )}

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-gray-900 truncate mb-1">
                                                {item.productTitle}
                                            </div>
                                            {item.optionsJson && item.optionsJson.length > 0 && (
                                                <div className="text-xs text-gray-600 mb-1">
                                                    {formatOrderItemOptions(item.optionsJson)}
                                                </div>
                                            )}
                                            {item.sku && (
                                                <div className="text-xs text-gray-500 font-mono">
                                                    SKU: {item.sku}
                                                </div>
                                            )}
                                        </div>

                                        {/* Price & Quantity */}
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-sm font-bold text-gray-900">
                                                ₩{item.rowTotal.toLocaleString()}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {item.quantity}개 × ₩{item.unitPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-gray-700">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-sm font-semibold">결제 정보</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">상품금액 ({totalQuantity}개)</span>
                                <span className="font-medium">₩{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">배송비</span>
                                <span className="font-medium">₩0</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">총 주문금액</span>
                                <span className="text-xl font-bold text-pink-600">₩{totalAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 pt-1">
                                <span>결제방법</span>
                                <span>카드</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                        {onStatusUpdate && (
                            <>
                                {order.status === 'confirmed' && (
                                    <Button
                                        onClick={() => onStatusUpdate(order.orderNo, 'processing')}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        size="sm"
                                    >
                                        배송준비 시작
                                    </Button>
                                )}
                                {order.status === 'processing' && (
                                    <Button
                                        onClick={() => onStatusUpdate(order.orderNo, 'completed')}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        size="sm"
                                    >
                                        배송완료 처리
                                    </Button>
                                )}
                                {order.status === 'completed' && (
                                    <Button
                                        onClick={() => onStatusUpdate(order.orderNo, 'completed')}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        size="sm"
                                    >
                                        주문완료 처리
                                    </Button>
                                )}
                                {order.status === 'canceled' && (
                                    <Button
                                        onClick={() => onStatusUpdate(order.orderNo, 'canceled')}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                        size="sm"
                                    >
                                        주문취소 처리
                                    </Button>
                                )}
                            </>
                        )}
                        <Button variant="outline" onClick={onClose} size="sm" className="flex-1">
                            닫기
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

