import { ProductReview } from "@/types/product";

export const sampleReviews: ProductReview[] = [
  {
    id: 1,
    productId: 1, // 상품 ID 추가
    rating: 5,
    content:
      "정말 만족스러운 구매였어요! 사이즈도 정확하고 색상도 사진과 동일해서 너무 좋습니다. 배송도 빨라서 주문한 다음날 받았네요. 친구들에게도 추천하고 싶어요. 👍",
    imageUrl: "/hero/image1.png",
    createdAt: "2024-01-15T10:30:00Z",
    user: {
      userId: "user1",
      name: "김미영",
    },
  },
  {
    id: 2,
    productId: 1,
    rating: 4,
    content:
      "전체적으로 만족합니다. 핏도 좋고 재질도 괜찮아요. 다만 생각보다 약간 얇은 느낌이 있어서 별 하나 뺐어요. 그래도 가성비는 좋다고 생각해요!",
    createdAt: "2024-01-12T14:20:00Z",
    user: {
      userId: "user2",
      name: "이서연",
    },
  },
  {
    id: 3,
    productId: 1,
    rating: 5,
    content:
      "완전 만족! 사이즈 가이드대로 주문했는데 딱 맞네요. 특히 AI 가상피팅 기능이 정말 도움이 되었어요. 미리 어떻게 입힐지 볼 수 있어서 좋았습니다.",
    imageUrl: "/hero/image2.png",
    createdAt: "2024-01-10T09:15:00Z",
    user: {
      userId: "user3",
      name: "박지훈",
    },
  },
  {
    id: 4,
    productId: 1,
    rating: 3,
    content:
      "보통이에요. 가격대비 나쁘지 않지만 특별히 좋다고 할 것도 없어요. 배송은 빨랐어요.",
    createdAt: "2024-01-08T16:45:00Z",
    user: {
      userId: "user4",
      name: "최민수",
    },
  },
  {
    id: 5,
    productId: 1,
    rating: 5,
    content:
      "진짜 예쁘고 품질도 좋아요! 세탁 후에도 변형 없고, 색 빠짐도 없었어요. BOGOFIT에서 구매한 것 중에 가장 만족스러운 상품입니다. 재구매 의향 100%!",
    imageUrl: "/hero/image3.png",
    createdAt: "2024-01-05T11:30:00Z",
    user: {
      userId: "user5",
      name: "정수빈",
    },
  },
  {
    id: 6,
    productId: 1,
    rating: 4,
    content:
      "사이즈가 딱 맞고 디자인도 예뻐요. 가상피팅으로 미리 확인할 수 있어서 온라인 쇼핑의 불안감이 많이 줄었어요. 다음에도 이용할 것 같아요.",
    createdAt: "2024-01-03T13:20:00Z",
    user: {
      userId: "user6",
      name: "홍길동",
    },
  },
  {
    id: 7,
    productId: 1,
    rating: 5,
    content:
      "배송 진짜 빠르고 포장도 꼼꼼하게 잘 해주셨어요. 상품 퀄리티도 가격 대비 너무 좋아요. 사이즈 고민 많았는데 AI 추천 받은 사이즈가 정말 딱 맞네요!",
    createdAt: "2024-01-01T08:45:00Z",
    user: {
      userId: "user7",
      name: "윤서아",
    },
  },
  {
    id: 8,
    productId: 1,
    rating: 2,
    content:
      "기대했던 것보다는 아쉬워요. 사진과 실제 색상이 좀 다르고, 재질도 생각보다 얇네요. 교환 고려 중입니다.",
    createdAt: "2023-12-28T15:10:00Z",
    user: {
      userId: "user8",
      name: "강태민",
    },
  },
  {
    id: 9,
    productId: 1,
    rating: 4,
    content:
      "전반적으로 좋아요! 특히 핏이 정말 예쁘게 나와요. 다만 배송이 조금 늦었던 점이 아쉬워요. 그래도 상품 자체는 만족합니다.",
    imageUrl: "/hero/image4.png",
    createdAt: "2023-12-25T12:30:00Z",
    user: {
      userId: "user9",
      name: "조은비",
    },
  },
  {
    id: 10,
    productId: 1,
    rating: 5,
    content:
      "완벽해요! 사이즈, 색상, 재질 모든 게 완벽합니다. BOGOFIT의 가상피팅 기술 덕분에 실수 없이 쇼핑할 수 있어서 정말 좋아요. 강력 추천!",
    createdAt: "2023-12-22T17:20:00Z",
    user: {
      userId: "user10",
      name: "노지현",
    },
  },
];

// 리뷰 통계 계산 함수
export const calculateReviewStats = (reviews: ProductReview[]) => {
  if (reviews.length === 0) {
    return {
      avgRating: 0,
      reviewCount: 0,
      ratingDistribution: [0, 0, 0, 0, 0],
    };
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map(
    (rating) => reviews.filter((review) => review.rating === rating).length
  );

  return {
    avgRating: Math.round(avgRating * 10) / 10, // 소수점 한자리까지
    reviewCount: reviews.length,
    ratingDistribution,
  };
};
