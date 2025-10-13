import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireBusinessAuth } from "./jwt-server";

export interface BusinessUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  isBusiness: boolean;
  brandId: number;
  brand: {
    id: number;
    name: string;
    slug: string;
    status: string;
    isActive: boolean;
  };
}

export interface BusinessAuthError {
  error: string;
  status: number;
}

/**
 * Business API에서 사용하는 JWT 기반 인증 체크 함수
 * @returns [BusinessUser | null, NextResponse | null]
 */
export async function checkBusinessAuth(
  request: NextRequest
): Promise<[BusinessUser | null, NextResponse | null]> {
  const [jwtUser, errorResponse] = await requireBusinessAuth(request);

  if (errorResponse) {
    return [null, errorResponse];
  }

  if (!jwtUser) {
    return [
      null,
      NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      ),
    ];
  }

  try {
    // DB에서 사용자 정보 조회 (브랜드 정보 포함)
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.userId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    if (!user) {
      return [
        null,
        NextResponse.json(
          { error: "사용자를 찾을 수 없습니다" },
          { status: 404 }
        ),
      ];
    }

    // 사업자가 아니면 에러
    if (!user.isBusiness) {
      return [
        null,
        NextResponse.json({ error: "사업자 계정이 아닙니다" }, { status: 403 }),
      ];
    }

    // 브랜드가 없으면 에러 (자동 생성 안 함!)
    const brand = user.brand;
    if (!brand || !user.brandId) {
      console.log(`[BusinessAuth] 사용자 ${user.id}에게 브랜드가 할당되지 않았습니다`);
      return [
        null,
        NextResponse.json(
          { error: "브랜드가 할당되지 않았습니다. 관리자에게 문의하세요." },
          { status: 403 }
        ),
      ];
    }

    const businessUser: BusinessUser = {
      id: user.id,
      userId: user.userId,
      name: user.name || user.userId,
      email: user.email,
      isBusiness: user.isBusiness,
      brandId: brand.id,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        status: brand.status,
        isActive: brand.isActive,
      },
    };

    return [businessUser, null];
  } catch (error) {
    console.error("[BusinessAuth] 인증 처리 중 오류:", error);
    return [
      null,
      NextResponse.json(
        { error: "인증 처리 중 오류가 발생했습니다" },
        { status: 500 }
      ),
    ];
  }
}



/**
 * x-user-id 헤더에서 사용자 ID 추출
 */
function extractUserIdFromHeader(request: NextRequest): string | null {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    console.error("[BusinessAuth] x-user-id 헤더가 없습니다");
    return null;
  }

  console.log("[BusinessAuth] 사용자 ID 추출:", userId);
  return userId;
}

/**
 * x-user-data 헤더에서 추가 사용자 정보 추출 (선택적)
 */
