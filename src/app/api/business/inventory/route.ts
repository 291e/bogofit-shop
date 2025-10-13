import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkBusinessAuth } from "@/lib/businessAuth";
import { Prisma } from "@prisma/client";

/**
 * @swagger
 * /api/business/inventory:
 *   get:
 *     tags:
 *       - Business
 *     summary: 비즈니스 재고 관리 조회
 *     description: 현재 인증된 비즈니스의 상품 재고 현황을 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 페이지당 상품 수
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 검색어 (상품명, SKU)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [in_stock, low_stock, out_of_stock, all]
 *         description: 재고 상태 필터
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 카테고리 필터
 *     responses:
 *       200:
 *         description: 재고 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       sku:
 *                         type: string
 *                       category:
 *                         type: string
 *                       currentStock:
 *                         type: integer
 *                       minStock:
 *                         type: integer
 *                       maxStock:
 *                         type: integer
 *                       unitPrice:
 *                         type: number
 *                       stockValue:
 *                         type: number
 *                       status:
 *                         type: string
 *                       lastUpdated:
 *                         type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                     lowStockCount:
 *                       type: integer
 *                     outOfStockCount:
 *                       type: integer
 *                     totalValue:
 *                       type: number
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function GET(request: NextRequest) {
  try {
    // JWT 쿠키 기반 인증 체크
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    // 쿼리 파라미터 처리
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const skip = (page - 1) * limit;

    // 재고 상태 계산을 위한 조건
    const whereConditions: Prisma.ProductWhereInput = {
      brandId: businessUser!.brandId,
    };

    if (search) {
      whereConditions.title = { contains: search, mode: "insensitive" };
    }

    if (category && category !== "all") {
      whereConditions.category = category;
    }

    // 상품 목록 조회 (variants 포함)
    const products = await prisma.product.findMany({
      where: whereConditions,
      orderBy: { updatedAt: "desc" },
      include: {
        variants: {
          select: {
            id: true,
            stock: true,
            optionName: true,
            optionValue: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 각 variant를 별도의 inventory item으로 변환
    interface InventoryItem {
      id: string;
      productId: number;
      variantId: number;
      title: string;
      variantName: string;
      sku: string;
      category: string;
      imageUrl?: string;
      currentStock: number;
      minStock: number;
      maxStock: number;
      unitPrice: number;
      stockValue: number;
      status: "in_stock" | "low_stock" | "out_of_stock";
      lastUpdated: string;
      variant: typeof products[0]['variants'][0];
      product: typeof products[0];
      brand: typeof products[0]['brand'];
    }
    const inventoryItems: InventoryItem[] = [];
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        // 재고 상태 결정
        let status: "in_stock" | "low_stock" | "out_of_stock";
        if (variant.stock === 0) {
          status = "out_of_stock";
        } else if (variant.stock <= 5) {
          // 최소 재고 임계값을 5로 설정
          status = "low_stock";
        } else {
          status = "in_stock";
        }

        // SKU 생성 (product ID + variant ID)
        const sku = `SKU-${product.id.toString().padStart(6, "0")}-${variant.id.toString().padStart(3, "0")}`;

        inventoryItems.push({
          id: `${product.id}-${variant.id}`, // 고유 ID
          productId: product.id,
          variantId: variant.id,
          title: product.title,
          variantName: `${variant.optionName}: ${variant.optionValue}`,
          sku,
          category: product.category,
          imageUrl: product.imageUrl,
          currentStock: variant.stock,
          minStock: 5, // 기본 최소 재고
          maxStock: 100, // 기본 최대 재고
          unitPrice: product.price,
          stockValue: variant.stock * product.price,
          status,
          lastUpdated: product.updatedAt.toISOString().split("T")[0],
          variant: variant,
          product: product,
          brand: product.brand,
        });
      });
    });

    // 총 개수 계산
    const totalCount = inventoryItems.length;

    // 상태별 필터링 (API에서 처리)
    let filteredItems = inventoryItems;
    if (status && status !== "all") {
      filteredItems = inventoryItems.filter(
        (item) => item.status === status
      );
    }

    // Pagination 적용
    const paginatedItems = filteredItems.slice(skip, skip + limit);

    // 전체 상품 통계 계산
    const allProducts = await prisma.product.findMany({
      where: { brandId: businessUser!.brandId },
      include: {
        variants: {
          select: {
            stock: true,
          },
        },
      },
    });

    const stats = {
      totalProducts: allProducts.length,
      lowStockCount: allProducts.filter((product) => {
        const totalStock = product.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
        return totalStock > 0 && totalStock <= 5;
      }).length,
      outOfStockCount: allProducts.filter((product) => {
        const totalStock = product.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
        return totalStock === 0;
      }).length,
      totalValue: allProducts.reduce((sum, product) => {
        const totalStock = product.variants.reduce(
          (sum, variant) => sum + variant.stock,
          0
        );
        return sum + totalStock * product.price;
      }, 0),
    };

    return NextResponse.json({
      products: paginatedItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
      stats,
    });
  } catch (error) {
    console.error("재고 목록 조회 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/business/inventory:
 *   put:
 *     tags:
 *       - Business
 *     summary: 재고 조정
 *     description: 상품의 재고를 조정합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: 상품 ID
 *               variantId:
 *                 type: integer
 *                 description: 상품 옵션 ID
 *               type:
 *                 type: string
 *                 enum: [increase, decrease]
 *                 description: 재고 조정 타입 (increase=입고, decrease=출고)
 *               quantity:
 *                 type: integer
 *                 description: 조정 수량
 *               reason:
 *                 type: string
 *                 description: 조정 사유
 *     responses:
 *       200:
 *         description: 재고 조정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 product:
 *                   type: object
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export async function PUT(request: NextRequest) {
  try {
    // JWT 쿠키 기반 인증 체크
    const [businessUser, errorResponse] = await checkBusinessAuth(request);
    if (errorResponse) return errorResponse;

    const { productId, variantId, type, quantity, reason } = await request.json();

    // 필수 필드 검증
    if (!productId || !variantId || !type || !quantity || !reason) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다" },
        { status: 400 }
      );
    }

    // 상품 조회 및 권한 확인
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(productId),
        brandId: businessUser!.brandId,
      },
      include: {
        variants: {
          select: {
            id: true,
            stock: true,
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

    // 지정된 variant 찾기
    const targetVariant = product.variants.find(v => v.id === parseInt(variantId));
    if (!targetVariant) {
      return NextResponse.json(
        { error: "상품 variant를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const newStock =
      type === "increase"
        ? targetVariant.stock + quantity
        : Math.max(0, targetVariant.stock - quantity);

    // 재고 업데이트
    await prisma.productVariant.update({
      where: { id: targetVariant.id },
      data: { stock: newStock },
    });

    // 상품 업데이트 시간 갱신
    await prisma.product.update({
      where: { id: product.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: "재고가 성공적으로 조정되었습니다",
      product: {
        id: product.id,
        title: product.title,
        currentStock: newStock,
      },
    });
  } catch (error) {
    console.error("재고 조정 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
