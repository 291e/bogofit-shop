import { NextRequest, NextResponse } from "next/server";
import { safeJsonParse } from "@/lib/api-utils";
import {
  CreateBrandDto,
  CreateBrandResponse,
  GetBrandsResponse,
  BrandResponseDto,
  BackendBrandResponse,
  BackendBrandsResponse,
  BrandStatus,
  PaymentMode,
} from "@/types/brand";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: CreateBrandDto = await request.json();

    // Validate required fields
    const validationErrors: { field: string; message: string }[] = [];

    if (!body.applicationId) {
      validationErrors.push({ field: "applicationId", message: "신청서 ID는 필수입니다" });
    }

    if (!body.name) {
      validationErrors.push({ field: "name", message: "브랜드명은 필수입니다" });
    } else if (body.name.length > 255) {
      validationErrors.push({ field: "name", message: "브랜드명은 255자를 초과할 수 없습니다" });
    }

    if (!body.slug) {
      validationErrors.push({ field: "slug", message: "슬러그는 필수입니다" });
    } else if (body.slug.length > 255) {
      validationErrors.push({ field: "slug", message: "슬러그는 255자를 초과할 수 없습니다" });
    } else if (!/^[a-z0-9-]+$/.test(body.slug)) {
      validationErrors.push({ field: "slug", message: "슬러그는 소문자, 숫자, 하이픈만 포함할 수 있습니다" });
    }

    if (body.description && body.description.length > 1000) {
      validationErrors.push({ field: "description", message: "설명은 1000자를 초과할 수 없습니다" });
    }

    if (body.logoUrl && body.logoUrl.trim() !== "" && !/^https?:\/\/.+/.test(body.logoUrl)) {
      validationErrors.push({ field: "logoUrl", message: "유효하지 않은 로고 URL입니다" });
    }

    if (body.coverUrl && body.coverUrl.trim() !== "" && !/^https?:\/\/.+/.test(body.coverUrl)) {
      validationErrors.push({ field: "coverUrl", message: "유효하지 않은 커버 URL입니다" });
    }

    if (body.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail)) {
      validationErrors.push({ field: "contactEmail", message: "유효하지 않은 연락처 이메일입니다" });
    } else if (body.contactEmail && body.contactEmail.length > 255) {
      validationErrors.push({ field: "contactEmail", message: "연락처 이메일은 255자를 초과할 수 없습니다" });
    }

    if (body.contactPhone && body.contactPhone.length > 20) {
      validationErrors.push({ field: "contactPhone", message: "연락처 전화번호는 20자를 초과할 수 없습니다" });
    }

    if (!body.paymentMode) {
      validationErrors.push({ field: "paymentMode", message: "결제 모드는 필수입니다" });
    } else if (!["platform", "business"].includes(body.paymentMode)) {
      validationErrors.push({ field: "paymentMode", message: "결제 모드는 'platform' 또는 'business'여야 합니다" });
    }

    if (validationErrors.length > 0) {
      const response: CreateBrandResponse = {
        success: false,
        message: "입력 데이터에 오류가 있습니다.",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Convert camelCase to PascalCase for backend API
    const backendBody = {
      ApplicationId: body.applicationId,
      Name: body.name,
      Slug: body.slug,
      Description: body.description || null,
      LogoUrl: body.logoUrl && body.logoUrl.trim() !== "" ? body.logoUrl : null,
      CoverUrl: body.coverUrl && body.coverUrl.trim() !== "" ? body.coverUrl : null,
      ContactEmail: body.contactEmail && body.contactEmail.trim() !== "" ? body.contactEmail : null,
      ContactPhone: body.contactPhone && body.contactPhone.trim() !== "" ? body.contactPhone : null,
      PaymentMode: body.paymentMode
    };


    try {
      const response = await fetch(`${API_URL}/api/Brand`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(backendBody),
      });

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as BackendBrandResponse;

      // Convert API response to our DTO format
      const convertedData: CreateBrandResponse = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? "브랜드가 성공적으로 생성되었습니다." : "브랜드 생성에 실패했습니다."),
        brand: data.brand ? {
          id: data.brand.id,
          name: data.brand.name,
          slug: data.brand.slug,
          status: data.brand.status as BrandStatus,
          description: data.brand.description,
          logoUrl: data.brand.logoUrl,
          coverUrl: data.brand.bannerUrl,
          contactEmail: data.brand.contactEmail,
          contactPhone: data.brand.contactPhone,
          paymentMode: "platform" as PaymentMode, // Default value, should be provided by backend
          createdAt: data.brand.createdAt,
          updatedAt: data.brand.updatedAt,
        } : undefined
      };


      // Handle backend validation errors
      if (!response.ok && data && 'errors' in data) {
        const validationErrors: { field: string; message: string }[] = [];
        const errorData = data as Record<string, unknown>;

        // Convert backend PascalCase errors to camelCase for frontend
        if (errorData.errors && typeof errorData.errors === 'object') {
          Object.keys(errorData.errors).forEach(field => {
            const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
            const messages = (errorData.errors as Record<string, unknown>)[field];
            if (Array.isArray(messages)) {
              messages.forEach((message: unknown) => {
                if (typeof message === 'string') {
                  validationErrors.push({ field: camelCaseField, message });
                }
              });
            }
          });
        }

        const validationResponse: CreateBrandResponse = {
          success: false,
          message: (typeof errorData.title === 'string' ? errorData.title : undefined) || "입력 데이터에 오류가 있습니다.",
          brand: undefined,
        };
        return NextResponse.json(validationResponse, { status: 400 });
      }

      // Return appropriate status based on backend response
      if (response.ok && data.success) {
        return NextResponse.json(convertedData, { status: 200 });
      } else {
        // If backend returns error, forward the error with proper status
        return NextResponse.json(convertedData, { status: response.status });
      }
    } catch {
      // Fallback khi backend API không khả dụng
      return NextResponse.json(
        { success: false, message: "Backend service unavailable" },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Brand creation error:", error);
    return NextResponse.json(
      { success: false, message: "브랜드 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header (optional for public access)
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const brandId = searchParams.get('id');

    // Build URL with query parameters
    let apiUrl = `${API_URL}/api/Brand`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Case 1: Get single brand by ID (requires auth)
    if (brandId) {
      if (!token) {
        return NextResponse.json(
          { success: false, message: "인증이 필요합니다." },
          { status: 401 }
        );
      }
      apiUrl += `/${brandId}`;
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Case 2: Get brands by application (requires auth)
    else if (applicationId) {
      if (!token) {
        return NextResponse.json(
          { success: false, message: "인증이 필요합니다." },
          { status: 401 }
        );
      }
      apiUrl += `?applicationId=${applicationId}`;
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Case 3: Get all brands (public - no auth needed)
    // apiUrl stays as is

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as BackendBrandsResponse;

      // Handle single brand response
      if (brandId && data.brands && data.brands.length > 0) {
        const brand = data.brands[0];
        const convertedData = {
          success: data.success || true,
          message: data.message || "브랜드 정보를 성공적으로 가져왔습니다.",
          brand: {
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            status: brand.status as BrandStatus,
            description: brand.description,
            logoUrl: brand.logoUrl,
            coverUrl: brand.bannerUrl,
            contactEmail: brand.contactEmail,
            contactPhone: brand.contactPhone,
            paymentMode: "platform" as PaymentMode,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
          } as BrandResponseDto
        };
        return NextResponse.json(convertedData, { status: response.status });
      }

      // Handle brand list response
      const convertedData: GetBrandsResponse = {
        success: data.success || true,
        message: data.message || "브랜드 목록을 성공적으로 가져왔습니다.",
        brands: data.brands ? data.brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          status: brand.status as BrandStatus,
          description: brand.description,
          logoUrl: brand.logoUrl,
          coverUrl: brand.bannerUrl,
          contactEmail: brand.contactEmail,
          contactPhone: brand.contactPhone,
          paymentMode: "platform" as PaymentMode,
          createdAt: brand.createdAt,
          updatedAt: brand.updatedAt,
        })) as BrandResponseDto[] : [],
        count: data.count || 0,
      };
      return NextResponse.json(convertedData, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: "브랜드 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
