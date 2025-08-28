import { NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 연동 상태 확인 API
 *
 * 환경변수 설정, OAuth 설정, API 연결 상태 등을 종합적으로 진단합니다.
 */
export async function GET() {
  console.log("=== Cafe24 연동 상태 확인 시작 ===");

  const status = {
    timestamp: new Date().toISOString(),
    environment: {
      CAFE24_MALL_ID: {
        exists: !!process.env.CAFE24_MALL_ID,
        value: process.env.CAFE24_MALL_ID || "설정되지 않음",
      },
      CAFE24_CLIENT_ID: {
        exists: !!process.env.CAFE24_CLIENT_ID,
        value: process.env.CAFE24_CLIENT_ID
          ? process.env.CAFE24_CLIENT_ID.substring(0, 8) + "..."
          : "설정되지 않음",
      },
      CAFE24_CLIENT_SECRET: {
        exists: !!process.env.CAFE24_CLIENT_SECRET,
        value: process.env.CAFE24_CLIENT_SECRET ? "설정됨" : "설정되지 않음",
      },
      NEXT_PUBLIC_BASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_BASE_URL,
        value: process.env.NEXT_PUBLIC_BASE_URL || "설정되지 않음",
      },
    },
    oauth: {
      configLoaded: false,
      authUrlGenerated: false,
      redirectUri: "",
      authUrl: "",
      tokenUrl: "",
    },
    connectivity: {
      hasAccessToken: false,
      canCallAPI: false,
      errorMessage: null as string | null,
    },
    recommendations: [] as string[],
  };

  try {
    // 1. OAuth 설정 확인
    const config = cafe24OAuth.getConfig();
    status.oauth.configLoaded = true;
    status.oauth.redirectUri = config.redirectUri;
    status.oauth.authUrl = `https://${config.mallId}.cafe24.com/api/v2/oauth/authorize`;
    status.oauth.tokenUrl = `https://${config.mallId}.cafe24api.com/api/v2/oauth/token`;

    // 2. OAuth 인증 URL 생성 테스트
    try {
      const testAuthUrl = cafe24OAuth.getAuthorizationUrl([
        "mall.read_application",
      ]);
      status.oauth.authUrlGenerated = !!testAuthUrl;
    } catch (authError) {
      status.oauth.authUrlGenerated = false;
      status.connectivity.errorMessage = `OAuth URL 생성 실패: ${
        authError instanceof Error ? authError.message : "알 수 없는 오류"
      }`;
    }

    // 3. 액세스 토큰 확인
    try {
      const hasToken = await cafe24OAuth.getAccessToken();
      status.connectivity.hasAccessToken = !!hasToken;

      // 4. API 호출 테스트 (토큰이 있는 경우)
      if (hasToken) {
        try {
          await cafe24OAuth.apiCall("/admin/products", "GET", undefined, false);
          status.connectivity.canCallAPI = true;
        } catch (apiError) {
          status.connectivity.canCallAPI = false;
          if (!status.connectivity.errorMessage) {
            status.connectivity.errorMessage = `API 호출 실패: ${
              apiError instanceof Error ? apiError.message : "알 수 없는 오류"
            }`;
          }
        }
      }
    } catch (tokenError) {
      status.connectivity.hasAccessToken = false;
      if (!status.connectivity.errorMessage) {
        status.connectivity.errorMessage = `토큰 확인 실패: ${
          tokenError instanceof Error ? tokenError.message : "알 수 없는 오류"
        }`;
      }
    }

    console.log("✅ Cafe24 연동 상태 확인 완료");
  } catch (error) {
    console.error("❌ Cafe24 연동 상태 확인 실패:", error);
    status.connectivity.errorMessage =
      error instanceof Error ? error.message : "알 수 없는 오류";
  }

  // 5. 권장사항 생성
  status.recommendations = generateRecommendations(status);

  // 6. 전체적인 건강 상태 판단
  const isHealthy =
    status.environment.CAFE24_MALL_ID.exists &&
    status.environment.CAFE24_CLIENT_ID.exists &&
    status.environment.CAFE24_CLIENT_SECRET.exists &&
    status.environment.NEXT_PUBLIC_BASE_URL.exists &&
    status.oauth.configLoaded &&
    status.oauth.authUrlGenerated;

  return NextResponse.json({
    success: isHealthy,
    status: isHealthy ? "healthy" : "unhealthy",
    health_score: calculateHealthScore(status),
    ...status,
  });
}

