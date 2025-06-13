"use client";

import { useState, useEffect } from "react";
import { Search, X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductFilters as IProductFilters } from "@/types/product";

interface ProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
}

export default function ProductFilters({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const [localFilters, setLocalFilters] = useState<IProductFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleSearchChange = (value: string) => {
    const newFilters = { ...localFilters, search: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFilterChange = (
    key: keyof IProductFilters,
    value: string | number | boolean | undefined
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // const clearFilters = () => {
  //   const clearedFilters: IProductFilters = {
  //     search: localFilters.search,
  //     sortBy: "newest",
  //     showSoldOut: false,
  //   };
  //   setLocalFilters(clearedFilters);
  //   onFiltersChange(clearedFilters);
  // };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.showSoldOut) count++;
    if (filters.sortBy && filters.sortBy !== "newest") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* 검색바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="상품명, 브랜드명으로 검색..."
          value={localFilters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 필터 및 정렬 */}
      <div className="flex items-center justify-between gap-4">
        {/* 정렬 */}
        <Select
          value={localFilters.sortBy || "newest"}
          onValueChange={(value) => handleFilterChange("sortBy", value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">최신순</SelectItem>
            <SelectItem value="price_low">가격 낮은순</SelectItem>
            <SelectItem value="price_high">가격 높은순</SelectItem>
            <SelectItem value="name">이름순</SelectItem>
            <SelectItem value="rating">평점순</SelectItem>
          </SelectContent>
        </Select>

        {/* 품절 상품 표시 토글 */}
        <Button
          variant={localFilters.showSoldOut ? "default" : "outline"}
          onClick={() =>
            handleFilterChange("showSoldOut", !localFilters.showSoldOut)
          }
          className="flex items-center gap-2"
        >
          {localFilters.showSoldOut ? (
            <>
              <Eye className="w-4 h-4" />
              품절 상품 표시
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              품절 상품 숨김
            </>
          )}
        </Button>
      </div>

      {/* 활성 필터 표시 */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.showSoldOut && (
            <Badge variant="secondary" className="flex items-center gap-1">
              품절 상품 표시
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange("showSoldOut", false)}
              />
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== "newest" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              정렬:{" "}
              {filters.sortBy === "price_low"
                ? "가격 낮은순"
                : filters.sortBy === "price_high"
                ? "가격 높은순"
                : filters.sortBy === "name"
                ? "이름순"
                : filters.sortBy === "rating"
                ? "평점순"
                : "최신순"}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange("sortBy", "newest")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
