import { cookies } from "next/headers";
import {
  Cafe24OAuthConfig,
  Cafe24TokenResponse,
  Cafe24TokenRequest,
  Cafe24RefreshTokenRequest,
  Cafe24Product,
  Cafe24ApiError,
} from "@/types/cafe24";

// Cafe24 OAuth 설정
export class Cafe24OAuth {
  private config: Cafe24OAuthConfig;

  constructor() {
    // 카페24 공식 문서에 따른 환경변수 검증
    // mallId는 동적으로 전달받아야 하므로 환경변수에서 가져오지 않음
    const clientId = process.env.CAFE24_CLIENT_ID || "";
    const clientSecret = process.env.CAFE24_CLIENT_SECRET || "";
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

    this.config = {
      mallId: "", // 사용 시 동적으로 전달됨
      clientId,
      clientSecret,
      redirectUri: `${baseUrl}/api/cafe24/oauth/callback`,
      baseUrl: "", // 사용 시 동적으로 생성됨
    };

    // 필수 환경변수 검증
    if (!clientId || !clientSecret || !baseUrl) {
      const missing = [];
      if (!clientId) missing.push("CAFE24_CLIENT_ID");
      if (!clientSecret) missing.push("CAFE24_CLIENT_SECRET");
      if (!baseUrl) missing.push("NEXT_PUBLIC_BASE_URL");

      throw new Error(
        `카페24 OAuth 필수 환경변수가 설정되지 않았습니다: ${missing.join(
          ", "
        )}`
      );
    }

    console.log("✅ 카페24 OAuth 설정 완료");
    console.log("⚠️  Mall ID는 동적으로 전달됩니다 (URL 파라미터 또는 state)");
    console.log(`- Redirect URI: ${this.config.redirectUri}`);
  }

  /**
   * OAuth 설정 정보 조회
   */
  getConfig(): Cafe24OAuthConfig {
    return { ...this.config };
  }

