import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 대표 상품 정보 추출
    const result = payments.map((payment) => {
      const items = payment.order?.items || [];
      const firstItem = items[0];
      return {
        id: payment.id,
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
        approvedAt: payment.approvedAt,
        // 대표 상품 정보
        product: firstItem
          ? {
              id: firstItem.product?.id,
              title: firstItem.product?.title,
              imageUrl: firstItem.product?.imageUrl,
            }
          : null,
        productCount: items.length,
        // 주문자 정보
        orderer: payment.order
          ? {
              name: payment.order.ordererName,
              email: payment.order.ordererEmail,
              phone: payment.order.ordererPhone,
              tel: payment.order.ordererTel,
            }
          : null,
        // 배송지 정보
        shipping: payment.order
          ? {
              recipientName: payment.order.recipientName,
              recipientPhone: payment.order.recipientPhone,
              recipientTel: payment.order.recipientTel,
              zipCode: payment.order.zipCode,
              address1: payment.order.address1,
              address2: payment.order.address2,
            }
          : null,
        // 통관 정보
        customsId: payment.order?.customsId,
      };
    });

    return NextResponse.json({ payments: result });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { error: "결제 내역을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
