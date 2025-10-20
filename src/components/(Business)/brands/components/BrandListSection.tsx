"use client";

import { Building2 } from "lucide-react";
import { BrandResponseDto } from "@/types/brand";
import BrandCard from "./BrandCard";

interface BrandListSectionProps {
  brands: BrandResponseDto[];
  onViewBrand?: (brand: BrandResponseDto) => void;
}

export default function BrandListSection({ brands, onViewBrand }: BrandListSectionProps) {
  if (brands.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">아직 등록된 브랜드가 없습니다</h3>
        <p className="text-gray-600">새로운 브랜드가 등록되면 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {brands.map((brand) => (
        <BrandCard 
          key={brand.id} 
          brand={brand} 
          onViewBrand={onViewBrand}
        />
      ))}
    </div>
  );
}
