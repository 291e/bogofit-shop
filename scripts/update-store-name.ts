import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStoreNames() {
  console.log("🔍 현재 storeName 현황 조회 중...");

  // storeName별 상품 개수 조회
  const storeNameCounts = await prisma.product.groupBy({
    by: ["storeName"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  });

  console.log(
    `📊 총 ${storeNameCounts.length}개의 서로 다른 storeName이 있습니다:`
  );

  let totalProducts = 0;
  for (const store of storeNameCounts) {
    const storeName = store.storeName || "(null)";
    console.log(`  📦 ${storeName}: ${store._count.id}개 상품`);
    totalProducts += store._count.id;
  }

  console.log(`\n📈 전체 상품 수: ${totalProducts}개`);

  // wunderstory가 아닌 상품들 상세 조회
  const nonWunderStoryProducts = await prisma.product.findMany({
    where: {
      OR: [{ storeName: { not: "wunderstory" } }, { storeName: null }],
    },
    select: {
      id: true,
      title: true,
      storeName: true,
      price: true,
      createdAt: true,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // 최신 10개만 미리보기
  });

  if (nonWunderStoryProducts.length > 0) {
    console.log(`\n🔄 wunderstory가 아닌 상품들 (최신 10개):`);
    nonWunderStoryProducts.forEach((product, index) => {
      const storeName = product.storeName || "(null)";
      console.log(
        `  ${index + 1}. ID: ${
          product.id
        }, storeName: "${storeName}", 상품명: "${product.title.substring(
          0,
          30
        )}..."`
      );
    });
  }

  return storeNameCounts;
}

async function updateStoreNames(targetStoreName = "wunderstory") {
  console.log(`🔄 storeName을 "${targetStoreName}"로 업데이트 시작...`);

  // wunderstory가 아닌 상품들 조회
  const productsToUpdate = await prisma.product.findMany({
    where: {
      OR: [{ storeName: { not: targetStoreName } }, { storeName: null }],
    },
    select: {
      id: true,
      title: true,
      storeName: true,
    },
  });

  console.log(`📊 업데이트할 상품 수: ${productsToUpdate.length}개`);

  if (productsToUpdate.length === 0) {
    console.log("✅ 이미 모든 상품의 storeName이 wunderstory입니다.");
    return;
  }

  let updatedCount = 0;
  let failedCount = 0;

  for (const product of productsToUpdate) {
    try {
      const oldStoreName = product.storeName || "(null)";

      await prisma.product.update({
        where: { id: product.id },
        data: { storeName: targetStoreName },
      });

      console.log(
        `  ✅ ID ${
          product.id
        }: "${oldStoreName}" → "${targetStoreName}" | ${product.title.substring(
          0,
          30
        )}...`
      );
      updatedCount++;
    } catch (error) {
      console.error(`  ❌ ID ${product.id} 업데이트 실패: ${error}`);
      failedCount++;
    }
  }

  console.log(`\n📈 업데이트 완료!`);
  console.log(`  ✅ 성공: ${updatedCount}개`);
  console.log(`  ❌ 실패: ${failedCount}개`);
}

async function updateSpecificStoreName(
  fromStoreName: string,
  toStoreName: string
) {
  console.log(`🔄 "${fromStoreName}"을 "${toStoreName}"로 업데이트 시작...`);

  // 특정 storeName을 가진 상품들만 조회
  const productsToUpdate = await prisma.product.findMany({
    where: {
      storeName: fromStoreName,
    },
    select: {
      id: true,
      title: true,
      storeName: true,
    },
  });

  console.log(`📊 "${fromStoreName}" 상품 수: ${productsToUpdate.length}개`);

  if (productsToUpdate.length === 0) {
    console.log(`✅ "${fromStoreName}" storeName을 가진 상품이 없습니다.`);
    return;
  }

  let updatedCount = 0;
  let failedCount = 0;

  for (const product of productsToUpdate) {
    try {
      await prisma.product.update({
        where: { id: product.id },
        data: { storeName: toStoreName },
      });

      console.log(
        `  ✅ ID ${
          product.id
        }: "${fromStoreName}" → "${toStoreName}" | ${product.title.substring(
          0,
          30
        )}...`
      );
      updatedCount++;
    } catch (error) {
      console.error(`  ❌ ID ${product.id} 업데이트 실패: ${error}`);
      failedCount++;
    }
  }

  console.log(`\n📈 업데이트 완료!`);
  console.log(`  ✅ 성공: ${updatedCount}개`);
  console.log(`  ❌ 실패: ${failedCount}개`);
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0];
    const fromStore = args[1];
    const toStore = args[2];

    if (command === "check") {
      // storeName 현황 확인만
      await checkStoreNames();
    } else if (command === "update") {
      // 모든 상품을 wunderstory로 업데이트
      await updateStoreNames("wunderstory");
    } else if (command === "update-specific" && fromStore && toStore) {
      // 특정 storeName을 다른 storeName으로 업데이트
      await updateSpecificStoreName(fromStore, toStore);
    } else {
      console.log("사용법:");
      console.log(
        "  npx tsx scripts/update-store-name.ts check                           # storeName 현황 확인"
      );
      console.log(
        "  npx tsx scripts/update-store-name.ts update                          # 모든 상품을 wunderstory로 업데이트"
      );
      console.log(
        "  npx tsx scripts/update-store-name.ts update-specific [from] [to]     # 특정 storeName을 다른 storeName으로 업데이트"
      );
      console.log("");
      console.log("예시:");
      console.log("  npx tsx scripts/update-store-name.ts check");
      console.log("  npx tsx scripts/update-store-name.ts update");
      console.log(
        '  npx tsx scripts/update-store-name.ts update-specific "old-store" "wunderstory"'
      );
    }
  } catch (error) {
    console.error("❌ 오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
