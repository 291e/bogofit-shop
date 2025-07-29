import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function findDuplicateProducts() {
  console.log("🔍 중복된 상품명 찾는 중...");

  // 중복된 상품명과 개수 조회
  const duplicates = await prisma.product.groupBy({
    by: ["title"],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  console.log(`📊 중복된 상품명: ${duplicates.length}개`);

  for (const duplicate of duplicates) {
    console.log(`\n📦 상품명: "${duplicate.title}" (${duplicate._count.id}개)`);

    // 해당 상품명의 모든 상품 조회
    const products = await prisma.product.findMany({
      where: {
        title: duplicate.title,
      },
      select: {
        id: true,
        title: true,
        price: true,
        createdAt: true,
        isActive: true,
        url: true,
        variants: {
          select: {
            id: true,
          },
        },
        reviews: {
          select: {
            id: true,
          },
        },
        orderItems: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc", // 생성일 순으로 정렬
      },
    });

    products.forEach((product, index) => {
      console.log(
        `  ${index + 1}. ID: ${product.id}, 가격: ${product.price}원, 생성일: ${
          product.createdAt.toISOString().split("T")[0]
        }, 활성: ${product.isActive}`
      );
      console.log(
        `     연관 데이터: 옵션 ${product.variants.length}개, 리뷰 ${product.reviews.length}개, 주문 ${product.orderItems.length}개`
      );
    });
  }

  return duplicates;
}

async function safeDeleteProduct(productId: number) {
  console.log(`  🗑️ 상품 ID ${productId} 삭제 중...`);

  // 1. CartItem 삭제 (ProductVariant를 참조하는 것들)
  const variants = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });

  for (const variant of variants) {
    const deletedCartItems = await prisma.cartItem.deleteMany({
      where: { variantId: variant.id },
    });
    if (deletedCartItems.count > 0) {
      console.log(`    📱 CartItem ${deletedCartItems.count}개 삭제`);
    }
  }

  // 2. OrderItem 삭제 (Product 직접 참조)
  const deletedOrderItems = await prisma.orderItem.deleteMany({
    where: { productId },
  });
  if (deletedOrderItems.count > 0) {
    console.log(`    📋 OrderItem ${deletedOrderItems.count}개 삭제`);
  }

  // 3. Review 삭제 (Product 직접 참조)
  const deletedReviews = await prisma.review.deleteMany({
    where: { productId },
  });
  if (deletedReviews.count > 0) {
    console.log(`    ⭐ Review ${deletedReviews.count}개 삭제`);
  }

  // 4. ProductVariant 삭제 (Product 직접 참조)
  const deletedVariants = await prisma.productVariant.deleteMany({
    where: { productId },
  });
  if (deletedVariants.count > 0) {
    console.log(`    🎛️ ProductVariant ${deletedVariants.count}개 삭제`);
  }

  // 5. 마지막에 Product 삭제
  await prisma.product.delete({
    where: { id: productId },
  });
  console.log(`    ✅ Product 삭제 완료`);
}

async function removeDuplicateProducts(keepLatest = true) {
  console.log("🗑️ 중복 상품 제거 시작...");

  const duplicates = await prisma.product.groupBy({
    by: ["title"],
    _count: {
      id: true,
    },
    having: {
      id: {
        _count: {
          gt: 1,
        },
      },
    },
  });

  let totalRemoved = 0;

  for (const duplicate of duplicates) {
    console.log(`\n처리 중: "${duplicate.title}"`);

    const products = await prisma.product.findMany({
      where: {
        title: duplicate.title,
      },
      orderBy: {
        createdAt: keepLatest ? "desc" : "asc", // 최신것을 남길지, 오래된것을 남길지 결정
      },
    });

    // 첫 번째 상품을 제외하고 나머지 제거
    const toRemove = products.slice(1);
    const toKeep = products[0];

    console.log(
      `  ✅ 유지: ID ${toKeep.id} (생성일: ${
        toKeep.createdAt.toISOString().split("T")[0]
      })`
    );

    for (const product of toRemove) {
      console.log(
        `  ❌ 제거: ID ${product.id} (생성일: ${
          product.createdAt.toISOString().split("T")[0]
        })`
      );

      try {
        await safeDeleteProduct(product.id);
        totalRemoved++;
      } catch (error) {
        console.error(`    ❌ 삭제 실패: ${error}`);
      }
    }
  }

  console.log(`\n✅ 총 ${totalRemoved}개의 중복 상품이 제거되었습니다.`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];

    if (command === "check") {
      // 중복 상품 확인만
      await findDuplicateProducts();
    } else if (command === "remove") {
      // 중복 상품 제거 (최신것 유지)
      await removeDuplicateProducts(true);
    } else if (command === "remove-old") {
      // 중복 상품 제거 (오래된것 유지)
      await removeDuplicateProducts(false);
    } else {
      console.log("사용법:");
      console.log(
        "  npx tsx scripts/remove-duplicate-products.ts check         # 중복 상품 확인"
      );
      console.log(
        "  npx tsx scripts/remove-duplicate-products.ts remove        # 중복 상품 제거 (최신것 유지)"
      );
      console.log(
        "  npx tsx scripts/remove-duplicate-products.ts remove-old    # 중복 상품 제거 (오래된것 유지)"
      );
    }
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
