"use client";

import { useState } from "react";
import { ProductResponseDto } from "@/types/product";
import { usePublicProducts } from "@/hooks/useProducts";
import { Cafe24ProductCard } from "@/components/(Public)/mainPage/sections/Cafe24ProductCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SalePageClient() {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("discount-desc");


    const { data, isLoading, error } = usePublicProducts({
        isActive: true,
        promotion: true,
        pageSize: 60,
    });

    const allProducts = data?.data?.data || data?.products || [];

    // Helper functions
    const calculateDiscountPercent = (basePrice: number, promotion?: { type: string; value?: number }) => {
        if (!promotion || promotion.value === undefined) return 0;

        if (promotion.type === "percentage") {
            return promotion.value || 0;
        } else if (promotion.type === "fixed_amount") {
            return Math.round((promotion.value / basePrice) * 100);
        }
        return 0;
    };

    const getFinalPrice = (product: ProductResponseDto) => {
        if (!product.promotion) return product.basePrice;

        if (product.promotion.type === "percentage") {
            return Math.round(product.basePrice * (1 - (product.promotion.value || 0) / 100));
        } else if (product.promotion.type === "fixed_amount") {
            return Math.max(0, product.basePrice - (product.promotion.value || 0));
        }
        return product.basePrice;
    };

    // Filter and sort products
    const filteredProducts = allProducts
        .filter(product => !!product.promotion) // Only products with active promotion
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "discount-desc":
                    const discountA = a.promotion ? calculateDiscountPercent(a.basePrice, a.promotion) : 0;
                    const discountB = b.promotion ? calculateDiscountPercent(b.basePrice, b.promotion) : 0;
                    return discountB - discountA;
                case "discount-asc":
                    const discountA2 = a.promotion ? calculateDiscountPercent(a.basePrice, a.promotion) : 0;
                    const discountB2 = b.promotion ? calculateDiscountPercent(b.basePrice, b.promotion) : 0;
                    return discountA2 - discountB2;
                case "price-desc":
                    return b.basePrice - a.basePrice;
                case "price-asc":
                    return a.basePrice - b.basePrice;
                case "name":
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    <p>상품을 불러오는 중 오류가 발생했습니다: {error instanceof Error ? error.message : String(error)}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        필터
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[220px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="상품명 또는 브랜드 검색..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium">정렬:</label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="discount-desc">할인율 높은 순</SelectItem>
                                    <SelectItem value="discount-asc">할인율 낮은 순</SelectItem>
                                    <SelectItem value="price-desc">가격 높은 순</SelectItem>
                                    <SelectItem value="price-asc">가격 낮은 순</SelectItem>
                                    <SelectItem value="name">상품명 A-Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">상품을 찾을 수 없습니다</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredProducts.map((product) => {
                        const finalPrice = getFinalPrice(product);
                        const discountPercent = calculateDiscountPercent(product.basePrice, product.promotion);

                        const productCard = {
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price: finalPrice,
                            originalPrice: product.basePrice,
                            discount: discountPercent,
                            image: product.images?.[0] || "/images/placeholder-product.png",
                            brand: product.brand?.name || undefined,
                            brandSlug: product.brand?.slug,
                            rating: undefined,
                            reviews: undefined,
                        };

                        return (
                            <div key={product.id} className="relative group">
                                <Cafe24ProductCard product={productCard} />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
