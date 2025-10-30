"use client";

import React, { useState } from 'react';
import { CreateReviewDto } from '@/types/review';
import { useCreateReview } from '@/hooks/useReviews';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Star, X } from 'lucide-react';

interface CreateReviewModalProps {
    productId: string;
    productName: string;
    orderId: string; // Required orderId for order-specific reviews
    children?: React.ReactNode;
    onReviewCreated?: () => void;
    isOpen?: boolean;
    onClose?: () => void;
}

export const CreateReviewModal: React.FC<CreateReviewModalProps> = ({
    productId,
    productName,
    orderId,
    children,
    onReviewCreated,
    isOpen: controlledIsOpen,
    onClose: controlledOnClose
}) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<string[]>([]);

    // Use controlled or internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = controlledOnClose ? controlledOnClose : setInternalIsOpen;

    const createReviewMutation = useCreateReview();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('평점을 선택해주세요.');
            return;
        }

        const reviewData: CreateReviewDto = {
            productId,
            orderId,
            rating,
            title: title.trim() || undefined,
            content: content.trim() || undefined,
            images: images.length > 0 ? images : undefined
        };

        try {
            await createReviewMutation.mutateAsync(reviewData);

            // Reset form
            setRating(0);
            setTitle('');
            setContent('');
            setImages([]);
            setIsOpen(false);

            onReviewCreated?.();
        } catch {
            // Error handling is done in the mutation
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        // TODO: Implement image upload logic
        // For now, just add placeholder URLs
        const newImages = files.map((_, index) => `/placeholder-review-image-${index + 1}.jpg`);
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            {controlledIsOpen === undefined && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        {children || (
                            <Button className="w-full sm:w-auto">
                                <Star className="w-4 h-4 mr-2" />
                                리뷰 작성하기
                            </Button>
                        )}
                    </DialogTrigger>

                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>리뷰 작성</DialogTitle>
                            <p className="text-sm text-gray-600">{productName}</p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">
                                    평점 <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <StarRating
                                        rating={rating}
                                        interactive={true}
                                        onRatingChange={setRating}
                                        size="large"
                                    />
                                    <span className="text-sm text-gray-600">
                                        {rating > 0 && `${rating}점`}
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">제목 (선택사항)</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="리뷰 제목을 입력하세요"
                                    maxLength={255}
                                />
                                <p className="text-xs text-gray-500">
                                    {title.length}/255
                                </p>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">리뷰 내용 (선택사항)</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="제품에 대한 솔직한 리뷰를 작성해주세요"
                                    rows={4}
                                    maxLength={2000}
                                />
                                <p className="text-xs text-gray-500">
                                    {content.length}/2000
                                </p>
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label htmlFor="images">사진 (선택사항)</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-gray-500">
                                    최대 5장까지 업로드 가능합니다
                                </p>

                                {/* Image Preview */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={image}
                                                        alt={`리뷰 이미지 ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={createReviewMutation.isPending}
                                    className="flex-1"
                                >
                                    취소
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createReviewMutation.isPending || rating === 0}
                                    className="flex-1"
                                >
                                    {createReviewMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            작성 중...
                                        </>
                                    ) : (
                                        '리뷰 작성'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}

            {/* Controlled modal - only render DialogContent, no DialogTrigger */}
            {controlledIsOpen !== undefined && controlledIsOpen && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>리뷰 작성</DialogTitle>
                            <p className="text-sm text-gray-600">{productName}</p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Rating */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium">
                                    평점 <span className="text-red-500">*</span>
                                </Label>
                                <div className="flex items-center gap-2">
                                    <StarRating
                                        rating={rating}
                                        interactive={true}
                                        onRatingChange={setRating}
                                        size="large"
                                    />
                                    <span className="text-sm text-gray-600">
                                        {rating > 0 && `${rating}점`}
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">제목 (선택사항)</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="리뷰 제목을 입력하세요"
                                    maxLength={255}
                                />
                                <p className="text-xs text-gray-500">
                                    {title.length}/255
                                </p>
                            </div>

                            {/* Content */}
                            <div className="space-y-2">
                                <Label htmlFor="content">리뷰 내용 (선택사항)</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="제품에 대한 솔직한 리뷰를 작성해주세요"
                                    rows={4}
                                    maxLength={2000}
                                />
                                <p className="text-xs text-gray-500">
                                    {content.length}/2000
                                </p>
                            </div>

                            {/* Images */}
                            <div className="space-y-2">
                                <Label htmlFor="images">사진 (선택사항)</Label>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="cursor-pointer"
                                />
                                <p className="text-xs text-gray-500">
                                    최대 5장까지 업로드 가능합니다
                                </p>

                                {/* Image Preview */}
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                                    <img
                                                        src={image}
                                                        alt={`리뷰 이미지 ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    disabled={createReviewMutation.isPending}
                                    className="flex-1"
                                >
                                    취소
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createReviewMutation.isPending || rating === 0}
                                    className="flex-1"
                                >
                                    {createReviewMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            작성 중...
                                        </>
                                    ) : (
                                        '리뷰 작성'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
};
