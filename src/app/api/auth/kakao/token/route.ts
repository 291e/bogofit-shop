import { NextRequest, NextResponse } from "next/server";

// Kakao OAuth 설정
const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "";
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET || "";
const KAKAO_REDIRECT_URI = `${
  process.env.NEXT_PUBLIC_BASE_URL || ""
}/auth/callback/kakao`;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    console.log("=== Kakao OAuth Token Request Debug ===");
    console.log("Code received:", !!code);
    console.log("Client ID:", KAKAO_CLIENT_ID ? "✓ Set" : "✗ Missing");
    console.log("Client Secret:", KAKAO_CLIENT_SECRET ? "✓ Set" : "✗ Missing");
    console.log("Redirect URI:", KAKAO_REDIRECT_URI);

    if (!code) {
      console.error("❌ No authorization code provided");
      return NextResponse.json(
        { message: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    if (!KAKAO_CLIENT_ID) {
      console.error("❌ Missing Kakao Client ID");
      return NextResponse.json(
        { message: "Kakao OAuth 설정이 누락되었습니다." },
        { status: 500 }
      );
    }

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    });

    // Kakao에서는 client_secret이 선택사항이므로 있을 때만 추가
    if (KAKAO_CLIENT_SECRET) {
      tokenParams.append("client_secret", KAKAO_CLIENT_SECRET);
    }

    console.log(
      "Token request params:",
      Object.fromEntries(tokenParams.entries())
    );

    // Kakao OAuth 토큰 엔드포인트로 요청
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    console.log("Kakao token response status:", tokenResponse.status);
    console.log("Kakao token response data:", tokenData);

    if (!tokenResponse.ok) {
      console.error("❌ Kakao 토큰 요청 실패:", tokenData);
      return NextResponse.json(
        {
          message: "액세스 토큰 요청에 실패했습니다.",
          error:
            tokenData.error_description || tokenData.error || "Unknown error",
          details: tokenData,
        },
        { status: tokenResponse.status }
      );
    }

    console.log("✅ Kakao token request successful");
    // 액세스 토큰 반환
    return NextResponse.json({ accessToken: tokenData.access_token });
  } catch (error) {
    console.error("❌ Kakao 토큰 요청 오류:", error);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
