import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus, Prisma } from "@prisma/client";
import { checkBusinessAuth } from "@/lib/businessAuth";

export async function GET(request: NextRequest) {
  try {
    // 공통 인증 체크 (인증 없이 고정 브랜드 사용)
    const [user, errorResponse] = await checkBusinessAuth();
    if (errorResponse) return errorResponse;

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Prisma.ProductWhereInput = {
      brandId: user!.brandId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status as ProductStatus;
    }

    if (category) {
      where.category = category;
    }

    // 상품 목록 조회
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
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
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // 상품 통계 계산
    const stats = await prisma.product.groupBy({
      by: ["status"],
      where: { brandId: user!.brandId },
      _count: { status: true },
    });

    const statusStats = {
      total: totalCount,
      pending: stats.find((s) => s.status === "PENDING")?._count.status || 0,
      approved: stats.find((s) => s.status === "APPROVED")?._count.status || 0,
      rejected: stats.find((s) => s.status === "REJECTED")?._count.status || 0,
      draft: stats.find((s) => s.status === "DRAFT")?._count.status || 0,
    };

    // 응답 데이터 변환
    const formattedProducts = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            product.reviews.length
          : 0;

      // 전체 재고 계산 (variants 합계)
      const stockQuantity = product.variants.reduce(
        (sum, variant) => sum + variant.stock,
        0
      );

      return {
        id: product.id.toString(), // BusinessProduct는 string ID 기대
        businessId: user!.brandId?.toString() || "", // brandId를 businessId로 사용
        productId: product.id,
        title: product.title,
        description: product.description || "",
        detailDescription: product.detailDescription,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl || "", // 빈 문자열 기본값
        detailImage: product.detailImage || undefined,
        thumbnailImages: product.thumbnailImages || [],
        badge: product.badge,
        status: product.status,
        isActive: product.isActive,
        stockQuantity, // 계산된 재고
        minOrderQuantity: 1, // 기본값
        tags: [], // 현재 스키마에 없으므로 빈 배열
        totalSales: product.totalSales,
        totalSold: product.totalSold,
        approvedAt: product.approvedAt,
        approvedBy: product.approvedBy,
        rejectionReason: product.rejectionReason,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        brand: product.brand,
        variants: product.variants,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats: statusStats,
      brand: user!.brand,
    });
  } catch (error) {
    console.error("상품 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 공통 인증 체크 (인증 없이 고정 브랜드 사용)
    const [user, errorResponse] = await checkBusinessAuth();
    if (errorResponse) return errorResponse;

    const productData = await request.json();

    // 필수 필드 검증
    if (!productData.title || !productData.price || !productData.category) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다 (title, price, category)" },
        { status: 400 }
      );
    }

    // slug 자동 생성 (상품명을 기반으로)
    const slug =
      productData.title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    try {
      // 트랜잭션으로 Product와 ProductVariant 동시 생성
      const result = await prisma.$transaction(async (tx) => {
        // Product 생성 (url은 임시로 빈 문자열)
        const newProduct = await tx.product.create({
          data: {
            brandId: user!.brandId,
            title: productData.title,
            slug: slug,
            description: productData.description || null,
            detailDescription: productData.detailDescription || null,
            price: parseFloat(productData.price),
            url: "", // 임시 빈 값
            category: productData.category,
            subCategory: productData.subCategory || null,
            imageUrl: productData.imageUrl || "",
            badge: productData.badge || null,
            storeName: productData.storeName || null,
            isActive: productData.isActive !== false,
            detailImage: productData.detailImage || null,
            thumbnailImages: productData.thumbnailImages || [],
            status: "DRAFT", // 새로 등록된 상품은 DRAFT 상태
          },
        });

        // ProductVariant 생성 (옵션이 있는 경우)
        let variants = [];
        if (productData.variants && productData.variants.length > 0) {
          const variantPromises = productData.variants.map(
            (variant: {
              optionName?: string;
              optionValue?: string;
              priceDiff?: number;
              stock?: number;
            }) =>
              tx.productVariant.create({
                data: {
                  productId: newProduct.id,
                  optionName: variant.optionName || "기본",
                  optionValue: variant.optionValue || "기본",
                  priceDiff: variant.priceDiff || 0,
                  stock: variant.stock || 0,
                },
              })
          );

          variants = await Promise.all(variantPromises);
        } else {
          // 기본 variant 생성
          const defaultVariant = await tx.productVariant.create({
            data: {
              productId: newProduct.id,
              optionName: "기본",
              optionValue: "기본",
              priceDiff: 0,
              stock: productData.stock || 0,
            },
          });
          variants = [defaultVariant];
        }

        // 상품 ID를 기반으로 URL 업데이트
        const updatedProduct = await tx.product.update({
          where: { id: newProduct.id },
          data: {
            url: `/products/${newProduct.id}`,
          },
        });

        // 브랜드 정보 별도 조회
        const brandInfo = await tx.brand.findUnique({
          where: { id: user!.brandId! },
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        });

        return { product: updatedProduct, variants, brand: brandInfo };
      });

      console.log("새 상품 생성 성공:", result.product.id);

      return NextResponse.json(
        {
          success: true,
          data: {
            product: {
              id: result.product.id,
              title: result.product.title,
              slug: result.product.slug,
              description: result.product.description,
              detailDescription: result.product.detailDescription,
              price: result.product.price,
              url: result.product.url,
              category: result.product.category,
              subCategory: result.product.subCategory,
              imageUrl: result.product.imageUrl,
              badge: result.product.badge,
              status: result.product.status,
              isActive: result.product.isActive,
              detailImage: result.product.detailImage,
              thumbnailImages: result.product.thumbnailImages,
              createdAt: result.product.createdAt,
              updatedAt: result.product.updatedAt,
              brand: result.brand,
            },
            variants: result.variants,
          },
          message: "상품이 성공적으로 등록되었습니다.",
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("DB 저장 실패:", dbError);
      return NextResponse.json(
        { error: "상품 등록 중 오류가 발생했습니다" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("상품 등록 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
