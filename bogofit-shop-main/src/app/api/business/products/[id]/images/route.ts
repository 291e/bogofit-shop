import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { imageType, s3Url } = body;

    // 필수 필드 검증
    if (!imageType || !s3Url) {
      return NextResponse.json(
        { error: "imageType과 s3Url이 필요합니다" },
        { status: 400 }
      );
    }

    // 유효한 이미지 타입 검증
    const validImageTypes = ["main", "detail", "thumbnail"];
    if (!validImageTypes.includes(imageType)) {
      return NextResponse.json(
        {
          error: `유효하지 않은 imageType입니다. 허용되는 타입: ${validImageTypes.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // URL 형식 검증 (기본적인 검증)
    if (!s3Url.startsWith("https://") || !s3Url.includes(".amazonaws.com")) {
      return NextResponse.json(
        { error: "유효하지 않은 S3 URL 형식입니다" },
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        detailImage: true,
        thumbnailImages: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "해당 상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 이미지 타입에 따라 업데이트할 필드 결정
    const updateData: {
      imageUrl?: string;
      detailImage?: string;
      thumbnailImages?: string[];
    } = {};

    switch (imageType) {
      case "main":
        updateData.imageUrl = s3Url;
        break;

      case "detail":
        updateData.detailImage = s3Url;
        break;

      case "thumbnail":
        // 기존 썸네일 배열에 새 URL 추가
        const currentThumbnails = existingProduct.thumbnailImages || [];
        if (!currentThumbnails.includes(s3Url)) {
          updateData.thumbnailImages = [...currentThumbnails, s3Url];
        } else {
          return NextResponse.json(
            { error: "이미 존재하는 썸네일 이미지입니다" },
            { status: 400 }
          );
        }
        break;
    }

    // Product 업데이트
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        detailImage: true,
        thumbnailImages: true,
        updatedAt: true,
      },
    });

    console.log(
      `상품 이미지 업데이트 성공 - Product ID: ${productId}, Type: ${imageType}, URL: ${s3Url}`
    );

    return NextResponse.json({
      success: true,
      data: {
        productId: updatedProduct.id,
        title: updatedProduct.title,
        images: {
          main: updatedProduct.imageUrl,
          detail: updatedProduct.detailImage,
          thumbnails: updatedProduct.thumbnailImages,
        },
        updatedAt: updatedProduct.updatedAt,
      },
      message: `${
        imageType === "main"
          ? "메인"
          : imageType === "detail"
          ? "상세"
          : "썸네일"
      } 이미지가 저장되었습니다`,
    });
  } catch (error) {
    console.error("상품 이미지 업데이트 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { thumbnailUrls } = body;

    // 썸네일 배열 일괄 업데이트
    if (!Array.isArray(thumbnailUrls)) {
      return NextResponse.json(
        { error: "thumbnailUrls는 배열이어야 합니다" },
        { status: 400 }
      );
    }

    // 각 URL 검증
    for (const url of thumbnailUrls) {
      if (!url.startsWith("https://") || !url.includes(".amazonaws.com")) {
        return NextResponse.json(
          { error: `유효하지 않은 S3 URL: ${url}` },
          { status: 400 }
        );
      }
    }

    // 상품 존재 여부 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "해당 상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 썸네일 배열 전체 교체
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        thumbnailImages: thumbnailUrls,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        thumbnailImages: true,
        updatedAt: true,
      },
    });

    console.log(
      `썸네일 배열 업데이트 성공 - Product ID: ${productId}, Count: ${thumbnailUrls.length}`
    );

    return NextResponse.json({
      success: true,
      data: {
        productId: updatedProduct.id,
        title: updatedProduct.title,
        thumbnailImages: updatedProduct.thumbnailImages,
        updatedAt: updatedProduct.updatedAt,
      },
      message: `${thumbnailUrls.length}개의 썸네일 이미지가 저장되었습니다`,
    });
  } catch (error) {
    console.error("썸네일 일괄 업데이트 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const { searchParams } = new URL(request.url);
    const imageType = searchParams.get("imageType");
    const thumbnailUrl = searchParams.get("thumbnailUrl");

    if (!imageType) {
      return NextResponse.json(
        { error: "imageType 파라미터가 필요합니다" },
        { status: 400 }
      );
    }

    // 상품 존재 여부 확인
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, thumbnailImages: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "해당 상품을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    const updateData: {
      imageUrl?: string;
      detailImage?: string | null;
      thumbnailImages?: string[];
      updatedAt: Date;
    } = { updatedAt: new Date() };

    switch (imageType) {
      case "main":
        updateData.imageUrl = "";
        break;

      case "detail":
        updateData.detailImage = null;
        break;

      case "thumbnail":
        if (!thumbnailUrl) {
          // 전체 썸네일 삭제
          updateData.thumbnailImages = [];
        } else {
          // 특정 썸네일 삭제
          const currentThumbnails = existingProduct.thumbnailImages || [];
          updateData.thumbnailImages = currentThumbnails.filter(
            (url) => url !== thumbnailUrl
          );
        }
        break;

      default:
        return NextResponse.json(
          { error: "유효하지 않은 imageType입니다" },
          { status: 400 }
        );
    }

    // Product 업데이트
    await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    console.log(
      `상품 이미지 삭제 성공 - Product ID: ${productId}, Type: ${imageType}`
    );

    return NextResponse.json({
      success: true,
      message: `${imageType} 이미지가 삭제되었습니다`,
    });
  } catch (error) {
    console.error("상품 이미지 삭제 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
