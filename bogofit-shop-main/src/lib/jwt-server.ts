import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { CustomJWTPayload } from "./jwt";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-here"
);
const COOKIE_NAME = "auth-token";

/**
 * JWT 토큰 생성
 */
export async function createJWT(
  payload: Omit<CustomJWTPayload, "iat" | "exp">
): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return jwt;
}

/**
 * JWT 토큰 검증
 */
export async function verifyJWT(
  token: string
): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as CustomJWTPayload;
  } catch (error) {
    console.error("[JWT] 토큰 검증 실패:", error);
    return null;
  }
}

/**
 * 응답에 인증 쿠키 설정
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });
}

/**
 * 응답에서 인증 쿠키 제거
 */
export function removeAuthCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}

/**
 * 쿠키에서 사용자 정보 조회
 */
export async function getUserFromCookies(): Promise<CustomJWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return await verifyJWT(token);
  } catch (error) {
    console.error("[JWT] 쿠키에서 사용자 정보 조회 실패:", error);
    return null;
  }
}

/**
 * 요청에서 사용자 정보 조회
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<CustomJWTPayload | null> {
  try {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    return await verifyJWT(token);
  } catch (error) {
    console.error("[JWT] 요청에서 사용자 정보 조회 실패:", error);
    return null;
  }
}

/**
 * 인증이 필요한 API에서 사용하는 헬퍼 함수
 */
export async function requireAuth(
  request: NextRequest
): Promise<[CustomJWTPayload | null, NextResponse | null]> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return [
      null,
      NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 }),
    ];
  }

  return [user, null];
}

/**
 * 비즈니스 사용자 인증이 필요한 API에서 사용하는 헬퍼 함수
 */
export async function requireBusinessAuth(
  request: NextRequest
): Promise<[CustomJWTPayload | null, NextResponse | null]> {
  const [user, errorResponse] = await requireAuth(request);

  if (errorResponse) {
    return [null, errorResponse];
  }

  if (!user?.isBusiness) {
    return [
      null,
      NextResponse.json(
        { error: "비즈니스 계정이 필요합니다" },
        { status: 403 }
      ),
    ];
  }

  return [user, null];
}

/**
 * @deprecated 호환성을 위해 유지
 */
export async function verifyBusinessJwt(
  token: string
): Promise<CustomJWTPayload | null> {
  return await verifyJWT(token);
}