function generateRecommendations(status: {
  environment: Record<string, { exists: boolean }>;
  oauth: {
    configLoaded: boolean;
    authUrlGenerated: boolean;
    redirectUri: string;
  };
  connectivity: { hasAccessToken: boolean; canCallAPI: boolean };
}): string[] {
  const recommendations: string[] = [];

  // 환경변수 관련 권장사항
  if (!status.environment.CAFE24_MALL_ID.exists) {
    recommendations.push("🔧 CAFE24_MALL_ID 환경변수를 설정하세요.");
  }

  if (!status.environment.CAFE24_CLIENT_ID.exists) {
    recommendations.push("🔧 CAFE24_CLIENT_ID 환경변수를 설정하세요.");
  }

  if (!status.environment.CAFE24_CLIENT_SECRET.exists) {
    recommendations.push("🔧 CAFE24_CLIENT_SECRET 환경변수를 설정하세요.");
  }

  if (!status.environment.NEXT_PUBLIC_BASE_URL.exists) {
    recommendations.push("🔧 NEXT_PUBLIC_BASE_URL 환경변수를 설정하세요.");
  }

  // OAuth 관련 권장사항
  if (!status.oauth.authUrlGenerated) {
    recommendations.push(
      "🔗 OAuth 인증 URL 생성에 실패했습니다. 환경변수를 다시 확인하세요."
    );
  }

  // 연결 관련 권장사항
  if (!status.connectivity.hasAccessToken) {
    recommendations.push(
      "🔐 OAuth 인증을 완료하세요. /api/cafe24/oauth/authorize로 인증을 시작하세요."
    );
  }

  if (status.connectivity.hasAccessToken && !status.connectivity.canCallAPI) {
    recommendations.push(
      "📡 API 호출에 실패했습니다. 토큰이 만료되었거나 권한이 부족할 수 있습니다."
    );
  }

  // 카페24 개발자센터 설정 권장사항
  if (
    status.oauth.configLoaded &&
    recommendations.length === 0 &&
    !status.connectivity.canCallAPI
  ) {
    recommendations.push("🏪 카페24 개발자센터에서 다음을 확인하세요:");
    recommendations.push(`   - 리디렉션 URI: ${status.oauth.redirectUri}`);
    recommendations.push(
      "   - 권한 스코프: mall.read_application, mall.write_application"
    );
    recommendations.push("   - 앱 상태: 활성화됨");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ 모든 설정이 정상입니다!");
  }

  return recommendations;
}

function calculateHealthScore(status: {
  environment: Record<string, { exists: boolean }>;
  oauth: { configLoaded: boolean; authUrlGenerated: boolean };
  connectivity: { hasAccessToken: boolean; canCallAPI: boolean };
}): number {
  let score = 0;
  const maxScore = 100;

  // 환경변수 (40점)
  if (status.environment.CAFE24_MALL_ID.exists) score += 10;
  if (status.environment.CAFE24_CLIENT_ID.exists) score += 10;
  if (status.environment.CAFE24_CLIENT_SECRET.exists) score += 10;
  if (status.environment.NEXT_PUBLIC_BASE_URL.exists) score += 10;

  // OAuth 설정 (30점)
  if (status.oauth.configLoaded) score += 15;
  if (status.oauth.authUrlGenerated) score += 15;

  // 연결성 (30점)
  if (status.connectivity.hasAccessToken) score += 15;
  if (status.connectivity.canCallAPI) score += 15;

  return Math.round((score / maxScore) * 100);
}
