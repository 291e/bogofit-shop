import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/product/[id]/variants - Get product variants
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try { 
    const { id } = await params;

    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    // ✅ ĐÚNG - Sử dụng endpoint thực tế
    const response = await fetch(`${API_URL}/api/ProductVariant?productId=${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch product variants' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/product/[id]/variants - Create product variant
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();

    // Get token from incoming request headers
    const authHeader = request.headers.get('authorization');

    // ✅ ĐÚNG - Sử dụng PascalCase và OptionsJson
    const createVariantDto =
    {
      ProductId: productId,
      Price: body.price ?? null,
      CompareAtPrice: body.compareAtPrice ?? null,
      Quantity: body.quantity ?? 0,
      WeightGrams: body.weightGrams ?? null,
      Status: body.status || 'active',
      OptionsJson: typeof body.options === 'object' 
        ? JSON.stringify(body.options) 
        : body.optionsJson || undefined
    };

    // ✅ ĐÚNG - Sử dụng endpoint thực tế với productId
    const response = await fetch(`${API_URL}/api/ProductVariant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(createVariantDto)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create product variant' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating product variant:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

