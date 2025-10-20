import { CreateCartItemDto } from '@/types/cart';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==================== POST /api/cart/items ====================
// Add item to cart (or update quantity if already exists)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body: CreateCartItemDto = await request.json();

    // Basic validation
    if (!body.productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
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
    console.error('Add to cart error:', {
      timestamp: new Date().toISOString(),
      endpoint: 'POST /api/cart/items',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

