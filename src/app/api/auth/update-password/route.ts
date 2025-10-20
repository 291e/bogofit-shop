import { NextRequest, NextResponse } from 'next/server';

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

    // Input validation
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json(
        { success: false, message: '현재 비밀번호와 새 비밀번호를 입력해주세요' },
        { status: 400 }
      );
    }

    if (body.newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: '새 비밀번호는 6자 이상이어야 합니다' },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${API_URL}/api/Auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          CurrentPassword: body.currentPassword,
          NewPassword: body.newPassword
        })
      });

      const data = await response.json();
      
      const convertedData = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? '비밀번호가 성공적으로 변경되었습니다.' : '비밀번호 변경에 실패했습니다.')
      };

      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      
      return NextResponse.json(convertedData, { 
        status: response.status,
        headers: responseHeaders
      });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Update password API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'PUT /api/auth/update-password',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}