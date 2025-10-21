import { CreateProductVariantDto } from '@/types/product';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/product - Get products with various filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Support both 'page' and 'pageNumber' for backward compatibility
    const page = searchParams.get('page') || searchParams.get('pageNumber') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    
    // Filter parameters
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const brandId = searchParams.get('brandId');
    const brand = searchParams.get('brand'); // Brand slug for SEO-friendly queries
    const categoryId = searchParams.get('categoryId');
    const category = searchParams.get('category'); // Category name for filtering
    const status = searchParams.get('status');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const include = searchParams.get('include'); // Include variants

    // Build query parameters based on backend API documentation
    const queryParams = new URLSearchParams();
    
    // Priority 1: Get by ID (single product)
    if (id) {
      queryParams.set('id', id);
      if (include) queryParams.set('include', include);
    }
    // Priority 2: Get by slug + brandId (single product)
    else if (slug && brandId) {
      queryParams.set('slug', slug);
      queryParams.set('brandId', brandId);
      if (include) queryParams.set('include', include);
    }
    // Priority 2.5: Get by slug + brand slug (single product - SEO-friendly)
    else if (slug && brand) {
      console.log(`🔍 Fetching product by slug: ${slug} and brand: ${brand}`);
      queryParams.set('slug', slug);
      queryParams.set('brand', brand);
      if (include) queryParams.set('include', include);
    }
    // Priority 3: List with filters
    else {
      queryParams.set('page', page);
      queryParams.set('pageSize', pageSize);
      
      // Only add brandId if provided (for public access, this can be empty)
      if (brandId) queryParams.set('brandId', brandId);
      if (categoryId) queryParams.set('categoryId', categoryId);
      if (category) queryParams.set('category', category);
      if (status) queryParams.set('status', status);
      if (isActive) queryParams.set('isActive', isActive);
      if (search) queryParams.set('search', search);
      if (include) queryParams.set('include', include);
    }

    // Get authorization header from the incoming request
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${API_URL}/api/Product?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      }
    });

    const responseText = await response.text();
    let data;
    
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error in GET:', parseError);
        console.error('Response text:', responseText);
        return NextResponse.json(
          { success: false, message: 'Invalid response from server' },
          { status: 500 }
        );
      }
    } else {
      console.error('❌ Empty response from backend');
      return NextResponse.json(
        { success: false, message: 'Empty response from backend' },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error('❌ Failed to fetch products:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch products' },
        { status: response.status }
      );
    }


    // Add cache headers for better performance
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600'); // 5 min cache, 10 min stale
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/product - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    // ✅ Validate required fields
    if (!body.brandId || !body.name || !body.slug || !body.basePrice) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: brandId, name, slug, basePrice' },
        { status: 400 }
      );
    }

    // ✅ v2.1: Variants are optional - validate based on hasOptions
    const hasOptions = body.hasOptions || false;
    if (hasOptions && (!body.variants || body.variants.length === 0)) {
      return NextResponse.json(
        { success: false, message: 'Variants are required when hasOptions is true' },
        { status: 400 }
      );
    }

    // ✅ Sử dụng PascalCase cho backend (C# convention)
    const createProductDto = {
      brandId: body.brandId,
      name: body.name,
      slug: body.slug,
      sku: body.sku || null,
      status: body.status || 'draft',
      description: body.description || null,
      categoryId: body.categoryId || null,
      thumbUrl: body.thumbUrl || null,
      images: body.images || [],
      basePrice: body.basePrice,
      baseCompareAtPrice: body.baseCompareAtPrice || null,
      quantity: body.quantity || null, // ✅ v2.1: Product-level inventory
      variants: hasOptions ? body.variants.map((variant: CreateProductVariantDto) => ({
        price: variant.price ?? null,
        compareAtPrice: variant.compareAtPrice ?? null,
        quantity: variant.quantity ?? 0, // ✅ Required field
        weightGrams: variant.weightGrams ?? null,
        status: variant.status || 'active', // ✅ Required field với validation
        optionsJson: variant.optionsJson || undefined // ✅ camelCase - Optional for products without options
      })) : [] // ✅ v2.1: Empty array when no variants
    };

    const response = await fetch(`${API_URL}/api/Product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(createProductDto)
    });

    const responseText = await response.text();
    let data;
    
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Response text:', responseText);
        return NextResponse.json(
          { success: false, message: 'Invalid response from server' },
          { status: 500 }
        );
      }
    } else {
      data = { success: true, message: 'Product created successfully' };
    }

    if (!response.ok) {
      console.error('❌ Product creation failed:', data);
      if (data.errors) {
        return NextResponse.json(
          { success: false, message: data.message || 'Validation failed', errors: data.errors },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create product' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

