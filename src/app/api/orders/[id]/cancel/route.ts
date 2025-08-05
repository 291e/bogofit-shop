import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/orders/{id}/cancel:
 *   post:
 *     tags:
 *       - Orders
 *     summary: 주문 취소
 *     description: 고객이 자신의 주문을 취소합니다. 결제가 완료된 경우 Toss Payments API를 통해 결제도 취소됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주문 ID
 *         example: "order_12345"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 취소 사유
 *                 example: "고객 변심"
 *     responses:
 *       200:
 *         description: 주문 취소 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "주문이 성공적으로 취소되었습니다."
 *                 orderId:
 *                   type: string
 *                   example: "order_12345"
 *                 paymentCanceled:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 잘못된 요청
 *       403:
 *         description: 권한 없음
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
        payment: true, // 결제 정보 포함
      },
    });

    if (!order) {
      console.log("[주문 없음]", { orderId, userIdHeader });
      return NextResponse.json(
        { error: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 주문자 확인 (본인만 취소 가능)
    if (order.userId && order.userId !== userIdHeader) {
      console.log("[권한 없음]", {
        orderId,
        orderUserId: order.userId,
        requestUserId: userIdHeader,
      });
      return NextResponse.json(
        { error: "본인의 주문만 취소할 수 있습니다." },
        { status: 403 }
      );
    }

    // 비회원 주문의 경우 ordererPhone으로 확인 (추가 구현 필요)
    // 현재는 로그인된 사용자만 처리

    // 취소 가능 여부 확인
    const now = new Date();
    const orderDate = new Date(order.createdAt);
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    // 이미 취소되었거나 완료된 주문 확인
    if (order.status === "CANCELED") {
      return NextResponse.json(
        { error: "이미 취소된 주문입니다." },
        { status: 400 }
      );
    }

    // COMPLETED 상태에서도 취소 가능하도록 수정 (사용자 요구사항)
    // if (order.status === "COMPLETED") {
    //   return NextResponse.json(
    //     {
    //       error:
    //         "배송 완료된 주문은 취소할 수 없습니다. 환불 신청을 이용해주세요.",
    //     },
    //     { status: 400 }
    //   );
    // }

    // 24시간 초과 확인 (PENDING, PAID는 24시간 내 취소 가능)
    if (hoursDiff > 24 && !["PENDING", "PAID"].includes(order.status)) {
      return NextResponse.json(
        { error: "주문 후 24시간이 지나 취소할 수 없습니다." },
        { status: 400 }
      );
    }

    // 결제 정보 확인 및 로깅
    console.log("[주문 취소 요청] 결제 정보:", {
      orderId,
      paymentId: order.payment?.id,
      paymentKey: order.payment?.paymentKey,
      paymentStatus: order.payment?.status,
      orderStatus: order.status,
    });

    // 결제가 이미 취소되었는지 확인
    if (order.payment?.status === "CANCELED") {
      console.log("[결제 이미 취소됨]", {
        orderId,
        paymentKey: order.payment.paymentKey,
      });
      return NextResponse.json(
        { error: "이미 취소된 결제입니다." },
        { status: 400 }
      );
    }

    // 토스페이먼츠 결제 취소 처리 (주문 상태 변경 전에 실행)
    let cancelResult = null;
    if (order.payment?.paymentKey) {
      try {
        const tossApiKey = process.env.TOSS_SECRET_KEY;
        if (!tossApiKey) {
          console.error("TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다.");
          return NextResponse.json(
            {
              error:
                "결제 취소 설정이 올바르지 않습니다. 고객센터에 문의해주세요.",
            },
            { status: 500 }
          );
        }

        console.log("[토스페이먼츠 취소 요청]", {
          orderId,
          paymentKey: order.payment.paymentKey,
          apiKeyPresent: !!tossApiKey,
          apiKeyPrefix: tossApiKey
            ? tossApiKey.substring(0, 8) + "..."
            : "없음",
          isTestKey: tossApiKey?.startsWith("test_"),
          cancelAmount: order.totalAmount,
        });

        // 토스페이먼츠 결제 취소 API 호출
        const tossResponse = await fetch(
          `https://api.tosspayments.com/v1/payments/${order.payment.paymentKey}/cancel`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(tossApiKey + ":").toString("base64")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cancelReason: "고객 요청에 의한 주문 취소",
              // 전액 취소인 경우 cancelAmount를 생략하거나 전체 금액을 지정
              ...(order.totalAmount && { cancelAmount: order.totalAmount }),
            }),
          }
        );

        if (tossResponse.ok) {
          cancelResult = await tossResponse.json();
          console.log("[토스페이먼츠 취소 성공]", {
            orderId,
            paymentKey: order.payment.paymentKey,
            status: cancelResult.status,
          });
        } else {
          const errorData = await tossResponse.json();
          console.error("[토스페이먼츠 취소 실패]", {
            status: tossResponse.status,
            statusText: tossResponse.statusText,
            headers: Object.fromEntries(tossResponse.headers.entries()),
            errorData,
            orderId,
            paymentKey: order.payment.paymentKey,
          });

          // 토스페이먼츠 에러 코드별 메시지 처리
          let userMessage =
            "결제 취소에 실패했습니다. 고객센터에 문의해주세요.";

          switch (errorData.code) {
            case "FORBIDDEN_REQUEST":
              userMessage =
                "결제 취소 권한이 없습니다. API 키 설정을 확인해주세요.";
              break;
            case "NOT_FOUND_PAYMENT":
              userMessage = "결제 정보를 찾을 수 없습니다.";
              break;
            case "ALREADY_CANCELED_PAYMENT":
              userMessage = "이미 취소된 결제입니다.";
              break;
            case "PROVIDER_ERROR":
              userMessage =
                "결제 서비스 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
              break;
            default:
              userMessage = `결제 취소에 실패했습니다: ${errorData.message || "알 수 없는 오류"}`;
          }

          return NextResponse.json(
            {
              error: userMessage,
              code: errorData.code,
              details: errorData,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("[토스페이먼츠 API 호출 오류]", error);
        return NextResponse.json(
          {
            error:
              "결제 취소 처리 중 오류가 발생했습니다. 고객센터에 문의해주세요.",
          },
          { status: 500 }
        );
      }
    }

    // 토스페이먼츠 취소 성공 시 주문 및 결제 상태 업데이트
    if (cancelResult || !order.payment?.paymentKey) {
      const updateTime = new Date();

      // 주문 상태를 CANCELED로 변경
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELED",
          updatedAt: updateTime,
          // canceledAt: updateTime, // Prisma 스키마에 해당 필드가 없는 경우 주석 처리
          // cancelReason: "고객 요청", // Prisma 스키마에 해당 필드가 없는 경우 주석 처리
        },
      });

      // 결제 정보 업데이트 (결제 정보가 있는 경우)
      if (order.payment) {
        await prisma.payment.update({
          where: { id: order.payment.id },
          data: {
            status: "CANCELED",
            updatedAt: updateTime,
          },
        });
      }
    }

    console.log(
      `[주문 취소] 주문 ID: ${orderId}, 사용자: ${userIdHeader}, 결제 취소: ${!!cancelResult}`
    );

    return NextResponse.json({
      success: true,
      message: cancelResult
        ? "주문이 성공적으로 취소되었습니다. 결제 금액은 영업일 기준 3-5일 내 환불됩니다."
        : "주문이 취소되었습니다.",
      orderId: orderId,
      paymentCanceled: !!cancelResult,
    });
  } catch (error) {
    console.error("[주문 취소 오류]", error);
    return NextResponse.json(
      { error: "주문 취소 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
