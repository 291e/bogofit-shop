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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Search,
} from "lucide-react";
import {
  InventoryProduct,
  StockAdjustment,
  mockInventoryData,
} from "@/contents/Business/inventoryData";

export default function InventoryPage() {
  const [inventoryData, setInventoryData] =
    useState<InventoryProduct[]>(mockInventoryData);
  const [filteredData, setFilteredData] =
    useState<InventoryProduct[]>(mockInventoryData);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);
  const [adjustmentData, setAdjustmentData] = useState<StockAdjustment>({
    productId: 0,
    type: "increase",
    quantity: 0,
    reason: "",
  });
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  // 필터링 로직
  useEffect(() => {
    let filtered = inventoryData;

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // 카테고리 필터
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredData(filtered);
  }, [inventoryData, searchTerm, statusFilter, categoryFilter]);

  // 재고 조정 핸들러
  const handleStockAdjustment = () => {
    if (!selectedProduct || adjustmentData.quantity <= 0) return;

    const updatedData = inventoryData.map((item) => {
      if (item.id === selectedProduct.id) {
        const newStock =
          adjustmentData.type === "increase"
            ? item.currentStock + adjustmentData.quantity
            : Math.max(0, item.currentStock - adjustmentData.quantity);

        let newStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
        if (newStock === 0) newStatus = "out_of_stock";
        else if (newStock <= item.minStock) newStatus = "low_stock";

        return {
          ...item,
          currentStock: newStock,
          stockValue: newStock * item.unitPrice,
          status: newStatus,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }
      return item;
    });

    setInventoryData(updatedData);
    setIsAdjustmentDialogOpen(false);
    setAdjustmentData({
      productId: 0,
      type: "increase",
      quantity: 0,
      reason: "",
    });
    setSelectedProduct(null);
  };

  // 상태별 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_stock":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            재고 충분
          </Badge>
        );
      case "low_stock":
        return (
          <Badge
            variant="destructive"
            className="bg-yellow-100 text-yellow-800"
          >
            재고 부족
          </Badge>
        );
      case "out_of_stock":
        return <Badge variant="destructive">품절</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  // 통계 계산
  const totalProducts = inventoryData.length;
  const lowStockCount = inventoryData.filter(
    (item) => item.status === "low_stock"
  ).length;
  const outOfStockCount = inventoryData.filter(
    (item) => item.status === "out_of_stock"
  ).length;
  const totalStockValue = inventoryData.reduce(
    (sum, item) => sum + item.stockValue,
    0
  );

  const categories = [
    "all",
    ...Array.from(new Set(inventoryData.map((item) => item.category))),
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">재고 관리</h1>
        <p className="text-gray-600">상품별 재고 현황을 확인하고 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 상품 수</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">관리 중인 상품</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">재고 부족</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">최소 재고 이하</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">품절 상품</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockCount}
            </div>
            <p className="text-xs text-muted-foreground">재고 0개 상품</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 재고 가치</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₩{totalStockValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">전체 재고 가치</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>재고 현황</CardTitle>
          <CardDescription>
            상품별 재고 현황을 확인하고 조정하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="상품명 또는 SKU로 검색..."
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
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="in_stock">재고 충분</SelectItem>
                <SelectItem value="low_stock">재고 부족</SelectItem>
                <SelectItem value="out_of_stock">품절</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "모든 카테고리" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 재고 테이블 */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>상품정보</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead className="text-right">현재재고</TableHead>
                  <TableHead className="text-right">최소재고</TableHead>
                  <TableHead className="text-right">단가</TableHead>
                  <TableHead className="text-right">재고가치</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>최근업데이트</TableHead>
                  <TableHead>관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.title}
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      {product.currentStock}개
                    </TableCell>
                    <TableCell className="text-right">
                      {product.minStock}개
                    </TableCell>
                    <TableCell className="text-right">
                      ₩{product.unitPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ₩{product.stockValue.toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell>{product.lastUpdated}</TableCell>
                    <TableCell>
                      <Dialog
                        open={
                          isAdjustmentDialogOpen &&
                          selectedProduct?.id === product.id
                        }
                        onOpenChange={(open) => {
                          setIsAdjustmentDialogOpen(open);
                          if (!open) {
                            setSelectedProduct(null);
                            setAdjustmentData({
                              productId: 0,
                              type: "increase",
                              quantity: 0,
                              reason: "",
                            });
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(product);
                              setAdjustmentData((prev) => ({
                                ...prev,
                                productId: product.id,
                              }));
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            조정
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>재고 조정</DialogTitle>
                            <DialogDescription>
                              {product.title}의 재고를 조정합니다. (현재:{" "}
                              {product.currentStock}개)
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>조정 유형</Label>
                              <Select
                                value={adjustmentData.type}
                                onValueChange={(
                                  value: "increase" | "decrease"
                                ) =>
                                  setAdjustmentData((prev) => ({
                                    ...prev,
                                    type: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="increase">
                                    입고 (+)
                                  </SelectItem>
                                  <SelectItem value="decrease">
                                    출고 (-)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>수량</Label>
                              <Input
                                type="number"
                                min="1"
                                value={adjustmentData.quantity}
                                onChange={(e) =>
                                  setAdjustmentData((prev) => ({
                                    ...prev,
                                    quantity: parseInt(e.target.value) || 0,
                                  }))
                                }
                                placeholder="조정할 수량을 입력하세요"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>사유</Label>
                              <Input
                                value={adjustmentData.reason}
                                onChange={(e) =>
                                  setAdjustmentData((prev) => ({
                                    ...prev,
                                    reason: e.target.value,
                                  }))
                                }
                                placeholder="재고 조정 사유를 입력하세요"
                              />
                            </div>

                            {adjustmentData.quantity > 0 && (
                              <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                  <strong>조정 후 재고:</strong>{" "}
                                  {adjustmentData.type === "increase"
                                    ? product.currentStock +
                                      adjustmentData.quantity
                                    : Math.max(
                                        0,
                                        product.currentStock -
                                          adjustmentData.quantity
                                      )}
                                  개
                                </p>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAdjustmentDialogOpen(false)}
                            >
                              취소
                            </Button>
                            <Button
                              onClick={handleStockAdjustment}
                              disabled={
                                adjustmentData.quantity <= 0 ||
                                !adjustmentData.reason.trim()
                              }
                            >
                              재고 조정
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>조건에 맞는 상품이 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
