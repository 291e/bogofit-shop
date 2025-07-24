import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBusinessAuth } from "@/lib/businessAuth";

export async function GET() {
  try {
    // 공통 인증 체크 (인증 없이 고정 브랜드 사용)
    const [user, errorResponse] = await checkBusinessAuth();
    if (errorResponse) return errorResponse;

    // 현재 날짜 기준 계산
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // 병렬로 통계 데이터 조회
    const [
      totalProductsCount,
      pendingOrdersCount,
      totalOrdersStats,
      monthlyOrdersStats,
      yearlyOrdersStats,
    ] = await Promise.all([
      // 총 상품 수
      prisma.product.count({
        where: {
          brandId: user!.brandId,
          isActive: true,
        },
      }),

      // 대기 중인 주문 수
      prisma.order.count({
        where: {
          brandId: user!.brandId,
          status: "PENDING",
        },
      }),

      // 전체 주문 통계
      prisma.order.aggregate({
        where: {
          brandId: user!.brandId,
          status: {
            in: ["PAID", "SHIPPING", "COMPLETED"],
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      // 이번 달 주문 통계
      prisma.order.aggregate({
        where: {
          brandId: user!.brandId,
          status: {
            in: ["PAID", "SHIPPING", "COMPLETED"],
          },
          createdAt: {
            gte: startOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      // 올해 주문 통계
      prisma.order.aggregate({
        where: {
          brandId: user!.brandId,
          status: {
            in: ["PAID", "SHIPPING", "COMPLETED"],
          },
          createdAt: {
            gte: startOfYear,
          },
        },
        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // 상품별 판매 통계 (상위 5개)
    const topSellingProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          brandId: user!.brandId,
          status: {
            in: ["PAID", "SHIPPING", "COMPLETED"],
          },
        },
      },
      _sum: {
        quantity: true,
        unitPrice: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // 상품 정보 조회
    const productIds = topSellingProducts
      .map((item) => item.productId)
      .filter(Boolean);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds as number[],
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        price: true,
      },
    });

    // 상품 정보와 판매 통계 매핑
    const topProducts = topSellingProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product: product || null,
        totalQuantity: item._sum.quantity || 0,
        totalRevenue: item._sum.unitPrice || 0,
        orderCount: item._count.productId || 0,
      };
    });

    // 통계 데이터 구성
    const stats = {
      // 전체 통계
      totalRevenue: totalOrdersStats._sum.totalAmount || 0,
      totalOrders: totalOrdersStats._count.id || 0,
      totalProducts: totalProductsCount,
      pendingOrders: pendingOrdersCount,

      // 이번 달 통계
      monthlyRevenue: monthlyOrdersStats._sum.totalAmount || 0,
      monthlyOrders: monthlyOrdersStats._count.id || 0,

      // 올해 통계
      yearlyRevenue: yearlyOrdersStats._sum.totalAmount || 0,
      yearlyOrders: yearlyOrdersStats._count.id || 0,

      // 평균 주문 금액
      averageOrderValue:
        totalOrdersStats._count.id > 0
          ? Math.round(
              (totalOrdersStats._sum.totalAmount || 0) /
                totalOrdersStats._count.id
            )
          : 0,

      // 이번 달 평균 주문 금액
      monthlyAverageOrderValue:
        monthlyOrdersStats._count.id > 0
          ? Math.round(
              (monthlyOrdersStats._sum.totalAmount || 0) /
                monthlyOrdersStats._count.id
            )
          : 0,

      // 상위 판매 상품
      topSellingProducts: topProducts,

      // 브랜드 정보
      brand: user!.brand,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("통계 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