function extractUserDataFromHeader(
  request: NextRequest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | null {
  const userData = request.headers.get("x-user-data");
  if (userData) {
    try {
      return JSON.parse(decodeURIComponent(userData));
    } catch (e) {
      console.error("[BusinessAuth] x-user-data 파싱 실패:", e);
    }
  }
  return null;
}

/**
 * 사용자용 브랜드를 생성하는 함수
 * @param userId 사용자 ID
 * @param userName 사용자 이름
 * @returns 생성된 브랜드 정보
 */
export async function createBrandForUser(userId: string, userName: string) {
  const brandName = `${userName}의 브랜드`;
  const slug = `${userName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

  const brand = await prisma.brand.create({
    data: {
      name: brandName,
      slug: slug,
      description: `${userName}님의 브랜드입니다`,
      logo: "/logo.png",
      status: "APPROVED",
      isActive: true,
      businessNumber: "",
      commissionRate: 0.05,
      bankAccount: "",
      bankCode: "",
      accountHolder: userName,
    },
  });

  console.log(
    `[BusinessAuth] 브랜드 생성 완료: ${brand.name} (ID: ${brand.id})`
  );
  return brand;
}

/**
 * 헤더 기반 실제 사용자 인증
 */
export async function getUserBusinessInfo(
  request: NextRequest
): Promise<BusinessUser | BusinessAuthError> {
  try {
    // x-user-id 헤더에서 사용자 ID 추출
    const userId = extractUserIdFromHeader(request);
    if (!userId) {
      return { error: "사용자 ID가 필요합니다", status: 401 };
    }

    // 추가 사용자 데이터 추출 (선택적)
    const additionalUserData = extractUserDataFromHeader(request);

    // 로컬 DB에서 사용자 조회
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    // 사용자가 없으면 생성 (추가 데이터 활용)
    if (!user) {
      const userData = additionalUserData || {};
      const userName = userData.userId || userData.name || userId;
      const userEmail = userData.email || `${userId}@business.com`;
      const isBusiness =
        userData.isBusiness !== undefined ? userData.isBusiness : true;

      console.log(
        `[BusinessAuth] 새 사용자 생성: ${userId} (isBusiness: ${isBusiness})`
      );
      user = await prisma.user.create({
        data: {
          id: userId,
          userId: userName,
          email: userEmail,
          name: userName,
          isBusiness: isBusiness,
        },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              status: true,
              isActive: true,
            },
          },
        },
      });
    }

    // 비즈니스 사용자가 아니면 에러
    if (!user.isBusiness) {
      return { error: "비즈니스 계정이 아닙니다", status: 403 };
    }

    // 브랜드가 없으면 에러 (자동 생성 안 함!)
    const brand = user.brand;
    if (!brand || !user.brandId) {
      console.log(`[BusinessAuth] 사용자 ${user.id}에게 브랜드가 할당되지 않았습니다`);
      return { 
        error: "브랜드가 할당되지 않았습니다. 관리자에게 문의하세요.", 
        status: 403 
      };
    }

    return {
      id: user.id,
      userId: user.userId,
      name: user.name || user.userId,
      email: user.email,
      isBusiness: user.isBusiness,
      brandId: brand.id,
      brand: {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        status: brand.status,
        isActive: brand.isActive,
      },
    };
  } catch (error) {
    console.error("[BusinessAuth] 오류:", error);
    return { error: "인증 처리 중 오류가 발생했습니다", status: 500 };
  }
}

/**
 * JWT 쿠키 기반 비즈니스 인증 체크 (새로운 방식)
 */
export async function checkJwtBusinessAuth(
  request: NextRequest
): Promise<[BusinessUser | null, NextResponse | null]> {
  const [jwtUser, errorResponse] = await requireBusinessAuth(request);

  if (errorResponse) {
    return [null, errorResponse];
  }

  // JWT 사용자 정보를 BusinessUser 형태로 변환
  const businessUser: BusinessUser = {
    id: jwtUser!.userId,
    userId: jwtUser!.userId,
    name: jwtUser!.name,
    email: jwtUser!.email,
    isBusiness: jwtUser!.isBusiness,
    brandId: jwtUser!.brandId || 0,
    brand: {
      id: jwtUser!.brandId || 0,
      name: "브랜드", // 실제로는 DB에서 조회해야 함
      slug: "brand-slug",
      status: "APPROVED",
      isActive: true,
    },
  };

  return [businessUser, null];
}

/**
 * 헤더 기반 비즈니스 인증 체크 (기존 방식 - 호환성 유지)
 */
export async function checkHeaderBusinessAuth(
  request: NextRequest
): Promise<[BusinessUser | null, NextResponse | null]> {
  const authResult = await getUserBusinessInfo(request);

  if ("error" in authResult) {
    return [
      null,
      NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      ),
    ];
  }

  return [authResult, null];
}

/**
 * Business API에서 사용하는 브랜드 권한 체크 함수
 * @param user BusinessUser 객체
 * @param brandId 체크할 브랜드 ID
 * @returns boolean
 */
export function checkBrandPermission(
  user: BusinessUser,
  brandId: number
): boolean {
  return user.brandId === brandId;
}

/**
 * Business API에서 사용하는 상품 권한 체크 함수
 * @param user BusinessUser 객체
 * @param productBrandId 상품의 브랜드 ID
 * @returns boolean
 */
export function checkProductPermission(
  user: BusinessUser,
  productBrandId: number | null
): boolean {
  if (!productBrandId) return false;
  return user.brandId === productBrandId;
}
