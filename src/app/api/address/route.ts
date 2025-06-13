import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 주소 목록 조회
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId가 필요합니다." },
        { status: 400 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: userId,
      },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("주소 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "주소 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 주소 추가
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 필수 필드 검증
    if (
      !data.userId ||
      !data.label ||
      !data.recipient ||
      !data.zipCode ||
      !data.address1 ||
      !data.phone
    ) {
      return NextResponse.json(
        { error: "모든 필수 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 기본 주소로 설정하는 경우, 기존 기본 주소 해제
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 새 주소 생성
    const address = await prisma.address.create({
      data: {
        userId: data.userId,
        label: data.label,
        recipient: data.recipient,
        zipCode: data.zipCode,
        address1: data.address1,
        address2: data.address2 || null,
        phone: data.phone,
        isDefault: data.isDefault || false,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("주소 추가 오류:", error);
    return NextResponse.json(
      { error: "주소 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
