import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BrandData {
  id: string | number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  productCount: number;
  userCount: number;
  status: string;
  isActive: boolean;
  createdAt: string | Date;
  type: "official" | "store";
}

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

    // 1. Brand 테이블에서 공식 입점 브랜드들 가져오기
    const officialBrands = await prisma.brand.findMany({
      where: {
        isActive: true,
        status: "APPROVED",
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

    // 2. Product 테이블에서 고유한 storeName과 상품 개수 가져오기
    const storeNameGroups = await prisma.product.groupBy({
      by: ["storeName"],
      where: {
        isActive: true,
        storeName: {
          not: null,
        },
        NOT: {
          storeName: "",
        },
      },
      _count: {
        id: true,
      },
    });

    // 3. 통합 브랜드 맵 생성 (중복 제거)
    const brandMap = new Map<string, BrandData>();

    // 공식 브랜드 추가
    officialBrands.forEach((brand) => {
      brandMap.set(brand.name.toLowerCase(), {
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
        type: "official", // 공식 브랜드 구분
      });
    });

    // storeName 브랜드 추가 (기존 브랜드와 중복되면 상품 개수만 업데이트)
    storeNameGroups.forEach((group, index) => {
      const storeName = group.storeName || "";
      const key = storeName.toLowerCase();

      if (brandMap.has(key)) {
        // 이미 공식 브랜드로 존재하면 상품 개수 합산
        const existing = brandMap.get(key);
        if (existing) {
          existing.productCount += group._count.id;
        }
      } else {
        // 새로운 storeName 브랜드 추가
        brandMap.set(key, {
          id: `store_${index + 1000}`, // 충돌 방지를 위한 ID
          name: storeName,
          slug: storeName.toLowerCase().replace(/\s+/g, "-"),
          logo: null,
          description: `${storeName} 브랜드의 상품들`,
          productCount: group._count.id,
          userCount: 0,
          status: "APPROVED" as const,
          isActive: true,
          createdAt: new Date().toISOString(),
          type: "store", // 스토어 브랜드 구분
        });
      }
    });

    // 4. 맵을 배열로 변환
    let processedBrands = Array.from(brandMap.values());

    // 5. 검색어 필터링
    if (search) {
      processedBrands = processedBrands.filter((brand) =>
        brand.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 6. 정렬 처리
    switch (sortBy) {
      case "productCount":
        processedBrands.sort((a, b) => b.productCount - a.productCount);
        break;
      case "createdAt":
        processedBrands.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "name":
      default:
        processedBrands.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return NextResponse.json({
      success: true,
      data: {
        brands: processedBrands,
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
