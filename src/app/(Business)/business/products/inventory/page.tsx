"use client";

import { useState } from "react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InventoryProduct } from "@/contents/Business/inventoryData";
import { useBusinessInventory } from "@/hooks/useBusiness";
import Image from "next/image";

export default function InventoryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [adjustmentData, setAdjustmentData] = useState({
    productId: 0,
    type: "increase" as "increase" | "decrease",
    quantity: 0,
    reason: "",
  });
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);

  const {
    products,
    loading,
    pagination,
    stats,
    adjustStock,
    goToPage,
  } = useBusinessInventory(currentPage, 10);

  // 필터링된 상품 목록 (현재 페이지의 상품들만 필터링)
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    goToPage(newPage);
  };

  // 필터 변경 시 첫 페이지로 리셋
  const handleFilterChange = () => {
    setCurrentPage(1);
    goToPage(1);
  };

  // 재고 조정 핸들러
  const handleStockAdjustment = async () => {
    if (!selectedProduct || adjustmentData.quantity <= 0) return;

    try {
      await adjustStock(
        selectedProduct.productId,
        selectedProduct.variantId,
        adjustmentData.type,
        adjustmentData.quantity,
        adjustmentData.reason
      );

      setIsAdjustmentDialogOpen(false);
      setAdjustmentData({
        productId: 0,
        type: "increase",
        quantity: 0,
        reason: "",
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error("재고 조정 실패:", error);
    }
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
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
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
              {stats.lowStockCount}
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
              {stats.outOfStockCount}
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
              ₩{stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">전체 재고 가치</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>
            재고 현황 ({pagination.total}개 중 {filteredProducts.length}개 표시)
          </CardTitle>
          <CardDescription>
            상품별 재고 현황을 확인하고 조정하세요
          </CardDescription>
          <div className="text-sm text-gray-600">
            페이지 {pagination.page} / {pagination.totalPages} 
            ({pagination.limit}개씩 표시)
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="상품명 또는 SKU로 검색..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <Select 
              value={statusFilter} 
              onValueChange={(value) => {
                setStatusFilter(value);
                handleFilterChange();
              }}
            >
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

            <Select 
              value={categoryFilter} 
              onValueChange={(value) => {
                setCategoryFilter(value);
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                  <TableHead>옵션</TableHead>
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
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-gray-500">ID: {product.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {product.variantName}
                      </span>
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
                                productId: product.id as unknown as number,
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
                              {product.title} - {product.variantName}의 재고를 조정합니다. (현재:{" "}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page > 1) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={!(pagination.page > 1) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={currentPage === pageNum}
                          size="sm"
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (pagination.page < pagination.totalPages) {
                          handlePageChange(currentPage + 1);
                        }
                      }}
                      className={!(pagination.page < pagination.totalPages) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {filteredProducts.length === 0 && (
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
