import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== DELETE /api/cart/clear ====================
// Clear all items from cart

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      return NextResponse.json(data, { status: response.status });
    } catch {
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Clear cart error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'DELETE /api/cart/clear',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

