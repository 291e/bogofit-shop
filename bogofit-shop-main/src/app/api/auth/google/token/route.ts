import { NextRequest, NextResponse } from "next/server";

// Google OAuth 설정
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = `${
  process.env.NEXT_PUBLIC_BASE_URL || ""
}/auth/callback/google`;

/**
 * @swagger
 * /api/auth/google/token:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Google OAuth 토큰 교환
 *     description: Google OAuth 인증 코드를 토큰으로 교환하고 사용자 정보를 가져옵니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 description: Google OAuth 인증 코드
 *                 example: "4/0AdQt8qh..."
 *             required:
 *               - code
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: 성공 여부
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    console.log("=== Google OAuth Token Request Debug ===");
    console.log("Code received:", !!code);
    console.log("Client ID:", GOOGLE_CLIENT_ID ? "✓ Set" : "✗ Missing");
    console.log("Client Secret:", GOOGLE_CLIENT_SECRET ? "✓ Set" : "✗ Missing");
    console.log("Redirect URI:", GOOGLE_REDIRECT_URI);

    if (!code) {
      console.error("❌ No authorization code provided");
      return NextResponse.json(
        { message: "인증 코드가 필요합니다." },
        { status: 400 }
      );
    }

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error("❌ Missing Google OAuth credentials");
      return NextResponse.json(
        { message: "Google OAuth 설정이 누락되었습니다." },
        { status: 500 }
      );
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    });

    console.log(
      "Token request params:",
      Object.fromEntries(tokenParams.entries())
    );

    // Google OAuth 토큰 엔드포인트로 요청
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    const tokenData = await tokenResponse.json();

    console.log("Google token response status:", tokenResponse.status);
    console.log("Google token response data:", tokenData);

    if (!tokenResponse.ok) {
      console.error("❌ Google 토큰 요청 실패:", tokenData);
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

    console.log("✅ Google token request successful");
    // 액세스 토큰 반환
    return NextResponse.json({ accessToken: tokenData.access_token });
  } catch (error) {
    console.error("❌ Google 토큰 요청 오류:", error);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
