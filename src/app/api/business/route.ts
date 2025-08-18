import { NextRequest, NextResponse } from "next/server";
import { checkBusinessAuth } from "@/lib/businessAuth";
import { prisma } from "@/lib/prisma";

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
    // JWT 기반 사업자 인증 체크
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    if (!businessUser) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }

    // 사용자의 브랜드 정보 조회
    const brand = await prisma.brand.findUnique({
      where: { id: businessUser.brandId },
      include: {
        users: {
          select: {
            id: true,
            userId: true,
            email: true,
            name: true,
            profile: true,
            phoneNumber: true,
            isBusiness: true,
            isAdmin: true,
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "브랜드 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // Business 형태로 데이터 변환
    const businessData = {
      id: brand.id.toString(),
      userId: businessUser.id,
      businessName: brand.name,
      businessNumber: brand.businessNumber || "",
      businessType: "BRAND" as const,
      description: brand.description || "",
      location: "", // Brand 모델에 location 필드가 없음
      website: "", // Brand 모델에 website 필드가 없음
      contactEmail: businessUser.email,
      contactPhone: businessUser.brand.name, // 임시로 브랜드명 사용
      isApproved: brand.status === "APPROVED",
      approvedAt: brand.status === "APPROVED" ? brand.createdAt : null,
      createdAt: brand.createdAt,
      updatedAt: brand.updatedAt,
      user: {
        id: businessUser.id,
        userId: businessUser.userId,
        email: businessUser.email,
        name: businessUser.name,
        profile: null,
        phoneNumber: null,
        isBusiness: businessUser.isBusiness,
        isAdmin: false,
      },
      stores: [], // 현재 Store 모델이 없으므로 빈 배열
    };

    return NextResponse.json({ business: businessData });
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
    // JWT 기반 사업자 인증 체크
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    if (!businessUser) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // 브랜드 정보 업데이트 (POST는 브랜드 생성이 아닌 업데이트로 사용)
    const updatedBrand = await prisma.brand.update({
      where: { id: businessUser.brandId },
      data: {
        name: data.businessName || businessUser.brand.name,
        description: data.description,
        businessNumber: data.businessNumber,
        // 추가 필드들은 필요시 Brand 모델에 추가 후 사용
      },
    });

    // Business 형태로 응답 데이터 구성
    const businessData = {
      id: updatedBrand.id.toString(),
      userId: businessUser.id,
      businessName: updatedBrand.name,
      businessNumber: updatedBrand.businessNumber || "",
      businessType: "BRAND" as const,
      description: updatedBrand.description || "",
      location: data.location || "",
      website: data.website || "",
      contactEmail: data.contactEmail || businessUser.email,
      contactPhone: data.contactPhone || "",
      isApproved: updatedBrand.status === "APPROVED",
      approvedAt:
        updatedBrand.status === "APPROVED" ? updatedBrand.createdAt : null,
      createdAt: updatedBrand.createdAt,
      updatedAt: updatedBrand.updatedAt,
      user: {
        id: businessUser.id,
        userId: businessUser.userId,
        email: businessUser.email,
        name: businessUser.name,
        profile: null,
        phoneNumber: null,
        isBusiness: businessUser.isBusiness,
        isAdmin: false,
      },
      stores: [],
    };

    return NextResponse.json({ business: businessData }, { status: 201 });
  } catch (error) {
    console.error("비즈니스 정보 업데이트 실패:", error);
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
    // JWT 기반 사업자 인증 체크
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    if (!businessUser) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // 브랜드 정보 부분 업데이트
    const updateData: {
      name?: string;
      businessNumber?: string;
      description?: string;
    } = {};
    if (data.businessName) updateData.name = data.businessName;
    if (data.businessNumber !== undefined)
      updateData.businessNumber = data.businessNumber;
    if (data.description !== undefined)
      updateData.description = data.description;

    const updatedBrand = await prisma.brand.update({
      where: { id: businessUser.brandId },
      data: updateData,
    });

    // Business 형태로 응답 데이터 구성
    const businessData = {
      id: updatedBrand.id.toString(),
      userId: businessUser.id,
      businessName: updatedBrand.name,
      businessNumber: updatedBrand.businessNumber || "",
      businessType: "BRAND" as const,
      description: updatedBrand.description || "",
      location: data.location || "",
      website: data.website || "",
      contactEmail: data.contactEmail || businessUser.email,
      contactPhone: data.contactPhone || "",
      isApproved: updatedBrand.status === "APPROVED",
      approvedAt:
        updatedBrand.status === "APPROVED" ? updatedBrand.createdAt : null,
      createdAt: updatedBrand.createdAt,
      updatedAt: updatedBrand.updatedAt,
      user: {
        id: businessUser.id,
        userId: businessUser.userId,
        email: businessUser.email,
        name: businessUser.name,
        profile: null,
        phoneNumber: null,
        isBusiness: businessUser.isBusiness,
        isAdmin: false,
      },
      stores: [],
    };

    return NextResponse.json({ business: businessData });
  } catch (error) {
    console.error("비즈니스 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
