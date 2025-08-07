"use client";

import { useState } from "react";
import { useBusinessProducts } from "@/hooks/useBusiness";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ProductStatus } from "@/types/business";
import ProductDetailModal from "@/components/business/ProductDetailModal";

export default function BusinessProductsPage() {
  const {
    products,
    loading,
    deleteProduct,
    refetch: refreshProducts,
  } = useBusinessProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">(
    "ALL"
  );
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  // 필터링된 상품 목록
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || product.status === statusFilter;
    const matchesCategory =
      categoryFilter === "ALL" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // 카테고리 목록 추출
  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error("상품 삭제 실패:", error);
    }
  };

  const handleStatusChange = async (
    productId: string,
    newStatus: ProductStatus
  ) => {
    setStatusUpdating(productId);
    try {
      const response = await fetch(
        `/api/business/products/${productId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "상태 변경에 실패했습니다.");
      }

      const result = await response.json();
      console.log("상태 변경 성공:", result.message);

      // 상품 목록 새로고침
      await refreshProducts();
    } catch (error) {
      console.error("상품 상태 변경 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "상태 변경 중 오류가 발생했습니다."
      );
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductId(null);
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig = {
      APPROVED: { label: "상품 활성화", variant: "default" as const },
      INACTIVE: { label: "상품 비활성화", variant: "outline" as const },
      // 기존 상태들은 호환성을 위해 유지하되 사용하지 않음
      DRAFT: { label: "임시저장", variant: "secondary" as const },
      PENDING: { label: "승인대기", variant: "default" as const },
      REJECTED: { label: "승인거부", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="text-gray-600">
            등록된 상품을 관리하고 새로운 상품을 추가하세요
          </p>
        </div>
        <Button asChild>
          <Link href="/business/products/new">
            <Plus className="h-4 w-4 mr-2" />
            상품 등록
          </Link>
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">전체 상품</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">활성화 상품</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.status === "APPROVED").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <div>
                <p className="text-sm font-medium">비활성화 상품</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.status === "INACTIVE").length}
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
                  placeholder="상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ProductStatus | "ALL")
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 상태</SelectItem>
                <SelectItem value="APPROVED">상품 활성화</SelectItem>
                <SelectItem value="INACTIVE">상품 비활성화</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 상품 목록 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>상품 목록 ({filteredProducts.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>상품정보</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>가격</TableHead>
                <TableHead>재고</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : product.thumbnailImages &&
                          product.thumbnailImages.length > 0 ? (
                          <img
                            src={product.thumbnailImages[0]}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-gray-500">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{product.category}</p>
                        {product.subcategory && (
                          <p className="text-sm text-gray-500">
                            {product.subcategory}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          ₩{product.price.toLocaleString()}
                        </p>
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <p className="text-sm text-gray-500 line-through">
                              ₩{product.originalPrice.toLocaleString()}
                            </p>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`font-medium ${
                          product.stockQuantity <= 5
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(product.status)}
                        <Select
                          value={product.status}
                          onValueChange={(newStatus) =>
                            handleStatusChange(
                              product.id,
                              newStatus as ProductStatus
                            )
                          }
                          disabled={statusUpdating === product.id}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <RefreshCw
                              className={`h-3 w-3 ${
                                statusUpdating === product.id
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APPROVED">
                              상품 활성화
                            </SelectItem>
                            <SelectItem value="INACTIVE">
                              상품 비활성화
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(product.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewDetail(product.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            상세보기
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/business/products/${product.id}/edit`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </Link>
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>상품 삭제</AlertDialogTitle>
                                <AlertDialogDescription>
                                  정말로 이 상품을 삭제하시겠습니까? 이 작업은
                                  되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">등록된 상품이 없습니다.</p>
                      <Button asChild>
                        <Link href="/business/products/new">
                          <Plus className="h-4 w-4 mr-2" />첫 상품 등록하기
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상품 상세정보 모달 */}
      {selectedProductId && (
        <ProductDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          productId={selectedProductId}
        />
      )}
    </div>
  );
}
