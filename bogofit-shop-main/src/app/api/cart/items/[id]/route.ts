import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/cart/items/{id}:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: 장바구니 아이템 수량 변경
 *     description: 장바구니에 있는 특정 아이템의 수량을 변경합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 장바구니 아이템 ID
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: 변경할 수량
 *                 example: 3
 *     responses:
 *       200:
 *         description: 수량 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "수량이 변경되었습니다."
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 잘못된 요청 (재고 부족 등)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 장바구니 아이템을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     tags:
 *       - Cart
 *     summary: 장바구니 아이템 삭제
 *     description: 장바구니에서 특정 아이템을 제거합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 장바구니 아이템 ID
 *       - in: header
 *         name: x-user-id
 *         required: true
 *         schema:
 *           type: string
 *         description: 사용자 ID
 *     responses:
 *       200:
 *         description: 아이템 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "상품이 장바구니에서 제거되었습니다."
 *                 success:
 *                   type: boolean
 *                   example: true
 *       401:
 *         description: 인증 필요
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 장바구니 아이템을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

// 장바구니 아이템 수정 (수량 변경)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);
    const { quantity } = await req.json();

    if (!quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "올바른 수량을 입력해주세요." },
        { status: 400 }
      );
    }

    // 장바구니 아이템 확인 (사용자 권한 체크 포함)
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: userId,
        },
      },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 재고 확인
    if (cartItem.variant.stock < quantity) {
      return NextResponse.json(
        { error: "재고가 부족합니다." },
        { status: 400 }
      );
    }

    // 수량 업데이트
    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // 장바구니 업데이트 시간 갱신
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "수량이 변경되었습니다.",
      success: true,
    });
  } catch (error: unknown) {
    console.error("장바구니 아이템 수정 실패:", error);
    return NextResponse.json(
      { error: "수량 변경에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 장바구니 아이템 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const itemId = parseInt(id);

    // 장바구니 아이템 확인 (사용자 권한 체크 포함)
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: {
          userId: userId,
        },
      },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: "장바구니 아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 아이템 삭제
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // 장바구니 업데이트 시간 갱신
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "상품이 장바구니에서 제거되었습니다.",
      success: true,
    });
  } catch (error: unknown) {
    console.error("장바구니 아이템 삭제 실패:", error);
    return NextResponse.json(
      { error: "상품 제거에 실패했습니다." },
      { status: 500 }
    );
  }
}
