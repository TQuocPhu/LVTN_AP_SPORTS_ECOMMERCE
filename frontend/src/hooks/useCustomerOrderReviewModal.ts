'use client';

import { useState, useCallback, useMemo } from 'react';
import { reviewController } from '@/controllers/review-controller';
import { formatVariantSummary } from '@/utils/formatters';
import { toast } from 'sonner';

export const MIN_REVIEW_COMMENT_LENGTH = 10;

export interface OrderItemToReview {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  variantSize?: string;
  variantColor?: string;
  attributes?: string;
  variantSummary?: string;
  price: number;
  quantity: number;
}

/**
 * Nén và giảm kích thước ảnh ngay trên Client bằng HTML5 Canvas.
 * Giảm dung lượng từ 5-10MB xuống còn ~100-250KB với độ phân giải tối ưu 1200px.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve) => {
    // Nếu không phải image mime type thì đọc base64 trực tiếp
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => resolve('');
    reader.onload = (e) => {
      const rawBase64 = e.target?.result as string;
      if (!rawBase64) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawBase64); // Fallback base64 gốc nếu load ảnh thất bại
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawBase64);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Nén sang JPEG với chất lượng 0.82
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  });
}

export function useCustomerOrderReviewModal(onReviewSuccess?: () => void) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItemToReview | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [photoFiles, setPhotoFiles] = useState<string[]>([]); // Base64 data strings
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

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

  const handleAddPhoto = useCallback(async (file: File) => {
    if (photoFiles.length >= 5) {
      toast.warning('Tối đa 5 hình ảnh cho mỗi đánh giá');
      return;
    }
    try {
      setIsCompressingPhoto(true);
      const compressed = await compressImageFile(file);
      if (compressed) {
        setPhotoFiles(prev => [...prev, compressed]);
      }
    } catch (err) {
      console.error('Lỗi khi nén ảnh:', err);
      toast.error('Không thể xử lý ảnh, vui lòng thử ảnh khác');
    } finally {
      setIsCompressingPhoto(false);
    }
  }, [photoFiles.length]);

  const handleRemovePhoto = useCallback((index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleAddPhoto(e.target.files[0]);
        e.target.value = '';
      }
    },
    [handleAddPhoto]
  );

  const variantDisplay = useMemo(() => {
    if (!selectedOrderItem) return '';
    return formatVariantSummary(
      selectedOrderItem.variantSummary,
      selectedOrderItem.attributes,
      selectedOrderItem.variantColor,
      selectedOrderItem.variantSize
    );
  }, [selectedOrderItem]);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      isCompressingPhoto ||
      comment.trim().length < MIN_REVIEW_COMMENT_LENGTH
    );
  }, [isSubmitting, isCompressingPhoto, comment]);

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
        toast.success('Gửi đánh giá sản phẩm thành công!');
        closeReviewModal();
        if (onReviewSuccess) {
          onReviewSuccess();
        }
      } else {
        toast.error(res?.message || 'Không thể gửi đánh giá, vui lòng thử lại');
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi đánh giá:', err);
      toast.error(err?.response?.data?.message || err?.message || 'Không thể gửi đánh giá, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedOrderItem, rating, comment, photoFiles, closeReviewModal, onReviewSuccess]);

  return {
    isOpen,
    selectedOrderItem,
    variantDisplay,
    rating,
    setRating,
    comment,
    setComment,
    photoFiles,
    handleAddPhoto,
    handleRemovePhoto,
    handleFileInputChange,
    isSubmitting,
    isCompressingPhoto,
    isSubmitDisabled,
    openReviewModal,
    closeReviewModal,
    submitReview,
  };
}
