import { NextResponse } from "next/server";

/**
 * Cafe24 설정 테스트 엔드포인트
 */
export async function GET() {
  try {
    // 환경 변수 확인
    const config = {
      mallId: process.env.CAFE24_MALL_ID,
      clientId: process.env.CAFE24_CLIENT_ID,
      hasClientSecret: !!process.env.CAFE24_CLIENT_SECRET,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      apiBaseUrl: `https://${process.env.CAFE24_MALL_ID}.cafe24api.com`,
    };

    // OAuth URL 수동 생성 테스트
    const testScopes = [
      "mall.read_product",
      "mall.write_product",
      "mall.read_category",
      "mall.write_category",
    ];
    const state = "test_state_" + Date.now();

    const oauthParams = new URLSearchParams({
      response_type: "code",
      client_id: config.clientId || "",
      state: state,
      redirect_uri: `${config.baseUrl}/api/cafe24/oauth/callback`,
      scope: testScopes.join(","),
    });

    const testOAuthUrl = `${
      config.apiBaseUrl
    }/api/v2/oauth/authorize?${oauthParams.toString()}`;

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      config,
      testScopes,
      testOAuthUrl,
      suggestions: [
        "1. Cafe24 Developers Admin에서 앱 상태가 '활성화'인지 확인",
        "2. 권한 스코프에서 'mall.read_product', 'mall.write_product', 'mall.read_category', 'mall.write_category'가 체크되어 있는지 확인",
        "3. Redirect URI가 정확히 일치하는지 확인",
        "4. Client ID가 정확한지 확인",
        "5. 쇼핑몰 관리자 권한으로 로그인했는지 확인",
      ],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "설정 확인 중 오류 발생",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
