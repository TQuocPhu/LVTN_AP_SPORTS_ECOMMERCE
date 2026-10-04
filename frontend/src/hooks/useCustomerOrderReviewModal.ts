'use client';

import { useState, useCallback } from 'react';
import { reviewController } from '@/controllers/review-controller';

export const MIN_REVIEW_COMMENT_LENGTH = 10;

export interface OrderItemToReview {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  variantSize?: string;
  variantColor?: string;
  price: number;
  quantity: number;
}

export function useCustomerOrderReviewModal(onReviewSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItemToReview | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photoFiles, setPhotoFiles] = useState<string[]>([]); // Base64 data strings
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openReviewModal = useCallback((item: OrderItemToReview) => {
    setSelectedOrderItem(item);
    setRating(5);
    setComment('');
    setPhotoFiles([]);
    setIsOpen(true);
  }, []);

  const closeReviewModal = useCallback(() => {
    setIsOpen(false);
    setSelectedOrderItem(null);
  }, []);

  const handleAddPhoto = useCallback((file: File) => {
    if (photoFiles.length >= 5) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        setPhotoFiles(prev => [...prev, base64]);
      }
    };
    reader.readAsDataURL(file);
  }, [photoFiles.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const submitReview = useCallback(async () => {
    if (!selectedOrderItem) return;
    if (comment.trim().length < MIN_REVIEW_COMMENT_LENGTH) return;

    setIsSubmitting(true);
    try {
      const res = await reviewController.createReview({
        productId: selectedOrderItem.productId,
        orderItemId: selectedOrderItem.id,
        rating,
        comment: comment.trim(),
        imageUrls: photoFiles,
      });

      if (res && (res.status === 200 || res.status === 201)) {
        closeReviewModal();
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi đánh giá:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrderItem, rating, comment, photoFiles, closeReviewModal, onReviewSuccess]);

  return {
    isOpen,
    selectedOrderItem,
    rating,
    setRating,
    comment,
    setComment,
    photoFiles,
    handleAddPhoto,
    handleRemovePhoto,
    isSubmitting,
    openReviewModal,
    closeReviewModal,
    submitReview,
  };
}
