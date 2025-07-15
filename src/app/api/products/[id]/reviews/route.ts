import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductReview } from "@/types/product";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     tags:
 *       - Products
 *     summary: 상품 리뷰 목록 조회
 *     description: 특정 상품의 리뷰 목록을 페이지네이션과 필터링으로 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 리뷰 수
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [latest, oldest, highest, lowest]
 *           default: latest
 *         description: 정렬 방식
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: 평점 필터
 *     responses:
 *       200:
 *         description: 리뷰 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reviews:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 리뷰 ID
 *                       rating:
 *                         type: integer
 *                         description: 평점 (1-5)
 *                       comment:
 *                         type: string
 *                         description: 리뷰 내용
 *                       userName:
 *                         type: string
 *                         description: 작성자명
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 작성일시
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalReviews:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     averageRating:
 *                       type: number
 *                       description: 평균 평점
 *                     totalCount:
 *                       type: integer
 *                       description: 총 리뷰 수
 *       400:
 *         description: 잘못된 상품 ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    // URL 쿼리 파라미터 가져오기
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "latest";
    const filterRating = searchParams.get("rating");

    // 필터 조건 구성
    const where: { productId: number; rating?: number } = { productId };
    if (filterRating) {
      const rating = parseInt(filterRating);
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        where.rating = rating;
      }
    }

    // 정렬 조건 구성
    let orderBy: { createdAt?: "desc" | "asc"; rating?: "desc" | "asc" } = {
      createdAt: "desc",
    }; // default: latest
    switch (sortBy) {
      case "rating_high":
        orderBy = { rating: "desc" };
        break;
      case "rating_low":
        orderBy = { rating: "asc" };
        break;
    }

    // 리뷰 조회 (페이징 포함)
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              userId: true,
              name: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    // 전체 리뷰 통계 계산 (필터 없이)
    const [avgRatingResult, totalReviews, ratingDistribution] =
      await Promise.all([
        prisma.review.aggregate({
          where: { productId },
          _avg: { rating: true },
        }),
        prisma.review.count({ where: { productId } }),
        prisma.review.groupBy({
          by: ["rating"],
          where: { productId },
          _count: { rating: true },
        }),
      ]);

    // 별점별 분포 계산
    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const found = ratingDistribution.find((item) => item.rating === rating);
      return found ? found._count.rating : 0;
    });

    const totalPages = Math.ceil(total / limit);

    // ProductReview 타입에 맞게 변환
    const formattedReviews: ProductReview[] = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      rating: review.rating,
      content: review.content,
      imageUrl: review.imageUrl || undefined,
      createdAt: review.createdAt.toISOString(),
      user: {
        userId: review.user.userId,
        name: review.user.name,
      },
    }));

    return NextResponse.json({
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      stats: {
        avgRating: avgRatingResult._avg.rating || 0,
        reviewCount: totalReviews,
        ratingDistribution: distribution,
      },
    });
  } catch (error) {
    console.error("리뷰 조회 오류:", error);
    return NextResponse.json(
      { error: "리뷰를 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 리뷰 작성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { rating, content, imageUrl, userId } = body;

    // 입력값 검증
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "별점은 1-5 사이의 값이어야 합니다." },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: "리뷰 내용은 최소 10자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    if (content.trim().length > 500) {
      return NextResponse.json(
        { error: "리뷰 내용은 500자를 초과할 수 없습니다." },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 상품 존재 확인
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "존재하지 않는 상품입니다." },
        { status: 404 }
      );
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다." },
        { status: 404 }
      );
    }

    // 중복 리뷰 확인 (선택적)
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.id,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "이미 이 상품에 대한 리뷰를 작성하셨습니다." },
        { status: 400 }
      );
    }

    // 새 리뷰 생성
    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        content: content.trim(),
        imageUrl: imageUrl || null,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    // ProductReview 타입에 맞게 변환
    const formattedReview: ProductReview = {
      id: newReview.id,
      productId: newReview.productId,
      rating: newReview.rating,
      content: newReview.content,
      imageUrl: newReview.imageUrl || undefined,
      createdAt: newReview.createdAt.toISOString(),
      user: {
        userId: newReview.user.userId,
        name: newReview.user.name,
      },
    };

    return NextResponse.json(
      {
        success: true,
        message: "리뷰가 성공적으로 등록되었습니다.",
        review: formattedReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("리뷰 작성 오류:", error);
    return NextResponse.json(
      { error: "리뷰 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 리뷰 수정
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { reviewId, rating, content, imageUrl, userId } = body;

    if (isNaN(productId) || !reviewId || !userId) {
      return NextResponse.json(
        { error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다." },
        { status: 404 }
      );
    }

    // 리뷰 소유자 확인
    const existingReview = await prisma.review.findFirst({
      where: {
        id: reviewId,
        productId,
        userId: user.id,
      },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "수정할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 리뷰 수정
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating,
        content: content.trim(),
        imageUrl: imageUrl || null,
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
          },
        },
      },
    });

    const formattedReview: ProductReview = {
      id: updatedReview.id,
      productId: updatedReview.productId,
      rating: updatedReview.rating,
      content: updatedReview.content,
      imageUrl: updatedReview.imageUrl || undefined,
      createdAt: updatedReview.createdAt.toISOString(),
      user: {
        userId: updatedReview.user.userId,
        name: updatedReview.user.name,
      },
    };

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 수정되었습니다.",
      review: formattedReview,
    });
  } catch (error) {
    console.error("리뷰 수정 오류:", error);
    return NextResponse.json(
      { error: "리뷰 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 리뷰 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");
    const userId = searchParams.get("userId");

    if (!reviewId || !userId) {
      return NextResponse.json(
        { error: "리뷰 ID와 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다." },
        { status: 404 }
      );
    }

    // 리뷰 소유자 확인 및 삭제
    const deletedReview = await prisma.review.deleteMany({
      where: {
        id: parseInt(reviewId),
        productId,
        userId: user.id,
      },
    });

    if (deletedReview.count === 0) {
      return NextResponse.json(
        { error: "삭제할 리뷰를 찾을 수 없거나 권한이 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "리뷰가 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("리뷰 삭제 오류:", error);
    return NextResponse.json(
      { error: "리뷰 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