  /**
   * 1단계: Authorization Code 요청 URL 생성
   * 브라우저에서 이 URL로 리디렉션하여 사용자 인증을 받습니다.
   */
  getAuthorizationUrl(
    scopes: string[] = ["mall.read_application", "mall.write_application"],
    mallIdOverride?: string
  ): string {
    const mallId = this.resolveMallId(mallIdOverride);
    const state = this.generateState({ mallId });
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      state: state,
      redirect_uri: this.config.redirectUri,
      scope: scopes.join(","),
    });

    // state를 세션에 저장 (CSRF 방지)
    if (typeof window !== "undefined") {
      sessionStorage.setItem("cafe24_oauth_state", state);
    }

    // 카페24 공식 OAuth 인증 엔드포인트
    // 참고: 카페24 OAuth 2.0 인증 URL 형식 (공식 문서 기준)
    const authUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/authorize?${params.toString()}`;

    console.log("🔗 카페24 OAuth 인증 URL 생성");
    console.log(`- URL: ${authUrl}`);
    console.log(`- Scopes: ${scopes.join(", ")}`);
    console.log(`- Client ID: ${this.config.clientId}`);
    console.log(`- Redirect URI: ${this.config.redirectUri}`);
    console.log(`- Mall ID: ${mallId}`);

    return authUrl;
  }

  /**
   * 2단계: Authorization Code를 Access Token으로 교환
   */
  async exchangeCodeForToken(
    code: string,
    state?: string
  ): Promise<Cafe24TokenResponse> {
    try {
      console.log("🔄 토큰 교환 시작");
      console.log("- Code:", code ? code.substring(0, 8) + "..." : "없음");
      console.log("- State:", state ? state.substring(0, 8) + "..." : "없음");

      const statePayload = this.parseState(state);
      console.log("- Parsed State:", statePayload);

      const mallId = this.resolveMallId(statePayload?.mallId);
      console.log("- Resolved Mall ID:", mallId);

      // state 검증 (CSRF 방지)
      if (state && typeof window !== "undefined") {
        const storedState = sessionStorage.getItem("cafe24_oauth_state");
        if (storedState !== state) {
          throw new Error("Invalid state parameter");
        }
        sessionStorage.removeItem("cafe24_oauth_state");
      }

      const tokenRequest: Cafe24TokenRequest = {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: this.config.redirectUri,
      };

      // 카페24 공식 토큰 엔드포인트
      const tokenUrl = `https://${mallId}.cafe24api.com/api/v2/oauth/token`;

      console.log("🔗 카페24 토큰 교환 요청");
      console.log(`- URL: ${tokenUrl}`);
      console.log(`- Grant Type: ${tokenRequest.grant_type}`);
      console.log(`- Mall ID: ${mallId}`);

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${this.getBasicAuthHeader()}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: tokenRequest.grant_type,
          code: tokenRequest.code,
          redirect_uri: tokenRequest.redirect_uri,
        }),
      });

      if (!response.ok) {
        const errorData: Cafe24ApiError = await response.json();
        throw new Error(
          `Token exchange failed: ${errorData.error} - ${errorData.error_description}`
        );
      }

      const tokenData: Cafe24TokenResponse = await response.json();

      // 토큰을 안전하게 저장
      await this.storeTokens(tokenData);

      return tokenData;
    } catch (error) {
      console.error("Cafe24 토큰 교환 실패:", error);
      throw error;
    }
  }

  /**
   * 3단계: Refresh Token으로 Access Token 갱신
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get("cafe24_refresh_token")?.value;
      const mallIdFromCookie = cookieStore.get("cafe24_mall_id")?.value;

      if (!refreshToken) {
        throw new Error("리프레시 토큰이 없습니다");
      }

      const mallId = this.resolveMallId(mallIdFromCookie);

      const refreshRequest: Cafe24RefreshTokenRequest = {
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      };

      const response = await fetch(
        `${this.buildApiBaseUrl(mallId)}/oauth/token`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${this.getBasicAuthHeader()}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: refreshRequest.grant_type,
            refresh_token: refreshRequest.refresh_token,
          }),
        }
      );

      if (!response.ok) {
        const errorData: Cafe24ApiError = await response.json();
        throw new Error(
          `Token refresh failed: ${errorData.error} - ${errorData.error_description}`
        );
      }

      const tokenData: Cafe24TokenResponse = await response.json();

      // 새 토큰을 저장
      await this.storeTokens(tokenData);

      return tokenData.access_token;
    } catch (error) {
      console.error("Cafe24 토큰 갱신 실패:", error);
      return null;
    }
  }

  /**
   * Access Token 가져오기
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("cafe24_access_token")?.value;
      const expiresAt = cookieStore.get("cafe24_expires_at")?.value;

      if (!accessToken) {
        return null;
      }

      // 토큰 만료 확인 (2시간)
      if (expiresAt && new Date(expiresAt) <= new Date()) {
        console.log("Access token expired, refreshing...");
        return await this.refreshAccessToken();
      }

      return accessToken;
    } catch (error) {
      console.error("토큰 가져오기 실패:", error);
      return null;
    }
  }

  /**
   * Cafe24 API 호출 (자동 토큰 갱신 포함)
   */
  async apiCall<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: Record<string, unknown>,
    retryOnUnauthorized: boolean = true,
    mallIdOverride?: string
  ): Promise<T> {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error(
        "액세스 토큰이 없습니다. 먼저 OAuth 인증을 완료해주세요."
      );
    }

    const mallId = await this.resolveMallIdForServer(mallIdOverride);
    const url = `${this.buildApiBaseUrl(mallId)}${endpoint}`;
    const headers: HeadersInit = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);

      // 401 에러 시 토큰 갱신 후 재시도
      if (response.status === 401 && retryOnUnauthorized) {
        console.log("API call unauthorized, refreshing token...");
        const newToken = await this.refreshAccessToken();

        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...options, headers });

          if (!retryResponse.ok) {
            throw new Error(
              `API 호출 실패: ${retryResponse.status} ${retryResponse.statusText}`
            );
          }

          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API 호출 실패: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Cafe24 API 호출 오류:", error);
      throw error;
    }
  }

  /**
   * 상품 정보 가져오기
   */
  async getProduct(
    productNo: number,
    mallIdOverride?: string
  ): Promise<Cafe24Product> {
    return await this.apiCall<{ product: Cafe24Product }>(
      `/admin/products/${productNo}`,
      "GET",
      undefined,
      true,
      mallIdOverride
    ).then((response) => response.product);
  }

  /**
   * 상품 목록 가져오기
   */
  async getProducts(params?: {
    category?: number;
    limit?: number;
    offset?: number;
    mallId?: string;
  }): Promise<Cafe24Product[]> {
    const queryParams = new URLSearchParams();

    if (params?.category)
      queryParams.append("category", params.category.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());

    const endpoint = `/admin/products${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return await this.apiCall<{ products: Cafe24Product[] }>(
      endpoint,
      "GET",
      undefined,
      true,
      params?.mallId
    ).then((response) => response.products);
  }

  /**
   * 상품 이미지 정보 가져오기
   */
  async getProductImages(
    productNo: number,
    mallIdOverride?: string
  ): Promise<
    Array<{
      image_no: number;
      image_url: string;
      image_type: string;
      image_path: string;
    }>
  > {
    return await this.apiCall<{
      images: Array<{
        image_no: number;
        image_url: string;
        image_type: string;
        image_path: string;
      }>;
    }>(
      `/admin/products/${productNo}/images`,
      "GET",
      undefined,
      true,
      mallIdOverride
    ).then((response) => response.images);
  }

  // Private Helper Methods

  private generateState(payload: Record<string, unknown> = {}): string {
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const nonce = Buffer.from(randomBytes).toString("base64url");
    const statePayload = { nonce, ...payload };

    return Buffer.from(JSON.stringify(statePayload)).toString("base64url");
  }

  private parseState(
    state?: string
  ): { nonce?: string; mallId?: string } | null {
    if (!state) {
      return null;
    }

    try {
      const decoded = Buffer.from(state, "base64url").toString("utf8");
      const payload = JSON.parse(decoded) as {
        nonce?: string;
        mallId?: string;
      };

      return payload;
    } catch (error) {
      console.warn("⚠️  Cafe24 OAuth state 파싱에 실패했습니다.", error);
      return null;
    }
  }

  private resolveMallId(mallIdOverride?: string | null): string {
    console.log("🔍 resolveMallId 호출:");
    console.log("- mallIdOverride:", mallIdOverride);
    console.log("- mallIdOverride type:", typeof mallIdOverride);
    console.log("- mallIdOverride truthy:", !!mallIdOverride);

    // mallIdOverride가 있으면 사용 (필수)
    if (mallIdOverride) {
      console.log("✅ mallIdOverride 사용:", mallIdOverride);
      return mallIdOverride;
    }

    // mallIdOverride가 없으면 에러 (환경변수 fallback 제거)
    throw new Error(
      "카페24 Mall ID가 필요합니다. mall_id 파라미터를 전달해주세요."
    );
  }

  private async resolveMallIdForServer(
    mallIdOverride?: string | null
  ): Promise<string> {
    // mallIdOverride가 있으면 우선 사용
    if (mallIdOverride) {
      return mallIdOverride;
    }

    // 쿠키에서 mallId 조회
    try {
      const cookieStore = await cookies();
      const mallIdFromCookie = cookieStore.get("cafe24_mall_id")?.value;

      if (mallIdFromCookie) {
        return mallIdFromCookie;
      }
    } catch (error) {
      console.warn(
        "⚠️  쿠키에서 Cafe24 Mall ID를 읽는 데 실패했습니다.",
        error
      );
    }

    // 환경변수 fallback
    return this.resolveMallId();
  }

  private buildApiBaseUrl(mallId: string): string {
    return `https://${mallId}.cafe24api.com/api/v2`;
  }

  private getBasicAuthHeader(): string {
    const authHeader = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`
    ).toString("base64");

    console.log("🔄 authHeader: ", authHeader);

    return authHeader;
  }

  private async storeTokens(tokenData: Cafe24TokenResponse): Promise<void> {
    if (typeof window === "undefined") {
      // 서버 사이드에서 쿠키에 저장
      const cookieStore = await cookies();

      const expiresAt = new Date(tokenData.expires_at);
      const refreshExpiresAt = new Date(tokenData.refresh_token_expires_at);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict" as const,
        path: "/",
      };

      // Access token 저장 (2시간)
      cookieStore.set("cafe24_access_token", tokenData.access_token, {
        ...cookieOptions,
        expires: expiresAt,
      });

      // Refresh token 저장 (14일)
      cookieStore.set("cafe24_refresh_token", tokenData.refresh_token, {
        ...cookieOptions,
        expires: refreshExpiresAt,
      });

      // 만료 시간 저장
      cookieStore.set("cafe24_expires_at", tokenData.expires_at, {
        ...cookieOptions,
        expires: expiresAt,
      });

      // 사용자 정보 저장
      cookieStore.set("cafe24_user_id", tokenData.user_id, {
        ...cookieOptions,
        expires: refreshExpiresAt,
      });

      cookieStore.set("cafe24_mall_id", tokenData.mall_id, {
        ...cookieOptions,
        expires: refreshExpiresAt,
      });
    }
  }
}

// 싱글톤 인스턴스 생성
export const cafe24OAuth = new Cafe24OAuth();

// 🔄 기존 코드와의 호환성을 위한 함수들
// 새로운 코드에서는 cafe24OAuth 인스턴스를 직접 사용하는 것을 권장합니다.

/**
 * @deprecated cafe24OAuth.getProduct()를 사용하세요
 */
export async function getProduct(
  productNo: number,
  mallId?: string
): Promise<Cafe24Product> {
  return await cafe24OAuth.getProduct(productNo, mallId);
}

/**
 * @deprecated cafe24OAuth.getProducts()를 사용하세요
 */
export async function getProducts(
  limit: number = 10,
  offset: number = 0,
  mallId?: string
): Promise<Cafe24Product[]> {
  return await cafe24OAuth.getProducts({ limit, offset, mallId });
}

/**
 * @deprecated cafe24OAuth.getProductImages()를 사용하세요
 */
export async function getProductImages(
  productNo: number,
  mallId?: string
): Promise<
  Array<{
    image_no: number;
    image_url: string;
    image_type: string;
    image_path: string;
  }>
> {
  return await cafe24OAuth.getProductImages(productNo, mallId);
}

/**
 * @deprecated cafe24OAuth.apiCall()을 사용하세요
 */
export async function cafe24ApiCall<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: Record<string, unknown>,
  retryOnUnauthorized: boolean = true,
  mallId?: string
): Promise<T> {
  return await cafe24OAuth.apiCall<T>(
    endpoint,
    method,
    body,
    retryOnUnauthorized,
    mallId
  );
}

// 타입 re-export (기존 코드 호환성)
export type { Cafe24Product } from "@/types/cafe24";
