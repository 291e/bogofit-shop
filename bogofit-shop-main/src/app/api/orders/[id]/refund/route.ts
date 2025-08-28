import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { SmsNotificationService, isTestMode } from "@/lib/sms-notifications";
import { sendEmail } from "@/lib/resend";
import { generateExchangeRefundEmail } from "@/lib/email-templates";

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
    const {
      reason = "고객 변심",
      description = "",
      applicantName = "",
      applicantPhone = "",
      applicantEmail = "",
      requestType = "refund" as "exchange" | "refund",
    } = body;

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

    // 기간 제한 확인 (교환/반품과 환불 구분)
    const now = new Date();
    // completedAt 필드가 스키마에 없는 경우 updatedAt 사용
    const completedAt = order.updatedAt; // order.completedAt || order.updatedAt;
    const daysDiff =
      (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (requestType === "refund") {
      // 환불: 배송 완료 후 7일 이내
      if (daysDiff > 7) {
        return NextResponse.json(
          { error: "배송 완료 후 7일이 지나 환불 신청할 수 없습니다." },
          { status: 400 }
        );
      }
    } else {
      // 교환/반품: 배송 완료 후 30일 이내
      if (daysDiff > 30) {
        return NextResponse.json(
          { error: "배송 완료 후 30일이 지나 교환/반품 신청할 수 없습니다." },
          { status: 400 }
        );
      }
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

    // 교환/반품 신청 생성
    await prisma.exchangeRefund.create({
      data: {
        orderId: orderId,
        type: requestType === "exchange" ? "EXCHANGE" : "REFUND",
        status: "PENDING",
        applicantName,
        applicantPhone,
        applicantEmail: applicantEmail || null,
        reason,
        description: description || null,
      },
    });

    // 주문 상태를 업데이트
    await prisma.order.update({
      where: { id: orderId },
      data: {
        updatedAt: now,
      },
    });

    const refundId = `refund_${orderId}_${Date.now()}`;
    console.log(
      `[교환/반품 신청] 주문 ID: ${orderId}, 환불 ID: ${refundId}, 사용자: ${userIdHeader}, 사유: ${reason}, 설명: ${description}`
    );

    // 🚀 교환/반품 신청 이메일 발송 (비동기, 실패해도 신청은 성공)
    const productNames = order.items
      .map((item) => item.product?.title || "상품")
      .join(", ");

    if (applicantName && applicantPhone) {
      try {
        const appUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const emailHtml = await generateExchangeRefundEmail({
          userName: applicantName,
          appUrl,
          orderId,
          productTitle: productNames,
          amount: order.totalAmount,
          orderDate: order.createdAt.toISOString().slice(0, 10),
          applicantName,
          applicantPhone,
          applicantEmail: applicantEmail || "",
          requestType,
          reason,
          description,
        });

        const requestTypeText = requestType === "exchange" ? "교환" : "반품";

        // 관리자에게 이메일 발송
        await sendEmail({
          to: ["bogofit@naver.com"],
          subject: `[${requestTypeText} 신청] 주문번호: ${orderId}`,
          html: emailHtml,
        });

        // 신청자에게도 복사본 발송 (이메일이 있는 경우)
        if (applicantEmail) {
          await sendEmail({
            to: [applicantEmail],
            subject: `[${requestTypeText} 신청 접수] 주문번호: ${orderId}`,
            html: emailHtml,
          });
        }

        console.log(`✅ 교환/반품 신청 이메일 전송 완료: ${orderId}`);
      } catch (emailError) {
        console.error("[이메일] 교환/반품 신청 이메일 발송 실패:", emailError);
      }
    }

    // 🚀 환불 신청 SMS 발송 (비동기, 실패해도 환불 신청은 성공)
    if (order.ordererPhone) {
      const productNames = order.items
        .map((item) => item.product?.title || "상품")
        .join(", ");

      // 고객에게 환불/교환/반품 신청 SMS 발송
      if (requestType === "refund") {
        SmsNotificationService.sendRefundRequestedSms({
          customerPhone: order.ordererPhone,
          customerName: order.ordererName || "고객",
          orderId: orderId,
          productName: productNames,
          amount: order.totalAmount,
          refundDate: new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          reason: reason,
          testMode: isTestMode,
        }).catch((error) => {
          console.error("[SMS] 환불 신청 SMS 발송 실패:", error);
        });
      } else {
        SmsNotificationService.sendExchangeRefundRequestedSms({
          customerPhone: order.ordererPhone,
          customerName: order.ordererName || "고객",
          orderId: orderId,
          productName: productNames,
          amount: order.totalAmount,
          requestDate: new Date().toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          requestType: requestType,
          reason: reason,
          testMode: isTestMode,
        }).catch((error) => {
          console.error("[SMS] 교환/반품 신청 SMS 발송 실패:", error);
        });
      }

      // 비즈니스 사용자에게 환불 신청 알림 (설정된 경우)
      const businessPhone = process.env.BUSINESS_NOTIFICATION_PHONE;
      if (businessPhone) {
        SmsNotificationService.sendSms(
          businessPhone,
          `[BogoFit] ${requestType === "refund" ? "환불" : "교환/반품"} 신청이 접수되었습니다.\n` +
            `주문번호: ${orderId}\n` +
            `상품: ${productNames}\n` +
            `금액: ${order.totalAmount.toLocaleString()}원\n` +
            `신청자: ${applicantName}\n` +
            `연락처: ${applicantPhone}\n` +
            `사유: ${reason}\n` +
            `처리해주세요.`,
          {
            testMode: isTestMode,
            title: `${requestType === "refund" ? "환불" : "교환/반품"} 신청 알림`,
          }
        ).catch((error) => {
          console.error("[SMS] 비즈니스 환불 신청 알림 SMS 발송 실패:", error);
        });
      }
    }

    // 신청자에게도 SMS 발송 (신청자 연락처가 주문자와 다른 경우)
    if (applicantPhone && applicantPhone !== order.ordererPhone) {
      const productNames = order.items
        .map((item) => item.product?.title || "상품")
        .join(", ");

      SmsNotificationService.sendSms(
        applicantPhone,
        `[BogoFit] ${requestType === "refund" ? "환불" : "교환/반품"} 신청이 접수되었습니다.\n` +
          `주문번호: ${orderId}\n` +
          `상품: ${productNames}\n` +
          `신청자: ${applicantName}\n` +
          `사유: ${reason}\n` +
          `영업일 기준 3-5일 내 처리됩니다.`,
        {
          testMode: isTestMode,
          title: `${requestType === "refund" ? "환불" : "교환/반품"} 신청 접수`,
        }
      ).catch((error) => {
        console.error("[SMS] 신청자 알림 SMS 발송 실패:", error);
      });
    }

    const requestTypeText = requestType === "exchange" ? "교환" : "반품";
    return NextResponse.json({
      success: true,
      message: `${requestTypeText} 신청이 접수되었습니다. 영업일 기준 3-5일 내 처리됩니다.`,
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
