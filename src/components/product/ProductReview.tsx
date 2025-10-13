"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ThumbsUp, MessageCircle, Camera, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ProductReview } from "@/types/product";
import { useAuth } from "@/providers/AuthProvider";

interface ProductReviewProps {
  productId: number;
  onReviewSubmit?: (review: ProductReview) => void;
}

interface ReviewsResponse {
  reviews: ProductReview[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    avgRating: number;
    reviewCount: number;
    ratingDistribution: number[];
  };
}

// 별점 컴포넌트
const StarRating = ({
  rating,
  size = "w-4 h-4",
  interactive = false,
  onRatingChange,
}: {
  rating: number;
  size?: string;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const displayRating = interactive ? hoveredRating || rating : rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${
            star <= displayRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          } ${
            interactive
              ? "cursor-pointer hover:scale-110 transition-transform"
              : ""
          }`}
          onClick={interactive ? () => onRatingChange?.(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      ))}
    </div>
  );
};

// 리뷰 항목 컴포넌트
const ReviewItem = ({ review }: { review: ProductReview }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  return (
    <Card className="border-0 shadow-sm bg-white/70 backdrop-blur-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-pink-100 flex-shrink-0">
            <div className="bg-gradient-to-br from-pink-400 to-purple-400 w-full h-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
              {review.user.name.charAt(0)}
            </div>
          </Avatar>

          <div className="flex-1 min-w-0 space-y-3">
            {/* 사용자 정보 및 평점 - 반응형 개선 */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <span className="font-medium text-gray-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-[200px]">
                  {review.user.name}
                </span>
                <div className="flex items-center gap-2">
                  <StarRating
                    rating={review.rating}
                    size="w-3 h-3 sm:w-4 sm:h-4"
                  />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {review.rating}점
                  </span>
                </div>
              </div>
              <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                    year: "2-digit",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </span>
                <Badge variant="outline" className="text-xs h-5 px-2">
                  구매확정
                </Badge>
              </div>
            </div>

            {/* 리뷰 내용 */}
            <div className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
              {review.content}
            </div>

            {/* 리뷰 이미지 - 클릭으로 확대 */}
            {review.imageUrl && (
              <div className="mt-3">
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageExpanded(true)}
                >
                  <Image
                    src={review.imageUrl}
                    alt="리뷰 이미지"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-colors">
                    <div className="text-white opacity-0 hover:opacity-100 transition-opacity">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 이미지 확대 모달 */}
                {isImageExpanded && (
                  <div
                    className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
                    onClick={() => setIsImageExpanded(false)}
                  >
                    <div className="relative max-w-3xl max-h-[80vh] w-full h-full">
                      <Image
                        src={review.imageUrl}
                        alt="리뷰 이미지 확대"
                        fill
                        className="object-contain"
                      />
                      <button
                        onClick={() => setIsImageExpanded(false)}
                        className="absolute top-4 right-4 w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 액션 버튼들 - 반응형 개선 */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-2 border-t border-gray-100">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 sm:h-8 text-xs px-2 sm:px-3 ${
                  isHelpful
                    ? "text-pink-600 bg-pink-50 hover:bg-pink-100"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } transition-colors`}
                onClick={() => {
                  setIsHelpful(!isHelpful);
                  setHelpfulCount((prev) => (isHelpful ? prev - 1 : prev + 1));
                }}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">도움돼요</span>
                {helpfulCount > 0 && (
                  <span className="ml-1">({helpfulCount})</span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 sm:h-8 text-xs px-2 sm:px-3 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">답글</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 리뷰 작성 폼 컴포넌트
const ReviewForm = ({
  onSubmit,
  onCancel,
}: {
  onSubmit: (review: Partial<ProductReview>) => void;
  onCancel: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || content.trim() === "") return;

    onSubmit({
      rating,
      content: content.trim(),
      imageUrl: previewUrl, // 실제로는 업로드된 이미지 URL
    });

    // Reset form
    setRating(0);
    setContent("");
    setPreviewUrl("");
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  return (
    <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50">
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-800">리뷰 작성하기</h3>
        <p className="text-sm text-gray-600">
          상품에 대한 솔직한 후기를 남겨주세요.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              별점 평가 *
            </label>
            <StarRating
              rating={rating}
              size="w-8 h-8"
              interactive
              onRatingChange={setRating}
            />
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && "⭐ 별로예요"}
                {rating === 2 && "⭐⭐ 그저 그래요"}
                {rating === 3 && "⭐⭐⭐ 보통이에요"}
                {rating === 4 && "⭐⭐⭐⭐ 좋아요"}
                {rating === 5 && "⭐⭐⭐⭐⭐ 최고예요"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              리뷰 내용 *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="상품에 대한 후기를 자세히 작성해주세요. (최소 10자 이상)"
              className="min-h-[120px] resize-none border-gray-300 focus:border-pink-400 focus:ring-pink-400"
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                최소 10자 이상 작성해주세요.
              </span>
              <span className="text-xs text-gray-500">
                {content.length}/500
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              사진 첨부 (선택)
            </label>
            {previewUrl ? (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={previewUrl}
                  alt="리뷰 이미지 미리보기"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-400 transition-colors">
                <div className="text-center">
                  <Camera className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">사진 추가</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={rating === 0 || content.trim().length < 10}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
            >
              리뷰 등록하기
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-8 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// 메인 리뷰 컴포넌트
export default function ProductReview({
  productId,
  onReviewSubmit,
}: ProductReviewProps) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState<number[]>([
    0, 0, 0, 0, 0,
  ]);
  const [loading, setLoading] = useState(true);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [sortBy, setSortBy] = useState<"latest" | "rating_high" | "rating_low">(
    "latest"
  );
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [page] = useState(1);

  // 리뷰 데이터 가져오기
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sortBy,
      });

      if (filterRating) {
        params.append("rating", filterRating.toString());
      }

      const response = await fetch(
        `/api/products/${productId}/reviews?${params}`
      );
      if (!response.ok) throw new Error("리뷰를 불러올 수 없습니다.");

      const data: ReviewsResponse = await response.json();
      setReviews(data.reviews);
      setAvgRating(data.stats.avgRating);
      setReviewCount(data.stats.reviewCount);
      setRatingDistribution(data.stats.ratingDistribution);
    } catch (error) {
      console.error("리뷰 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, sortBy, filterRating, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 별점별 리뷰 개수 계산
  const ratingCounts = [5, 4, 3, 2, 1].map((rating, index) => ({
    rating,
    count: ratingDistribution[index] || 0,
    percentage:
      reviewCount > 0
        ? ((ratingDistribution[index] || 0) / reviewCount) * 100
        : 0,
  }));

  const handleReviewSubmit = async (reviewData: Partial<ProductReview>) => {
    if (!isAuthenticated || !user) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: reviewData.rating,
          content: reviewData.content,
          imageUrl: reviewData.imageUrl,
          userId: user.userId, // 실제 로그인된 사용자 ID
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "리뷰 작성에 실패했습니다.");
      }

      const result = await response.json();

      // 리뷰 목록 새로고침
      await fetchReviews();
      setShowWriteForm(false);

      onReviewSubmit?.(result.review);
    } catch (error) {
      console.error("리뷰 작성 오류:", error);
      alert(
        error instanceof Error ? error.message : "리뷰 작성에 실패했습니다."
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="h-12 bg-gray-200 rounded w-16 mx-auto mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 리뷰 요약 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">고객 리뷰</h2>
          <Button
            onClick={() => {
              if (!isAuthenticated) {
                alert("로그인이 필요합니다.");
                return;
              }
              setShowWriteForm(true);
            }}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
          >
            {isAuthenticated ? "리뷰 작성하기" : "로그인 후 리뷰 작성"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 평점 요약 */}
          <div className="text-center">
            <div className="mb-4">
              <div className="text-4xl font-bold text-gray-800 mb-2">
                {avgRating.toFixed(1)}
              </div>
              <StarRating rating={avgRating} size="w-6 h-6" />
              <p className="text-gray-600 mt-2">
                총 {reviewCount.toLocaleString("ko-KR")}개의 리뷰
              </p>
            </div>

            {/* 별점별 분포 */}
            <div className="space-y-2">
              {ratingCounts.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 w-12">
                    <span>{rating}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 리뷰 키워드 */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">
              자주 언급되는 키워드
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "핏이 좋아요",
                "배송 빨라요",
                "가성비 좋음",
                "색상 예쁨",
                "재질 좋음",
                "사이즈 정확",
              ].map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 cursor-default"
                >
                  #{keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 리뷰 작성 폼 */}
      {showWriteForm && (
        <ReviewForm
          onSubmit={handleReviewSubmit}
          onCancel={() => setShowWriteForm(false)}
        />
      )}

      {/* 리뷰 필터 및 정렬 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
              className="h-8 text-xs px-2 sm:px-3 min-w-[44px]"
            >
              전체
            </Button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
                className="h-8 text-xs px-2 sm:px-3 min-w-[44px]"
              >
                {rating}⭐
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">정렬:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
          >
            <option value="latest">최신순</option>
            <option value="rating_high">별점 높은순</option>
            <option value="rating_low">별점 낮은순</option>
          </select>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filterRating
                ? `${filterRating}점 리뷰가 없습니다`
                : "첫 번째 리뷰를 작성해보세요!"}
            </h3>
            <p className="text-gray-600 mb-6">
              {filterRating
                ? "다른 별점의 리뷰를 확인해보세요."
                : "다른 고객들에게 도움이 되는 후기를 남겨주세요."}
            </p>
            {!filterRating && (
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    alert("로그인이 필요합니다.");
                    return;
                  }
                  setShowWriteForm(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium"
              >
                {isAuthenticated ? "첫 리뷰 작성하기" : "로그인 후 리뷰 작성"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
