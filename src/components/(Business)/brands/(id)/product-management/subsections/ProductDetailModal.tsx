"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// import { Separator } from "@/components/ui/separator";
import { ProductResponseDto } from "@/types/product";
import { Package, DollarSign, Box, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface ProductDetailModalProps {
    product: ProductResponseDto | null;
    isOpen: boolean;
    onClose: () => void;
    brandId?: string;
}

export default function ProductDetailModal({
    product,
    isOpen,
    onClose,
    brandId
}: ProductDetailModalProps) {
    const router = useRouter();

    if (!product) return null;

    const getApprovalStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'banned': return 'bg-gray-900 text-white';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getApprovalStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return '승인됨';
            case 'pending': return '대기중';
            case 'rejected': return '거부됨';
            case 'banned': return '차단됨';
            default: return status;
        }
    };

    const handleEdit = () => {
        router.push(`/business/brands/${brandId}/products/${product.id}/edit`);
        onClose();
    };

    // Calculate total stock
    const getTotalStock = () => {
        if (product.variants && product.variants.length > 0) {
            // If has variants, sum all variant quantities
            return product.variants.reduce((sum, variant) => sum + variant.quantity, 0);
        }
        // If no variants, use product quantity
        return product.quantity;
    };

    // Calculate price range for variants
    const getPriceRange = () => {
        if (product.variants && product.variants.length > 0) {
            const prices = product.variants.map(v => v.price || product.basePrice);
            const uniquePrices = [...new Set(prices)];
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Only show range if there are actually different prices
            const hasRange = uniquePrices.length > 1;

            return { minPrice, maxPrice, hasRange };
        }
        return { minPrice: product.basePrice, maxPrice: product.basePrice, hasRange: false };
    };



    const totalStock = getTotalStock();
    const priceRange = getPriceRange();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">상품 상세 정보</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 1. Product Name, Status, IsActive */}
                    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-lg text-gray-900 mb-3">{product.name}</h2>
                                <div className="flex items-center gap-3 flex-wrap">
                                    {product.sku && (
                                        <span className="text-xs font-mono text-gray-600">SKU: {product.sku}</span>
                                    )}
                                    <Badge className={`${getApprovalStatusColor(product.status)} text-xs px-2 py-1`}>
                                        {getApprovalStatusLabel(product.status)}
                                    </Badge>
                                    <Badge className={`${product.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        } text-xs px-2 py-1`}>
                                        {product.isActive ? '판매중' : '판매중지'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Promotion */}
                    {product.promotion && (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="bg-purple-600 text-white text-xs">
                                    프로모션
                                </Badge>
                                <span className="text-sm font-semibold text-gray-900">{product.promotion.name}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                {product.promotion.type === 'percentage'
                                    ? `${product.promotion.value}% 할인 적용`
                                    : product.promotion.type === 'fixed_amount'
                                        ? `${product.promotion.value?.toLocaleString()}원 할인 적용`
                                        : '무료 배송'
                                }
                            </div>
                        </div>
                    )}

                    {/* 3. Price Information */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
                            <DollarSign className="w-4 h-4 text-purple-600" />
                            가격 정보
                        </h3>
                        <div className="space-y-3">
                            {/* 판매가 */}
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">판매가</span>
                                <div className="text-right">
                                    {!priceRange.hasRange ? (
                                        <span className="text-xl font-bold text-gray-900">
                                            ₩{priceRange.minPrice.toLocaleString()}
                                        </span>
                                    ) : (
                                        <div>
                                            <div className="text-xs text-gray-500">₩{priceRange.minPrice.toLocaleString()} ~ ₩{priceRange.maxPrice.toLocaleString()}</div>
                                            <div className="text-sm text-gray-400">(옵션별로 상이)</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* 할인 후 가격 (nếu có promotion) */}
                            {product.promotion && product.finalPrice && product.finalPrice < product.basePrice && (
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="text-sm font-semibold text-purple-600">프로모션 가격</span>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400 line-through mb-1">
                                            ₩{product.basePrice.toLocaleString()}
                                        </div>
                                        <span className="text-2xl font-bold text-purple-600">
                                            ₩{product.finalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 4. Quantity Info */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-gray-900">
                            <Box className="w-4 h-4 text-green-600" />
                            재고 정보
                        </h3>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                {product.variants && product.variants.length > 0 ? '총 재고 수량' : '재고 수량'}
                            </span>
                            <span className={`font-bold text-lg ${totalStock === 0 ? 'text-red-600' :
                                totalStock !== null && totalStock !== undefined && totalStock < 10 ? 'text-orange-600' :
                                    'text-green-600'
                                }`}>
                                {totalStock === null ? '무제한' : `${totalStock || 0}개`}
                            </span>
                        </div>
                        {product.variants && product.variants.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                                ({product.variants.length}개 옵션)
                            </div>
                        )}
                    </div>

                    {/* 5. Product Images */}
                    {product.images && product.images.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1 text-gray-700">
                                <ImageIcon className="w-3 h-3" />
                                상품 이미지 ({product.images.length}개)
                            </h3>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {product.images.map((image, idx) => (
                                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                        <Image
                                            src={image}
                                            alt={`${product.name} ${idx + 1}`}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                        />
                                        {idx === 0 && (
                                            <div className="absolute top-2 left-2">
                                                <Badge className="bg-pink-600 text-white text-xs">
                                                    대표
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Product Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold mb-2 flex items-center gap-1 text-gray-700">
                                <Package className="w-3 h-3" />
                                상품 옵션 ({product.variants.length}개)
                            </h3>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto">
                                {product.variants.map((variant, idx) => {
                                    let optionsDisplay = '';
                                    try {
                                        if (variant.optionsJson) {
                                            const options = JSON.parse(variant.optionsJson);
                                            optionsDisplay = options.map((opt: Record<string, string>) =>
                                                Object.entries(opt).map(([key, value]) => `${key}: ${value}`).join(', ')
                                            ).join(' / ');
                                        }
                                    } catch (e) {
                                        console.error('Failed to parse options:', e);
                                    }

                                    return (
                                        <div key={idx} className="border rounded p-3 hover:bg-gray-50 transition">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate mb-1">{optionsDisplay || '기본'}</div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                    {variant.finalPrice && variant.finalPrice < (variant.price || product.basePrice) ? (
                                                        <>
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₩{(variant.price || product.basePrice).toLocaleString()}
                                                            </span>
                                                            <span className="font-bold text-base text-purple-600">
                                                                ₩{variant.finalPrice.toLocaleString()}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="font-bold text-base">
                                                            ₩{(variant.price || product.basePrice).toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className={`text-xs font-medium ${variant.quantity === 0 ? 'text-red-600' :
                                                        variant.quantity < 10 ? 'text-orange-600' :
                                                            'text-green-600'
                                                        }`}>
                                                        재고: {variant.quantity}개
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Product Description */}
                    {product.description && (
                        <div>
                            <h3 className="text-xs font-semibold mb-2 text-gray-700">상품 설명</h3>
                            <div
                                className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 max-h-[120px] overflow-y-auto"
                                dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            onClick={handleEdit}
                            className="flex-1 bg-pink-600 hover:bg-pink-700"
                            size="sm"
                        >
                            상품 수정
                        </Button>
                        <Button variant="outline" onClick={onClose} size="sm" className="flex-1">
                            닫기
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

