import { NextRequest } from "next/server";
import { getUserFromRequest as getJwtUser } from "./jwt-server";

/**
 * @deprecated 기존 토큰 기반 인증 - JWT 쿠키 기반으로 마이그레이션됨
 * 호환성을 위해 유지하지만 새로운 getUserFromRequest 사용 권장
 */
export async function getUserFromRequestLegacy(req: NextRequest) {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return null;

    // 토큰 검증 및 사용자 정보 조회
    const response = await fetch(`${process.env.AUTH_API_URL}/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const user = await response.json();
    return user;
  } catch (error) {
    console.error("[Auth] 토큰 검증 실패:", error);
    return null;
  }
}

/**
 * JWT 쿠키 기반 사용자 정보 조회 (새로운 방식)
 */
export async function getUserFromRequest(req: NextRequest) {
  return await getJwtUser(req);
}
