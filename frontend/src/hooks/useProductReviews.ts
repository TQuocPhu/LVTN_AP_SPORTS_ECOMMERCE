'use client';

import { useState, useEffect, useCallback } from 'react';
import { reviewController } from '@/controllers/review-controller';
import { Review, ProductReviewSummary } from '@/types/review';

export function useProductReviews(productId?: number) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ProductReviewSummary | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | undefined>(undefined);
  const [withImagesOnly, setWithImagesOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSummary = useCallback(async () => {
    if (!productId) return;
    try {
      const res = await reviewController.getProductReviewSummary(productId);
      if (res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy thống kê đánh giá:', err);
    }
  }, [productId]);

  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const res = await reviewController.getProductReviews(
        productId,
        selectedRating,
        withImagesOnly,
        page,
        5
      );
      if (res.data) {
        setReviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách đánh giá:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, selectedRating, withImagesOnly, page]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filterByRating = useCallback((rating?: number) => {
    setSelectedRating(rating);
    setWithImagesOnly(false);
    setPage(0);
  }, []);

  const toggleWithImagesOnly = useCallback(() => {
    setWithImagesOnly(prev => !prev);
    setSelectedRating(undefined);
    setPage(0);
  }, []);

  return {
    reviews,
    summary,
    selectedRating,
    withImagesOnly,
    page,
    setPage,
    totalPages,
    totalElements,
    isLoading,
    filterByRating,
    toggleWithImagesOnly,
    refreshReviews: fetchReviews,
  };
}
