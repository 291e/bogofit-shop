import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/jwt-server";
import { prisma } from "@/lib/prisma";

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  isAdmin: boolean;
  isBusiness: boolean;
}

/**
 * 관리자 권한 체크 함수
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<[AdminUser | null, NextResponse | null]> {
  try {
    // JWT 토큰에서 사용자 정보 추출
    const tokenUser = await getUserFromRequest(request);

    if (!tokenUser) {
      return [
        null,
        NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 }),
      ];
    }

    // DB에서 사용자 정보 조회 (관리자 권한 확인)
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        userId: true,
        name: true,
        email: true,
        isAdmin: true,
        isBusiness: true,
      },
    });

    if (!user) {
      return [
        null,
        NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 404 }
        ),
      ];
    }

    if (!user.isAdmin) {
      return [
        null,
        NextResponse.json(
          { error: "관리자 권한이 필요합니다" },
          { status: 403 }
        ),
      ];
    }

    return [user as AdminUser, null];
  } catch (error) {
    console.error("[AdminAuth] 인증 처리 중 오류:", error);
    return [
      null,
      NextResponse.json(
        { error: "인증 처리 중 오류가 발생했습니다" },
        { status: 500 }
      ),
    ];
  }
}
