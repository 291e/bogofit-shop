import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags: [Products]
 *     summary: 관리자 - 상품 목록 조회 (페이지네이션)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ALL, PENDING, APPROVED, REJECTED, DRAFT] }
 *       - in: query
 *         name: brandId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: 상품 목록과 페이지네이션 정보
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
 *                   $ref: '#/components/schemas/Pagination'
 */
// 관리자용 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const brandId = searchParams.get("brandId") || "";

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status as ProductStatus;
    }

    if (brandId) {
      where.brandId = parseInt(brandId);
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          variants: {
            select: {
              id: true,
              optionName: true,
              optionValue: true,
              stock: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 상품 통계
    const stats = await prisma.product.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusStats = {
      total: totalCount,
      pending: stats.find((s) => s.status === "PENDING")?._count.status || 0,
      approved: stats.find((s) => s.status === "APPROVED")?._count.status || 0,
      rejected: stats.find((s) => s.status === "REJECTED")?._count.status || 0,
      draft: stats.find((s) => s.status === "DRAFT")?._count.status || 0,
    };

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats: statusStats,
    });
  } catch (error) {
    console.error("관리자 상품 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
