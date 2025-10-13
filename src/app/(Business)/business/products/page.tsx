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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
import Image from "next/image";

export default function BusinessProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL"
  );
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  const {
    products,
    loading,
    pagination,
    stats,
    deleteProduct,
    refetch: refreshProducts,
    goToPage,
  } = useBusinessProducts(currentPage, 10, searchTerm, statusFilter, categoryFilter);

  // Server-side filtering is now handled by the API
  const filteredProducts = products;

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

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
    } catch (error) {
      console.error("상품 삭제 실패:", error);
    }
  };

  const handleActiveChange = async (
    productId: string,
    isActive: boolean
  ) => {
    setStatusUpdating(productId);
    try {
      const response = await fetch(
        `/api/business/products/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ isActive }),
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
      APPROVED: { label: "승인완료", variant: "default" as const },
      DRAFT: { label: "임시저장", variant: "secondary" as const },
      PENDING: { label: "승인대기", variant: "default" as const },
      REJECTED: { label: "승인거부", variant: "destructive" as const },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-500">활성화</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-500">비활성화</Badge>
    );
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
                <p className="text-2xl font-bold">{pagination.total}</p>
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
                <p className="text-2xl font-bold">{stats.active}</p>
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
                <p className="text-2xl font-bold">{stats.inactive}</p>
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
                setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE");
                handleFilterChange();
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">모든 상태</SelectItem>
                <SelectItem value="ACTIVE">상품 활성화</SelectItem>
                <SelectItem value="INACTIVE">상품 비활성화</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={categoryFilter} 
              onValueChange={(value) => {
                setCategoryFilter(value);
                handleFilterChange();
              }}
            >
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
          <CardTitle>
            상품 목록 ({pagination.total}개 중 {filteredProducts.length}개 표시)
          </CardTitle>
          <div className="text-sm text-gray-600">
            페이지 {pagination.page} / {pagination.totalPages} 
            ({pagination.limit}개씩 표시)
          </div>
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
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : product.thumbnailImages &&
                          product.thumbnailImages.length > 0 ? (
                          <Image
                            src={product.thumbnailImages[0]}
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
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">승인:</span>
                          {getStatusBadge(product.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">활성:</span>
                          {getActiveBadge(product.isActive)}
                          <Select
                            value={product.isActive ? "active" : "inactive"}
                            onValueChange={(newValue) =>
                              handleActiveChange(
                                product.id,
                                newValue === "active"
                              )
                            }
                            disabled={statusUpdating === product.id}
                          >
                            <SelectTrigger className="w-24 h-7">
                              <RefreshCw
                                className={`h-3 w-3 ${
                                  statusUpdating === product.id
                                    ? "animate-spin"
                                    : ""
                                }`}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">
                                활성화
                              </SelectItem>
                              <SelectItem value="inactive">
                                비활성화
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
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
                        if (pagination.hasPrev) {
                          handlePageChange(currentPage - 1);
                        }
                      }}
                      className={!pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                          className="cursor-pointer"
                          size="icon"
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
                        if (pagination.hasNext) {
                          handlePageChange(currentPage + 1);
                        } 
                      }}
                      className={!pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
