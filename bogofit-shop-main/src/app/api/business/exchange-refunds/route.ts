import { NextRequest, NextResponse } from "next/server";
import {
  PrismaClient,
  Prisma,
  ExchangeRefundStatus,
  ExchangeRefundType,
} from "@prisma/client";

const prisma = new PrismaClient();

// 교환/반품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const whereClause: Prisma.ExchangeRefundWhereInput = {};

    // 상태 필터
    if (status && status !== "all") {
      whereClause.status = status.toUpperCase() as ExchangeRefundStatus;
    }

    // 타입 필터
    if (type && type !== "all") {
      whereClause.type = type.toUpperCase() as ExchangeRefundType;
    }

    // 검색 조건
    if (search) {
      whereClause.OR = [
        {
          order: {
            is: { orderNumber: { contains: search, mode: "insensitive" } },
          },
        },
        { applicantName: { contains: search, mode: "insensitive" } },
      ];
    }

    const exchangeRefunds = await prisma.exchangeRefund.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: exchangeRefunds,
    });
  } catch (error) {
    console.error("[교환/반품 목록 조회 오류]", error);
    return NextResponse.json(
      { error: "교환/반품 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 교환/반품 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, adminNotes, processedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "ID와 상태는 필수입니다." },
        { status: 400 }
      );
    }

    const updatedExchangeRefund = await prisma.exchangeRefund.update({
      where: { id },
      data: {
        status: status.toUpperCase(),
        adminNotes: adminNotes || null,
        processedBy: processedBy || null,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        order: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "교환/반품 상태가 업데이트되었습니다.",
      data: updatedExchangeRefund,
    });
  } catch (error) {
    console.error("[교환/반품 상태 업데이트 오류]", error);
    return NextResponse.json(
      { error: "교환/반품 상태 업데이트 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
