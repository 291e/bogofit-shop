import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// userId는 반드시 User의 id(uuid)로만 사용해야 합니다.
// 프론트엔드에서도 user.id만 전달해야 하며, user.userId(로그인용)는 절대 사용하지 마세요.

/**
 * @swagger
 * /api/address:
 *   get:
 *     tags:
 *       - User
 *     summary: 주소 목록 조회
 *     description: 사용자의 배송 주소 목록을 조회합니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID (UUID)
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: 주소 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: 주소 ID
 *                   name:
 *                     type: string
 *                     description: 주소 별칭
 *                   recipientName:
 *                     type: string
 *                     description: 수령자명
 *                   phone:
 *                     type: string
 *                     description: 전화번호
 *                   zipCode:
 *                     type: string
 *                     description: 우편번호
 *                   address:
 *                     type: string
 *                     description: 주소
 *                   addressDetail:
 *                     type: string
 *                     description: 상세주소
 *                   isDefault:
 *                     type: boolean
 *                     description: 기본 주소 여부
 *       400:
 *         description: userId 누락
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
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId가 필요합니다." },
        { status: 400 }
      );
    }

    // userId는 반드시 User의 id(uuid)
    const addresses = await prisma.address.findMany({
      where: {
        userId: userId, // userId는 User.id(uuid)
      },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("주소 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "주소 목록을 불러오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/address:
 *   post:
 *     tags:
 *       - User
 *     summary: 새 배송 주소 추가
 *     description: 사용자의 새로운 배송 주소를 추가합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 ID (UUID)
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               label:
 *                 type: string
 *                 description: 주소 별칭
 *                 example: "우리집"
 *               recipientName:
 *                 type: string
 *                 description: 수령자명
 *                 example: "홍길동"
 *               phone:
 *                 type: string
 *                 description: 전화번호
 *                 example: "010-1234-5678"
 *               zipCode:
 *                 type: string
 *                 description: 우편번호
 *                 example: "12345"
 *               address:
 *                 type: string
 *                 description: 주소
 *                 example: "서울시 강남구 역삼동"
 *               addressDetail:
 *                 type: string
 *                 description: 상세주소
 *                 example: "123-45 상세주소"
 *               isDefault:
 *                 type: boolean
 *                 description: 기본 주소로 설정할지 여부
 *                 example: false
 *             required:
 *               - userId
 *               - label
 *               - recipientName
 *               - phone
 *               - zipCode
 *               - address
 *     responses:
 *       201:
 *         description: 주소 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 성공 메시지
 *                 address:
 *                   type: object
 *                   description: 생성된 주소 정보
 *       400:
 *         description: 필수 필드 누락 또는 잘못된 요청
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
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // 필수 필드 검증
    if (
      !data.userId ||
      !data.label ||
      !data.recipient ||
      !data.zipCode ||
      !data.address1 ||
      !data.phone
    ) {
      return NextResponse.json(
        { error: "모든 필수 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 기본 주소로 설정하는 경우, 기존 기본 주소 해제
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: data.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // userId가 실제 User 테이블에 존재하는지 확인 (id로 조회)

    const existingUser = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "존재하지 않는 사용자입니다. 다시 로그인해주세요." },
        { status: 400 }
      );
    }

    // 새 주소 생성
    const address = await prisma.address.create({
      data: {
        userId: data.userId, // 반드시 User.id(uuid)
        label: data.label,
        recipient: data.recipient,
        zipCode: data.zipCode,
        address1: data.address1,
        address2: data.address2 || null,
        phone: data.phone,
        isDefault: data.isDefault || false,
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error) {
    console.error("주소 추가 오류:", error);
    return NextResponse.json(
      { error: "주소 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
