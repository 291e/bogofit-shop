import { NextRequest, NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 OAuth 콜백 처리
 *
 * 사용자가 Cafe24에서 인증을 완료한 후 이 엔드포인트로 리디렉션됩니다.
 * Authorization Code를 받아서 Access Token으로 교환합니다.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  console.log("=== Cafe24 OAuth 콜백 처리 ===");
  console.log("Code:", !!code);
  console.log("State:", !!state);
  console.log("Error:", error);

  // 에러가 있는 경우
  if (error) {
    console.error("❌ Cafe24 OAuth 에러:", error);
    return NextResponse.redirect(
      new URL(`/cafe24/error?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // 필수 파라미터 검증
  if (!code) {
    console.error("❌ Authorization code가 없습니다");
    return NextResponse.redirect(
      new URL("/cafe24/error?error=missing_code", request.url)
    );
  }

  try {
    console.log("🔄 Authorization Code를 Access Token으로 교환 중...");

    // Authorization Code를 Access Token으로 교환
    const tokenData = await cafe24OAuth.exchangeCodeForToken(
      code,
      state || undefined
    );

    console.log("✅ Cafe24 OAuth 인증 성공");
    console.log("- Mall ID:", tokenData.mall_id);
    console.log("- User ID:", tokenData.user_id);
    console.log("- Scopes:", tokenData.scopes);
    console.log("- Expires At:", tokenData.expires_at);

    // 성공 페이지로 리디렉션
    return NextResponse.redirect(new URL("/cafe24/success", request.url));
  } catch (error) {
    console.error("❌ Cafe24 OAuth 토큰 교환 실패:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "토큰 교환 중 알 수 없는 오류가 발생했습니다";

    return NextResponse.redirect(
      new URL(
        `/cafe24/error?error=${encodeURIComponent(errorMessage)}`,
        request.url
      )
    );
  }
}
