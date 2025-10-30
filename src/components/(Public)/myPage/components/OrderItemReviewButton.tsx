"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreateReviewModal } from '@/components/(Public)/product/CreateReviewModal';
import { Star, MessageSquare, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderItemReviewButtonProps {
    orderItem: {
        id: string;
        productId: string;
        productName: string;
        productImage?: string;
        quantity: number;
        price: number;
        options?: string;
        review?: {
            id: string;
            rating: number;
            title?: string;
            content?: string;
            images: string[];
            createdAt: string;
            user: {
                id: string;
                name: string;
                email: string;
            };
        } | null; // Review information from Order API
    };
    orderStatus: string;
    orderDate: string;
    orderId: string; // Add orderId for review creation
    brandSlug?: string; // Add brandSlug for proper URL navigation
    productSlug?: string; // Add productSlug for proper URL navigation
}

export const OrderItemReviewButton: React.FC<OrderItemReviewButtonProps> = ({
    orderItem,
    orderStatus,
    orderDate,
    orderId,
    brandSlug,
    productSlug
}) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const router = useRouter();

    // Check if user can write review
    const canWriteReview = () => {
        // Only allow review for completed orders
        if (orderStatus !== 'completed' && orderStatus !== 'delivered') {
            return false;
        }

        // Check if order is not too old (e.g., within 30 days)
        const orderDateTime = new Date(orderDate);
        const now = new Date();
        const daysDiff = (now.getTime() - orderDateTime.getTime()) / (1000 * 60 * 60 * 24);

        return daysDiff <= 30; // Allow review within 30 days
    };

    // Check if review already exists for this product (from Order API)
    const hasExistingReview = () => {
        return orderItem.review !== null && orderItem.review !== undefined;
    };

    // Navigate to product page to view review
    const handleViewReview = () => {
        console.log('🔍 OrderItemReviewButton - handleViewReview:', {
            brandSlug,
            productSlug,
            productId: orderItem.productId
        });

        if (brandSlug && productSlug) {
            // Use brand/product slug format: /brands/{brandSlug}/products/{productSlug}
            router.push(`/brands/${brandSlug}/products/${productSlug}`);
        } else if (brandSlug && orderItem.productId) {
            // Fallback: Use brand slug with product ID
            router.push(`/brands/${brandSlug}/products/${orderItem.productId}`);
        } else {
            // Final fallback: Use product ID only
            router.push(`/products/${orderItem.productId}`);
        }
    };

    const getReviewButtonText = () => {
        if (hasExistingReview()) {
            return '리뷰 보기';
        }
        if (orderStatus === 'completed' || orderStatus === 'delivered') {
            return '리뷰 작성';
        }
        return '배송 완료 후 리뷰 작성 가능';
    };

    const getReviewButtonVariant = () => {
        if (hasExistingReview()) {
            return 'outline' as const;
        }
        if (canWriteReview()) {
            return 'default' as const;
        }
        return 'outline' as const;
    };

    const getReviewButtonIcon = () => {
        if (hasExistingReview()) {
            return <Eye className="w-3 h-3 mr-1" />;
        }
        if (canWriteReview()) {
            return <Star className="w-3 h-3 mr-1" />;
        }
        return <MessageSquare className="w-3 h-3 mr-1" />;
    };

    const getBadgeText = () => {
        if (hasExistingReview()) {
            return '리뷰 작성 완료';
        }
        if (orderStatus === 'completed' || orderStatus === 'delivered') {
            return '리뷰 작성 가능';
        }
        return '배송 대기 중';
    };

    const getBadgeVariant = () => {
        if (hasExistingReview()) {
            return 'default' as const;
        }
        return 'secondary' as const;
    };

    // If review already exists, show "View Review" button
    if (hasExistingReview()) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant={getReviewButtonVariant()}
                    size="sm"
                    onClick={handleViewReview}
                    className="text-xs"
                >
                    {getReviewButtonIcon()}
                    {getReviewButtonText()}
                </Button>
                <Badge variant={getBadgeVariant()} className="text-xs">
                    {getBadgeText()}
                </Badge>
            </div>
        );
    }

    // If cannot write review (not completed or too old)
    if (!canWriteReview()) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant={getReviewButtonVariant()}
                    size="sm"
                    disabled
                    className="text-xs"
                >
                    {getReviewButtonIcon()}
                    {getReviewButtonText()}
                </Button>
                <Badge variant={getBadgeVariant()} className="text-xs">
                    {getBadgeText()}
                </Badge>
            </div>
        );
    }

    // Can write review - show "Write Review" button
    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant={getReviewButtonVariant()}
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="text-xs"
                >
                    {getReviewButtonIcon()}
                    {getReviewButtonText()}
                </Button>
                <Badge variant={getBadgeVariant()} className="text-xs">
                    {getBadgeText()}
                </Badge>
            </div>

            <CreateReviewModal
                productId={orderItem.productId}
                productName={orderItem.productName}
                orderId={orderId}
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onReviewCreated={() => {
                    setShowCreateModal(false);
                    // Optionally refresh order data or show success message
                }}
            />
        </>
    );
};
