"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ProductFilters as IProductFilters, Product } from "@/types/product";
import { useI18n } from "@/providers/I18nProvider";

interface ProductFiltersProps {
  filters: IProductFilters;
  onFiltersChange: (filters: IProductFilters) => void;
  products?: Product[];
}

export default function ProductFilters({
  filters,
  onFiltersChange,
}: ProductFiltersProps) {
  const { t } = useI18n();
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

  // 품절 상품 개수 계산 (badge가 "품절"이거나 isSoldOut이 true인 경우)

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* 검색바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder={t("product.filters.searchPlaceholder")}
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
            <SelectValue placeholder={t("product.filters.sort.label")}/>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("product.filters.sort.newest")}</SelectItem>
            <SelectItem value="price_low">{t("product.filters.sort.priceLow")}</SelectItem>
            <SelectItem value="price_high">{t("product.filters.sort.priceHigh")}</SelectItem>
            <SelectItem value="name">{t("product.filters.sort.name")}</SelectItem>
            <SelectItem value="rating">{t("product.filters.sort.rating")}</SelectItem>
          </SelectContent>
        </Select>

        {/* 품절 상품 표시 토글 */}
      </div>

      {/* 활성 필터 표시 */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.showSoldOut && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("product.filters.showSoldOut")}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => handleFilterChange("showSoldOut", false)}
              />
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== "newest" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {t("product.filters.sort.activePrefix")} {" "}
              {filters.sortBy === "price_low"
                ? t("product.filters.sort.priceLow")
                : filters.sortBy === "price_high"
                ? t("product.filters.sort.priceHigh")
                : filters.sortBy === "name"
                ? t("product.filters.sort.name")
                : filters.sortBy === "rating"
                ? t("product.filters.sort.rating")
                : t("product.filters.sort.newest")}
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
