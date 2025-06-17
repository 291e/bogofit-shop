import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 장바구니 조회
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    // 사용자의 장바구니 조회 (없으면 생성)
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // 장바구니가 없으면 생성
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });
    }

    // 응답 데이터 변환
    const cartData = {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        variant: {
          id: item.variant.id,
          optionName: item.variant.optionName,
          optionValue: item.variant.optionValue,
          priceDiff: item.variant.priceDiff,
          stock: item.variant.stock,
          product: {
            id: item.variant.product.id,
            title: item.variant.product.title,
            price: item.variant.product.price,
            imageUrl: item.variant.product.imageUrl,
            category: item.variant.product.category,
          },
        },
      })),
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: cart.items.reduce(
        (sum, item) =>
          sum +
          (item.variant.product.price + item.variant.priceDiff) * item.quantity,
        0
      ),
      updatedAt: cart.updatedAt,
    };

    return NextResponse.json({ cart: cartData });
  } catch (error: unknown) {
    console.error("장바구니 조회 실패:", error);
    return NextResponse.json(
      { error: "장바구니를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 장바구니에 상품 추가
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { variantId, quantity = 1 } = await req.json();

    console.log("장바구니 API 호출:", { variantId, quantity, userId });

    if (!variantId || quantity <= 0) {
      console.log("잘못된 요청 데이터:", { variantId, quantity });
      return NextResponse.json(
        { error: "상품 옵션과 수량을 확인해주세요." },
        { status: 400 }
      );
    }

    // 상품 옵션 존재 여부 및 재고 확인
    let variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    // ProductVariant가 없는 경우, Product ID와 동일한지 확인하고 기본 variant 생성
    if (!variant) {
      const product = await prisma.product.findUnique({
        where: { id: variantId }, // variantId가 실제로는 productId인 경우
      });

      if (product) {
        // 기본 variant를 메모리에서 생성 (실제 DB에는 저장하지 않음)
        variant = {
          id: variantId,
          productId: product.id,
          optionName: "기본",
          optionValue: "기본",
          priceDiff: 0,
          stock: 999, // 기본 재고
          product: product,
        };
        console.log("기본 variant 생성됨");
      } else {
        console.log("상품도 존재하지 않음");
        return NextResponse.json(
          { error: "존재하지 않는 상품입니다." },
          { status: 404 }
        );
      }
    }

    // 재고 확인 제거 - 무제한 주문 가능

    // 사용자의 장바구니 조회 또는 생성
    console.log("장바구니 조회 시작");
    let cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      console.log("새 장바구니 생성 시도");
      cart = await prisma.cart.create({
        data: { userId },
      });
      console.log("새 장바구니 생성됨:", cart.id);
    }

    // 이미 장바구니에 있는 상품인지 확인

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variantId,
        },
      },
    });

    if (existingItem) {
      // 기존 아이템 수량 업데이트
      const newQuantity = existingItem.quantity + quantity;

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // 새 아이템 추가
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId: variantId,
          quantity: quantity,
        },
      });
    }

    // 장바구니 업데이트 시간 갱신
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "장바구니에 추가되었습니다.",
      success: true,
    });
  } catch (error: unknown) {
    console.error("장바구니 추가 실패:", error);
    return NextResponse.json(
      { error: "장바구니에 추가하는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 장바구니 비우기
export async function DELETE(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const cart = await prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return NextResponse.json(
        { error: "장바구니를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 장바구니 아이템 모두 삭제
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 장바구니 업데이트 시간 갱신
    await prisma.cart.update({
      where: { id: cart.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "장바구니가 비워졌습니다.",
      success: true,
    });
  } catch (error: unknown) {
    console.error("장바구니 비우기 실패:", error);
    return NextResponse.json(
      { error: "장바구니를 비우는데 실패했습니다." },
      { status: 500 }
    );
  }
}
