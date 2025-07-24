"use client";

import { useState } from "react";
import { useBusinessOrders } from "@/hooks/useBusiness";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Search,
  MoreHorizontal,
  Eye,
  Truck,
  Package,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BusinessOrderStatus,
  BusinessOrder,
  BusinessOrderItem,
} from "@/types/business";

export default function BusinessOrdersPage() {
  const { orders, loading, updateOrderStatus } = useBusinessOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<BusinessOrderStatus | "ALL">(
    "ALL"
  );
  const [selectedOrder, setSelectedOrder] = useState<BusinessOrder | null>(
    null
  );

  // 필터링된 주문 목록
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.businessOrderNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: BusinessOrderStatus
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("주문 상태 변경 실패:", error);
    }
  };

  const getStatusBadge = (status: BusinessOrderStatus) => {
    const statusConfig = {
      PENDING: {
        label: "주문접수",
        variant: "default" as const,
        color: "bg-yellow-100 text-yellow-800",
      },
      CONFIRMED: {
        label: "주문확인",
        variant: "default" as const,
        color: "bg-blue-100 text-blue-800",
      },
      PROCESSING: {
        label: "상품준비중",
        variant: "default" as const,
        color: "bg-purple-100 text-purple-800",
      },
      SHIPPED: {
        label: "발송완료",
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      DELIVERED: {
        label: "배송완료",
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      CANCELLED: {
        label: "취소",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
      RETURNED: {
        label: "반품",
        variant: "destructive" as const,
        color: "bg-orange-100 text-orange-800",
      },
      REFUNDED: {
        label: "환불완료",
        variant: "outline" as const,
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config = statusConfig[status];
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: BusinessOrderStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "PROCESSING":
        return <Package className="h-4 w-4 text-purple-600" />;
      case "SHIPPED":
      case "DELIVERED":
        return <Truck className="h-4 w-4 text-green-600" />;
      case "CANCELLED":
      case "RETURNED":
      case "REFUNDED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">주문 관리</h1>
          <p className="text-gray-600">
            접수된 주문을 관리하고 배송 상태를 업데이트하세요
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">전체 주문</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">접수대기</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "PENDING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">준비중</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "PROCESSING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">배송중</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "SHIPPED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">완료</p>
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === "DELIVERED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="주문번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as BusinessOrderStatus | "ALL")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 상태</SelectItem>
                <SelectItem value="PENDING">주문접수</SelectItem>
                <SelectItem value="CONFIRMED">주문확인</SelectItem>
                <SelectItem value="PROCESSING">상품준비중</SelectItem>
                <SelectItem value="SHIPPED">발송완료</SelectItem>
                <SelectItem value="DELIVERED">배송완료</SelectItem>
                <SelectItem value="CANCELLED">취소</SelectItem>
                <SelectItem value="RETURNED">반품</SelectItem>
                <SelectItem value="REFUNDED">환불완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 주문 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>주문 목록 ({filteredOrders.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>주문정보</TableHead>
                <TableHead>주문금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>주문일시</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <p className="font-medium">
                            {order.businessOrderNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            상품 {order.items?.length || 0}개
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          ₩{order.totalAmount.toLocaleString()}
                        </p>
                        {order.commission > 0 && (
                          <p className="text-sm text-gray-500">
                            수수료: ₩{order.commission.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedOrder(order);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                상세보기
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>주문 상세정보</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium">주문번호</h4>
                                      <p>{selectedOrder.businessOrderNumber}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">주문상태</h4>
                                      {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">주문금액</h4>
                                      <p>
                                        ₩
                                        {selectedOrder.totalAmount.toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">수수료</h4>
                                      <p>
                                        ₩
                                        {selectedOrder.commission.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">
                                      주문 상품
                                    </h4>
                                    <div className="space-y-2">
                                      {selectedOrder.items?.map(
                                        (
                                          item: BusinessOrderItem,
                                          index: number
                                        ) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center p-2 border rounded"
                                          >
                                            <span>{item.productTitle}</span>
                                            <span>
                                              {item.quantity}개 × ₩
                                              {item.unitPrice.toLocaleString()}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">
                                      상태 변경
                                    </h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {[
                                        "CONFIRMED",
                                        "PROCESSING",
                                        "SHIPPED",
                                        "DELIVERED",
                                        "CANCELLED",
                                      ].map((status) => (
                                        <Button
                                          key={status}
                                          size="sm"
                                          variant={
                                            selectedOrder.status === status
                                              ? "default"
                                              : "outline"
                                          }
                                          onClick={() =>
                                            handleStatusUpdate(
                                              selectedOrder.id,
                                              status as BusinessOrderStatus
                                            )
                                          }
                                        >
                                          {status === "CONFIRMED" && "주문확인"}
                                          {status === "PROCESSING" &&
                                            "상품준비중"}
                                          {status === "SHIPPED" && "발송완료"}
                                          {status === "DELIVERED" && "배송완료"}
                                          {status === "CANCELLED" && "취소"}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <ShoppingCart className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">주문이 없습니다.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
