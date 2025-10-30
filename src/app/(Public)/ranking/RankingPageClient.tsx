"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePublicProducts } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/useCategories';
import { Cafe24ProductCard } from '@/components/(Public)/mainPage/sections/Cafe24ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CategoryDropdown from '@/components/ui/category-dropdown';
import { ProductResponseDto } from '@/types/product';

export function RankingPageClient() {
    const [currentPage, setCurrentPage] = useState(1);
    // Rating dropdown options (thresholds): 'none' | '1' | '2' | '3' | '4' | '5'
    const [ratingFilter, setRatingFilter] = useState<string>('4');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const { data, isLoading, error } = usePublicProducts({
        pageNumber: currentPage,

        reviews: true, // Include review stats
        isActive: true, // Chỉ lấy sản phẩm active

    });

    const allProducts = data?.data?.data || data?.products || [];
    const pagination = data?.data;


    // Filter và sort products dựa trên reviewStats
    React.useEffect(() => {
        if (allProducts && allProducts.length) {
            console.log("[Ranking] reviewStats sample:", allProducts.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                averageRating: p.reviewStats?.averageRating,
                totalReviews: p.reviewStats?.totalReviews
            })));
        } else {
            console.log("[Ranking] No products or empty list.");
        }
    }, [allProducts]);
    const ratingSelected = ratingFilter;

    // Filter products: require reviewStats and meet thresholds
    const products = allProducts
        .filter(product => {
            const reviewStats = product.reviewStats;
            if (ratingSelected === 'none') {
                // No rating filter: include all
                return true;
            }
            const n = parseInt(ratingSelected, 10);
            if (!reviewStats || (reviewStats.totalReviews || 0) === 0) return false;
            return (reviewStats.averageRating || 0) >= n;
        })
        .filter(product => {
            if (selectedCategory === 'all') return true;
            return product.categoryId === selectedCategory;
        })
        .sort((a, b) => {
            if (ratingSelected === 'none') {
                const aReviews = a.reviewStats?.totalReviews || 0;
                const bReviews = b.reviewStats?.totalReviews || 0;
                return bReviews - aReviews; // Desc by review count
            }
            const aRating = a.reviewStats?.averageRating || 0;
            const bRating = b.reviewStats?.averageRating || 0;
            return bRating - aRating; // Desc by rating
        });

    const totalReviewsAcross = products.reduce((sum, p) => sum + (p.reviewStats?.totalReviews || 0), 0);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Build category options from available categoryIds to match product data
    // Categories for dropdown (same UI as Recommend page)
    const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = usePublicCategories();
    const categories = categoriesData?.data || [];

    // Infinite scroll for '평점 없음' mode
    const [noneModeProducts, setNoneModeProducts] = React.useState<ProductResponseDto[]>([]);
    const [nonePage, setNonePage] = React.useState(1);
    const [noneHasMore, setNoneHasMore] = React.useState(true);
    const [noneLoading, setNoneLoading] = React.useState(false);
    const noneLoadingRef = React.useRef(false);
    const loadMoreRef = React.useRef<HTMLDivElement | null>(null);

    const fetchNoneMode = React.useCallback(async (page: number) => {
        if (noneLoadingRef.current) return;
        noneLoadingRef.current = true;
        setNoneLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('pageSize', '12');
            params.append('isActive', 'true');
            params.append('include', 'true');
            params.append('includeReviewStats', 'true');
            if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
            const res = await fetch(`/api/product?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const json = await res.json();
            const pageItems = json?.data?.data || json?.products || [];
            const totalPages = json?.data?.totalPages || json?.pagination?.totalPages || json?.totalPages || 1;
            setNoneModeProducts(prev => {
                const ids = new Set(prev.map((p) => p.id));
                const unique = pageItems.filter((p: ProductResponseDto) => !ids.has(p.id));
                return [...prev, ...unique];
            });
            setNonePage(page + 1);
            setNoneHasMore(page < totalPages);
        } catch (e) {
            console.error('ranking none-mode error', e);
            setNoneHasMore(false);
        } finally {
            setNoneLoading(false);
            noneLoadingRef.current = false;
        }
    }, [selectedCategory]);

    // Reset when switching to none mode or category changes
    React.useEffect(() => {
        if (ratingFilter === 'none') {
            setNoneModeProducts([]);
            setNonePage(1);
            setNoneHasMore(true);
            fetchNoneMode(1);
        }
    }, [ratingFilter, selectedCategory, fetchNoneMode]);

    // Observe bottom for infinite loading
    React.useEffect(() => {
        if (ratingFilter !== 'none') return;
        if (!noneHasMore) return;
        const el = loadMoreRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !noneLoadingRef.current && noneHasMore) {
                fetchNoneMode(nonePage);
            }
        }, { rootMargin: '200px' });
        observer.observe(el);
        return () => observer.disconnect();
    }, [ratingFilter, noneHasMore, noneLoading, nonePage, fetchNoneMode]);

    // Reset to first page whenever filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [ratingFilter, selectedCategory]);



    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-8">
                            <div className="h-12 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
                            <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto animate-pulse"></div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                                    <div className="aspect-square bg-gray-200"></div>
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">랭킹 정보를 불러올 수 없습니다</h2>
                    <p className="text-gray-600 mb-4">잠시 후 다시 시도해주세요.</p>
                    <Button onClick={() => window.location.reload()}>
                        다시 시도
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div>
                    {/* Simple Filter summary (no dropdowns) */}
                    <div className="mb-6 rounded-lg border bg-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-gray-800">필터</div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setRatingFilter('4');
                                    setSelectedCategory('all');
                                    setCurrentPage(1);
                                }}
                            >
                                필터 초기화
                            </Button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">평점</span>
                                <Select value={ratingFilter} onValueChange={(v) => setRatingFilter(v)}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="평점" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">평점 없음</SelectItem>
                                        <SelectItem value="1">1점 이상</SelectItem>
                                        <SelectItem value="2">2점 이상</SelectItem>
                                        <SelectItem value="3">3점 이상</SelectItem>
                                        <SelectItem value="4">4점 이상</SelectItem>
                                        <SelectItem value="5">5점 이상</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">카테고리</span>
                                <CategoryDropdown
                                    categories={categories}
                                    selectedCategoryId={selectedCategory === 'all' ? '' : selectedCategory}
                                    onCategorySelect={(id) => {
                                        setSelectedCategory(id || 'all');
                                    }}
                                    isLoading={categoriesLoading}
                                    error={categoriesError?.message}
                                    compactMode={true}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                                총 {(ratingFilter === 'none' ? noneModeProducts.length : products.length)}개 상품
                            </Badge>
                            <span className="text-sm text-gray-600">
                                {ratingFilter === 'none' ? '평점 없음' : `${ratingFilter}점 이상`} · 총 리뷰 {totalReviewsAcross}개
                            </span>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {(ratingFilter === 'none' ? noneModeProducts.length === 0 : products.length === 0) ? (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">⭐</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                조건에 맞는 상품이 없습니다
                            </h3>
                            <p className="text-gray-600 mb-4">
                                필터 조건을 조정해보세요.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setRatingFilter('4');
                                    setSelectedCategory('all');
                                    setCurrentPage(1);
                                }}
                            >
                                필터 초기화
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                            {(ratingFilter === 'none' ? noneModeProducts : products).map((product) => (
                                <Cafe24ProductCard
                                    key={product.id}
                                    product={{
                                        id: product.id,
                                        name: product.name,
                                        price: product.finalPrice || product.basePrice,
                                        originalPrice: product.baseCompareAtPrice,
                                        discount: product.promotion ?
                                            (product.promotion.type === 'percentage' ? product.promotion.value :
                                                product.promotion.type === 'fixed_amount' ? (product.promotion.value! / product.basePrice * 100) : 0) : undefined,
                                        image: product.images?.[0] || product.thumbUrl || "",
                                        brand: product.brand?.name,
                                        brandSlug: product.brand?.slug,
                                        slug: product.slug,
                                        rating: product.reviewStats?.averageRating,
                                        reviews: product.reviewStats?.totalReviews,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination or Infinite Scroll trigger */}
                    {ratingFilter === 'none' ? (
                        <div className="flex items-center justify-center mt-8">
                            <div ref={loadMoreRef} />
                            {noneLoading && (
                                <span className="text-sm text-gray-500">더 불러오는 중...</span>
                            )}
                            {!noneHasMore && (
                                <span className="text-sm text-gray-400">모두 불러왔습니다</span>
                            )}
                        </div>
                    ) : (
                        pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    이전
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className="w-10 h-10"
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.totalPages}
                                >
                                    다음
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}

