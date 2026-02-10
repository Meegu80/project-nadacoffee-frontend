import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { reviewApi } from '../api/review.api';
import { twMerge } from 'tailwind-merge';

interface ProductRatingProps {
    prodId: number;
    className?: string;
    iconSize?: number;
    textColor?: string;
}

const ProductRating: React.FC<ProductRatingProps> = ({
    prodId,
    className,
    iconSize = 14,
    textColor = "text-brand-yellow"
}) => {
    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['product-rating', prodId],
        queryFn: () => reviewApi.getProductReviews(prodId, 1, 100),
        staleTime: 1000 * 60 * 5, // 5분 캐시
        enabled: !!prodId
    });

    if (isLoading || !reviewsData || reviewsData.data.length === 0) {
        return null;
    }

    const ratings = reviewsData.data.map(r => r.rating);
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    return (
        <div className={twMerge("flex items-center gap-0.5", className)}>
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={iconSize}
                        className={twMerge(
                            "transition-all duration-200",
                            star <= Math.round(average)
                                ? twMerge("fill-current", textColor)
                                : "text-gray-200"
                        )}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductRating;
