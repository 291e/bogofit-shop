import React from "react";
import { notFound } from "next/navigation";
import { ProductResponseDto } from "@/types/product";
import ProductDetailClient from "@/components/(Public)/product/ProductDetailClient";

interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  imageUrl: string;
  thumbnailImages?: string[];
  detailImage?: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
  storeName?: string;
  badge?: string;
  avgRating?: number;
  reviewCount?: number;
  variants?: Array<{
    id: string;
    optionName: string;
    optionValue: string;
    priceDiff: number;
    stock: number;
  }>;
  status: string;
  sku?: string;
}

// Helper function to get parent category name for Virtual Fitting
async function getParentCategoryName(categoryId?: string): Promise<string> {
  if (!categoryId) return "상품";
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/category`, {
      cache: 'no-store',
    });
    
    if (!response.ok) return "상품";
    
    const data = await response.json();
    const categories = data.data || data.categories || [];
    
    // Find category by ID and get parent name
    interface Category {
      id: string;
      name: string;
      parentId?: string;
      children?: Category[];
    }
    
    const findCategoryById = (cats: Category[], targetId: string): Category | null => {
      for (const cat of cats) {
        if (cat.id === targetId) return cat;
        if (cat.children) {
          const found = findCategoryById(cat.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategoryById(categories, categoryId);
    if (category) {
      // Find the level 2 category (상의, 하의, 원피스)
      const findLevel2Category = (cat: Category): string | null => {
        if (!cat.parentId) return null; // Level 1 (root)
        
        const parent = findCategoryById(categories, cat.parentId);
        if (!parent || !parent.parentId) {
          // This is level 2 (parent is level 1, no grandparent)
          return cat.name;
        }
        
        // This is level 3+, recursively find level 2
        return findLevel2Category(parent);
      };
      
      const level2Category = findLevel2Category(category);
      if (level2Category) {
        return level2Category;
      }
      
      return category.name || "상품";
    }
    
    return "상품";
  } catch {
    return "상품";
  }
}

async function fetchProduct(productSlug: string, brandSlug: string): Promise<Product | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/product?slug=${productSlug}&brand=${brandSlug}&include=true`,
      {
        cache: 'no-store', // Real-time data, no caching
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (!data.success) return null;
    
    const product = (data.product || data.products?.[0]) as ProductResponseDto;
    if (!product) return null;
    
    // Get category name first
    const categoryName = await getParentCategoryName(product.categoryId);

    // Convert to expected format
    return {
      id: product.id,
      title: product.name,
      price: product.basePrice,
      originalPrice: product.baseCompareAtPrice,
      imageUrl: product.images?.[0] || "/logo.png",
      thumbnailImages: product.images?.slice(1) || [],
      description: product.description,
      category: categoryName,
      subCategory: undefined,
      brand: product.brand ? {
        id: product.brand.id,
        name: product.brand.name,
        slug: product.brand.slug
      } : undefined,
      badge: "NEW",
      avgRating: 4.5,
      reviewCount: 128,
      variants: product.variants?.map(variant => {
        // Parse optionsJson to get option name and value
        // Format: [{"color": "08 다크그레이"}, {"size": "XXL"}]
        let optionName = "옵션";
        let optionValue = "기본";
        
        // Option name mapping (English -> Korean)
        const optionNameMap: Record<string, string> = {
          "color": "색상",
          "size": "사이즈", 
          "colour": "색상",
          "style": "스타일",
          "material": "소재",
          "type": "타입",
          "model": "모델"
        };
        
        try {
          if (variant.optionsJson) {
            const options = JSON.parse(variant.optionsJson) as Record<string, string>[];
            
            if (Array.isArray(options) && options.length > 0) {
              // Get first option as the main option name/value
              const firstOpt = options[0];
              const firstEntry = Object.entries(firstOpt)[0];
              if (firstEntry) {
                const [originalKey, value] = firstEntry;
                // Convert to Korean if mapping exists
                optionName = optionNameMap[originalKey.toLowerCase()] || originalKey;
                optionValue = value;
              }
              
              // If multiple options, combine them into value
              if (options.length > 1) {
                optionValue = options.map(opt => 
                  Object.entries(opt).map(([key, val]) => {
                    const koreanKey = optionNameMap[key.toLowerCase()] || key;
                    return `${koreanKey}: ${val}`;
                  }).join(', ')
                ).join(', ');
              }
            }
          }
        } catch {
          // Failed to parse optionsJson
        }
        
        return {
          id: variant.id,
          optionName,
          optionValue,
          priceDiff: (variant.price || product.basePrice) - product.basePrice,
          stock: variant.quantity || 0
        };
      }),
      status: product.status,
      sku: product.sku
    };
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ brandSlug: string; productSlug: string }>
}) {
  const { brandSlug, productSlug } = await params;
  const product = await fetchProduct(productSlug, brandSlug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
