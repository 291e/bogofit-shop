import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/payment/history:
 *   get:
 *     tags:
 *       - Orders
 *     summary: 결제 이력 조회
 *     description: 사용자의 결제 이력을 조회합니다.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 결제 이력 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 결제 ID
 *                   amount:
 *                     type: number
 *                     description: 결제 금액
 *                   status:
 *                     type: string
 *                     description: 결제 상태
 *                   method:
 *                     type: string
 *                     description: 결제 방법
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: 결제 일시
 *                   order:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
                  include: {
                    brand: {
                      select: {
                        id: true,
                        name: true,
                        slug: true,
                        logo: true,
                      },
                    },
                  },
                },
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
        // 주문 정보
        order: payment.order
          ? {
              status: payment.order.status,
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
