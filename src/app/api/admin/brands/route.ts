import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { BrandStatus } from "@prisma/client";

// 관리자용 브랜드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { businessNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status as BrandStatus;
    }

    const [brands, totalCount] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          users: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
              orders: true,
            },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    // 브랜드 통계
    const stats = await prisma.brand.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusStats = {
      total: totalCount,
      pending: stats.find((s) => s.status === "PENDING")?._count.status || 0,
      approved: stats.find((s) => s.status === "APPROVED")?._count.status || 0,
      rejected: stats.find((s) => s.status === "REJECTED")?._count.status || 0,
      suspended:
        stats.find((s) => s.status === "SUSPENDED")?._count.status || 0,
    };

    return NextResponse.json({
      brands,
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
    console.error("관리자 브랜드 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
