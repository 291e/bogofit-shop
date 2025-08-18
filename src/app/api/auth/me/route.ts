import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/jwt-server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // JWT 토큰에서 사용자 정보 추출
    const tokenUser = await getUserFromRequest(request);

    if (!tokenUser) {
      return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
    }

    // 최신 사용자 정보를 DB에서 조회
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isActive: true,
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

    // 사용자 정보 반환 (비밀번호 제외)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        email: user.email,
        name: user.name || user.userId,
        isBusiness: user.isBusiness,
        brand: user.brand,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("[Auth Me] 오류:", error);
    return NextResponse.json(
      { error: "사용자 정보 조회 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
