import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { GetCategoriesResponse, GetCategoriesParams } from '@/types/category';

// Backend API base URL - có thể config từ environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Function để gọi API backend thực
async function callBackendAPI(params: GetCategoriesParams): Promise<GetCategoriesResponse> {
  try {
    const queryParams = new URLSearchParams();

    if (params.status) queryParams.append('status', params.status);
    if (params.parentId) queryParams.append('parentId', params.parentId);
    if (params.slug) queryParams.append('slug', params.slug);
    if (params.id) queryParams.append('id', params.id);
    if (params.isRoot) queryParams.append('isRoot', 'true');
    if (params.isTree) queryParams.append('isTree', 'true');

    const url = `${API_URL}/api/Category?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Timeout 10 giây
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status} ${response.statusText}`);
    }

    const result = await safeJsonParse(response);

    if (!result.success) {
      throw new Error(result.message || 'Backend API error');
    }

    const data = result.data as GetCategoriesResponse;
    return data;
  } catch (error) {
    console.error('Backend API call failed:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: GetCategoriesParams = {
      status: searchParams.get('status') || undefined,
      parentId: searchParams.get('parentId') || undefined,
      slug: searchParams.get('slug') || undefined,
      id: searchParams.get('id') || undefined,
      isRoot: searchParams.get('isRoot') === 'true',
      isTree: searchParams.get('isTree') === 'true'
    };

    try {
      // Gọi backend API thực tế
      const backendResponse = await callBackendAPI(params);

      if (backendResponse && backendResponse.success) {
        return NextResponse.json(backendResponse);
      } else {
        return NextResponse.json({
          success: false,
          message: backendResponse?.message || "Backend API trả về dữ liệu không hợp lệ"
        }, { status: 500 });
      }
    } catch (backendError) {
      console.warn('Backend API không khả dụng:', backendError);

      // Trả về mock data để UI hoạt động
      const mockCategories = [
        {
          id: "1",
          name: "상의",
          slug: "top",
          status: "active",
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: "11",
              name: "후드",
              slug: "hoodie",
              status: "active",
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "1"
            },
            {
              id: "12",
              name: "맨투맨",
              slug: "sweatshirt",
              status: "active",
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "1"
            },
            {
              id: "13",
              name: "셔츠",
              slug: "shirt",
              status: "active",
              sortOrder: 3,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "1"
            }
          ]
        },
        {
          id: "2",
          name: "하의",
          slug: "bottom",
          status: "active",
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: "21",
              name: "청바지",
              slug: "jeans",
              status: "active",
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "2"
            },
            {
              id: "22",
              name: "슬랙스",
              slug: "slacks",
              status: "active",
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "2"
            }
          ]
        },
        {
          id: "3",
          name: "아우터",
          slug: "outer",
          status: "active",
          sortOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: "31",
              name: "자켓",
              slug: "jacket",
              status: "active",
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "3"
            },
            {
              id: "32",
              name: "코트",
              slug: "coat",
              status: "active",
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "3"
            }
          ]
        },
        {
          id: "4",
          name: "원피스",
          slug: "dress",
          status: "active",
          sortOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          children: [
            {
              id: "41",
              name: "미니원피스",
              slug: "mini-dress",
              status: "active",
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "4"
            },
            {
              id: "42",
              name: "맥시원피스",
              slug: "maxi-dress",
              status: "active",
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentId: "4"
            }
          ]
        }
      ];

      const response: GetCategoriesResponse = {
        success: true,
        message: "Backend API không khả dụng, sử dụng mock data",
        data: mockCategories
      };

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('Category API Error:', error);
    return NextResponse.json({
      success: false,
      message: "Lỗi server: " + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

