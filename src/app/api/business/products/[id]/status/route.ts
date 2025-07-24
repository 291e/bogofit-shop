import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { checkBusinessAuth } from "@/lib/businessAuth";

// 상품 상태 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const [user, errorResponse] = await checkBusinessAuth();
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const productId = parseInt(resolvedParams.id);
    const body = await request.json();
    const { status, rejectionReason } = body;

    // productId 유효성 검사
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "유효하지 않은 상품 ID입니다" },
        { status: 400 }
      );
    }

    // status 유효성 검사
    const validStatuses: ProductStatus[] = [
      "DRAFT",
      "PENDING",
      "APPROVED",
      "REJECTED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "유효하지 않은 상태입니다. (DRAFT, PENDING, APPROVED, REJECTED)",
        },
        { status: 400 }
      );
    }

    // 거부 상태의 경우 거부 사유 필수
    if (status === "REJECTED" && !rejectionReason) {
      return NextResponse.json(
        { error: "거부 상태로 변경할 때는 거부 사유가 필요합니다" },
        { status: 400 }
      );
    }

    // 상품 존재 및 소유권 확인
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        brandId: user!.brandId,
      },
      select: {
        id: true,
        title: true,
        status: true,
        brandId: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "상품을 찾을 수 없거나 권한이 없습니다" },
        { status: 404 }
      );
    }

    // 상태 변경 로직 및 검증
    const currentStatus = existingProduct.status;
    const newStatus = status as ProductStatus;

    // 상태 변경 규칙 검증
    if (currentStatus === newStatus) {
      return NextResponse.json(
        { error: "이미 동일한 상태입니다" },
        { status: 400 }
      );
    }

    // 비즈니스 로직: 특정 상태 변경만 허용
    if (currentStatus === "APPROVED" && newStatus === "DRAFT") {
      return NextResponse.json(
        { error: "승인된 상품은 임시저장 상태로 변경할 수 없습니다" },
        { status: 400 }
      );
    }

    // 상품 상태 업데이트 데이터 준비
    const updateData: {
      status: ProductStatus;
      rejectionReason?: string | null;
      approvedAt?: Date | null;
      approvedBy?: string | null;
      updatedAt: Date;
    } = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // 상태별 추가 필드 설정
    switch (newStatus) {
      case "APPROVED":
        updateData.approvedAt = new Date();
        updateData.approvedBy = user!.id; // 승인자 정보
        updateData.rejectionReason = null; // 거부 사유 초기화
        break;
      case "REJECTED":
        updateData.rejectionReason = rejectionReason;
        updateData.approvedAt = null;
        updateData.approvedBy = null;
        break;
      case "PENDING":
      case "DRAFT":
        updateData.rejectionReason = null;
        if (newStatus === "DRAFT") {
          updateData.approvedAt = null;
          updateData.approvedBy = null;
        }
        break;
    }

    // 상품 상태 업데이트
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        title: true,
        status: true,
        rejectionReason: true,
        approvedAt: true,
        approvedBy: true,
        updatedAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    console.log(
      `상품 상태 변경 성공: ${productId} - ${currentStatus} → ${newStatus}`
    );

    // 상태 변경에 따른 로그 또는 알림 (선택사항)
    // TODO: 상품 상태 변경 이력 저장, 브랜드 관리자에게 알림 발송 등

    return NextResponse.json({
      success: true,
      data: {
        product: updatedProduct,
        previousStatus: currentStatus,
        newStatus: newStatus,
      },
      message: `상품 상태가 ${getStatusText(currentStatus)}에서 ${getStatusText(
        newStatus
      )}로 변경되었습니다`,
    });
  } catch (error) {
    console.error("상품 상태 변경 실패:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

// 상태 텍스트 변환 헬퍼 함수
function getStatusText(status: ProductStatus): string {
  const statusMap = {
    DRAFT: "임시저장",
    PENDING: "승인대기",
    APPROVED: "승인완료",
    REJECTED: "승인거부",
  };
  return statusMap[status] || status;
}
