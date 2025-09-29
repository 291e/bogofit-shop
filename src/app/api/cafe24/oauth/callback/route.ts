import { NextRequest, NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 OAuth 콜백 처리
 *
 * 사용자가 Cafe24에서 인증을 완료한 후 이 엔드포인트로 리디렉션됩니다.
 * Authorization Code를 받아서 Access Token으로 교환합니다.
 */
export async function GET(request: NextRequest) {
  // 환경별 baseUrl 설정
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL || "https://www.bogofit.kr"
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  console.log("=== Cafe24 OAuth 콜백 처리 ===");
  console.log("- Request URL:", request.url);
  console.log("- Base URL:", baseUrl);
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- Host Header:", request.headers.get("host"));
  console.log("- X-Forwarded-Host:", request.headers.get("x-forwarded-host"));
  console.log("- Code:", code ? code.substring(0, 8) + "..." : "❌ 없음");
  console.log("- State:", state ? state.substring(0, 8) + "..." : "❌ 없음");
  console.log("- Error:", error || "없음");
  console.log("- Error Description:", errorDescription || "없음");

  // Cafe24에서 반환된 에러가 있는 경우
  if (error) {
    console.error("❌ Cafe24 OAuth 에러 발생:");
    console.error("- Error Code:", error);
    console.error("- Error Description:", errorDescription);

    const errorMessage = errorDescription
      ? `${error}: ${errorDescription}`
      : error;

    return NextResponse.redirect(
      new URL(
        `/cafe24/error?error=${encodeURIComponent(errorMessage)}`,
        baseUrl
      )
    );
  }

  // 필수 파라미터 검증
  if (!code) {
    console.error("❌ Authorization code가 없습니다");
    console.error("- 가능한 원인:");
    console.error("  1. 사용자가 인증을 거부했습니다");
    console.error("  2. Cafe24 OAuth 설정이 잘못되었습니다");
    console.error("  3. 리디렉션 URI가 일치하지 않습니다");

    return NextResponse.redirect(
      new URL("/cafe24/error?error=missing_code", baseUrl)
    );
  }

  try {
    console.log("🔄 Authorization Code를 Access Token으로 교환 중...");

    // Authorization Code를 Access Token으로 교환
    // mallId는 여러 방법으로 추출 시도

    // 1. URL 파라미터에서 추출 (가장 확실한 방법)
    const mallIdFromUrl = searchParams.get("mall_id");
    console.log("🔍 URL 파라미터에서 mallId:", mallIdFromUrl);

    // 2. Referer 헤더에서 추출 (extractMallIdFromUrl 함수 사용)
    const referer = request.headers.get("referer");
    let mallIdFromReferer: string | null = null;

    if (referer) {
      console.log("🔍 Referer URL:", referer);
      mallIdFromReferer = cafe24OAuth.extractMallIdFromUrl(referer);
      if (mallIdFromReferer) {
        console.log("✅ Referer에서 mallId 추출:", mallIdFromReferer);
      }
    }

    // 3. 쿠키에서 추출 (fallback)
    const mallIdFromCookie = request.cookies.get("cafe24_temp_mall_id")?.value;
    console.log("🔍 쿠키에서 mallId:", mallIdFromCookie);

    // 우선순위: URL 파라미터 > Referer > 쿠키
    const finalMallId = mallIdFromUrl || mallIdFromReferer || mallIdFromCookie;
    console.log("🔍 최종 mallId:", finalMallId);

    const tokenData = await cafe24OAuth.exchangeCodeForToken(
      code,
      state || undefined,
      finalMallId || undefined
    );

    console.log("✅ Cafe24 OAuth 인증 성공!");
    console.log("- Mall ID:", tokenData.mall_id);
    console.log("- User ID:", tokenData.user_id);
    console.log("- Scopes:", tokenData.scopes);
    console.log("- Expires At:", tokenData.expires_at);
    console.log(
      "- Access Token:",
      tokenData.access_token?.substring(0, 10) + "..."
    );

    // 성공 페이지로 리디렉션 (mallId 정보 포함)
    const successUrl = new URL("/solution", baseUrl);
    successUrl.searchParams.set("mall_id", tokenData.mall_id);
    successUrl.searchParams.set("user_id", tokenData.user_id);

    console.log("🎉 최종 페이지로 리디렉션:", successUrl.toString());
    return NextResponse.redirect(successUrl);

    // const successUrl = new URL("/cafe24/success", request.url);
    // successUrl.searchParams.set("mall_id", tokenData.mall_id);
    // successUrl.searchParams.set("user_id", tokenData.user_id);

    // console.log("🎉 성공 페이지로 리디렉션:", successUrl.toString());
    // return NextResponse.redirect(successUrl);
  } catch (error) {
    console.error("❌ Cafe24 OAuth 토큰 교환 실패:");
    console.error("- Error:", error);

    if (error instanceof Error) {
      console.error("- Message:", error.message);
      console.error("- Stack:", error.stack);
    }

    // 에러 유형별 상세 메시지
    let errorMessage = "토큰 교환 중 알 수 없는 오류가 발생했습니다";
    let troubleshooting = "";

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes("Token exchange failed")) {
        troubleshooting =
          "Cafe24 서버에서 토큰 교환을 거부했습니다. Client ID/Secret을 확인해주세요.";
      } else if (error.message.includes("Invalid state")) {
        troubleshooting =
          "CSRF 보안 검증에 실패했습니다. 인증을 다시 시도해주세요.";
      } else if (error.message.includes("fetch")) {
        troubleshooting =
          "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.";
      }
    }

    const errorUrl = new URL(`/cafe24/error`, baseUrl);
    errorUrl.searchParams.set("error", errorMessage);
    if (troubleshooting) {
      errorUrl.searchParams.set("troubleshooting", troubleshooting);
    }

    return NextResponse.redirect(errorUrl);
  }
}
