import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { message: "DB 조회 오류", error },
      { status: 500 }
    );
  }
}
