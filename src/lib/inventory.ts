import { ProductResponseDto } from "@/types/product";

/**
 * Get stock text for display
 */
export function getStockText(product: ProductResponseDto): string {
  // If product has variants, use variant stock
  if (product.variants && product.variants.length > 0) {
    const totalStock = product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
    if (totalStock === 0) return "품절";
    return `${totalStock}개 남음`;
  }
  
  // If product has no variants, use product-level quantity
  if (product.quantity === null) return "무제한";
  if (product.quantity === 0) return "품절";
  return `${product.quantity}개 남음`;
}

/**
 * Get display price information
 */
export function getDisplayPrice(product: ProductResponseDto) {
  // If product has variants, use first variant price
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    return {
      price: firstVariant.price ?? product.basePrice,
      originalPrice: firstVariant.compareAtPrice ?? product.baseCompareAtPrice,
      discountPercent: firstVariant.compareAtPrice && firstVariant.price 
        ? Math.round(((firstVariant.compareAtPrice - firstVariant.price) / firstVariant.compareAtPrice) * 100)
        : null,
      hasDiscount: !!(firstVariant.compareAtPrice && firstVariant.price && firstVariant.compareAtPrice > firstVariant.price)
    };
  }
  
  // If product has no variants, use product base price
  return {
    price: product.basePrice,
    originalPrice: product.baseCompareAtPrice,
    discountPercent: product.baseCompareAtPrice 
      ? Math.round(((product.baseCompareAtPrice - product.basePrice) / product.baseCompareAtPrice) * 100)
      : null,
    hasDiscount: !!(product.baseCompareAtPrice && product.baseCompareAtPrice > product.basePrice)
  };
}
