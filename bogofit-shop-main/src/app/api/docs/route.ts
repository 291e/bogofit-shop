import { NextResponse } from "next/server";
import swaggerSpec from "@/lib/swagger";

export async function GET() {
  try {
    // 스펙 유효성 보정: openapi 루트 필드 보장 및 기본 구조 채우기
    const spec = swaggerSpec as unknown as Record<string, unknown>;
    const hasValidVersion = !!spec && ("openapi" in spec || "swagger" in spec);

    const safeSpec = hasValidVersion
      ? spec
      : {
          openapi: "3.0.0",
          info: {
            title: "BogoFit Shop API",
            version: "2.0.0",
            description:
              "스펙 생성에 실패하여 최소한의 스펙으로 대체되었습니다. 주석 스캔 경로 또는 빌드 환경을 확인하세요.",
          },
          servers: [
            {
              url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
              description: "Development server",
            },
          ],
          paths: {},
          components: { schemas: {}, securitySchemes: {} },
        };

    return new NextResponse(JSON.stringify(safeSpec), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Swagger 문서 로딩 실패:", error);
    return NextResponse.json(
      { error: "Swagger 문서를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
