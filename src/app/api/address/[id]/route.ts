import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 주소 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

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
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 주소 업데이트
    const address = await prisma.address.update({
      where: { id },
      data: {
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
    console.error("주소 수정 오류:", error);
    return NextResponse.json(
      { error: "주소 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 주소 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("주소 삭제 오류:", error);
    return NextResponse.json(
      { error: "주소 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
