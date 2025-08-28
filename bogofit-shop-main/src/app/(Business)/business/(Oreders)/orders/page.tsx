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
import { OrderStatus } from "@prisma/client";

// API 응답에 맞는 실제 타입 정의
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  totalCommission: number;
  settlementStatus: string;
  createdAt: Date;
  updatedAt: Date;
  orderer: {
    name: string;
    email: string | null;
    phone: string;
    tel: string | null;
  };
  shipping: {
    recipientName: string;
    recipientPhone: string;
    recipientTel: string | null;
    zipCode: string;
    address1: string;
    address2: string | null;
  };
  customsId: string;
  isGuestOrder: boolean;
  representativeProduct: {
    id: number;
    title: string;
    imageUrl: string;
    price: number;
    category: string;
  } | null;
  itemCount: number;
  totalQuantity: number;
  payment: {
    id: string;
    amount: number;
    status: string;
    method: string | null;
    paymentKey: string | null;
    approvedAt: Date | null;
  } | null;
  brand: {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
  items: {
    id: number;
    quantity: number;
    unitPrice: number;
    product: {
      id: number;
      title: string;
      imageUrl: string;
      price: number;
      category: string;
    } | null;
    variant: {
      id: number;
      optionName: string;
      optionValue: string;
      priceDiff: number;
    } | null;
  }[];
}

export default function BusinessOrdersPage() {
  const { orders, loading, updateOrderStatus } =
    useBusinessOrders() as unknown as {
      orders: Order[];
      loading: boolean;
      updateOrderStatus: (
        orderId: string,
        status: OrderStatus
      ) => Promise<Order>;
    };
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 필터링된 주문 목록
  const filteredOrders = (orders || []).filter((order) => {
    // 검색어가 비어있으면 모든 주문 통과, 아니면 주문번호로 검색
    const matchesSearch =
      !searchTerm.trim() ||
      (order.orderNumber?.toLowerCase()?.includes(searchTerm.toLowerCase()) ??
        false);
    const matchesStatus =
      statusFilter === "ALL" || (order.status && order.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error("주문 상태 변경 실패:", error);
    }
  };

  const getStatusBadge = (status: OrderStatus | undefined | null) => {
    const statusConfig = {
      PENDING: {
        label: "주문접수",
        variant: "default" as const,
        color: "bg-yellow-100 text-yellow-800",
      },
      PAID: {
        label: "결제완료",
        variant: "default" as const,
        color: "bg-blue-100 text-blue-800",
      },
      SHIPPING: {
        label: "배송중",
        variant: "default" as const,
        color: "bg-purple-100 text-purple-800",
      },
      COMPLETED: {
        label: "배송완료",
        variant: "default" as const,
        color: "bg-green-100 text-green-800",
      },
      CANCELED: {
        label: "취소",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
      FAILED: {
        label: "실패",
        variant: "destructive" as const,
        color: "bg-red-100 text-red-800",
      },
    };

    // 기본값 설정 (알 수 없는 상태 처리)
    const defaultConfig = {
      label: "알 수 없음",
      variant: "outline" as const,
      color: "bg-gray-100 text-gray-800",
    };

    // status가 null, undefined이거나 statusConfig에 없는 경우 기본값 사용
    const config = (status && statusConfig[status]) || defaultConfig;
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: OrderStatus | undefined | null) => {
    // status가 undefined이거나 null일 경우 기본값 처리
    if (!status) {
      return <Clock className="h-4 w-4 text-gray-600" />;
    }

    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "SHIPPING":
        return <Truck className="h-4 w-4 text-purple-600" />;
      case "COMPLETED":
        return <Package className="h-4 w-4 text-green-600" />;
      case "CANCELED":
      case "FAILED":
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
                <p className="text-2xl font-bold">{orders?.length || 0}</p>
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
                  {(orders || []).filter((o) => o.status === "PENDING").length}
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
                <p className="text-sm font-medium">결제완료</p>
                <p className="text-2xl font-bold">
                  {(orders || []).filter((o) => o.status === "PAID").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">배송중</p>
                <p className="text-2xl font-bold">
                  {(orders || []).filter((o) => o.status === "SHIPPING").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">배송완료</p>
                <p className="text-2xl font-bold">
                  {
                    (orders || []).filter((o) => o.status === "COMPLETED")
                      .length
                  }
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
                setStatusFilter(value as OrderStatus | "ALL")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 상태</SelectItem>
                <SelectItem value="PENDING">주문접수</SelectItem>
                <SelectItem value="PAID">결제완료</SelectItem>
                <SelectItem value="SHIPPING">배송중</SelectItem>
                <SelectItem value="COMPLETED">배송완료</SelectItem>
                <SelectItem value="CANCELED">취소</SelectItem>
                <SelectItem value="FAILED">실패</SelectItem>
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
                            {order.orderNumber || "주문번호 없음"}
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
                          ₩{(order.totalAmount || 0).toLocaleString()}
                        </p>
                        {(order.totalCommission || 0) > 0 && (
                          <p className="text-sm text-gray-500">
                            수수료: ₩
                            {(order.totalCommission || 0).toLocaleString()}
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
                                      <p>
                                        {selectedOrder.orderNumber ||
                                          "주문번호 없음"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">주문상태</h4>
                                      {getStatusBadge(selectedOrder.status)}
                                    </div>
                                    <div>
                                      <h4 className="font-medium">주문금액</h4>
                                      <p>
                                        ₩
                                        {(
                                          selectedOrder.totalAmount || 0
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium">수수료</h4>
                                      <p>
                                        ₩
                                        {(
                                          selectedOrder.totalCommission || 0
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-2">
                                      주문 상품
                                    </h4>
                                    <div className="space-y-2">
                                      {selectedOrder.items?.map(
                                        (item, index) => (
                                          <div
                                            key={index}
                                            className="flex justify-between items-center p-2 border rounded"
                                          >
                                            <span>
                                              {item.product?.title ||
                                                "상품명 없음"}
                                            </span>
                                            <span>
                                              {item.quantity || 0}개 × ₩
                                              {(
                                                item.unitPrice || 0
                                              ).toLocaleString()}
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
                                        "PAID",
                                        "SHIPPING",
                                        "COMPLETED",
                                        "CANCELED",
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
                                              status as OrderStatus
                                            )
                                          }
                                        >
                                          {status === "PAID" && "결제완료"}
                                          {status === "SHIPPING" && "배송중"}
                                          {status === "COMPLETED" && "배송완료"}
                                          {status === "CANCELED" && "취소"}
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
