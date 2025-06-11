import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface PaymentPrepareRequest {
  amount: number;
  method: string;
  productId: number;
  productTitle: string;
  selectedOption?: string;
}

export async function POST(req: NextRequest) {
  try {
    // 1. 인증 체크
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      console.warn("[API/payment/prepare] 사용자 ID 없음");
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    // 2. 바디 파싱 + 값 검증
    let data: PaymentPrepareRequest;
    try {
      data = await req.json();
    } catch (jsonError) {
      console.error("[API/payment/prepare] req.json() 파싱 에러:", jsonError);
      return NextResponse.json(
        { error: "잘못된 요청 데이터", detail: String(jsonError) },
        { status: 400 }
      );
    }

    const { amount, method, productId, productTitle } = data;

    if (
      typeof amount !== "number" ||
      amount < 1000 ||
      !method ||
      typeof method !== "string" ||
      !productId ||
      !productTitle
    ) {
      console.warn(
        `[API/payment/prepare] 필수 결제 정보 누락 또는 잘못됨, amount: ${amount}, method: ${method}, productId: ${productId}, productTitle: ${productTitle}`
      );
      return NextResponse.json(
        { error: "필수 결제 정보가 누락되었거나 잘못되었습니다." },
        { status: 400 }
      );
    }

    // 3. 중복 결제 방지: 기존 PENDING 결제 존재 시 재사용
    const existing = await prisma.payment.findFirst({
      where: {
        userId,
        amount,
        status: "PENDING",
      },
    });

    if (existing) {
      console.log(
        `[API/payment/prepare] 기존 PENDING 결제(orderId: ${existing.orderId}) 재사용`
      );
      return NextResponse.json({ orderId: existing.orderId });
    }

    // 4. 새 orderId 생성 및 DB 저장
    const orderId = uuidv4();

    try {
      await prisma.payment.create({
        data: {
          userId,
          orderId,
          amount,
          status: "PENDING",
          method,
          productId,
          productTitle,
        },
      });
      console.log(
        `[API/payment/prepare] 결제 사전 생성 성공(orderId: ${orderId})`
      );
      return NextResponse.json({ orderId });
    } catch (dbError) {
      console.error("[API/payment/prepare] DB 저장 에러:", dbError);
      return NextResponse.json(
        { error: "DB 저장 중 오류 발생", detail: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[API/payment/prepare] 알 수 없는 서버 에러:", error);
    return NextResponse.json(
      { error: "서버 오류, 관리자에게 문의하세요.", detail: String(error) },
      { status: 500 }
    );
  }
}

// 결제 실패 처리 API
export async function PUT(req: NextRequest) {
  try {
    const { orderId, failReason } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "주문번호가 필요합니다." },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.update({
      where: { orderId },
      data: {
        status: "FAIL",
        failReason: failReason || "사용자에 의한 취소",
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("[API/payment/prepare] 결제 실패 처리 중 에러:", error);
    return NextResponse.json(
      { error: "결제 실패 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
