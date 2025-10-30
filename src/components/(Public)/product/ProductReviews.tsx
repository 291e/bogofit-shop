"use client";

import React, { useState } from 'react';
import { ReviewQueryParams } from '@/types/review';
import { useProductReviews, useProductReviewStats } from '@/hooks/useReviews';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';

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
                        <p className="text-gray-600">리뷰 정보를 불러오는 중...</p>
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
                        <p className="text-red-600">리뷰를 불러오는데 실패했습니다.</p>
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
            {/* Review Stats Section */}
            {stats && (
                <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-800">
                            <MessageSquare className="w-5 h-5 text-pink-600" />
                            고객 리뷰
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Overall Rating */}
                            <div className="text-center">
                                <div className="text-4xl font-bold text-gray-900 mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <StarRating rating={stats.averageRating} size="large" />
                                <div className="text-sm text-gray-600 mt-2">
                                    {stats.totalReviews}개 리뷰
                                </div>
                            </div>

                            {/* Rating Distribution */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(rating => {
                                    const count = stats.ratingDistribution[rating] || 0;
                                    const percentage = getPercentage(rating, stats);

                                    return (
                                        <div key={rating} className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 w-12">
                                                <span className="text-sm font-medium">{rating}</span>
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            </div>
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="text-sm text-gray-600 w-8 text-right">
                                                {count}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews List Section (optional) */}
            {fetchList && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-800">리뷰 목록</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 items-center mb-6">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">정렬:</label>
                                <Select value={`${queryParams.sortBy}-${queryParams.sortOrder}`} onValueChange={handleSortChange}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="createdAt-desc">최신순</SelectItem>
                                        <SelectItem value="createdAt-asc">오래된순</SelectItem>
                                        <SelectItem value="rating-desc">평점 높은순</SelectItem>
                                        <SelectItem value="rating-asc">평점 낮은순</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">평점:</label>
                                <Select value={queryParams.rating?.toString() || 'all'} onValueChange={handleRatingFilter}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">전체</SelectItem>
                                        <SelectItem value="5">5점</SelectItem>
                                        <SelectItem value="4">4점</SelectItem>
                                        <SelectItem value="3">3점</SelectItem>
                                        <SelectItem value="2">2점</SelectItem>
                                        <SelectItem value="1">1점</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Reviews List */}
                        {reviews.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    첫 번째 리뷰를 작성해보세요!
                                </h3>
                                <p className="text-gray-600">
                                    다른 고객들에게 도움이 되는 후기를 남겨주세요.
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
                                                            구매확정
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
                                                                alt={`리뷰 이미지 ${index + 1}`}
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
                                    이전
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <Button
                                                key={page}
                                                variant={queryParams.page === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                                className="w-8 h-8 p-0"
                                            >
                                                {page}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(queryParams.page! + 1)}
                                    disabled={queryParams.page === pagination.totalPages}
                                >
                                    다음
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
