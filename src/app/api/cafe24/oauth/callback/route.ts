import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: "인증 실패", details: error },
      { status: 400 }
    );
  }

  if (!code || !state) {
    return NextResponse.json(
      { error: "인증 코드 또는 상태값이 없습니다" },
      { status: 400 }
    );
  }

  try {
    // 카페24 OAuth 토큰 요청
    const tokenResponse = await fetch(
      `https://${process.env.CAFE24_SHOP_ID}.cafe24api.com/api/v2/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.CAFE24_CLIENT_ID}:${process.env.CAFE24_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/cafe24/oauth/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("토큰 요청 실패");
    }

    const tokenData = await tokenResponse.json();

    // 토큰을 안전하게 저장 (실제 구현에서는 데이터베이스나 암호화된 쿠키 사용)
    const response = NextResponse.redirect(
      new URL("/cafe24/success", request.url)
    );

    // HttpOnly 쿠키로 토큰 저장 (보안상 권장)
    response.cookies.set("cafe24_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: tokenData.expires_in || 3600,
    });

    response.cookies.set("cafe24_refresh_token", tokenData.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30일
    });

    return response;
  } catch (error) {
    console.error("카페24 OAuth 콜백 처리 중 오류:", error);
    return NextResponse.json(
      { error: "인증 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
