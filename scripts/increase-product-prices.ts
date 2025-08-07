import { PrismaClient } from "@prisma/client";
import * as readline from "readline";

const prisma = new PrismaClient();

// 콘솔 입력을 위한 인터페이스 생성
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 사용자 확인을 위한 함수
function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// 가격 인상률 (기본 10%)
const PRICE_INCREASE_RATE = 0.1; // 10%
const BATCH_SIZE = 100; // 배치 처리 크기
const MIN_PRICE = 100; // 최소 가격 (100원)

/**
 * 가격 계산 규칙:
 * 1. 기존 가격 × (1 + 인상률) 계산
 * 2. 100원 단위로 반올림 (끝자리 00으로 변경)
 * 3. 최소 100원 보장
 *
 * 예시:
 * - 1,234원 → 1,357.4원 → 1,400원 (100원 단위 반올림)
 * - 50원 → 55원 → 100원 (최소 가격 보장)
 * - 1,950원 → 2,145원 → 2,100원 (100원 단위 반올림)
 */

// 현재 상품 가격 현황 조회
async function checkCurrentPrices() {
  console.log("🔍 현재 상품 가격 현황 조회 중...");

  // 전체 상품 수
  const totalProducts = await prisma.product.count();

  // 가격대별 상품 분포 (현재는 사용하지 않지만 향후 활용 가능)
  // const priceDistribution = await prisma.product.groupBy({
  //   by: ["price"],
  //   _count: {
  //     id: true,
  //   },
  //   orderBy: {
  //     price: "asc",
  //   },
  // });

  // 가격 통계
  const priceStats = await prisma.product.aggregate({
    _avg: {
      price: true,
    },
    _min: {
      price: true,
    },
    _max: {
      price: true,
    },
    _sum: {
      price: true,
    },
  });

  console.log(`📊 전체 상품 수: ${totalProducts.toLocaleString()}개`);
  console.log(
    `💰 평균 가격: ${Math.round(priceStats._avg.price || 0).toLocaleString()}원`
  );
  console.log(
    `📈 최고 가격: ${(priceStats._max.price || 0).toLocaleString()}원`
  );
  console.log(
    `📉 최저 가격: ${(priceStats._min.price || 0).toLocaleString()}원`
  );

  // 0원 상품 확인
  const freeProducts = await prisma.product.count({
    where: {
      price: 0,
    },
  });

  // 100원 미만 상품 확인
  const lowPriceProducts = await prisma.product.count({
    where: {
      price: {
        gt: 0,
        lt: MIN_PRICE,
      },
    },
  });

  if (freeProducts > 0) {
    console.log(`⚠️  0원 상품: ${freeProducts}개 (가격 인상 대상에서 제외)`);
  }

  if (lowPriceProducts > 0) {
    console.log(
      `💡 100원 미만 상품: ${lowPriceProducts}개 (인상 후 100원으로 설정)`
    );
  }

  // 가격대별 분포 (간단히)
  console.log("\n📊 가격대별 상품 분포:");
  const priceRanges = [
    { min: 1, max: 100, label: "100원 미만" },
    { min: 100, max: 10000, label: "100원 이상 1만원 미만" },
    { min: 10000, max: 50000, label: "1만원 이상 5만원 미만" },
    { min: 50000, max: 100000, label: "5만원 이상 10만원 미만" },
    { min: 100000, max: 500000, label: "10만원 이상 50만원 미만" },
    { min: 500000, max: Infinity, label: "50만원 이상" },
  ];

  for (const range of priceRanges) {
    const count = await prisma.product.count({
      where: {
        price: {
          gte: range.min,
          lt: range.max === Infinity ? undefined : range.max,
        },
      },
    });
    if (count > 0) {
      console.log(`  💵 ${range.label}: ${count.toLocaleString()}개`);
    }
  }

  return { totalProducts, freeProducts, lowPriceProducts };
}

// 가격 인상 미리보기
async function previewPriceIncrease() {
  console.log("\n🔍 가격 인상 미리보기 (상위 10개 상품):");

  const sampleProducts = await prisma.product.findMany({
    where: {
      price: {
        gt: 0, // 0원 상품 제외
      },
    },
    select: {
      id: true,
      title: true,
      price: true,
    },
    orderBy: {
      price: "desc",
    },
    take: 10,
  });

  console.log(
    "┌─────────────────────────────────────┬──────────────┬──────────────┬──────────────┐"
  );
  console.log(
    "│ 상품명                             │   현재 가격  │   인상 가격  │   인상 금액  │"
  );
  console.log(
    "├─────────────────────────────────────┼──────────────┼──────────────┼──────────────┤"
  );

  for (const product of sampleProducts) {
    const currentPrice = product.price;
    // 가격 인상 후 100원 단위로 반올림 (최소 100원)
    const calculatedPrice = currentPrice * (1 + PRICE_INCREASE_RATE);
    const roundedPrice = Math.round(calculatedPrice / 100) * 100;
    const newPrice = Math.max(roundedPrice, MIN_PRICE);
    const increaseAmount = newPrice - currentPrice;

    const title =
      product.title.length > 30
        ? product.title.substring(0, 27) + "..."
        : product.title;

    console.log(
      `│ ${title.padEnd(35)} │ ${currentPrice.toLocaleString().padStart(10)}원 │ ${newPrice.toLocaleString().padStart(10)}원 │ ${increaseAmount.toLocaleString().padStart(10)}원 │`
    );
  }

  console.log(
    "└─────────────────────────────────────┴──────────────┴──────────────┴──────────────┘"
  );
}

