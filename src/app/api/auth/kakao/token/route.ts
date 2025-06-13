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

    if (!code) {
      return NextResponse.json(
        { message: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    // Kakao OAuth 토큰 엔드포인트로 요청
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Kakao 토큰 요청 실패:", tokenData);
      return NextResponse.json(
        { message: "액세스 토큰 요청에 실패했습니다." },
        { status: tokenResponse.status }
      );
    }

    // 액세스 토큰 반환
    return NextResponse.json({ accessToken: tokenData.access_token });
  } catch (error) {
    console.error("Kakao 토큰 요청 오류:", error);
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
