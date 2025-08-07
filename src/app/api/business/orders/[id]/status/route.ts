import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { checkBusinessAuth } from "@/lib/businessAuth";
import { SmsNotificationService, isTestMode } from "@/lib/sms-notifications";

/**
 * @swagger
 * /api/business/orders/{id}/status:
 *   put:
 *     tags:
 *       - Business
 *     summary: 주문 상태 변경
 *     description: 비즈니스 사용자가 주문 상태를 변경합니다. SHIPPING으로 변경 시 고객에게 SMS 발송됩니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *         example: "order_123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PAID, SHIPPING, COMPLETED, CANCELED, FAILED]
 *                 description: 새로운 주문 상태
 *                 example: "SHIPPING"
 *               trackingNumber:
 *                 type: string
 *                 description: 운송장 번호 (SHIPPING 상태일 때)
 *                 example: "1234567890123"
 *               courierCompany:
 *                 type: string
 *                 description: 택배회사명 (SHIPPING 상태일 때)
 *                 example: "CJ대한통운"
 *             required:
 *               - status
 *           example:
 *             status: "SHIPPING"
 *             trackingNumber: "1234567890123"
 *             courierCompany: "CJ대한통운"
 *     responses:
 *       200:
 *         description: 주문 상태 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "order_123"
 *                     previousStatus:
 *                       type: string
 *                       example: "PAID"
 *                     newStatus:
 *                       type: string
 *                       example: "SHIPPING"
 *                     smsStatus:
 *                       type: string
 *                       example: "sent"
 *                 message:
 *                   type: string
 *                   example: "주문 상태가 결제완료에서 배송중으로 변경되었습니다."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 주문을 찾을 수 없음
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
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 비즈니스 사용자 인증 확인
    const [user, errorResponse] = await checkBusinessAuth();
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    const body = await request.json();
    const { status, trackingNumber, courierCompany } = body;

    // 주문 ID 유효성 검사
    if (!orderId) {
      return NextResponse.json(
        { error: "주문 ID는 필수입니다." },
        { status: 400 }
      );
    }

    // 상태 유효성 검사
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PAID",
      "SHIPPING",
      "COMPLETED",
      "CANCELED",
      "FAILED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "유효하지 않은 상태입니다. (PENDING, PAID, SHIPPING, COMPLETED, CANCELED, FAILED)",
        },
        { status: 400 }
      );
    }

    // 기존 주문 조회 (브랜드 소유권 확인)
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: orderId,
        brandId: user!.brandId, // 자신의 브랜드 주문만 변경 가능
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "주문을 찾을 수 없거나 권한이 없습니다." },
        { status: 404 }
      );
    }

    const currentStatus = existingOrder.status;
    const newStatus = status as OrderStatus;

    // 동일한 상태인지 확인
    if (currentStatus === newStatus) {
      return NextResponse.json(
        { error: "이미 동일한 상태입니다." },
        { status: 400 }
      );
    }

    // 상태 변경 규칙 검증
    if (currentStatus === "COMPLETED" || currentStatus === "CANCELED") {
      return NextResponse.json(
        { error: "완료되거나 취소된 주문은 상태를 변경할 수 없습니다." },
        { status: 400 }
      );
    }

    // 배송 상태로 변경 시 운송장번호 필수 체크 (선택적)
    if (newStatus === "SHIPPING" && trackingNumber && !trackingNumber.trim()) {
      return NextResponse.json(
        { error: "배송 시작 시 운송장 번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 주문 상태 업데이트
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(
      `[API/business/orders/status] 주문 상태 변경: ${orderId} - ${currentStatus} → ${newStatus}`
    );

    let smsStatus = "not_sent";

    // 🚀 배송 시작 SMS 발송
    if (newStatus === "SHIPPING" && existingOrder.ordererPhone) {
      try {
        // 상품명 생성
        const productNames = existingOrder.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.product?.title || "상품")
          .join(", ");

        const smsSent = await SmsNotificationService.sendShippingStartedSms({
          customerPhone: existingOrder.ordererPhone,
          customerName: existingOrder.ordererName || "고객",
          orderId: existingOrder.id,
          productName: productNames,
          trackingNumber: trackingNumber || undefined,
          courierCompany: courierCompany || undefined,
          testMode: isTestMode,
        });

        smsStatus = smsSent ? "sent" : "failed";
        console.log(
          `[SMS] 배송 시작 알림 발송 ${smsStatus}: ${existingOrder.ordererPhone}`
        );
      } catch (error) {
        console.error("[SMS] 배송 시작 SMS 발송 실패:", error);
        smsStatus = "error";
      }
    }

    // 🚀 배송 완료 SMS 발송
    if (newStatus === "COMPLETED" && existingOrder.ordererPhone) {
      try {
        // 상품명 생성
        const productNames = existingOrder.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.product?.title || "상품")
          .join(", ");

        const smsSent = await SmsNotificationService.sendDeliveryCompletedSms({
          customerPhone: existingOrder.ordererPhone,
          customerName: existingOrder.ordererName || "고객",
          orderId: existingOrder.id,
          productName: productNames,
          testMode: isTestMode,
        });

        smsStatus = smsSent ? "sent" : "failed";
        console.log(
          `[SMS] 배송 완료 알림 발송 ${smsStatus}: ${existingOrder.ordererPhone}`
        );
      } catch (error) {
        console.error("[SMS] 배송 완료 SMS 발송 실패:", error);
        smsStatus = "error";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatedOrder.id,
        previousStatus: currentStatus,
        newStatus: newStatus,
        smsStatus,
        trackingInfo:
          newStatus === "SHIPPING"
            ? {
                trackingNumber: trackingNumber || null,
                courierCompany: courierCompany || null,
              }
            : undefined,
      },
      message: `주문 상태가 ${getStatusText(currentStatus)}에서 ${getStatusText(
        newStatus
      )}로 변경되었습니다.`,
    });
  } catch (error) {
    console.error("[API/business/orders/status] 주문 상태 변경 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 상태 텍스트 변환 함수
function getStatusText(status: OrderStatus): string {
  const statusMap = {
    PENDING: "대기중",
    PAID: "결제완료",
    SHIPPING: "배송중",
    COMPLETED: "배송완료",
    CANCELED: "취소됨",
    FAILED: "실패",
  };
  return statusMap[status] || status;
}
