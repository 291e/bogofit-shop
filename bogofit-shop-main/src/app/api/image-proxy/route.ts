import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    let fullImageUrl = imageUrl;

    // 로컬 경로인 경우 절대 URL로 변환
    if (imageUrl.startsWith("/")) {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        `${request.nextUrl.protocol}//${request.nextUrl.host}`;
      fullImageUrl = `${baseUrl}${imageUrl}`;
    }

    const response = await fetch(fullImageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // 24시간 캐시
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch image" },
      { status: 500 }
    );
  }
}
