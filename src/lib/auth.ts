import { NextRequest } from "next/server";

export async function getUserFromRequest(req: NextRequest) {
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
