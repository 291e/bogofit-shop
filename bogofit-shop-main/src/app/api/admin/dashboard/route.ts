import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: 관리자 대시보드 통계 조회
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 통계 데이터 반환
 *       401:
 *         description: 인증 실패
 */
// 관리자 대시보드 통계 조회
export async function GET(request: NextRequest) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    // 기본 통계
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalBrands,
      recentUsers,
      recentOrders,
      productStats,
      orderStats,
      brandStats,
      userStats,
    ] = await Promise.all([
      // 총 사용자 수
      prisma.user.count(),

      // 총 상품 수
      prisma.product.count(),

      // 총 주문 수
      prisma.order.count(),

      // 총 브랜드 수
      prisma.brand.count(),

      // 최근 가입 사용자 (7일)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // 최근 주문 (7일)
      prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // 상품 상태별 통계
      prisma.product.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // 주문 상태별 통계
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { totalAmount: true },
      }),

      // 브랜드 상태별 통계
      prisma.brand.groupBy({
        by: ["status"],
        _count: { status: true },
      }),

      // 사용자 유형별 통계
      prisma.user.groupBy({
        by: ["isAdmin", "isBusiness"],
        _count: { id: true },
      }),
    ]);

    // 월별 매출 통계 (최근 12개월)
    const monthlyRevenue = (await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*)::int as order_count,
        SUM("totalAmount")::int as revenue
      FROM "Order"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
        AND "status" IN ('PAID', 'SHIPPING', 'COMPLETED')
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
      LIMIT 12
    `) as Array<{
      month: Date;
      order_count: number;
      revenue: number;
    }>;

    // 인기 상품 TOP 10
    const topProducts = await prisma.product.findMany({
      take: 10,
      orderBy: { totalSold: "desc" },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        price: true,
        totalSold: true,
        totalSales: true,
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    // 최근 리뷰
    const recentReviews = await prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
    });

    return NextResponse.json({
      summary: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalBrands,
        recentUsers,
        recentOrders,
      },
      productStats: {
        pending:
          productStats.find((s) => s.status === "PENDING")?._count.status || 0,
        approved:
          productStats.find((s) => s.status === "APPROVED")?._count.status || 0,
        rejected:
          productStats.find((s) => s.status === "REJECTED")?._count.status || 0,
        draft:
          productStats.find((s) => s.status === "DRAFT")?._count.status || 0,
      },
      orderStats: {
        pending:
          orderStats.find((s) => s.status === "PENDING")?._count.status || 0,
        paid: orderStats.find((s) => s.status === "PAID")?._count.status || 0,
        shipping:
          orderStats.find((s) => s.status === "SHIPPING")?._count.status || 0,
        completed:
          orderStats.find((s) => s.status === "COMPLETED")?._count.status || 0,
        canceled:
          orderStats.find((s) => s.status === "CANCELED")?._count.status || 0,
        failed:
          orderStats.find((s) => s.status === "FAILED")?._count.status || 0,
        totalRevenue: orderStats.reduce(
          (sum, s) => sum + (s._sum.totalAmount || 0),
          0
        ),
      },
      brandStats: {
        pending:
          brandStats.find((s) => s.status === "PENDING")?._count.status || 0,
        approved:
          brandStats.find((s) => s.status === "APPROVED")?._count.status || 0,
        rejected:
          brandStats.find((s) => s.status === "REJECTED")?._count.status || 0,
        suspended:
          brandStats.find((s) => s.status === "SUSPENDED")?._count.status || 0,
      },
      userStats: {
        regular:
          userStats.find((s) => !s.isAdmin && !s.isBusiness)?._count.id || 0,
        business:
          userStats.find((s) => s.isBusiness && !s.isAdmin)?._count.id || 0,
        admin: userStats.find((s) => s.isAdmin)?._count.id || 0,
      },
      monthlyRevenue,
      topProducts,
      recentReviews,
    });
  } catch (error) {
    console.error("관리자 대시보드 통계 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
