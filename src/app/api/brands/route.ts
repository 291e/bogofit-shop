import { NextResponse } from "next/server";
import { PrismaClient, Prisma, BrandStatus } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: 브랜드 목록 조회
 *     description: 활성화된 승인된 브랜드 목록을 조회합니다.
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 브랜드명 검색
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUSPENDED]
 *         description: 브랜드 상태 필터
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, productCount, createdAt]
 *         description: 정렬 기준
 *     responses:
 *       200:
 *         description: 브랜드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     brands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *                     total:
 *                       type: number
 *       500:
 *         description: 서버 오류
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "APPROVED"; // 기본값은 승인된 브랜드만
    const sortBy = searchParams.get("sortBy") || "name";

    // 검색 조건 구성
    const where: Prisma.BrandWhereInput = {
      isActive: true,
    };

    // 상태가 지정된 경우
    if (status && status !== "ALL") {
      where.status = status as BrandStatus;
    }

    // 검색어가 있는 경우
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // 정렬 조건
    let orderBy: Prisma.BrandOrderByWithRelationInput = { name: "asc" };
    switch (sortBy) {
      case "productCount":
        // 상품 개수로 정렬할 때는 별도 처리 필요
        orderBy = { name: "asc" }; // 기본값으로 설정하고 나중에 정렬
        break;
      case "createdAt":
        orderBy = { createdAt: "desc" };
        break;
      case "name":
      default:
        orderBy = { name: "asc" };
        break;
    }

    // 브랜드 목록 조회
    const brands = await prisma.brand.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        status: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
            users: true,
          },
        },
      },
    });

    // 전체 브랜드 수
    const total = await prisma.brand.count({ where });

    // 브랜드 데이터 가공
    let processedBrands = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      status: brand.status,
      isActive: brand.isActive,
      productCount: brand._count.products,
      userCount: brand._count.users,
      createdAt: brand.createdAt,
    }));

    // 상품 개수로 정렬
    if (sortBy === "productCount") {
      processedBrands = processedBrands.sort(
        (a, b) => b.productCount - a.productCount
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        brands: processedBrands,
        total,
      },
    });
  } catch (error) {
    console.error("Brands GET API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "브랜드 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
