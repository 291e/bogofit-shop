import { NextResponse } from "next/server";
import { cafe24OAuth } from "@/lib/cafe24";

/**
 * Cafe24 API 연결 테스트
 *
 * OAuth 인증이 완료된 후 API 호출이 정상적으로 작동하는지 테스트합니다.
 */
export async function GET() {
  try {
    console.log("=== Cafe24 API 연결 테스트 ===");

    // 1. Access Token 확인
    const accessToken = await cafe24OAuth.getAccessToken();
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Access token이 없습니다. 먼저 OAuth 인증을 완료해주세요.",
          authUrl: cafe24OAuth.getAuthorizationUrl(),
        },
        { status: 401 }
      );
    }

    console.log("✅ Access Token 확인 완료");

    // 2. 상품 목록 가져오기 테스트
    console.log("🔄 상품 목록 가져오기 테스트...");
    const products = await cafe24OAuth.getProducts({ limit: 5 });

    console.log(`✅ 상품 목록 조회 성공: ${products.length}개 상품`);

    // 3. 첫 번째 상품 상세 정보 가져오기 (있는 경우)
    let productDetail = null;
    if (products.length > 0) {
      console.log("🔄 상품 상세 정보 가져오기 테스트...");
      try {
        productDetail = await cafe24OAuth.getProduct(products[0].product_no);
        console.log("✅ 상품 상세 정보 조회 성공");
      } catch (error) {
        console.warn("⚠️ 상품 상세 정보 조회 실패:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cafe24 API 연결 테스트 성공",
      data: {
        hasAccessToken: true,
        productsCount: products.length,
        products: products.map((p) => ({
          product_no: p.product_no,
          product_name: p.product_name,
          product_code: p.product_code,
        })),
        productDetail: productDetail
          ? {
              product_no: productDetail.product_no,
              product_name: productDetail.product_name,
              product_code: productDetail.product_code,
              description: productDetail.description,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Cafe24 API 테스트 실패:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다",
        authUrl: cafe24OAuth.getAuthorizationUrl(),
      },
      { status: 500 }
    );
  }
}
