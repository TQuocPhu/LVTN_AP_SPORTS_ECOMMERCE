'use client';

import React, { useMemo, useCallback } from 'react';

export interface UseProductRatingStarsProps {
  rating?: number;
  totalReviews?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function useProductRatingStars({
  rating,
  totalReviews,
  size = 'sm',
  interactive = false,
}: UseProductRatingStarsProps) {
  const safeRating = useMemo(() => {
    if (totalReviews === 0) return 0;
    if (rating === undefined || rating === null) {
      return 0;
    }
    const numericRating = Number(rating);
    if (Number.isNaN(numericRating)) return 0;
    return Math.max(0, Math.min(5, numericRating));
  }, [rating, totalReviews]);

  const roundedRating = useMemo(() => {
    return Math.round(safeRating * 10) / 10;
  }, [safeRating]);

  const formattedRating = useMemo(() => {
    return roundedRating.toFixed(1);
  }, [roundedRating]);

  const starSizes = useMemo(
    () => ({
      xs: 'w-3 h-3',
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    }),
    []
  );

  const textSizes = useMemo(
    () => ({
      xs: 'text-[10px]',
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }),
    []
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive) return;
      e.preventDefault();
      const target = document.getElementById('product-reviews-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [interactive]
  );

  return {
    safeRating,
    roundedRating,
    formattedRating,
    starSizeClass: starSizes[size],
    textSizeClass: textSizes[size],
    handleClick,
    isInteractive: interactive,
  };
}
