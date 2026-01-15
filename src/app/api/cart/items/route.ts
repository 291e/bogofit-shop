import { CreateCartItemDto } from '@/types/cart';
import { NextRequest, NextResponse } from 'next/server';
import { safeJsonParse } from "@/lib/api-utils";

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
      console.error("❌ Cart Error: Missing productId", body);
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity < 1) {
      console.error("❌ Cart Error: Invalid quantity", body);
      return NextResponse.json(
        { success: false, message: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    try {
      const backendRes = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      // Parse backend response
      let result;
      const text = await backendRes.text();
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error("❌ Backend response parse error:", text);
        result = { success: false, message: "Invalid JSON from backend" };
      }

      if (!backendRes.ok) {
        console.error(`❌ Backend /api/cart/items Error (${backendRes.status}):`, result);
        // Pass through the backend error message
        return NextResponse.json(
          { success: false, message: result.message || "Failed to add item to cart", errors: result.errors },
          { status: backendRes.status }
        );
      }

      return NextResponse.json(result, { status: 200 });
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

