import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

// 개별 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
              },
            },
          },
        },
        orderItems: {
          include: {
            order: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("관리자 상품 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 상품 상태 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const body = await request.json();

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    const { status, rejectionReason } = body;

    if (!status || !Object.values(ProductStatus).includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 상태입니다" },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, title: true, status: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 상품 상태 업데이트
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: status as ProductStatus,
        ...(status === "APPROVED" && {
          approvedAt: new Date(),
          approvedBy: "admin",
        }),
        ...(status === "REJECTED" && {
          rejectionReason: rejectionReason || null,
        }),
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(
      `[Admin] 상품 상태 변경: ${updatedProduct.title} (${existingProduct.status} → ${status}) by admin`
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: "상품 상태가 성공적으로 변경되었습니다",
    });
  } catch (error) {
    console.error("상품 상태 변경 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [, errorResponse] = await requireAdminAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    // 상품 존재 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        orderItems: {
          select: { id: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 주문된 상품인지 확인 (주문된 상품은 삭제 불가)
    if (existingProduct.orderItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "주문 이력이 있는 상품은 삭제할 수 없습니다. 상품을 비활성화해주세요.",
        },
        { status: 400 }
      );
    }

    // 상품 삭제 (variants는 cascade로 자동 삭제됨)
    await prisma.product.delete({
      where: { id: productId },
    });

    console.log(`[Admin] 상품 삭제: ${existingProduct.title} by admin`);

    return NextResponse.json({
      success: true,
      message: "상품이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("관리자 상품 삭제 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
