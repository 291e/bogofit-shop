import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const apiSecretKey = process.env.TOSS_SECRET_KEY;
const encryptedApiSecretKey =
  "Basic " + Buffer.from(apiSecretKey + ":").toString("base64");

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
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { orderId },
          data: { status: "FAILED" },
        });

        await tx.order.update({
          where: { id: orderId },
          data: { status: "FAILED" },
        });
      });

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
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "COMPLETED",
          paymentKey,
          approvedAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "COMPLETED" },
      });
    });

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
