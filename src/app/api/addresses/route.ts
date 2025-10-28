import { CreateAddressDto } from '@/types/address';
import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ✅ GET - Lấy địa chỉ
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // Get ALL query params and pass through
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${API_URL}/api/Address${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;

      // ✅ GIỮ NGUYÊN response structure từ backend
      return NextResponse.json(data, { 
        status: response.status,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        }
      });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Addresses GET error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'GET /api/addresses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ✅ POST - Tạo địa chỉ
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

     const body: CreateAddressDto = await request.json();
 
     // Frontend validation
     if (!['shipping', 'return', 'warehouse', 'billing'].includes(body.addressType)) {
      return NextResponse.json(
        { success: false, message: "addressType은 'shipping', 'return', 'warehouse', 또는 'billing'이어야 합니다." },
        { status: 400 }
      );
    }

    if (!body.recipient?.trim()) {
      return NextResponse.json(
        { success: false, message: "받는 사람은 필수 항목입니다." },
        { status: 400 }
      );
    }

    if (!body.roadAddress?.trim()) {
      return NextResponse.json(
        { success: false, message: "도로명 주소는 필수 항목입니다." },
        { status: 400 }
      );
    }

     try {
       // ✅ GỬI TRỰC TIẾP - C# tự động convert camelCase → PascalCase
       const response = await fetch(`${API_URL}/api/Address`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`,
         },
         body: JSON.stringify(body), // ✅ Gửi thẳng body, không cần convert
       });
 
       const result = await safeJsonParse(response);
    
    if (!result.success) {
      return NextResponse.json(result, { status: result.status || 500 });
    }

    const data = result.data;

      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}