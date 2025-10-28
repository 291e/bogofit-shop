import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";
import { BackendBrandResponse, BrandResponseDto, BrandStatus, GetBrandResponse, PaymentMode } from "@/types/brand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    try {
      // Await params first
      const { id } = await params;

      const response = await fetch(`${API_URL}/api/Brand/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as BackendBrandResponse;

      if (!response.ok) {
        return NextResponse.json(
          { success: false, message: data.message || "브랜드를 찾을 수 없습니다." },
          { status: response.status }
        );
      }

      // Convert API response to our DTO format
      const convertedData: GetBrandResponse = {
        success: true,
        message: "브랜드 정보를 성공적으로 가져왔습니다.",
        brand: {
          id: data.brand?.id,
          name: data.brand?.name,
          slug: data.brand?.slug,
          status: data.brand?.status as BrandStatus,
          description: data.brand?.description,
          logoUrl: data.brand?.logoUrl,
          coverUrl: data.brand?.bannerUrl,
          contactEmail: data.brand?.contactEmail,
          contactPhone: data.brand?.contactPhone,
          paymentMode: "platform" as PaymentMode,
          createdAt: data.brand?.createdAt,
          updatedAt: data.brand?.updatedAt
        } as BrandResponseDto
      };

      return NextResponse.json(convertedData, { status: 200 });
    } catch {
      // Fallback khi backend API không khả dụng
      return NextResponse.json(
        { success: false, message: "Backend service unavailable" },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Brand fetch error:", error);
    return NextResponse.json(
      { success: false, message: "브랜드 정보를 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
