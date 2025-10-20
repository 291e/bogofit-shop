"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ProductReview {
  id: string;
  rating: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ProductReviewProps {
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
            {/* 사용자 정보 및 평점 */}
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

            {/* 리뷰 이미지 */}
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

            {/* 액션 버튼들 */}
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

export default function ProductReview({
}: ProductReviewProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating] = useState(4.5);
  const [reviewCount] = useState(128);

  // Mock data for now
  useEffect(() => {
    setReviews([
      {
        id: "1",
        rating: 5,
        content: "정말 만족스러운 상품입니다. 핏도 좋고 재질도 훌륭해요!",
        createdAt: "2024-01-15T10:30:00Z",
        user: { id: "1", name: "김고객" }
      },
      {
        id: "2",
        rating: 4,
        content: "배송이 빨라서 좋았어요. 색상도 예쁘고 만족합니다.",
        createdAt: "2024-01-14T15:20:00Z",
        user: { id: "2", name: "이사용자" }
      }
    ]);
  }, []);

  // Mock data - use fixed values to avoid hydration mismatch
  const ratingCounts = [
    { rating: 5, count: 45, percentage: 65 },
    { rating: 4, count: 28, percentage: 22 },
    { rating: 3, count: 8, percentage: 8 },
    { rating: 2, count: 3, percentage: 3 },
    { rating: 1, count: 2, percentage: 2 }
  ];

  return (
    <div className="space-y-8">
      {/* 리뷰 요약 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">고객 리뷰</h2>
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
              첫 번째 리뷰를 작성해보세요!
            </h3>
            <p className="text-gray-600 mb-6">
              다른 고객들에게 도움이 되는 후기를 남겨주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
