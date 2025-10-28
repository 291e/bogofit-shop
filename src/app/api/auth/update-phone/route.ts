import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { AuthResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Input validation - Korean phone number format
    if (!body.phone || typeof body.phone !== 'string') {
      return NextResponse.json(
        { success: false, message: '전화번호를 입력해주세요' },
        { status: 400 }
      );
    }

    // Validate Korean phone format (010XXXXXXXX)
    const phoneRegex = /^01[016789]\d{7,8}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 전화번호입니다 (010-XXXX-XXXX 형식)' },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${API_URL}/api/Auth/update-phone`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Phone: body.phone
        })
      });

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as AuthResponse | undefined as AuthResponse;

      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Update phone API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'PUT /api/auth/update-phone',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}