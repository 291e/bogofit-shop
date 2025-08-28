import { NextResponse } from "next/server";
import swaggerSpec from "@/lib/swagger";

export async function GET() {
  try {
    return NextResponse.json(swaggerSpec);
  } catch (error) {
    console.error("Swagger 문서 로딩 실패:", error);
    return NextResponse.json(
      { error: "Swagger 문서를 불러올 수 없습니다." },
      { status: 500 }
    );
  }
}
