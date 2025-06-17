import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// userId는 반드시 User의 id(uuid)로만 사용해야 합니다.
// 프론트엔드에서도 user.id만 전달해야 하며, user.userId(로그인용)는 절대 사용하지 마세요.

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

    // userId는 반드시 User의 id(uuid)
    const addresses = await prisma.address.findMany({
      where: {
        userId: userId, // userId는 User.id(uuid)
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

    // userId가 실제 User 테이블에 존재하는지 확인 (id로 조회)

    const existingUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다. 다시 로그인해주세요." },
        { status: 400 }
      );
    }

    // 새 주소 생성
    const address = await prisma.address.create({
      data: {
        userId: data.userId, // 반드시 User.id(uuid)
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
