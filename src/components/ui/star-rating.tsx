"use client";

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    maxRating?: number;
    size?: 'small' | 'medium' | 'large';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showValue?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    size = 'medium',
    interactive = false,
    onRatingChange,
    showValue = false
}) => {
    const handleStarClick = (starRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const sizeClasses = {
        small: 'w-3 h-3',
        medium: 'w-4 h-4',
        large: 'w-5 h-5'
    };

    const containerClasses = `flex items-center gap-1 ${interactive ? 'cursor-pointer' : ''}`;

    return (
        <div className={containerClasses}>
            <div className="flex">
                {[...Array(maxRating)].map((_, index) => {
                    const starRating = index + 1;
                    const isFilled = starRating <= rating;
                    const isHalfFilled = starRating === Math.ceil(rating) && rating % 1 !== 0;

                    return (
                        <button
                            key={index}
                            type="button"
                            className={`${sizeClasses[size]} transition-colors ${interactive ? 'hover:scale-110' : ''
                                }`}
                            onClick={() => handleStarClick(starRating)}
                            disabled={!interactive}
                        >
                            <Star
                                className={`${isFilled
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : isHalfFilled
                                            ? 'fill-yellow-200 text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && (
                <span className="text-sm text-gray-600 ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};
