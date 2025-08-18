// GraphQL 토큰 페이로드 타입
export interface GraphQLTokenPayload {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

// 커스텀 JWT 토큰 페이로드 타입 (클라이언트에서도 사용 가능하도록 중복 정의)
export interface CustomJWTPayload {
  userId: string;
  email: string;
  name: string;
  isBusiness: boolean;
  brandId?: number;
  iat?: number;
  exp?: number;
}

/**
 * Base64URL 디코딩 함수 (브라우저 호환)
 */
function base64UrlDecode(str: string): string {
  // base64url을 base64로 변환
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  // 패딩 추가
  while (str.length % 4) {
    str += "=";
  }

  if (typeof window !== "undefined") {
    // 브라우저 환경
    return atob(str);
  } else {
    // Node.js 환경
    return Buffer.from(str, "base64").toString("utf8");
  }
}

/**
 * GraphQL JWT 토큰 디코딩 (검증 없이)
 * GraphQL에서 받은 토큰의 페이로드를 추출
 * 클라이언트에서도 사용 가능
 */
export function decodeGraphQLToken(token: string): GraphQLTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(base64UrlDecode(payload));

    return decoded as GraphQLTokenPayload;
  } catch (error) {
    console.error("GraphQL 토큰 디코딩 실패:", error);
    return null;
  }
}
