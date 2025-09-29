import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * 사용자별 카페24 쇼핑몰 설정 관리
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const currentMallId = cookieStore.get("cafe24_mall_id")?.value;
    const userId = cookieStore.get("cafe24_user_id")?.value;

    return NextResponse.json({
      success: true,
      data: {
        currentMallId,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "설정 조회 실패",
      },
      { status: 500 }
    );
  }
}

/**
 * 사용자별 쇼핑몰 설정 저장
 */
export async function POST(request: NextRequest) {
  try {
    const { mallId, userId } = await request.json();

    if (!mallId || !userId) {
      return NextResponse.json(
        {
          success: false,
          error: "mallId와 userId는 필수입니다.",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30일
    };

    // 사용자별 쇼핑몰 설정 저장
    cookieStore.set("cafe24_mall_id", mallId, cookieOptions);
    cookieStore.set("cafe24_user_id", userId, cookieOptions);

    return NextResponse.json({
      success: true,
      message: "쇼핑몰 설정이 저장되었습니다.",
      data: {
        mallId,
        userId,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "설정 저장 실패",
      },
      { status: 500 }
    );
  }
}
