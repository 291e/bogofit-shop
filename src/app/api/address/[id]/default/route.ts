import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 기본 배송지 설정
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

    // 해당 주소 조회
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return NextResponse.json(
        { error: "존재하지 않는 주소입니다." },
        { status: 404 }
      );
    }

    // 기존 기본 주소 해제
    await prisma.address.updateMany({
      where: {
        userId: address.userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // 새 기본 주소 설정
    await prisma.address.update({
      where: { id },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("기본 주소 설정 오류:", error);
    return NextResponse.json(
      { error: "기본 주소 설정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
