import { NextRequest, NextResponse } from "next/server";
import {
  Business,
  BusinessCreateInput,
  BusinessUpdateInput,
} from "@/types/business";

// Mock 비즈니스 데이터
const mockBusiness: Business = {
  id: "business_1",
  userId: "user_1",
  businessName: "스타일링 브랜드",
  businessNumber: "123-45-67890",
  businessType: "BRAND",
  description: "트렌디한 패션 아이템을 제공하는 브랜드입니다.",
  location: "서울특별시 강남구",
  website: "https://stylingbrand.com",
  contactEmail: "contact@stylingbrand.com",
  contactPhone: "02-1234-5678",
  isApproved: true,
  approvedAt: new Date("2024-01-01"),
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-15"),
  user: {
    id: "user_1",
    userId: "stylingowner",
    email: "owner@stylingbrand.com",
    name: "김스타일",
    profile: "/images/profile/owner.jpg",
    phoneNumber: "010-1234-5678",
    isBusiness: true,
    isAdmin: false,
  },
  stores: [
    {
      id: "store_1",
      businessId: "business_1",
      storeName: "메인 스토어",
      storeCode: "MAIN_001",
      description: "메인 매장",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
  ],
};

/**
 * @swagger
 * /api/business:
 *   get:
 *     tags:
 *       - Business
 *     summary: 비즈니스 정보 조회
 *     description: 현재 인증된 사용자의 비즈니스 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 비즈니스 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 비즈니스 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다" },
        { status: 401 }
      );
    }

    // Mock 데이터 반환
    return NextResponse.json({ business: mockBusiness });
  } catch (error) {
    console.error("비즈니스 정보 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/business:
 *   post:
 *     tags:
 *       - Business
 *     summary: 비즈니스 생성
 *     description: 새로운 비즈니스를 생성합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: 비즈니스명
 *               businessNumber:
 *                 type: string
 *                 description: 사업자 번호
 *               businessType:
 *                 type: string
 *                 enum: [BRAND, SELLER, DISTRIBUTOR]
 *                 description: 비즈니스 유형
 *               description:
 *                 type: string
 *                 description: 비즈니스 설명
 *               location:
 *                 type: string
 *                 description: 위치
 *               website:
 *                 type: string
 *                 description: 웹사이트 URL
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: 연락처 이메일
 *               contactPhone:
 *                 type: string
 *                 description: 연락처 전화번호
 *             required:
 *               - businessName
 *               - businessNumber
 *               - businessType
 *               - contactEmail
 *               - contactPhone
 *     responses:
 *       201:
 *         description: 비즈니스 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다" },
        { status: 401 }
      );
    }

    const data: BusinessCreateInput = await request.json();

    // 새 비즈니스 생성 (Mock)
    const newBusiness: Business = {
      id: `business_${Date.now()}`,
      userId: "user_1",
      businessName: data.businessName,
      businessNumber: data.businessNumber,
      businessType: data.businessType,
      description: data.description,
      location: data.location,
      website: data.website,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      isApproved: false, // 새로 등록된 비즈니스는 승인 대기
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockBusiness.user,
      stores: [],
    };

    return NextResponse.json({ business: newBusiness }, { status: 201 });
  } catch (error) {
    console.error("비즈니스 등록 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/business:
 *   put:
 *     tags:
 *       - Business
 *     summary: 비즈니스 정보 수정
 *     description: 현재 인증된 사용자의 비즈니스 정보를 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *                 description: 비즈니스명
 *               description:
 *                 type: string
 *                 description: 비즈니스 설명
 *               location:
 *                 type: string
 *                 description: 위치
 *               website:
 *                 type: string
 *                 description: 웹사이트 URL
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 description: 연락처 이메일
 *               contactPhone:
 *                 type: string
 *                 description: 연락처 전화번호
 *     responses:
 *       200:
 *         description: 비즈니스 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Business'
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 비즈니스 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "인증 토큰이 필요합니다" },
        { status: 401 }
      );
    }

    const data: BusinessUpdateInput = await request.json();

    // 비즈니스 정보 업데이트 (Mock)
    const updatedBusiness: Business = {
      ...mockBusiness,
      ...(data.businessName && { businessName: data.businessName }),
      ...(data.businessNumber && { businessNumber: data.businessNumber }),
      ...(data.businessType && { businessType: data.businessType }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.contactEmail !== undefined && {
        contactEmail: data.contactEmail,
      }),
      ...(data.contactPhone !== undefined && {
        contactPhone: data.contactPhone,
      }),
      updatedAt: new Date(),
    };

    return NextResponse.json({ business: updatedBusiness });
  } catch (error) {
    console.error("비즈니스 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
