import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, OrderStatus } from "@prisma/client";
import { checkHeaderBusinessAuth } from "@/lib/businessAuth";

export async function GET(request: NextRequest) {
  try {
    // 헤더 기반 사용자 인증
    const [user, errorResponse] = await checkHeaderBusinessAuth(request);
    if (errorResponse) return errorResponse;

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.OrderWhereInput = {
      brandId: user!.brandId,
    };

    if (status && status !== "ALL") {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { ordererName: { contains: search, mode: "insensitive" } },
        { ordererEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // 주문 목록 조회
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  imageUrl: true,
                  price: true,
                  category: true,
                },
              },
              variant: {
                select: {
                  id: true,
                  optionName: true,
                  optionValue: true,
                  priceDiff: true,
                },
              },
            },
          },
          payment: {
            select: {
              id: true,
              amount: true,
              status: true,
              method: true,
              paymentKey: true,
              approvedAt: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // 주문 통계 계산
    const stats = await prisma.order.groupBy({
      by: ["status"],
      where: { brandId: user!.brandId },
      _count: { status: true },
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
    };

    // 응답 데이터 변환
    const formattedOrders = orders.map((order) => {
      // 대표 상품 정보 (첫 번째 아이템)
      const firstItem = order.items[0];
      const representativeProduct = firstItem?.product;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        totalCommission: order.totalCommission,
        settlementStatus: order.settlementStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        // 주문자 정보
        orderer: {
          name: order.ordererName,
          email: order.ordererEmail,
          phone: order.ordererPhone,
          tel: order.ordererTel,
        },

        // 배송지 정보
        shipping: {
          recipientName: order.recipientName,
          recipientPhone: order.recipientPhone,
          recipientTel: order.recipientTel,
          zipCode: order.zipCode,
          address1: order.address1,
          address2: order.address2,
        },

        // 통관 정보
        customsId: order.customsId,
        isGuestOrder: order.isGuestOrder,

        // 대표 상품 정보
        representativeProduct: representativeProduct
          ? {
              id: representativeProduct.id,
              title: representativeProduct.title,
              imageUrl: representativeProduct.imageUrl,
              price: representativeProduct.price,
              category: representativeProduct.category,
            }
          : null,

        // 주문 아이템 수
        itemCount: order.items.length,
        totalQuantity: order.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),

        // 결제 정보
        payment: order.payment,

        // 브랜드 정보
        brand: order.brand,

        // 전체 아이템 정보 (상세 조회 시 사용)
        items: order.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          product: item.product,
          variant: item.variant,
        })),
      };
    });

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats: statusStats,
      brand: user!.brand,
    });
  } catch (error) {
    console.error("주문 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
