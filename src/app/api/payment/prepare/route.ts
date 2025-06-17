import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

interface PaymentPrepareRequest {
  amount: number;
  method: string;
  productId: number;
  productTitle: string;
  selectedOption?: string;
  quantity?: number;
  variantId?: number;
  orderInfo?: {
    ordererName: string;
    ordererPhone: string;
    ordererEmail: string;
    recipientName: string;
    recipientPhone: string;
    address: string;
    addressDetail: string;
    zipCode: string;
    deliveryRequest: string;
    customsInfo: {
      recipientNameEn: string;
      personalCustomsCode: string;
    };
  };
  // 기존 필드들도 호환성을 위해 유지
  ordererName?: string;
  ordererEmail?: string;
  ordererPhone?: string;
  ordererTel?: string;
  recipientName?: string;
  recipientPhone?: string;
  recipientTel?: string;
  zipCode?: string;
  address1?: string;
  address2?: string;
  customsId?: string;
  agreePrivacy?: boolean;
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

    const {
      amount,
      method,
      productId,
      productTitle,
      quantity = 1,
      variantId,
      orderInfo,
      ordererName,
      ordererEmail,
      ordererPhone,
      ordererTel,
      recipientName,
      recipientPhone,
      recipientTel,
      zipCode,
      address1,
      address2,
      customsId,
      agreePrivacy,
    } = data;

    // orderInfo가 있으면 우선 사용, 없으면 기존 필드 사용
    const finalOrdererName = orderInfo?.ordererName || ordererName;
    const finalOrdererEmail = orderInfo?.ordererEmail || ordererEmail;
    const finalOrdererPhone = orderInfo?.ordererPhone || ordererPhone;
    const finalRecipientName = orderInfo?.recipientName || recipientName;
    const finalRecipientPhone = orderInfo?.recipientPhone || recipientPhone;
    const finalZipCode = orderInfo?.zipCode || zipCode;
    const finalAddress1 = orderInfo?.address || address1;
    const finalAddress2 = orderInfo?.addressDetail || address2;
    const finalCustomsId =
      orderInfo?.customsInfo?.personalCustomsCode || customsId;

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

    // 3. 중복 결제 방지: 더 정확한 조건으로 수정 (productId와 amount 모두 체크)
    const existing = await prisma.payment.findFirst({
      where: {
        userId,
        amount,
        status: "PENDING",
        order: {
          items: {
            some: {
              productId: productId,
            },
          },
        },
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (existing) {
      console.log(
        `[API/payment/prepare] 기존 PENDING 결제(orderId: ${existing.orderId}) 재사용`
      );
      return NextResponse.json({ orderId: existing.orderId });
    }

    // 4. 새 orderId 생성 및 Order, Payment 생성
    const orderId = uuidv4();
    const orderNumber = `${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "")}-${Math.random()
      .toString(36)
      .substr(2, 4)
      .toUpperCase()}`;

    try {
      // 트랜잭션으로 Order와 Payment 동시 생성
      await prisma.$transaction(async (tx) => {
        // Order 생성 (주문자/배송지/통관/동의 정보 포함)
        const order = await tx.order.create({
          data: {
            id: orderId,
            userId,
            orderNumber,
            status: "PENDING",
            totalAmount: amount,
            ordererName: finalOrdererName,
            ordererEmail: finalOrdererEmail,
            ordererPhone: finalOrdererPhone,
            ordererTel,
            recipientName: finalRecipientName,
            recipientPhone: finalRecipientPhone,
            recipientTel,
            zipCode: finalZipCode,
            address1: finalAddress1,
            address2: finalAddress2,
            customsId: finalCustomsId,
            agreePrivacy,
          },
        });

        // OrderItem 생성 (variantId가 있는 경우)
        if (variantId) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variantId,
              productId,
              quantity,
              unitPrice: Math.floor(amount / quantity),
            },
          });
        } else {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              productId,
              quantity,
              unitPrice: Math.floor(amount / quantity),
            },
          });
        }

        // Payment 생성
        const payment = await tx.payment.create({
          data: {
            userId,
            orderId: order.id,
            amount,
            status: "PENDING",
            method,
          },
        });

        return { order, payment };
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

    // Payment와 Order 모두 실패 상태로 업데이트
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId },
        data: {
          status: "FAILED",
          failReason: failReason || "사용자에 의한 취소",
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API/payment/prepare] 결제 실패 처리 중 에러:", error);
    return NextResponse.json(
      { error: "결제 실패 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
