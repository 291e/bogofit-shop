import { NextRequest, NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 OAuth 인증 시작
 *
 * 사용자를 Cafe24 OAuth 인증 페이지로 리디렉션합니다.
 * ?mall_id=xxx 파라미터를 통해 특정 쇼핑몰로 인증을 시작할 수 있습니다.
 */
export async function GET(request: NextRequest) {
  try {
    console.log("=== Cafe24 OAuth 인증 시작 ===");

    const { searchParams } = new URL(request.url);
    const mallIdParam = searchParams.get("mall_id");

    console.log("- Mall ID 파라미터:", mallIdParam || "없음");
    console.log("- Request URL:", request.url);

    // 카페24 공식 문서에 따른 필수 스코프 설정
    const scopes = [
      "mall.read_application",
      "mall.write_application",
      "mall.read_product",
      "mall.write_product",
      "mall.read_category",
      "mall.write_category",
    ];

    console.log("- 요청 스코프:", scopes.join(", "));

        // OAuth 인증 URL 생성
    const authUrl = cafe24OAuth.getAuthorizationUrl(
      scopes,
      mallIdParam || undefined
    );
    // mallId를 쿠키에 저장 (callback에서 사용)
    const response = NextResponse.redirect(authUrl);

    if (mallIdParam) {
      response.cookies.set("cafe24_temp_mall_id", mallIdParam, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 5, // 5분
      });
      console.log("🍪 임시 mallId 쿠키 설정:", mallIdParam);
    }



    console.log("🔄 Cafe24 OAuth URL 생성 완료");
    console.log("- Auth URL:", authUrl);
    console.log("- Redirect URI:", cafe24OAuth.getConfig().redirectUri);
    console.log("- Mall ID:", mallIdParam);
    console.log("- Client ID:", cafe24OAuth.getConfig().clientId);

    // 카페24 OAuth 페이지로 리디렉션
    return response;
  } catch (error) {
    console.error("❌ Cafe24 OAuth 인증 시작 실패:", error);

    // 에러 유형별 처리
    if (error instanceof Error) {
      // 환경변수 오류 시 설치 페이지로 리디렉션
      if (error.message.includes("환경변수")) {
        const installUrl = `/cafe24/install?error=${encodeURIComponent(
          error.message
        )}`;
        return NextResponse.redirect(new URL(installUrl, request.url));
      }

      if (error.message.includes("Mall ID")) {
        const installUrl = `/cafe24/install?error=${encodeURIComponent(
          error.message
        )}`;
        return NextResponse.redirect(new URL(installUrl, request.url));
      }

      // 기타 오류는 JSON 응답으로 상세 정보 제공
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          error_type: "oauth_initialization_failed",
          timestamp: new Date().toISOString(),
          troubleshooting: {
            환경변수_확인: {
              description: "필수 환경변수가 설정되어 있는지 확인하세요.",
              required_vars: [
                "CAFE24_MALL_ID",
                "CAFE24_CLIENT_ID",
                "CAFE24_CLIENT_SECRET",
                "NEXT_PUBLIC_BASE_URL",
              ],
            },
            카페24_개발자센터_설정: {
              description: "카페24 개발자센터에서 다음 설정을 확인하세요.",
              redirect_uri: cafe24OAuth.getConfig().redirectUri,
              required_scopes: [
                "mall.read_application",
                "mall.write_application",
                "mall.read_product",
                "mall.write_product",
                "mall.read_category",
                "mall.write_category",
              ],
            },
            진단_도구: {
              description: "연동 상태를 확인하려면 다음 API를 호출하세요.",
              status_check_url: "/api/cafe24/status",
            },
          },
        },
        { status: 500 }
      );
    }

    // 예상치 못한 오류
    return NextResponse.json(
      {
        success: false,
        error: "OAuth 인증 시작 중 알 수 없는 오류가 발생했습니다",
        error_type: "unknown_error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
