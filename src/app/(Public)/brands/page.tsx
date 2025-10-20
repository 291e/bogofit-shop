"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Store, Mail, Phone, Search, X } from "lucide-react";
import { usePublicBrands } from "@/hooks/useBrands";
import { BrandResponseDto } from "@/types/brand";
import Link from "next/link";
import Image from "next/image";

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch brands
  const { data: brandsData, isLoading, error } = usePublicBrands();
  const brands = brandsData?.brands || [];

  // Filter brands by search
  const filteredBrands = brands.filter((brand: BrandResponseDto) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Set page title
  useEffect(() => {
    document.title = "브랜드 - BOGOFIT";
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Store className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">브랜드</h1>
          </div>
          <p className="text-gray-600 mb-6">다양한 브랜드의 상품을 만나보세요</p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="브랜드명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container mx-auto px-4 py-8">
        {/* Brands Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            총 <span className="font-semibold">{filteredBrands.length}</span>개의 브랜드
          </p>
        </div>

        {error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">브랜드를 불러올 수 없습니다</h3>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">브랜드를 불러오는 중...</span>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">브랜드가 없습니다</h3>
            <p className="text-gray-600">다른 검색어를 시도해보세요.</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredBrands.map((brand: BrandResponseDto) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Brand Cover/Logo */}
                <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                  {brand.coverUrl ? (
                    <Image
                      src={brand.coverUrl}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      width={500}
                      height={500}
                    />
                  ) : brand.logoUrl ? (
                    <div className="w-full h-full flex items-center justify-center p-8">
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain"
                        width={500}
                        height={500}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  {brand.status && (
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        brand.status === 'approved' 
                          ? 'bg-green-100 text-green-700'
                          : brand.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : brand.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                      </span>
                    </div>
                  )}
                </div>

                {/* Brand Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {brand.name}
                  </h3>
                  
                  {brand.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {brand.description}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-1">
                    {brand.contactEmail && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{brand.contactEmail}</span>
                      </div>
                    )}
                    {brand.contactPhone && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>{brand.contactPhone}</span>
                      </div>
                    )}
                  </div>

                 </div>
              </Link> 
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

