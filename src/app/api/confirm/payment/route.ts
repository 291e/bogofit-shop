import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SmsNotificationService, isTestMode } from "@/lib/sms-notifications";

const apiSecretKey = process.env.TOSS_SECRET_KEY;
const encryptedApiSecretKey =
  "Basic " + Buffer.from(apiSecretKey + ":").toString("base64");

/**
 * @swagger
 * /api/confirm/payment:
 *   post:
 *     tags:
 *       - Payment
 *     summary: 결제 확인
 *     description: Toss Payments API를 통해 결제를 확인하고 주문 상태를 업데이트합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentKey
 *               - orderId
 *               - amount
 *             properties:
 *               paymentKey:
 *                 type: string
 *                 description: Toss Payments 결제 키
 *                 example: "payment_12345"
 *               orderId:
 *                 type: string
 *                 description: 주문 ID
 *                 example: "order_67890"
 *               amount:
 *                 type: number
 *                 description: 결제 금액
 *                 example: 50000
 *     responses:
 *       200:
 *         description: 결제 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Toss Payments API 응답 데이터
 *       400:
 *         description: 결제 실패
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "결제 처리 중 오류가 발생했습니다."
 *                 code:
 *                   type: string
 *                   example: "PAYMENT_FAILED"
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "서버 오류가 발생했습니다."
 *                 code:
 *                   type: string
 *                   example: "INTERNAL_SERVER_ERROR"
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("API 요청 데이터:", body);

    const { paymentKey, orderId, amount } = body;

    const response = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: encryptedApiSecretKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentKey,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Toss Payments API Error:", errorData);

      // 결제 실패 시 Payment와 Order 모두 FAILED로 업데이트
      const failedOrderData = await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: { status: "FAILED" },
        });

        const failedOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: "FAILED" },
        });

        return failedOrder;
      });

      // 🚀 결제 실패 SMS 발송 (비동기)
      if (failedOrderData.ordererPhone) {
        SmsNotificationService.sendPaymentFailedSms({
          customerPhone: failedOrderData.ordererPhone,
          customerName: failedOrderData.ordererName || "고객",
          orderId: failedOrderData.id,
          testMode: isTestMode,
        }).catch((error) => {
          console.error("[SMS] 결제 실패 SMS 발송 실패:", error);
        });
      }

      return NextResponse.json(
        {
          error: true,
          message: errorData.message || "결제 처리 중 오류가 발생했습니다.",
          code: errorData.code,
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Toss Payments API Success Response:", result);

    // 결제 성공 시 Payment와 Order 모두 COMPLETED로 업데이트
    const orderData = await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "COMPLETED",
          paymentKey,
          approvedAt: new Date(),
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return updatedOrder;
    });

    // 🚀 결제 완료 SMS 발송 (비동기, 실패해도 결제는 성공)
    if (orderData.ordererPhone) {
      const productNames = orderData.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.product?.title || "상품")
        .join(", ");

      // 고객에게 주문 완료 SMS 발송
      SmsNotificationService.sendOrderCompletedSms({
        customerPhone: orderData.ordererPhone,
        customerName: orderData.ordererName || "고객",
        orderId: orderData.id,
        amount: result.totalAmount || orderData.totalAmount,
        productName: productNames,
        orderDate: new Date().toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        recipientName:
          orderData.recipientName || orderData.ordererName || "수령인",
        address: `${orderData.address1} ${orderData.address2 || ""}`.trim(),
        testMode: isTestMode,
      }).catch((error) => {
        console.error("[SMS] 주문 완료 SMS 발송 실패:", error);
      });

      // 비즈니스 사용자에게 새 주문 알림 (설정된 경우)
      const businessPhone = process.env.BUSINESS_NOTIFICATION_PHONE;
      if (businessPhone) {
        SmsNotificationService.sendBusinessOrderNotification({
          businessPhone,
          orderId: orderData.id,
          productName: productNames,
          amount: result.totalAmount || orderData.totalAmount,
          customerName: orderData.ordererName || "고객",
          testMode: isTestMode,
        }).catch((error) => {
          console.error("[SMS] 비즈니스 주문 알림 SMS 발송 실패:", error);
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      {
        error: true,
        message: "서버 오류가 발생했습니다.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
