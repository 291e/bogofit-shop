import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// BrandData interface removed - not used

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: 브랜드 목록 조회
 *     description: 공식 입점 브랜드와 스토어네임을 통합하여 브랜드 목록을 조회합니다.
 *     tags:
 *       - Brands
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 브랜드명 검색
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
    const sortBy = searchParams.get("sortBy") || "name";

    // Brand 테이블에서 공식 입점 브랜드만 가져오기
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
        status: "APPROVED",
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
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

    // 브랜드 데이터 가공
    const processedBrands = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo,
      description: brand.description,
      productCount: brand._count.products,
      userCount: brand._count.users,
      status: brand.status,
      isActive: brand.isActive,
      createdAt: brand.createdAt,
      type: "official" as const,
    }));

    // 정렬 처리
    let sortedBrands = processedBrands;
    switch (sortBy) {
      case "productCount":
        sortedBrands = [...processedBrands].sort((a, b) => b.productCount - a.productCount);
        break;
      case "createdAt":
        sortedBrands = [...processedBrands].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "name":
      default:
        sortedBrands = [...processedBrands].sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        brands: sortedBrands,
        total: processedBrands.length,
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
