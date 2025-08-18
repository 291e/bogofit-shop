import { NextResponse } from "next/server";
import { removeAuthCookie } from "@/lib/jwt-server";

export async function POST() {
  try {
    // 로그아웃 응답 생성
    const response = NextResponse.json({
      success: true,
      message: "로그아웃 되었습니다",
    });

    // 쿠키에서 토큰 제거
    removeAuthCookie(response);

    return response;
  } catch (error) {
    console.error("[Auth Logout] 오류:", error);
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// GET 메서드도 지원 (간편한 로그아웃을 위해)
export async function GET() {
  return POST();
}
