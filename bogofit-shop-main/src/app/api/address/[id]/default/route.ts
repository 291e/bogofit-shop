import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/address/{id}/default:
 *   put:
 *     tags:
 *       - Address
 *     summary: 기본 배송지 설정
 *     description: 선택한 주소를 기본 배송지로 설정합니다. 기존 기본 배송지는 자동으로 해제됩니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 기본 주소로 설정할 주소 ID
 *     responses:
 *       200:
 *         description: 기본 배송지 설정 성공
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
 *       404:
 *         description: 존재하지 않는 주소
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// 기본 배송지 설정
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

    // 해당 주소 조회
    const address = await prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      return NextResponse.json(
        { error: "존재하지 않는 주소입니다." },
        { status: 404 }
      );
    }

    // 기존 기본 주소 해제
    await prisma.address.updateMany({
      where: {
        userId: address.userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // 새 기본 주소 설정
    await prisma.address.update({
      where: { id },
      data: {
        isDefault: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("기본 주소 설정 오류:", error);
    return NextResponse.json(
      { error: "기본 주소 설정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
