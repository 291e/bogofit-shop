import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // 교환/반품 상태 조회
    const exchangeRefund = await prisma.exchangeRefund.findFirst({
      where: { orderId },
      orderBy: { createdAt: "desc" }, // 최신 신청 건
    });

    if (!exchangeRefund) {
      return NextResponse.json({
        status: "none",
        data: null,
      });
    }

    // 상태 매핑
    const statusMap = {
      PENDING: "pending",
      REVIEWING: "pending",
      APPROVED: "pending",
      PROCESSING: "pending",
      COMPLETED: "completed",
      REJECTED: "none",
    };

    return NextResponse.json({
      status: statusMap[exchangeRefund.status] || "none",
      data: {
        id: exchangeRefund.id,
        type: exchangeRefund.type,
        status: exchangeRefund.status,
        reason: exchangeRefund.reason,
        createdAt: exchangeRefund.createdAt,
        processedAt: exchangeRefund.processedAt,
      },
    });
  } catch (error) {
    console.error("[교환/반품 상태 조회 오류]", error);
    return NextResponse.json(
      { error: "교환/반품 상태 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
