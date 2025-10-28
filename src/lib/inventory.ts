import { ProductResponseDto } from "@/types/product";

/**
 * Get display price information including discounts
 */
export function getDisplayPrice(product: ProductResponseDto) {
    const basePrice = product.basePrice || 0;

    // Check if product has promotion and calculate discount
    if (product.promotion) {
        let discountAmount = 0;
        switch (product.promotion.type) {
            case "percentage":
                discountAmount = Math.round(basePrice * ((product.promotion.value || 0) / 100));
                break;
            case "fixed_amount":
                discountAmount = product.promotion.value || 0;
                break;
            case "free_shipping":
                discountAmount = 0; // Free shipping doesn't reduce product price
                break;
        }

        const discountedPrice = basePrice - discountAmount;
        const discountPercent = discountAmount > 0 ? Math.round((discountAmount / basePrice) * 100) : 0;

        return {
            price: discountedPrice,
            originalPrice: basePrice,
            hasDiscount: discountAmount > 0,
            discountPercent: discountPercent,
        };
    }

    return {
        price: basePrice,
        originalPrice: null,
        hasDiscount: false,
        discountPercent: null,
    };
}

/**
 * Get stock status text
 */
export function getStockText(product: ProductResponseDto): string {
    const stock = product.quantity || 0;

    if (stock === 0) {
        return "품절";
    } else if (stock < 10) {
        return `재고 부족 (${stock}개 남음)`;
    } else if (stock < 50) {
        return `재고 있음 (${stock}개)`;
    } else {
        return "충분한 재고";
    }
}

