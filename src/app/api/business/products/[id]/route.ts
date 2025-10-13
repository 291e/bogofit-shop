import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBusinessAuth } from "@/lib/businessAuth";

// 개별 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    // 상품 조회 (소유권 확인)
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: businessUser!.brandId,
      },
      include: {
        variants: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("상품 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    const productData = await request.json();

    // isActive만 업데이트하는 경우 validation skip
    const isOnlyActiveUpdate = Object.keys(productData).length === 1 && 'isActive' in productData;
    
    // 필수 필드 검증 (전체 업데이트 시에만)
    if (!isOnlyActiveUpdate && (!productData.title || !productData.price || !productData.category)) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다 (title, price, category)" },
        { status: 400 }
      );
    }

    // 기존 상품 존재 및 소유권 확인
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: businessUser!.brandId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    try {
      // isActive만 업데이트하는 경우 간단하게 처리
      if (isOnlyActiveUpdate) {
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            isActive: productData.isActive,
            updatedAt: new Date(),
          },
        });

        console.log(`상품 활성화 상태 변경 성공: ${updatedProduct.id} - isActive: ${updatedProduct.isActive}`);

        return NextResponse.json({
          success: true,
          data: { product: updatedProduct },
          message: "상품 상태가 성공적으로 변경되었습니다",
        });
      }

      // 트랜잭션으로 Product와 ProductVariant 동시 수정
      const result = await prisma.$transaction(async (prisma) => {
        // 1. 기존 variants 삭제 (cascade로 자동 삭제됨)
        await prisma.productVariant.deleteMany({
          where: { productId: productId },
        });

        // 2. Product 업데이트
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            title: productData.title,
            description: productData.description || null,
            price: productData.price,
            category: productData.category,
            subCategory: productData.subCategory || null,
            badge: productData.badge || null,
            isActive: productData.isActive ?? true,
            imageUrl: productData.imageUrl || existingProduct.imageUrl,
            detailImage: productData.detailImage || null,
            thumbnailImages: productData.thumbnailImages || [],
            shippingType: productData.shippingType || "OVERSEAS",
            updatedAt: new Date(),
          },
        });

        // 3. 새로운 variants 생성 (옵션이 있는 경우)
        if (productData.variants && productData.variants.length > 0) {
          const variantsData = productData.variants.map(
            (variant: {
              optionName: string;
              optionValue: string;
              priceDiff?: number;
              stock?: number;
            }) => ({
              productId: updatedProduct.id,
              optionName: variant.optionName,
              optionValue: variant.optionValue,
              priceDiff: variant.priceDiff || 0,
              stock: variant.stock || 0,
            })
          );

          await prisma.productVariant.createMany({
            data: variantsData,
          });
        }

        return updatedProduct;
      });

      console.log(`상품 수정 성공: ${result.id} - ${result.title}`);

      return NextResponse.json({
        success: true,
        data: { product: result },
        message: "상품이 성공적으로 수정되었습니다",
      });
    } catch (error) {
      console.error("상품 수정 트랜잭션 실패:", error);

      if (error instanceof Error) {
        return NextResponse.json(
          { error: `상품 수정 실패: ${error.message}` },
          { status: 400 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("상품 수정 실패:", error);
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
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    // 기존 상품 존재 및 소유권 확인
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: businessUser!.brandId,
      },
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
        { error: "상품을 찾을 수 없거나 권한이 없습니다" },
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

    console.log(`상품 삭제 성공: ${productId} - ${existingProduct.title}`);

    return NextResponse.json({
      success: true,
      message: "상품이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("상품 삭제 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
