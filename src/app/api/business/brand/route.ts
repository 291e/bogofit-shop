import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBusinessAuth } from "@/lib/businessAuth";

/**
 * @swagger
 * /api/business/brand:
 *   get:
 *     tags:
 *       - Brand
 *     summary: 브랜드 정보 조회
 *     description: 현재 인증된 비즈니스의 브랜드 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 브랜드 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 브랜드 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    const [user, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const brand = await prisma.brand.findUnique({
      where: { id: user!.brandId! },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        businessNumber: true,
        bankAccount: true,
        bankCode: true,
        accountHolder: true,
        status: true,
        isActive: true,
        commissionRate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!brand) {
      return NextResponse.json(
        { error: "브랜드 정보를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { brand },
    });
  } catch (error) {
    console.error("브랜드 정보 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/business/brand:
 *   put:
 *     tags:
 *       - Brand
 *     summary: 브랜드 정보 수정
 *     description: 현재 인증된 비즈니스의 브랜드 정보를 수정합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 브랜드명
 *               logo:
 *                 type: string
 *                 description: 브랜드 로고 URL
 *               description:
 *                 type: string
 *                 description: 브랜드 설명
 *               businessNumber:
 *                 type: string
 *                 description: 사업자 번호
 *               bankAccount:
 *                 type: string
 *                 description: 계좌번호
 *               bankCode:
 *                 type: string
 *                 description: 은행코드
 *               accountHolder:
 *                 type: string
 *                 description: 예금주명
 *     responses:
 *       200:
 *         description: 브랜드 정보 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 brand:
 *                   $ref: '#/components/schemas/Brand'
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
 *         description: 브랜드 정보를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest) {
  try {
    const [user, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const {
      name,
      description,
      logo,
      businessNumber,
      bankAccount,
      bankCode,
      accountHolder,
    } = body;

    // 필수 필드 검증
    if (!name) {
      return NextResponse.json(
        { error: "브랜드명은 필수 항목입니다" },
        { status: 400 }
      );
    }

    // 브랜드명 중복 체크 (자신 제외)
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name,
        id: { not: user!.brandId! },
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "이미 사용 중인 브랜드명입니다" },
        { status: 400 }
      );
    }

    // slug 자동 생성
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    // 브랜드 정보 업데이트
    const updatedBrand = await prisma.brand.update({
      where: { id: user!.brandId! },
      data: {
        name,
        slug,
        description: description || null,
        logo: logo || null,
        businessNumber: businessNumber || null,
        bankAccount: bankAccount || null,
        bankCode: bankCode || null,
        accountHolder: accountHolder || null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        businessNumber: true,
        bankAccount: true,
        bankCode: true,
        accountHolder: true,
        status: true,
        isActive: true,
        updatedAt: true,
      },
    });

    console.log(
      `브랜드 정보 업데이트 성공: ${updatedBrand.id} - ${updatedBrand.name}`
    );

    return NextResponse.json({
      success: true,
      data: { brand: updatedBrand },
      message: "브랜드 정보가 성공적으로 업데이트되었습니다",
    });
  } catch (error) {
    console.error("브랜드 정보 수정 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
