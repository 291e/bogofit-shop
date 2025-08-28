import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

// 개별 사용자 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brand: true,
        addresses: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            carts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("사용자 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 사용자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();

    const { name, email, phoneNumber, isAdmin, isBusiness } = body;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 자기 자신의 관리자 권한은 제거할 수 없음 (adminUser 체크 생략)
    // if (userId === adminUser?.id && isAdmin === false) {
    //   return NextResponse.json(
    //     { error: "자기 자신의 관리자 권한은 제거할 수 없습니다" },
    //     { status: 400 }
    //   );
    // }

    // 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(isAdmin !== undefined && { isAdmin }),
        ...(isBusiness !== undefined && { isBusiness }),
      },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phoneNumber: true,
        isAdmin: true,
        isBusiness: true,
        updatedAt: true,
      },
    });

    console.log(`[Admin] 사용자 수정: ${updatedUser.userId} by admin`);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "사용자 정보가 성공적으로 수정되었습니다",
    });
  } catch (error) {
    console.error("사용자 수정 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 사용자 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // 사용자 존재 확인
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        userId: true,
        isAdmin: true,
        orders: {
          select: { id: true },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 자기 자신은 삭제할 수 없음 (adminUser 체크 생략)
    // if (userId === adminUser?.id) {
    //   return NextResponse.json(
    //     { error: "자기 자신은 삭제할 수 없습니다" },
    //     { status: 400 }
    //   );
    // }

    // 주문 이력이 있는 경우 경고 메시지와 함께 삭제 진행
    // (주문 데이터는 SetNull로 userId만 null로 설정됨)
    if (existingUser.orders.length > 0) {
      console.log(
        `[Admin] 주문 이력(${existingUser.orders.length}건)이 있는 사용자 삭제: ${existingUser.userId}`
      );
    }

    // 사용자 삭제 (관련 데이터는 CASCADE 또는 SetNull로 자동 처리)
    await prisma.user.delete({
      where: { id: userId },
    });

    console.log(`[Admin] 사용자 삭제: ${existingUser.userId} by admin`);

    return NextResponse.json({
      success: true,
      message: "사용자가 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("사용자 삭제 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
