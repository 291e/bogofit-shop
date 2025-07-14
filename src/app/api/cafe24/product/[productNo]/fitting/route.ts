import { NextRequest, NextResponse } from "next/server";
import { getProduct, getProductImages } from "@/lib/cafe24";
import type { Cafe24Product } from "@/lib/cafe24";

// 카테고리 이름을 기반으로 상품 카테고리 분류
function determineProductCategory(
  categories: Cafe24Product["category"]
): string {
  if (!categories || categories.length === 0) {
    return "기타";
  }

  // 카테고리 이름을 기반으로 분류
  const categoryNames = categories.map((cat) =>
    cat.category_name.toLowerCase()
  );

  // 상의 관련 키워드
  const topKeywords = [
    "상의",
    "top",
    "티셔츠",
    "셔츠",
    "블라우스",
    "니트",
    "맨투맨",
    "후드",
  ];
  if (
    topKeywords.some((keyword) =>
      categoryNames.some((name) => name.includes(keyword))
    )
  ) {
    return "상의";
  }

  // 하의 관련 키워드
  const bottomKeywords = [
    "하의",
    "bottom",
    "바지",
    "팬츠",
    "스커트",
    "청바지",
    "데님",
  ];
  if (
    bottomKeywords.some((keyword) =>
      categoryNames.some((name) => name.includes(keyword))
    )
  ) {
    return "하의";
  }

  // 아우터 관련 키워드
  const outerKeywords = [
    "아우터",
    "outer",
    "자켓",
    "코트",
    "점퍼",
    "패딩",
    "가디건",
  ];
  if (
    outerKeywords.some((keyword) =>
      categoryNames.some((name) => name.includes(keyword))
    )
  ) {
    return "아우터";
  }

  // 원피스 관련 키워드
  const dressKeywords = ["원피스", "dress", "드레스"];
  if (
    dressKeywords.some((keyword) =>
      categoryNames.some((name) => name.includes(keyword))
    )
  ) {
    return "원피스";
  }

  return "기타";
}

// 최적의 이미지 선택 함수
function selectBestImage(
  product: Cafe24Product,
  images: Array<{
    image_no: number;
    image_url: string;
    image_type: string;
    image_path: string;
  }>
): string {
  // 1. 메인 이미지가 있으면 우선 사용
  if (product.detail_image) {
    return product.detail_image;
  }

  // 2. 목록 이미지 사용
  if (product.list_image) {
    return product.list_image;
  }

  // 3. 추가 이미지 중 첫 번째 이미지 사용
  if (images && images.length > 0) {
    return images[0].image_url;
  }

  // 4. 기본 이미지들 중 하나 사용
  if (product.small_image) {
    return product.small_image;
  }

  if (product.tiny_image) {
    return product.tiny_image;
  }

  return "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productNo: string }> }
) {
  const { productNo: productNoParam } = await params;
  const productNo = parseInt(productNoParam);

  if (isNaN(productNo)) {
    return NextResponse.json(
      { error: "유효하지 않은 상품 번호입니다" },
      { status: 400 }
    );
  }

  try {
    // 상품 정보 및 이미지 정보를 병렬로 가져오기
    const [product, images] = await Promise.all([
      getProduct(productNo),
      getProductImages(productNo).catch(() => []), // 이미지 정보 가져오기 실패 시 빈 배열
    ]);

    // 상품 카테고리 분류
    const productCategory = determineProductCategory(product.category);

    // 최적의 이미지 선택
    const currentImage = selectBestImage(product, images);

    // Cafe24VirtualFitting props로 변환
    const fittingProps = {
      productTitle:
        product.product_name || product.display_name || "제품명 없음",
      productCategory,
      currentImage,
      // 추가 정보 (필요에 따라 확장 가능)
      productInfo: {
        productNo: product.product_no,
        productCode: product.product_code,
        description: product.description || product.mobile_description || "",
        price: product.price
          ? {
              pc: product.price.pc_price,
              mobile: product.price.mobile_price,
              excludingTax: product.price.price_excluding_tax,
              includingTax: product.price.price_including_tax,
            }
          : null,
        categories: product.category || [],
        additionalImages: images.map((img) => ({
          url: img.image_url,
          type: img.image_type,
          path: img.image_path,
        })),
        options: product.options || [],
      },
    };

    return NextResponse.json(fittingProps);
  } catch (error) {
    console.error("상품 정보 가져오기 실패:", error);

    // 인증 오류인 경우
    if (error instanceof Error && error.message.includes("액세스 토큰")) {
      return NextResponse.json(
        { error: "카페24 인증이 필요합니다. 다시 로그인해주세요." },
        { status: 401 }
      );
    }

    // API 호출 실패인 경우
    if (error instanceof Error && error.message.includes("API 호출 실패")) {
      return NextResponse.json(
        { error: "카페24 API 호출에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "상품 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 여러 상품의 가상 피팅 정보를 한 번에 가져오는 API
export async function POST(request: NextRequest) {
  try {
    const { productNos } = await request.json();

    if (!Array.isArray(productNos) || productNos.length === 0) {
      return NextResponse.json(
        { error: "상품 번호 배열이 필요합니다" },
        { status: 400 }
      );
    }

    // 최대 10개까지만 허용
    if (productNos.length > 10) {
      return NextResponse.json(
        { error: "한 번에 최대 10개의 상품만 처리할 수 있습니다" },
        { status: 400 }
      );
    }

    // 병렬로 상품 정보 가져오기
    const results = await Promise.allSettled(
      productNos.map(async (productNo: number) => {
        const [product, images] = await Promise.all([
          getProduct(productNo),
          getProductImages(productNo).catch(() => []),
        ]);

        const productCategory = determineProductCategory(product.category);
        const currentImage = selectBestImage(product, images);

        return {
          productNo: productNo,
          productTitle:
            product.product_name || product.display_name || "제품명 없음",
          productCategory,
          currentImage,
          productInfo: {
            productNo: product.product_no,
            productCode: product.product_code,
            description:
              product.description || product.mobile_description || "",
            price: product.price
              ? {
                  pc: product.price.pc_price,
                  mobile: product.price.mobile_price,
                  excludingTax: product.price.price_excluding_tax,
                  includingTax: product.price.price_including_tax,
                }
              : null,
            categories: product.category || [],
            additionalImages: images.map((img) => ({
              url: img.image_url,
              type: img.image_type,
              path: img.image_path,
            })),
            options: product.options || [],
          },
        };
      })
    );

    const successResults = results
      .filter((result) => result.status === "fulfilled")
      .map(
        (result) =>
          (
            result as PromiseFulfilledResult<{
              productNo: number;
              productTitle: string;
              productCategory: string;
              currentImage: string;
              productInfo: Record<string, unknown>;
            }>
          ).value
      );

    const failedResults = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    return NextResponse.json({
      success: successResults,
      failed: failedResults.length,
      total: productNos.length,
    });
  } catch (error) {
    console.error("다중 상품 정보 가져오기 실패:", error);
    return NextResponse.json(
      { error: "다중 상품 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
