import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";
import { ApiApplicationResponse } from '@/types/application';
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
      const response: Response = await fetch(`${API_URL}/api/SellApplication`, {
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

      const data = result.data as ApiApplicationResponse;

      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      return NextResponse.json(data, {
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

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as ApiApplicationResponse;

      // Convert API response to our DTO format
      // Handle backend validation errors
      if (!response.ok) {
        return NextResponse.json(data, { status: 400 });
      }

      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Return appropriate status based on backend response
      if (response.ok && data.success) {
        return NextResponse.json(data, {
          status: 200,
          headers: responseHeaders
        });
      } else {
        return NextResponse.json(data, {
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

      const result = await safeJsonParse(response);

      if (!result.success) {
        return NextResponse.json(result, { status: result.status || 500 });
      }

      const data = result.data as ApiApplicationResponse;

      // Convert API response to our DTO format
      // Handle backend validation errors
      if (!response.ok) {
        return NextResponse.json(data, { status: 400 });
      }

      // Add security headers
      const responseHeaders = new Headers();
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('X-XSS-Protection', '1; mode=block');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Return appropriate status based on backend response
      if (response.ok && data.success) {
        return NextResponse.json(data, {
          status: 200,
          headers: responseHeaders
        });
      } else {
        return NextResponse.json(data, {
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