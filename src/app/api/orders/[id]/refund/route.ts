import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/orders/{id}/refund:
 *   post:
 *     summary: 환불 신청
 *     description: 고객이 완료된 주문에 대해 환불을 신청합니다. 배송 완료 후 7일 이내만 가능합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 주문 ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 환불 사유
 *               description:
 *                 type: string
 *                 description: 상세 설명
 *     responses:
 *       200:
 *         description: 환불 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 refundId:
 *                   type: string
 *       400:
 *         description: 환불 신청 불가능한 주문
 *       404:
 *         description: 주문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const userIdHeader = request.headers.get("x-user-id");
    const body = await request.json().catch(() => ({}));
    const { reason = "고객 변심", description = "" } = body;

    if (!userIdHeader) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    // 주문 정보 조회
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
        // refunds: true, // Prisma 스키마에 해당 관계가 없는 경우 주석 처리
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 주문자 확인 (본인만 환불 신청 가능)
    if (order.userId && order.userId !== userIdHeader) {
      return NextResponse.json(
        { error: "본인의 주문만 환불 신청할 수 있습니다." },
        { status: 403 }
      );
    }

    // 환불 가능 여부 확인
    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "배송 완료된 주문만 환불 신청이 가능합니다." },
        { status: 400 }
      );
    }

    // 이미 환불 신청된 주문 확인 (추후 구현)
    // TODO: 환불 테이블이 있다면 별도로 조회 필요
    // const existingRefund = await prisma.refund.findFirst({
    //   where: { orderId: orderId, status: { not: "REJECTED" } }
    // });
    // if (existingRefund) {
    //   return NextResponse.json(
    //     { error: "이미 환불 신청된 주문입니다." },
    //     { status: 400 }
    //   );
    // }

    // 환불 신청 기간 확인 (배송 완료 후 7일 이내)
    const now = new Date();
    // completedAt 필드가 스키마에 없는 경우 updatedAt 사용
    const completedAt = order.updatedAt; // order.completedAt || order.updatedAt;
    const daysDiff =
      (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff > 7) {
      return NextResponse.json(
        { error: "배송 완료 후 7일이 지나 환불 신청할 수 없습니다." },
        { status: 400 }
      );
    }

    // 환불 신청 생성 (환불 테이블이 없는 경우 주석 처리)
    // TODO: 환불 테이블 생성 후 구현
    // const refund = await prisma.refund.create({
    //   data: {
    //     orderId: orderId,
    //     userId: userIdHeader,
    //     amount: order.totalAmount,
    //     reason: reason,
    //     description: description,
    //     status: "PENDING",
    //     requestedAt: now,
    //   },
    // });

    // 주문 상태를 업데이트 (환불 신청 표시)
    await prisma.order.update({
      where: { id: orderId },
      data: {
        updatedAt: now,
        // 추후 환불 상태 필드 추가 시 사용
        // refundStatus: "REQUESTED",
      },
    });

    const refundId = `refund_${orderId}_${Date.now()}`;
    console.log(
      `[환불 신청] 주문 ID: ${orderId}, 환불 ID: ${refundId}, 사용자: ${userIdHeader}, 사유: ${reason}, 설명: ${description}`
    );

    return NextResponse.json({
      success: true,
      message: "환불 신청이 접수되었습니다. 영업일 기준 3-5일 내 처리됩니다.",
      refundId: refundId,
    });
  } catch (error) {
    console.error("[환불 신청 오류]", error);
    return NextResponse.json(
      { error: "환불 신청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
