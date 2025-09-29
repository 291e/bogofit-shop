import { NextRequest, NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * 쇼핑몰 전환 API
 * 사용자가 다른 쇼핑몰로 전환할 때 사용
 */
export async function POST(request: NextRequest) {
  try {
    const { mallId, userId } = await request.json();

    if (!mallId) {
      return NextResponse.json(
        {
          success: false,
          error: "mallId는 필수입니다.",
        },
        { status: 400 }
      );
    }

    console.log(`🔄 쇼핑몰 전환 요청: ${mallId}`);

    // 새로운 쇼핑몰로 OAuth 인증 시작
    const scopes = [
      "mall.read_application",
      "mall.write_application",
      "mall.read_product",
      "mall.write_product",
      "mall.read_category",
      "mall.write_category",
    ];

    const authUrl = cafe24OAuth.getAuthorizationUrl(scopes, mallId);

    return NextResponse.json({
      success: true,
      message: "새로운 쇼핑몰로 인증을 시작합니다.",
      data: {
        authUrl,
        mallId,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ 쇼핑몰 전환 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "쇼핑몰 전환 실패",
      },
      { status: 500 }
    );
  }
}
