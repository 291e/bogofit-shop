"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatOrderItemOptions, OrderStatus, OrderItem, Order, OrderGroup } from "@/types/order";

export default function OrderSection() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { data, isLoading, error } = useOrders(page, 10);
  
  const groups = data?.groups || [];
  const singles = data?.singles || [];
  const totalGroups = data?.totalGroups || 0;
  const totalSingles = data?.totalSingles || 0;
  const hasOrders = groups.length > 0 || singles.length > 0;
  const totalOrders = totalGroups + totalSingles;
  
  const toggleGroup = (groupId: string) => {
    const newSet = new Set(expandedGroups);
    if (newSet.has(groupId)) {
      newSet.delete(groupId);
    } else {
      newSet.add(groupId);
    }
    setExpandedGroups(newSet);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-pink-600 animate-spin mb-4" />
          <p className="text-gray-600">주문 내역을 불러오는 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>다시 시도</Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasOrders) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">주문 내역이 없습니다</h3>
          <p className="text-gray-500 mb-6">아직 주문한 상품이 없어요</p>
          <Link href="/">
            <Button>쇼핑 시작하기</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500">총 {totalOrders}건의 주문</p>
      </div>

      {/* Order Groups (MoR - Multiple Brands) */}
      {groups.map((group) => (
        <Card key={group.id} className="border-2 border-purple-200">
          <CardContent className="p-6">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div>
                <div className="text-xs text-purple-600 font-semibold uppercase">
                  {group.orders.length > 1 ? "멀티 브랜드 주문" : "주문"}
                </div>
                <p className="font-mono text-sm text-gray-600 mt-1">{group.groupNo}</p>
                <p className="text-sm text-gray-500">
                  {new Date(group.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ₩{group.finalAmount.toLocaleString()}
                </div>
                <Badge className={ORDER_STATUS_COLORS[group.status]}>
                  {ORDER_STATUS_LABELS[group.status]}
                </Badge>
              </div>
            </div>

            {/* Brand Orders in Group */}
            <div className="space-y-3">
              {group.orders.map((order) => (
                <div key={order.id} className="border rounded-lg overflow-hidden">
                  {/* Brand Header */}
                  <button
                    onClick={() => toggleGroup(order.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {order.brand?.logoUrl && (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                          <Image
                            src={order.brand.logoUrl}
                            alt={order.brand.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                        <div className="text-left">
                        <div className="font-semibold">{order.brand?.name || "브랜드"}</div>
                        <div className="text-xs text-gray-500 font-mono">{order.orderNo}</div>
                        <div className="text-sm text-gray-600">
                          {order.items.length}개 상품
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-400 text-lg">
                      {expandedGroups.has(order.id) ? "▼" : "▶"}
                    </div>
                  </button>

                  {/* Items Detail (Expandable) */}
                  {expandedGroups.has(order.id) && (
                    <div className="border-t bg-gray-50 p-4 space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white p-3 rounded">
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
                </div>
              ))}
            </div>

            {/* Group Summary */}
            <div className="mt-4 pt-4 border-t bg-purple-50 -mx-6 -mb-6 p-6 rounded-b-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>상품 금액</span>
                  <span>₩{group.totalAmount.toLocaleString()}</span>
                </div>
                {group.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>할인</span>
                    <span>-₩{group.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>배송비</span>
                  <span>₩{group.shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                  <span className="font-semibold">{group.orders.length}개 브랜드 주문 총액</span>
                  <span className="text-xl font-bold text-purple-600">
                    ₩{group.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Single Orders (Backend returns Order[] not OrderGroup[]) */}
      {singles.map((singleData: Order | OrderGroup) => {
        // Backend may return Order directly or OrderGroup with 1 order
        const isOrderGroup = 'orders' in singleData && Array.isArray(singleData.orders);
        const order = isOrderGroup ? singleData.orders[0] : singleData as Order;
        const groupData = isOrderGroup ? singleData as OrderGroup : null;
        
        // Skip if no order data
        if (!order) return null;
        
        return (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-mono text-sm text-gray-600 mb-1">{order.orderNo}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus] || "bg-gray-100 text-gray-800"}>
                  {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                </Badge>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {(order.items || []).slice(0, 2).map((item: OrderItem) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.imageUrl && (
                      <div className="relative w-14 h-14 bg-gray-100 rounded flex-shrink-0">
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
                      <p className="text-xs text-gray-600">수량: {item.quantity}개</p>
                    </div>
                    <p className="text-sm font-semibold">₩{item.rowTotal.toLocaleString()}</p>
                  </div>
                ))}
                
                {(order.items?.length || 0) > 2 && (
                  <p className="text-sm text-gray-500 text-center">
                    +{(order.items?.length || 0) - 2}개 상품 더보기
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              {/* Total - Calculate from items if no group data */}
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold">총 결제금액</p>
                <p className="text-xl font-bold text-pink-600">
                  ₩{((groupData as OrderGroup)?.finalAmount || order.items?.reduce((sum: number, item: OrderItem) => sum + item.rowTotal, 0) || 0).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              {order.status === "pending" && (
                <Button 
                  onClick={() => router.push(`/payment/${order.groupId || order.id}`)}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  결제하기
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Pagination */}
      {totalOrders > 10 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {Math.ceil(totalOrders / 10)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalOrders / 10)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}

