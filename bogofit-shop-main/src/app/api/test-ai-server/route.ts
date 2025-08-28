import { NextResponse } from "next/server";

const AI_SERVER_URL =
  "ec2-15-164-186-97.ap-northeast-2.compute.amazonaws.com:5001";

export async function GET() {
  try {
    console.log("AI 서버 연결 테스트 시작...");

    const endpoints = [
      "/",
      "/health",
      "/status",
      "/docs",
      "/run_workflow",
      "/queue_status",
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        console.log(`테스트 중: ${endpoint}`);
        const response = await fetch(`http://${AI_SERVER_URL}${endpoint}`, {
          method: "GET",
          headers: {
            Accept: "application/json, text/plain, */*",
          },
        });

        const responseText = await response.text();
        let responseData;

        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText.substring(0, 200);
        }

        results.push({
          endpoint,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get("content-type"),
          data: responseData,
        });

        console.log(`${endpoint}: ${response.status}`, responseData);
      } catch (error) {
        results.push({
          endpoint,
          error: (error as Error).message,
        });
      }
    }

    return NextResponse.json({
      message: "AI 서버 엔드포인트 테스트 완료",
      server: AI_SERVER_URL,
      results,
    });
  } catch (error) {
    console.error("AI 서버 연결 실패:", error);
    return NextResponse.json(
      {
        error: "AI 서버 연결 실패",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
