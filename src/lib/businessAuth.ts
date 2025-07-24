import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 테스트용 고정 브랜드 ID (개발 편의성을 위해)
const FIXED_BRAND_ID = 1;
const FIXED_USER_ID = "test-business-user";

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
 * 테스트용 고정 브랜드 정보를 반환하는 함수
 * @returns BusinessUser 또는 BusinessAuthError
 */
export async function getFixedBusinessUser(): Promise<
  BusinessUser | BusinessAuthError
> {
  try {
    // 고정 브랜드 조회 (없으면 생성)
    let brand = await prisma.brand.findFirst({
      where: { id: FIXED_BRAND_ID },
    });

    if (!brand) {
      // 브랜드가 없으면 테스트용 브랜드 생성
      brand = await prisma.brand.create({
        data: {
          id: FIXED_BRAND_ID,
          name: "테스트 브랜드",
          slug: "test-brand",
          description: "Business API 테스트용 브랜드입니다",
          logo: "/logo.png",
          status: "APPROVED",
          isActive: true,
          businessNumber: "123-45-67890",
          commissionRate: 0.05,
          bankAccount: "123456789",
          bankCode: "088",
          accountHolder: "테스트 브랜드",
        },
      });
    }

    return {
      id: FIXED_USER_ID,
      userId: FIXED_USER_ID,
      name: "테스트 비즈니스 사용자",
      email: "business@example.com",
      isBusiness: true,
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
    console.error("Fixed business user error:", error);
    return {
      error: "브랜드 정보 조회 중 오류가 발생했습니다",
      status: 500,
    };
  }
}

/**
 * Business API에서 사용하는 단순화된 인증 체크 함수
 * @returns [BusinessUser | null, NextResponse | null]
 */
export async function checkBusinessAuth(): Promise<
  [BusinessUser | null, NextResponse | null]
> {
  const authResult = await getFixedBusinessUser();

  // 실패 시 에러 응답 반환
  if ("error" in authResult) {
    return [
      null,
      NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      ),
    ];
  }

  // 성공 시 사용자 정보 반환
  return [authResult, null];
}

/**
 * 고정 브랜드 ID를 반환하는 헬퍼 함수
 * @returns 고정 브랜드 ID
 */
export function getFixedBrandId(): number {
  return FIXED_BRAND_ID;
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
