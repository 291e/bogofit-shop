"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Package } from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  user: {
    id: string;
    userId: string;
    email: string;
    name: string;
  };
  items: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: number;
      title: string;
      imageUrl?: string;
    };
    variant?: {
      id: number;
      optionName: string;
      optionValue: string;
    };
  }[];
  brand?: {
    id: number;
    name: string;
  };
}

export default function AdminOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      console.log("[AdminOrderManagement] 주문 목록 조회 시작");
      const params = new URLSearchParams({
        search: orderSearch,
        status: orderFilter,
        limit: "50",
      });

      const response = await fetch(`/api/admin/orders?${params}`, {
        credentials: "include",
      });

      console.log(
        "[AdminOrderManagement] API 응답:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[AdminOrderManagement] API 오류:", errorData);
        throw new Error(`주문 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("[AdminOrderManagement] 받은 데이터:", data);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("주문 목록 조회 오류:", error);
      toast.error("주문 목록을 불러오는데 실패했습니다");
    }
  }, [orderSearch, orderFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "결제 대기", variant: "outline" as const },
      PAID: { label: "결제 완료", variant: "default" as const },
      SHIPPING: { label: "배송 중", variant: "secondary" as const },
      COMPLETED: { label: "완료", variant: "default" as const },
      CANCELED: { label: "취소", variant: "destructive" as const },
      FAILED: { label: "실패", variant: "destructive" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">주문 관리</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="주문번호 또는 사용자 검색..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={orderFilter} onValueChange={setOrderFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="PENDING">결제 대기</SelectItem>
            <SelectItem value="PAID">결제 완료</SelectItem>
            <SelectItem value="SHIPPING">배송 중</SelectItem>
            <SelectItem value="COMPLETED">완료</SelectItem>
            <SelectItem value="CANCELED">취소</SelectItem>
            <SelectItem value="FAILED">실패</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={fetchOrders}>검색</Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>사용자</TableHead>
              <TableHead>상품 수</TableHead>
              <TableHead>총 금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>주문일</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.orderNumber}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {order.user.name || order.user.userId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{order.items.length}개</TableCell>
                <TableCell>₩{order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/order/${order.id}`, "_blank")
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // 주문 상세 정보 표시 또는 관리 기능
                        toast.info(
                          "주문 상세 관리 기능은 추후 구현 예정입니다"
                        );
                      }}
                    >
                      <Package className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {orders.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            주문 데이터가 없습니다.
          </div>
        )}
      </Card>
    </div>
  );
}
