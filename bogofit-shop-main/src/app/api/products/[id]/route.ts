import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: 상품 상세 정보 조회
 *     description: 특정 상품의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 상품 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 상품 상세 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: 잘못된 상품 ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: 상품을 찾을 수 없음
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
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { message: "잘못된 상품 ID입니다." },
        { status: 400 }
      );
    }
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            description: true,
          },
        },
        variants: {
          select: {
            id: true,
            optionName: true,
            optionValue: true,
            priceDiff: true,
            stock: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    if (!product) {
      return NextResponse.json(
        { message: "상품을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // storeName 호환성을 위해 brand.name으로 설정
    const productWithCompatibility = {
      ...product,
      storeName: product.brand?.name || product.storeName || null,
    };

    return NextResponse.json({ product: productWithCompatibility });
  } catch (error) {
    return NextResponse.json(
      { message: "DB 조회 오류", error },
      { status: 500 }
    );
  }
}
