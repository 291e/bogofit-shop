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
import { Search, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: number;
  title: string;
  price: number;
  status: string;
  createdAt: string;
  brand?: {
    id: number;
    name: string;
    status: string;
  };
  _count: {
    reviews: number;
    orderItems: number;
  };
}

export default function AdminProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 20;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      console.log("[AdminProductManagement] 상품 목록 조회 시작");
      const params = new URLSearchParams({
        search: productSearch,
        status: productFilter,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/admin/products?${params}`, {
        credentials: "include",
      });

      console.log(
        "[AdminProductManagement] API 응답:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("[AdminProductManagement] API 오류:", errorData);
        throw new Error(`상품 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log("[AdminProductManagement] 받은 데이터:", data);
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalProducts(data.pagination?.total || 0);
    } catch (error) {
      console.error("상품 목록 조회 오류:", error);
      toast.error("상품 목록을 불러오는데 실패했습니다");
    } finally {
      setLoading(false);
    }
  }, [productSearch, productFilter, currentPage, itemsPerPage]);

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "상품 삭제 실패");
      }

      toast.success("상품이 성공적으로 삭제되었습니다");
      fetchProducts();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "상품 삭제에 실패했습니다";
      console.error("상품 삭제 오류:", error);
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "대기", variant: "secondary" as const },
      APPROVED: { label: "승인", variant: "default" as const },
      REJECTED: { label: "거부", variant: "destructive" as const },
      DRAFT: { label: "임시", variant: "outline" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">상품 관리</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="상품 검색..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            <SelectItem value="PENDING">대기</SelectItem>
            <SelectItem value="APPROVED">승인</SelectItem>
            <SelectItem value="REJECTED">거부</SelectItem>
            <SelectItem value="DRAFT">임시</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>상품명</TableHead>
              <TableHead>브랜드</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>리뷰 수</TableHead>
              <TableHead>주문 수</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead>액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.brand?.name || "브랜드 없음"}</TableCell>
                <TableCell>₩{product.price.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(product.status)}</TableCell>
                <TableCell>{product._count.reviews}</TableCell>
                <TableCell>{product._count.orderItems}</TableCell>
                <TableCell>
                  {new Date(product.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(`/products/${product.id}`, "_blank")
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              전체 {totalProducts}개 중{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalProducts)}-
              {Math.min(currentPage * itemsPerPage, totalProducts)}개 표시
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              >
                이전
              </Button>

              {/* 페이지 번호 */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
