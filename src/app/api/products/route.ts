import { PrismaClient, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags:
 *       - Products
 *     summary: 상품 목록 조회
 *     description: 페이지네이션, 검색, 필터링이 적용된 상품 목록을 조회합니다.
 *     parameters:
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
 *           default: 20
 *         description: 페이지당 아이템 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 상품명, 설명, 브랜드명, 스토어명 검색어
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: 브랜드 정확 매칭 필터
 *       - in: query
 *         name: storeName
 *         schema:
 *           type: string
 *         description: 스토어명 정확 매칭 필터
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: 최소 가격
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: 최대 가격
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, oldest, price_asc, price_desc, popular]
 *           default: newest
 *         description: 정렬 방식
 *       - in: query
 *         name: showSoldOut
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 품절 상품 포함 여부
 *     responses:
 *       200:
 *         description: 상품 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 999999; // limit이 없으면 매우 큰 값
    const skip = limitParam ? (page - 1) * limit : 0;

    // 검색 및 필터 파라미터
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const storeName = searchParams.get("storeName") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "newest";
    const order = searchParams.get("order") || "desc"; // asc 또는 desc
    const showSoldOut = searchParams.get("showSoldOut") === "true";

    // 필터 조건 구성
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    // soldout 상품 제외 (데이터베이스 레벨에서 처리)
    if (!showSoldOut) {
      where.OR = where.OR || [];
      // variant가 없는 상품 OR variant가 있지만 품절이 아닌 상품
      const soldOutFilter = {
        OR: [
          // variant가 없는 상품
          {
            variants: {
              none: {},
            },
          },
          // variant가 있지만 품절이 아닌 옵션이 하나라도 있는 상품
          {
            variants: {
              some: {
                optionValue: {
                  not: {
                    contains: "품절",
                  },
                },
              },
            },
          },
        ],
      };

      // 기존 OR 조건과 soldout 필터를 AND로 결합
      if (where.OR.length > 0) {
        const existingOr = where.OR;
        delete where.OR;
        where.AND = [{ OR: existingOr }, soldOutFilter];
      } else {
        delete where.OR;
        Object.assign(where, soldOutFilter);
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { name: { contains: search, mode: "insensitive" } } },
        { storeName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    // 브랜드 정확 매칭
    if (brand) {
      where.brand = {
        name: { equals: brand, mode: "insensitive" },
      };
    }

    // 스토어명 정확 매칭
    if (storeName) {
      where.storeName = { equals: storeName, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // random 파라미터 처리
    if (searchParams.get("random")) {
      const randomCount = Number(searchParams.get("random")) || 20;
      const totalCount = await prisma.product.count({ where });
      const skipArr = Array.from({ length: totalCount }, (_, i) => i);
      const randomIndexes = skipArr
        .sort(() => 0.5 - Math.random())
        .slice(0, randomCount);
      const randomProducts = await Promise.all(
        randomIndexes.map((idx) =>
          prisma.product.findFirst({
            skip: idx,
            where,
            orderBy: { id: "asc" },
            include: {
              brand: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  logo: true,
                },
              },
            },
          })
        )
      );
      return NextResponse.json({
        products: randomProducts.filter(Boolean),
        total: randomProducts.length,
        page: 1,
        totalPages: 1,
        filters: {},
      });
    }

    // badge 필터 처리 - 콤마로 구분된 badge 문자열에서 포함 여부 확인
    if (searchParams.get("badge")) {
      const badgeFilter = searchParams.get("badge")!;
      where.badge = {
        contains: badgeFilter,
        mode: "insensitive",
      };
    }

    // 정렬 조건
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (sortBy) {
      case "price_low":
        orderBy = { price: "asc" };
        break;
      case "price_high":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { title: order === "desc" ? "desc" : "asc" };
        break;
      case "price":
        orderBy = { price: order === "desc" ? "desc" : "asc" };
        break;
      case "createdAt":
        orderBy = { createdAt: order === "desc" ? "desc" : "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // 전체 상품 수 조회 (필터 조건 적용)
    const totalCount = await prisma.product.count({ where });

    // 상품 조회 (페이지네이션 적용)
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
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

    // 평균 평점 계산
    const productsWithRating = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      // 품절 여부 확인
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
        // storeName 우선, 없으면 브랜드명 사용 (업체명 ≠ 브랜드명)
        storeName: product.storeName || product.brand?.name || "보고핏",
        reviews: undefined,
      };
    });

    // soldout 상품은 이미 데이터베이스 레벨에서 제외됨
    return NextResponse.json({
      products: productsWithRating,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
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
