"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Package, Loader2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatOrderItemOptions, OrderStatus, OrderItem, Order, OrderGroup } from "@/types/order";
import OrderDetailModal from "./OrderDetailModal";
import { useLanguage } from "@/providers/languageProvider";

export default function OrderSection() {
  const router = useRouter();
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<'order' | 'group'>('order');
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const openOrderDetail = (orderId: string, orderType: 'order' | 'group') => {
    setSelectedOrderId(orderId);
    setSelectedOrderType(orderType);
    setIsModalOpen(true);
  };

  const closeOrderDetail = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">{t("myPage.order.loading")}</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t("myPage.order.error")}</h3>
          <p className="text-gray-500 mb-6">{error.message}</p>
          <Button onClick={() => window.location.reload()}>{t("myPage.order.retry")}</Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasOrders) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">{t("myPage.order.noOrders")}</h3>
          <p className="text-gray-500 mb-6">{t("myPage.order.noOrdersDescription")}</p>
          <Link href="/">
            <Button>{t("myPage.order.startShopping")}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500">{t("myPage.order.totalOrders").replace("{count}", totalOrders.toString())}</p>
      </div>

      {/* Order Groups (MoR - Multiple Brands) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="border border-gray-200">
            <CardContent className="p-6">
              {/* Group Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div>
                  <div className="text-xs text-gray-900 font-semibold uppercase">
                    {group.orders.length > 1 ? t("myPage.order.multiBrandOrder") : t("myPage.order.order")}
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
                          <div className="font-semibold">{order.brand?.name || t("myPage.order.brand")}</div>
                          <div className="text-xs text-gray-500 font-mono">{order.orderNo}</div>
                          <div className="text-sm text-gray-600">
                            {t("myPage.order.products").replace("{count}", order.items.length.toString())}
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
                                  {t("myPage.order.option").replace("{options}", formatOrderItemOptions(item.optionsJson))}
                                </p>
                              )}
                              <p className="text-xs text-gray-600">
                                {t("myPage.order.quantity").replace("{count}", item.quantity.toString())} × ₩{item.unitPrice.toLocaleString()}
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
              <div className="mt-4 pt-4 border-t border-gray-100 -mx-6 -mb-6 p-6 rounded-b-lg bg-gray-50/50">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t("myPage.order.productAmount")}</span>
                    <span>₩{group.totalAmount.toLocaleString()}</span>
                  </div>
                  {group.discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-gray-900">
                      <span>{t("myPage.order.discount")}</span>
                      <span>-₩{group.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t("myPage.order.shippingFee")}</span>
                    <span>₩{group.shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-semibold">{t("myPage.order.totalBrandOrderAmount").replace("{count}", group.orders.length.toString())}</span>
                    <span className="text-xl font-bold text-gray-900">
                      ₩{group.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Group Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => openOrderDetail(group.id, 'group')}
                    variant="outline"
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {t("myPage.order.viewDetails")}
                  </Button>
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
            <Card key={order.id} className="transition-all hover:border-gray-400">
              <CardContent className="p-4 sm:p-5">
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-gray-900">{order.orderNo}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit"
                      })}
                    </span>
                  </div>
                  <Badge className={ORDER_STATUS_COLORS[order.status as OrderStatus] || "bg-gray-100 text-gray-800"}>
                    {ORDER_STATUS_LABELS[order.status as OrderStatus] || order.status}
                  </Badge>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-3">
                  {(order.items || []).slice(0, 2).map((item: OrderItem) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
                      {item.imageUrl && (
                        <div className="relative w-10 h-10 bg-white rounded flex-shrink-0 border border-gray-100">
                          <Image
                            src={item.imageUrl}
                            alt={item.productTitle}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 flex justify-between items-center">
                        <div className="min-w-0 pr-2">
                          <p className="text-sm text-gray-700 truncate">{item.productTitle}</p>
                          <p className="text-xs text-gray-500">
                            {t("myPage.order.quantity").replace("{count}", item.quantity.toString())}
                          </p>
                        </div>
                        <p className="text-sm font-semibold whitespace-nowrap">₩{item.rowTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}

                  {(order.items?.length || 0) > 2 && (
                    <p className="text-xs text-gray-400 text-center py-1">
                      + {t("myPage.order.moreProducts").replace("{count}", ((order.items?.length || 0) - 2).toString())}
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-3" />

                {/* Footer Actions & Total */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-gray-500">{t("myPage.order.totalPaymentAmount")}</span>
                    <span className="text-lg font-bold text-gray-900">
                      ₩{((groupData as OrderGroup)?.finalAmount || order.items?.reduce((sum: number, item: OrderItem) => sum + item.rowTotal, 0) || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => openOrderDetail(order.id, 'order')}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs sm:text-sm"
                    >
                      {t("myPage.order.viewDetails")}
                    </Button>
                    {order.status === "pending" && (
                      <Button
                        onClick={() => router.push(`/payment/${order.groupId || order.id}`)}
                        size="sm"
                        className="h-8 text-xs sm:text-sm bg-gray-900 hover:bg-gray-800 text-white"
                      >
                        {t("myPage.order.payment")}
                      </Button>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      {
        totalOrders > 10 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t("myPage.order.previous")}
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
              {t("myPage.order.next")}
            </Button>
          </div>
        )
      }

      {/* Order Detail Modal */}
      {
        selectedOrderId && (
          <OrderDetailModal
            isOpen={isModalOpen}
            onClose={closeOrderDetail}
            orderId={selectedOrderId}
            orderType={selectedOrderType}
          />
        )
      }
    </div >
  );
}

