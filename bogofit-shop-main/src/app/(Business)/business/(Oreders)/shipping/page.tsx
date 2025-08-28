"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  Edit,
  Search,
  Phone,
  MapPin,
} from "lucide-react";
import {
  ShippingOrder,
  mockShippingOrders,
  shippingStatusOptions,
  courierOptions,
  getShippingStats,
} from "@/contents/Business/shippingData";

export default function ShippingPage() {
  const [shippingOrders, setShippingOrders] =
    useState<ShippingOrder[]>(mockShippingOrders);
  const [filteredData, setFilteredData] =
    useState<ShippingOrder[]>(mockShippingOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ShippingOrder | null>(
    null
  );
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: "",
    courier: "",
    trackingNumber: "",
    notes: "",
  });

  // 필터링 로직
  useEffect(() => {
    let filtered = shippingOrders;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredData(filtered);
  }, [shippingOrders, searchTerm, statusFilter]);

  // 배송 정보 업데이트 핸들러
  const handleShippingUpdate = () => {
    if (!selectedOrder) return;

    const updatedOrders = shippingOrders.map((order) => {
      if (order.id === selectedOrder.id) {
        const updatedOrder = {
          ...order,
          status: updateData.status as ShippingOrder["status"],
          courier: updateData.courier,
          trackingNumber: updateData.trackingNumber || undefined,
          notes: updateData.notes || undefined,
        };

        // 배송 상태에 따른 날짜 자동 설정
        if (updateData.status === "shipped" && !order.shippingDate) {
          updatedOrder.shippingDate = new Date().toISOString().split("T")[0];
        }
        if (updateData.status === "delivered" && !order.deliveryDate) {
          updatedOrder.deliveryDate = new Date().toISOString().split("T")[0];
        }

        return updatedOrder;
      }
      return order;
    });

    setShippingOrders(updatedOrders);
    setIsUpdateDialogOpen(false);
    setSelectedOrder(null);
    setUpdateData({ status: "", courier: "", trackingNumber: "", notes: "" });
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            주문접수
          </Badge>
        );
      case "preparing":
        return (
          <Badge variant="default" className="bg-blue-100 text-blue-800">
            배송준비
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="default" className="bg-orange-100 text-orange-800">
            배송중
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            배송완료
          </Badge>
        );
      case "cancelled":
        return <Badge variant="destructive">취소</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  // 통계 계산
  const stats = getShippingStats(shippingOrders);

  // 다이얼로그 열기 시 데이터 초기화
  const openUpdateDialog = (order: ShippingOrder) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      courier: order.courier,
      trackingNumber: order.trackingNumber || "",
      notes: order.notes || "",
    });
    setIsUpdateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">배송 관리</h1>
        <p className="text-gray-600">주문별 배송 현황을 확인하고 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 주문</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">주문접수</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송준비</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.preparing}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송중</CardTitle>
            <Truck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.shipped}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">배송완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.delivered}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 배송 현황 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>배송 현황</CardTitle>
          <CardDescription>
            주문별 배송 현황을 확인하고 업데이트하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="주문번호, 고객명, 운송장번호로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                {shippingStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>주문정보</TableHead>
                  <TableHead>고객정보</TableHead>
                  <TableHead>상품정보</TableHead>
                  <TableHead className="text-right">주문금액</TableHead>
                  <TableHead>배송정보</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">
                          주문일: {order.orderDate}
                        </div>
                        {order.shippingDate && (
                          <div className="text-sm text-gray-500">
                            발송일: {order.shippingDate}
                          </div>
                        )}
                        {order.deliveryDate && (
                          <div className="text-sm text-gray-500">
                            도착일: {order.deliveryDate}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {order.customerPhone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-start">
                          <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="break-all">
                            {order.shippingAddress}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.products.map((product, index) => (
                          <div key={index} className="text-sm">
                            {product.name} x {product.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ₩{order.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          {order.courier}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-sm text-gray-500">
                            운송장: {order.trackingNumber}
                          </div>
                        )}
                        {order.notes && (
                          <div className="text-sm text-gray-500">
                            메모: {order.notes}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateDialog(order)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        수정
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>조건에 맞는 주문이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 배송 정보 수정 다이얼로그 */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>배송 정보 수정</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} 주문의 배송 정보를 수정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>배송 상태</Label>
              <Select
                value={updateData.status}
                onValueChange={(value) =>
                  setUpdateData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="배송 상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  {shippingStatusOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>택배사</Label>
              <Select
                value={updateData.courier}
                onValueChange={(value) =>
                  setUpdateData((prev) => ({ ...prev, courier: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="택배사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {courierOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>운송장 번호</Label>
              <Input
                value={updateData.trackingNumber}
                onChange={(e) =>
                  setUpdateData((prev) => ({
                    ...prev,
                    trackingNumber: e.target.value,
                  }))
                }
                placeholder="운송장 번호를 입력하세요"
              />
            </div>

            <div className="space-y-2">
              <Label>메모</Label>
              <Textarea
                value={updateData.notes}
                onChange={(e) =>
                  setUpdateData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="배송 관련 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleShippingUpdate}
              disabled={!updateData.status || !updateData.courier}
            >
              수정 완료
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
