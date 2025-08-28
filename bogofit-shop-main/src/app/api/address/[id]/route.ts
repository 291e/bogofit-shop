import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/address/{id}:
 *   put:
 *     tags:
 *       - Address
 *     summary: 주소 수정
 *     description: 기존 배송 주소를 수정합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주소 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - label
 *               - recipient
 *               - zipCode
 *               - address1
 *               - phone
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 사용자 ID
 *                 example: "user123"
 *               label:
 *                 type: string
 *                 description: 주소 라벨
 *                 example: "우리집"
 *               recipient:
 *                 type: string
 *                 description: 수령인 이름
 *                 example: "김철수"
 *               zipCode:
 *                 type: string
 *                 description: 우편번호
 *                 example: "12345"
 *               address1:
 *                 type: string
 *                 description: 기본 주소
 *                 example: "서울시 강남구 테헤란로 123"
 *               address2:
 *                 type: string
 *                 description: 상세 주소
 *                 example: "456호"
 *               phone:
 *                 type: string
 *                 description: 연락처
 *                 example: "010-1234-5678"
 *               isDefault:
 *                 type: boolean
 *                 description: 기본 주소 여부
 *                 example: false
 *     responses:
 *       200:
 *         description: 주소 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 address:
 *                   type: object
 *                   description: 수정된 주소 정보
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags:
 *       - Address
 *     summary: 주소 삭제
 *     description: 배송 주소를 삭제합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 주소 ID
 *     responses:
 *       200:
 *         description: 주소 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 유효하지 않은 주소 ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// 주소 수정
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

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
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // 주소 업데이트
    const address = await prisma.address.update({
      where: { id },
      data: {
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
    console.error("주소 수정 오류:", error);
    return NextResponse.json(
      { error: "주소 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 주소 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "유효하지 않은 주소 ID입니다." },
        { status: 400 }
      );
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("주소 삭제 오류:", error);
    return NextResponse.json(
      { error: "주소 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