// 실제 가격 인상 실행
async function executeePriceIncrease(targetProductCount: number) {
  console.log(
    `\n🚀 가격 인상 시작 (${targetProductCount.toLocaleString()}개 상품)...`
  );

  let processedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  let offset = 0;

  while (offset < targetProductCount) {
    try {
      // 배치 단위로 상품 조회
      const products = await prisma.product.findMany({
        where: {
          price: {
            gt: 0, // 0원 상품 제외
          },
        },
        select: {
          id: true,
          price: true,
        },
        skip: offset,
        take: BATCH_SIZE,
      });

      if (products.length === 0) break;

      // 배치 업데이트 준비
      const updatePromises = products.map(async (product) => {
        const currentPrice = product.price;
        // 가격 인상 후 100원 단위로 반올림 (최소 100원)
        const calculatedPrice = currentPrice * (1 + PRICE_INCREASE_RATE);
        const roundedPrice = Math.round(calculatedPrice / 100) * 100;
        const newPrice = Math.max(roundedPrice, MIN_PRICE);

        try {
          await prisma.product.update({
            where: { id: product.id },
            data: { price: newPrice },
          });
          return { success: true, productId: product.id };
        } catch (error) {
          console.error(`❌ 상품 ID ${product.id} 업데이트 실패:`, error);
          return { success: false, productId: product.id };
        }
      });

      // 배치 실행
      const results = await Promise.all(updatePromises);

      // 결과 집계
      const batchUpdated = results.filter((r) => r.success).length;
      const batchErrors = results.filter((r) => !r.success).length;

      updatedCount += batchUpdated;
      errorCount += batchErrors;
      processedCount += products.length;

      // 진행률 표시
      const progress = Math.round((processedCount / targetProductCount) * 100);
      console.log(
        `📈 진행률: ${progress}% (${processedCount.toLocaleString()}/${targetProductCount.toLocaleString()}) | 성공: ${updatedCount.toLocaleString()}개 | 실패: ${errorCount}개`
      );

      offset += BATCH_SIZE;

      // 짧은 대기 (DB 부하 방지)
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ 배치 처리 중 오류 발생:`, error);
      errorCount += BATCH_SIZE;
      offset += BATCH_SIZE;
    }
  }

  return { processedCount, updatedCount, errorCount };
}

// 결과 요약 출력
async function showSummary(results: {
  processedCount: number;
  updatedCount: number;
  errorCount: number;
}) {
  console.log("\n" + "=".repeat(60));
  console.log("📊 가격 인상 완료 요약");
  console.log("=".repeat(60));

  console.log(`✅ 처리된 상품: ${results.processedCount.toLocaleString()}개`);
  console.log(`🎯 성공적으로 인상: ${results.updatedCount.toLocaleString()}개`);

  if (results.errorCount > 0) {
    console.log(`❌ 실패: ${results.errorCount.toLocaleString()}개`);
  }

  // 업데이트 후 가격 통계
  const newPriceStats = await prisma.product.aggregate({
    _avg: {
      price: true,
    },
    _min: {
      price: true,
    },
    _max: {
      price: true,
    },
  });

  console.log(
    `\n💰 업데이트 후 평균 가격: ${Math.round(newPriceStats._avg.price || 0).toLocaleString()}원`
  );
  console.log(
    `📈 업데이트 후 최고 가격: ${(newPriceStats._max.price || 0).toLocaleString()}원`
  );
  console.log(
    `📉 업데이트 후 최저 가격: ${(newPriceStats._min.price || 0).toLocaleString()}원`
  );

  console.log("\n🎉 가격 인상이 완료되었습니다!");
}

// 메인 실행 함수
async function main() {
  try {
    console.log("🏪 BogoFit 상품 가격 일괄 인상 스크립트");
    console.log("=".repeat(50));
    console.log(`📈 인상률: ${PRICE_INCREASE_RATE * 100}%`);
    console.log("");

    // 1. 현재 가격 현황 조회
    const { totalProducts, freeProducts, lowPriceProducts } =
      await checkCurrentPrices();
    const targetProductCount = totalProducts - freeProducts;

    // 2. 가격 인상 미리보기
    await previewPriceIncrease();

    // 3. 사용자 확인
    console.log(
      `\n⚠️  ${targetProductCount.toLocaleString()}개 상품의 가격을 ${PRICE_INCREASE_RATE * 100}% 인상합니다.`
    );
    console.log(`💡 0원 상품 ${freeProducts.toLocaleString()}개는 제외됩니다.`);
    if (lowPriceProducts > 0) {
      console.log(
        `💡 100원 미만 상품 ${lowPriceProducts.toLocaleString()}개는 최소 100원으로 설정됩니다.`
      );
    }
    console.log(`🔢 모든 가격은 100원 단위로 반올림됩니다. (끝자리 00)`);

    const confirmMessage = `\n정말 실행하시겠습니까? 이 작업은 되돌릴 수 없습니다. (yes/no): `;
    const confirmation = await askQuestion(confirmMessage);

    if (confirmation.toLowerCase() !== "yes") {
      console.log("❌ 작업이 취소되었습니다.");
      return;
    }

    // 4. 실제 가격 인상 실행
    const results = await executeePriceIncrease(targetProductCount);

    // 5. 결과 요약
    await showSummary(results);
  } catch (error) {
    console.error("❌ 스크립트 실행 중 오류 발생:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

export { main };
