"use client";

import React, { useState } from 'react';
import { ReviewQueryParams } from '@/types/review';
import { useProductReviews, useProductReviewStats } from '@/hooks/useReviews';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/providers/languageProvider';

interface ProductReviewsProps {
    productId: string;
    statsFromProduct?: {
        averageRating?: number;
        totalReviews?: number;
        ratingDistribution?: Record<number, number>;
    };
    fetchList?: boolean; // if false, do not call review list API
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
    productId,
    statsFromProduct,
    fetchList = false,
}) => {
    const { t } = useLanguage();
    const [queryParams, setQueryParams] = useState<ReviewQueryParams>({
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
    });


    // Always call hooks to satisfy React Hooks rules; conditionally use results
    const { data: statsData, isLoading: statsLoading } = useProductReviewStats(productId);
    const { data: reviewsData, isLoading: reviewsLoading, error } = useProductReviews(productId, queryParams);

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-') as ['createdAt' | 'rating', 'asc' | 'desc'];
        setQueryParams(prev => ({
            ...prev,
            sortBy,
            sortOrder,
            page: 1
        }));
    };

    const handlePageChange = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }));
    };

    const handleRatingFilter = (rating: string) => {
        const ratingValue = rating === 'all' ? undefined : parseInt(rating);
        setQueryParams(prev => ({
            ...prev,
            rating: ratingValue,
            page: 1
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getPercentage = (rating: number, stats: { totalReviews: number; ratingDistribution: Record<number, number> }) => {
        return stats.totalReviews > 0
            ? (stats.ratingDistribution[rating] || 0) / stats.totalReviews * 100
            : 0;
    };

    if ((!statsFromProduct && statsLoading) || (fetchList && reviewsLoading)) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">{t("productDetail.productReviews.loading")}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (fetchList && error) {
        return (
            <Card>
                <CardContent className="p-8">
                    <div className="text-center">
                        <p className="text-red-600">{t("productDetail.productReviews.error")}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const stats = statsFromProduct?.averageRating !== undefined || statsFromProduct?.totalReviews !== undefined
        ? {
            averageRating: statsFromProduct?.averageRating || 0,
            totalReviews: statsFromProduct?.totalReviews || 0,
            ratingDistribution: statsFromProduct?.ratingDistribution || {}
        }
        : statsData?.stats;
    const reviews = fetchList ? (reviewsData?.reviews || []) : [];
    const pagination = fetchList ? reviewsData?.pagination : undefined;

    return (
        <div className="space-y-6">
            {/* Review Stats Section - Always visible */}
            {/* Review Stats Section - Simplified */}
            {stats && (
                <div className="bg-gray-50 rounded-xl p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                        {/* Overall Rating */}
                        <div className="text-center">
                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <StarRating rating={stats.averageRating} size="medium" />
                            <div className="text-sm text-gray-500 mt-2">
                                {t("productDetail.productReviews.reviews").replace("{count}", stats.totalReviews.toString())}
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="hidden md:block w-px h-24 bg-gray-200"></div>

                        {/* Rating Distribution */}
                        <div className="flex-1 max-w-sm w-full space-y-2">
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = stats.ratingDistribution[rating] || 0;
                                const percentage = getPercentage(rating, stats);

                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-8">
                                            <span className="text-xs font-medium text-gray-600">{rating}점</span>
                                        </div>
                                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-black h-full rounded-full"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-400 w-8 text-right">
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List Section - Always visible */}
            {fetchList && (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
                        <div className="text-lg font-bold">
                            리뷰 ({stats?.totalReviews || 0})
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">{t("productDetail.productReviews.sort")}</label>
                                <Select value={`${queryParams.sortBy}-${queryParams.sortOrder}`} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt-desc">{t("productDetail.productReviews.sortOptions.newest")}</SelectItem>
                                        <SelectItem value="createdAt-asc">{t("productDetail.productReviews.sortOptions.oldest")}</SelectItem>
                                        <SelectItem value="rating-desc">{t("productDetail.productReviews.sortOptions.ratingHigh")}</SelectItem>
                                        <SelectItem value="rating-asc">{t("productDetail.productReviews.sortOptions.ratingLow")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">{t("productDetail.productReviews.rating")}</label>
                                <Select value={queryParams.rating?.toString() || 'all'} onValueChange={handleRatingFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t("productDetail.productReviews.all")}</SelectItem>
                                        <SelectItem value="5">{t("productDetail.productReviews.stars").replace("{rating}", "5")}</SelectItem>
                                        <SelectItem value="4">{t("productDetail.productReviews.stars").replace("{rating}", "4")}</SelectItem>
                                        <SelectItem value="3">{t("productDetail.productReviews.stars").replace("{rating}", "3")}</SelectItem>
                                        <SelectItem value="2">{t("productDetail.productReviews.stars").replace("{rating}", "2")}</SelectItem>
                                        <SelectItem value="1">{t("productDetail.productReviews.stars").replace("{rating}", "1")}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {t("productDetail.productReviews.noReviewsDescription")}
                            </h3>
                            <p className="text-gray-600">
                                {t("productDetail.productReviews.noReviewsHelp")}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <Card key={review.id} className="border-0 shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                                    <CardContent className="p-6">
                                        {/* Review Header */}
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-semibold text-lg">
                                                    {review.user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="font-medium text-gray-900 text-lg">
                                                        {review.user.name}
                                                    </span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {t("productDetail.productReviews.purchaseConfirmed")}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <StarRating rating={review.rating} size="small" />
                                                    <span className="text-sm text-gray-500">
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        {review.title && (
                                            <h4 className="font-medium text-gray-900 mb-3 text-lg">
                                                {review.title}
                                            </h4>
                                        )}

                                        {review.content && (
                                            <p className="text-gray-700 leading-relaxed mb-4 text-base break-words whitespace-pre-wrap">
                                                {review.content}
                                            </p>
                                        )}

                                        {/* Review Images */}
                                        {review.images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                                {review.images.map((image, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                                                        <Image
                                                            src={image}
                                                            alt={t("productDetail.productReviews.reviewImage").replace("{index}", (index + 1).toString())}
                                                            fill
                                                            className="object-cover hover:scale-105 transition-transform cursor-pointer"
                                                            sizes="(max-width: 640px) 50vw, 33vw"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(queryParams.page! - 1)}
                                disabled={queryParams.page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                {t("productDetail.productReviews.previous")}
                            </Button>

                            <div className="flex items-center gap-1">
                                {(() => {
                                    const totalPages = pagination.totalPages;
                                    const currentPage = queryParams.page || 1;
                                    const pages: number[] = [];

                                    // Show up to 5 pages around current page
                                    if (totalPages <= 5) {
                                        // Show all pages if total <= 5
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(i);
                                        }
                                    } else {
                                        // Show pages around current page
                                        if (currentPage <= 3) {
                                            // Near the beginning
                                            for (let i = 1; i <= 5; i++) {
                                                pages.push(i);
                                            }
                                        } else if (currentPage >= totalPages - 2) {
                                            // Near the end
                                            for (let i = totalPages - 4; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            // In the middle
                                            for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                                                pages.push(i);
                                            }
                                        }
                                    }

                                    return pages.map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {page}
                                        </Button>
                                    ));
                                })()}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(queryParams.page! + 1)}
                                disabled={queryParams.page === pagination.totalPages}
                            >
                                {t("productDetail.productReviews.next")}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
