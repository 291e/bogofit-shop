import { NextRequest, NextResponse } from "next/server";

// Google OAuth 설정
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = `${
  process.env.NEXT_PUBLIC_BASE_URL || ""
}/auth/callback/google`;

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    // Google OAuth 토큰 엔드포인트로 요청
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google 토큰 요청 실패:", tokenData);
      return NextResponse.json(
        { message: "액세스 토큰 요청에 실패했습니다." },
        { status: tokenResponse.status }
      );
    }

    // 액세스 토큰 반환
    return NextResponse.json({ accessToken: tokenData.access_token });
  } catch (error) {
    console.error("Google 토큰 요청 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
