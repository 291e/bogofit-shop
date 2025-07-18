import { NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 OAuth 인증 시작
 *
 * 사용자를 Cafe24 OAuth 인증 페이지로 리디렉션합니다.
 */
export async function GET() {
  try {
    console.log("=== Cafe24 OAuth 인증 시작 ===");

    // 요청할 권한 스코프 설정 (승인 후 사용할 스코프들)
    const scopes = [
      "mall.read_product",
      "mall.read_category",
      "mall.read_application",
    ];

    // OAuth 인증 URL 생성
    const authUrl = cafe24OAuth.getAuthorizationUrl(scopes);

    console.log("🔄 Cafe24 OAuth URL 생성 완료");
    console.log("Auth URL:", authUrl);
    console.log("Requested Scopes:", scopes);

    // Cafe24 OAuth 페이지로 리디렉션
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("❌ Cafe24 OAuth 인증 시작 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "OAuth 인증 시작 중 오류가 발생했습니다",
      },
      { status: 500 }
    );
  }
}
