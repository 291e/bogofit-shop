import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

// 관리자용 주문 목록 조회
export async function GET(request: NextRequest) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { ordererName: { contains: search, mode: "insensitive" } },
        { ordererEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status as OrderStatus;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate + "T23:59:59.999Z"),
      };
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                },
              },
            },
          },
          payment: true,
          brand: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // 주문 통계
    const stats = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
      _sum: { totalAmount: true },
    });

    const statusStats = {
      total: totalCount,
      pending: stats.find((s) => s.status === "PENDING")?._count.status || 0,
      paid: stats.find((s) => s.status === "PAID")?._count.status || 0,
      shipping: stats.find((s) => s.status === "SHIPPING")?._count.status || 0,
      completed:
        stats.find((s) => s.status === "COMPLETED")?._count.status || 0,
      canceled: stats.find((s) => s.status === "CANCELED")?._count.status || 0,
      failed: stats.find((s) => s.status === "FAILED")?._count.status || 0,
      totalRevenue: stats.reduce(
        (sum, s) => sum + (s._sum.totalAmount || 0),
        0
      ),
    };

    return NextResponse.json({
      orders,
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
    console.error("관리자 주문 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
