import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * GET /api/application
 * Lấy application của user hiện tại
 */
export async function GET(request: NextRequest) {
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

    // Try-catch for backend call
    try {
      const response = await fetch(`${API_URL}/api/SellApplication`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      // Convert API response to our DTO format
      const convertedData = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? '신청서를 성공적으로 가져왔습니다.' : '신청서를 가져오는데 실패했습니다.'),
        application: data.application ? {
          id: data.application.id,
          appCode: data.application.appCode,
          status: data.application.status,
          businessName: data.application.businessName,
          bizRegNo: data.application.bizRegNo,
          contactName: data.application.contactName,
          contactPhone: data.application.contactPhone,
          contactEmail: data.application.contactEmail,
          docs: data.application.docs,
          noteAdmin: data.application.noteAdmin,
          ownerUser: data.application.ownerUser,
          createdAt: data.application.createdAt,
          decidedAt: data.application.decidedAt,
        } : undefined
      };
      
      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return NextResponse.json(convertedData, { 
        status: response.status,
        headers: responseHeaders
      });
    } catch {
      // Fallback when backend API is unavailable
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    // Safe error logging (don't expose sensitive info)
    console.error('Application API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'GET /api/application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/application
 * Tạo application mới
 */
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

    const body = await request.json();

    // Input validation
    const requiredFields = ['businessName', 'bizRegNo', 'contactName', 'contactPhone', 'contactEmail'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim().length === 0) {
        return NextResponse.json(
          { success: false, message: `Invalid ${field}` },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Try-catch for backend call
    try {
      const response = await fetch(`${API_URL}/api/SellApplication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          BusinessName: body.businessName,
          BizRegNo: body.bizRegNo,
          ContactName: body.contactName,
          ContactPhone: body.contactPhone,
          ContactEmail: body.contactEmail,
          Docs: body.docs,
        }),
      });

      const data = await response.json();
      
      // Convert API response to our DTO format
      const convertedData = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? '신청서가 성공적으로 생성되었습니다.' : '신청서 생성에 실패했습니다.'),
        application: data.application ? {
          id: data.application.id,
          appCode: data.application.appCode,
          status: data.application.status,
          businessName: data.application.businessName,
        } : undefined
      };

      // Handle backend validation errors
      if (!response.ok && data.errors) {
        const validationResponse = {
          success: false,
          message: data.title || '입력 데이터에 오류가 있습니다.',
          application: undefined,
        };
        
        // Add security headers
        const responseHeaders = new Headers();
        responseHeaders.set('X-Content-Type-Options', 'nosniff');
        responseHeaders.set('X-Frame-Options', 'DENY');
        responseHeaders.set('X-XSS-Protection', '1; mode=block');
        responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        return NextResponse.json(validationResponse, { 
          status: 400,
          headers: responseHeaders
        });
      }
      
      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Return appropriate status based on backend response
      if (response.ok && data.success) {
        return NextResponse.json(convertedData, { 
          status: 200,
          headers: responseHeaders
        });
      } else {
        return NextResponse.json(convertedData, { 
          status: response.status,
          headers: responseHeaders
        });
      }
    } catch {
      // Fallback when backend API is unavailable
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Application API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'POST /api/application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/application
 * Cập nhật application
 */
export async function PATCH(request: NextRequest) {
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

    const body = await request.json();

    // Input validation
    const requiredFields = ['businessName', 'bizRegNo', 'contactName', 'contactPhone', 'contactEmail'];
    for (const field of requiredFields) {
      if (!body[field] || typeof body[field] !== 'string' || body[field].trim().length === 0) {
        return NextResponse.json(
          { success: false, message: `Invalid ${field}` },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.contactEmail)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Try-catch for backend call
    try {
      const response = await fetch(`${API_URL}/api/SellApplication`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          BusinessName: body.businessName,
          BizRegNo: body.bizRegNo,
          ContactName: body.contactName,
          ContactPhone: body.contactPhone,
          ContactEmail: body.contactEmail,
          Docs: body.docs,
        }),
      });

      const data = await response.json();
      
      // Convert API response to our DTO format
      const convertedData = {
        success: data.success || response.ok,
        message: data.message || (response.ok ? '신청서가 성공적으로 수정되었습니다.' : '신청서 수정에 실패했습니다.'),
        application: data.application ? {
          id: data.application.id,
          appCode: data.application.appCode,
          status: data.application.status,
          businessName: data.application.businessName,
        } : undefined
      };

      // Handle backend validation errors
      if (!response.ok && data.errors) {
        const validationResponse = {
          success: false,
          message: data.title || '입력 데이터에 오류가 있습니다.',
          application: undefined,
        };
        
        // Add security headers
        const responseHeaders = new Headers();
        responseHeaders.set('X-Content-Type-Options', 'nosniff');
        responseHeaders.set('X-Frame-Options', 'DENY');
        responseHeaders.set('X-XSS-Protection', '1; mode=block');
        responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        return NextResponse.json(validationResponse, { 
          status: 400,
          headers: responseHeaders
        });
      }
      
      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Return appropriate status based on backend response
      if (response.ok && data.success) {
        return NextResponse.json(convertedData, { 
          status: 200,
          headers: responseHeaders
        });
      } else {
        return NextResponse.json(convertedData, { 
          status: response.status,
          headers: responseHeaders
        });
      }
    } catch {
      // Fallback when backend API is unavailable
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Application API error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'PATCH /api/application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}