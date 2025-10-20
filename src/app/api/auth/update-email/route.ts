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
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { success: false, message: '이메일을 입력해주세요' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 이메일 형식입니다' },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${API_URL}/api/Auth/update-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Email: body.email
        })
      });

      const data = await response.json();
      
      const convertedData = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? '이메일이 성공적으로 변경되었습니다.' : '이메일 변경에 실패했습니다.'),
        user: data.user ? {
          id: data.user.id,
          userId: data.user.userId,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          isAdmin: data.user.isAdmin,
          isActive: data.user.isActive,
          updatedAt: data.user.updatedAt
        } : undefined
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
    console.error('Update email API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'PUT /api/auth/update-email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}