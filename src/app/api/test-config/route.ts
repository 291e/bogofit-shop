import { NextResponse } from "next/server";

export async function GET() {
  const config = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "❌ Missing",
    googleClientId: process.env.GOOGLE_CLIENT_ID ? "✓ Set" : "❌ Missing",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET
      ? "✓ Set"
      : "❌ Missing",
    kakaoClientId: process.env.KAKAO_CLIENT_ID ? "✓ Set" : "❌ Missing",
    kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET ? "✓ Set" : "❌ Missing",
    nodeEnv: process.env.NODE_ENV,
  };

  return NextResponse.json({
    message: "OAuth Configuration Status",
    config,
    redirectUris: {
      google: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/callback/google`,
      kakao: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/auth/callback/kakao`,
    },
  });
}
