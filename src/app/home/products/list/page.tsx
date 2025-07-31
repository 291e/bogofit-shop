"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Product, ProductFilters } from "@/types/product";
import { SearchBar } from "@/components/ui/search-bar";
import { Button } from "@/components/ui/button";
import { Pencil, Eye, Trash2, EyeOff, Eye as EyeIcon, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/components/ui/format";
import { useProducts } from "@/hooks/useProducts";

// Hàm format ngày tháng
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

export default function ProductListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [updateTimeFilter, setUpdateTimeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const pageSize = 10;

  // Sử dụng hook để lấy dữ liệu từ API
  const { 
    products, 
    loading, 
    error, 
    pagination, 
    total,
    fetchProducts,
    deleteProduct: deleteProductFromAPI 
  } = useProducts();

  // Tạo filters object
  const filters: ProductFilters = {
    search: search || undefined,
    category: categoryFilter || undefined,
    sortBy: "newest"
  };

  // Fetch products khi filters thay đổi
  useEffect(() => {
    fetchProducts(filters);
  }, [page, search, categoryFilter, fetchProducts]);

  // Lấy categories từ products
  const categories = Array.from(new Set(products.map((p: Product) => p.category)));

  // Filter products locally cho status và update time
  let filtered = products.filter((product: Product) => {
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && !product.isSoldOut) ||
      (statusFilter === "hidden" && product.isSoldOut);
    
    // Lọc theo thời gian cập nhật
    const now = new Date();
    const productUpdatedDate = new Date(product.updatedAt);
    let matchesUpdateTime = true;
    
    if (updateTimeFilter) {
      switch (updateTimeFilter) {
        case "today":
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          matchesUpdateTime = productUpdatedDate >= today;
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesUpdateTime = productUpdatedDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesUpdateTime = productUpdatedDate >= monthAgo;
          break;
        case "quarter":
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          matchesUpdateTime = productUpdatedDate >= quarterAgo;
          break;
        case "year":
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          matchesUpdateTime = productUpdatedDate >= yearAgo;
          break;
      }
    }
    
    return matchesStatus && matchesUpdateTime;
  });

  const totalPages = Math.ceil(total / pageSize);

  const toggleStatus = (id: string) => {
    alert("기능 켜기/끄기는 데모 전용입니다!");
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await deleteProductFromAPI(id);
        alert("상품이 삭제되었습니다!");
      } catch (error) {
        alert("삭제 중 오류가 발생했습니다!");
      }
    }
  };

  const toggleProductSelection = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedProducts(filtered.map(p => p.id.toString()));
  };

  const clearSelection = () => {
    setSelectedProducts([]);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-lg font-medium text-gray-600">상품 목록을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium mb-2">오류가 발생했습니다</div>
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={() => fetchProducts(filters)} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b">
        <div className="px-2 py-2 w-max-width">
          <h1 className="text-2xl font-bold text-gray-900">상품 목록</h1>
        </div>
        <Link href="/home/products/new">
          <Button variant="outline" className="text-white px-6 py-3 ">
            ➕ 새 상품 추가
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">🔍 검색</label>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="이름 또는 상품 코드 검색..."
            className="w-full"
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap gap-4 items-end">
          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">📊 상태</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">모든 상품 상태</option>
              <option value="active">표시</option>
              <option value="hidden">숨김/판매 중단</option>
            </select>
          </div>
          
          {/* Category Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">📂 카테고리</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">모든 카테고리</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          
          {/* Update Time Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">🕒 업데이트 시간</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={updateTimeFilter}
              onChange={(e) => setUpdateTimeFilter(e.target.value)}
            >
              <option value="">모든 업데이트 시간</option>
              <option value="today">오늘 업데이트</option>
              <option value="week">지난 7일 업데이트</option>
              <option value="month">지난 30일 업데이트</option>
              <option value="quarter">지난 3개월 업데이트</option>
              <option value="year">지난 1년 업데이트</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-blue-900">
                선택된 상품 {selectedProducts.length}개
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                모두 선택 취소
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-orange-600 border-orange-300 hover:bg-orange-50">
                  🚫 상품 숨기기
              </Button>
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                ✅ 상품 표시
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                🗑️ 상품 삭제
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">상품 목록</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>총: {total} 상품</span>
              {selectedProducts.length > 0 && (
                <span className="text-blue-600">• 선택됨: {selectedProducts.length}</span>
              )}
            </div>
          </div>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filtered.length && filtered.length > 0}
                  onChange={selectedProducts.length === filtered.length ? clearSelection : selectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="p-4 text-left font-semibold text-gray-900">이미지 & 이름</th>
              <th className="p-4 text-left font-semibold text-gray-900">카테고리</th>
              <th className="p-4 text-left font-semibold text-gray-900">가격</th>
              <th className="p-4 text-left font-semibold text-gray-900">재고</th>
              <th className="p-4 text-left font-semibold text-gray-900">상태</th>
              <th className="p-4 text-left font-semibold text-gray-900">업데이트 날짜</th>
              <th className="p-4 text-left font-semibold text-gray-900">작업</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl">📦</div>
                    <div className="text-lg font-medium">일치하는 상품이 없습니다</div>
                    <div className="text-sm">필터를 변경하거나 검색어를 시도해보세요</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id.toString())}
                      onChange={() => toggleProductSelection(product.id.toString())}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-16 h-16 object-cover rounded-lg border shadow-sm"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">
                          {product.title}
                        </div>
                        <div className="text-sm text-gray-500">Mã: {product.id}</div>
                        <div className="text-xs text-gray-400 mt-1">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-lg">
                        {formatCurrency(product.price)}
                      </span>
                      {/* Nếu muốn hiển thị giá gốc, hãy bổ sung trường originalPrice vào Product */}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      {/* Nếu muốn hiển thị tồn kho, hãy bổ sung trường stock vào Product */}
                      <span className="font-semibold text-lg text-gray-900">
                        {product.isSoldOut ? 0 : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(product.id.toString())}
                      className={!product.isSoldOut ? "bg-white text-green-700 hover:bg-green-50" : "bg-white text-red-700 hover:bg-red-50"}
                    >
                      {!product.isSoldOut ? "✅ 표시" : "❌ 판매 중단"}
                    </Button>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {formatDate(new Date(product.updatedAt))}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/home/products/${product.id}/edit`}>
                        <Button size="sm" variant="ghost" title="수정" className="hover:bg-blue-50">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                      <Link href={`/home/products/${product.id}`}>
                        <Button size="sm" variant="ghost" title="상세 보기" className="hover:bg-green-50">
                          <EyeIcon className="h-4 w-4 text-green-600" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        title={!product.isSoldOut ? "Ẩn" : "Hiện"}
                        onClick={() => toggleStatus(product.id.toString())}
                        className="hover:bg-orange-50"
                      >
                        {!product.isSoldOut ? <EyeOff className="h-4 w-4 text-orange-600" /> : <EyeIcon className="h-4 w-4 text-orange-600" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="삭제"
                        onClick={() => deleteProduct(product.id.toString())}
                        className="hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-4 py-2 text-white"
              >
                ← 이전
              </Button>
              <div className="flex items-center gap-1 ">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <Button
                    key={pageNum}
                    size="sm"
                    variant={page === pageNum ? "default" : "outline"}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 ${page === pageNum ? "text-white bg-gray-700 hover:bg-gray-600" : "text-white bg-gray-500 hover:bg-gray-600"}`}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 text-white"
              >
                다음 →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
