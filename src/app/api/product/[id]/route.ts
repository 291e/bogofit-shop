import { NextRequest, NextResponse } from 'next/server';
import { UpdateProductVariantDto, CreateProductVariantDto, UpdateProductDto } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// GET /api/product/[id] - Get product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');


    // Backend uses query param for id with include
    const response = await fetch(`${API_URL}/api/Product?id=${id}&include=true`, {
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
        console.error('❌ JSON parse error:', parseError);
        console.error('Response text:', responseText);
        return NextResponse.json(
          { success: false, message: 'Invalid response from backend' },
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
      console.error('❌ Failed to fetch product:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch product' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/product/[id] - Update product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProductDto = await request.json();
    const authHeader = request.headers.get('authorization');

    // Validation helper
    const validateVariants = (variants: UpdateProductVariantDto[] | CreateProductVariantDto[], type: 'update' | 'new') => {
      const errors: string[] = [];
      
      variants?.forEach((variant, index) => {
        if (type === 'update' && !('id' in variant)) {
          errors.push(`Update variant ${index + 1}: ID is required`);
        }
        // ✅ Kiểm tra optionsJson là string và valid JSON
        if (variant.optionsJson && typeof variant.optionsJson === 'string') {
          try {
            const parsed = JSON.parse(variant.optionsJson);
            if (!Array.isArray(parsed)) {
              errors.push(`${type} variant ${index + 1}: OptionsJson must be a JSON array`);
            }
          } catch {
            errors.push(`${type} variant ${index + 1}: OptionsJson must be valid JSON`);
          }
        }
        if (variant.quantity && variant.quantity < 0) {
          errors.push(`${type} variant ${index + 1}: Quantity must be >= 0`);
        }
      });
      
      return errors;
    };

    // Validate variants
    const updateErrors = validateVariants(body.updateVariants || [], 'update');
    const newErrors = validateVariants(body.newVariants || [], 'new');

    if (updateErrors.length > 0 || newErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed', 
          errors: [...updateErrors, ...newErrors] 
        },
        { status: 400 }
      );
    }


    // ✅ FIXED: Sử dụng camelCase cho tất cả fields (backend .NET dùng camelCase mặc định)
    const updateProductDto = {
      // Product fields - camelCase
      name: body.name ?? undefined,
      slug: body.slug ?? undefined,
      sku: body.sku ?? undefined,
      isActive: body.isActive ?? undefined,  // ✅ Business user set active/inactive
      description: body.description ?? undefined,
      categoryId: body.categoryId ?? undefined,
      thumbUrl: body.thumbUrl ?? undefined,
      images: body.images ?? undefined,
      basePrice: body.basePrice ?? undefined,
      baseCompareAtPrice: body.baseCompareAtPrice ?? undefined,
      
      // Variant operations - camelCase
      updateVariants: body.updateVariants?.map((variant: UpdateProductVariantDto) => ({
        id: variant.id,
        price: variant.price ?? undefined,
        compareAtPrice: variant.compareAtPrice ?? undefined,
        quantity: variant.quantity ?? undefined,
        weightGrams: variant.weightGrams ?? undefined,
        status: variant.status ?? undefined,
        optionsJson: variant.optionsJson ?? undefined  // ✅ camelCase, không phải OptionsJson
      })) ?? undefined,
      
      newVariants: body.newVariants?.map((variant: CreateProductVariantDto) => ({
        price: variant.price ?? undefined,
        compareAtPrice: variant.compareAtPrice ?? undefined,
        quantity: variant.quantity ?? undefined,
        weightGrams: variant.weightGrams ?? undefined,
        status: variant.status ?? undefined,
        optionsJson: variant.optionsJson ?? undefined  // ✅ camelCase
      })) ?? undefined,
      
      deleteVariants: body.deleteVariants ?? undefined  // ✅ camelCase, không phải DeleteVariants
    };

    // Remove undefined values (chỉ gửi fields có giá trị)
    const cleanDto = Object.fromEntries(
      Object.entries(updateProductDto).filter(([, v]) => v !== undefined)
    );

    const response = await fetch(`${API_URL}/api/Product/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader })
      },
      body: JSON.stringify(cleanDto)
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
      console.error('❌ Empty response from backend');
      return NextResponse.json(
        { success: false, message: 'Empty response from backend' },
        { status: 503 }
      );
    }

    if (!response.ok) {
      console.error('❌ PATCH /api/product/[id] - Backend Error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      if (data.errors) {
        return NextResponse.json(
          { success: false, message: data.message || 'Validation failed', errors: data.errors },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to update product' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/product/[id] - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');


    const response = await fetch(`${API_URL}/api/Product/${id}`, {
      method: 'DELETE',
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
        console.error('❌ JSON parse error in DELETE:', parseError);
        return NextResponse.json(
          { success: false, message: 'Invalid response from server' },
          { status: 500 }
        );
      }
    } else {
      // Empty response có thể là OK cho DELETE
      data = { success: true, message: 'Product deleted successfully' };
    }

    if (!response.ok) {
      console.error('❌ Failed to delete product:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete product' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
