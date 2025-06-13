import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // 검색 및 필터 파라미터
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "newest";
    const showSoldOut = searchParams.get("showSoldOut") === "true";

    // 필터 조건 구성
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { storeName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice)
        (where.price as Record<string, number>).gte = parseFloat(minPrice);
      if (maxPrice)
        (where.price as Record<string, number>).lte = parseFloat(maxPrice);
    }

    // 정렬 조건
    let orderBy: Record<string, string> = { id: "desc" };
    switch (sortBy) {
      case "price_low":
        orderBy = { price: "asc" };
        break;
      case "price_high":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { title: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        variants: {
          select: {
            id: true,
            optionName: true,
            optionValue: true,
            priceDiff: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    // 평균 평점 계산 및 품절 상품 필터링
    let productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      // 품절 여부 확인 (모든 variants가 "품절"을 포함하는지 확인)
      const isSoldOut =
        product.variants && product.variants.length > 0
          ? product.variants.every((variant) =>
              variant.optionValue.includes("품절")
            )
          : false;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
        isSoldOut,
        reviews: undefined, // 응답에서 제거
      };
    });

    // 품절 상품 필터링 (showSoldOut이 false면 품절 상품 제외)
    if (!showSoldOut) {
      productsWithRating = productsWithRating.filter(
        (product) => !product.isSoldOut
      );
    }

    const filteredTotal = productsWithRating.length;

    return NextResponse.json({
      products: productsWithRating,
      total: filteredTotal,
      page,
      totalPages: Math.ceil(filteredTotal / limit),
      filters: {
        search,
        category,
        minPrice,
        maxPrice,
        sortBy,
        showSoldOut,
      },
    });
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      { message: "상품 조회 중 오류가 발생했습니다.", error },
      { status: 500 }
    );
  }
}
