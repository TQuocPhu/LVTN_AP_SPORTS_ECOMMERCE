import { useCallback, useState } from 'react';
import { deliveryReviewController } from '@/controllers/delivery-review-controller';
import { DeliveryReview } from '@/types/delivery-review';

export const DELIVERY_REVIEW_QUICK_TAGS = [
  'Giao đúng hẹn',
  'Shipper thân thiện',
  'Hàng nguyên vẹn',
  'Liên hệ trước khi giao',
  'Đóng gói cẩn thận',
];

export const DELIVERY_RATING_LABELS: Record<number, string> = {
  1: 'Rất tệ',
  2: 'Không hài lòng',
  3: 'Bình thường',
  4: 'Hài lòng',
  5: 'Tuyệt vời',
};

interface UseDeliveryReviewModalParams {
  orderCode: string;
  onSuccess: (created: DeliveryReview) => void;
  onClose: () => void;
}

export function useDeliveryReviewModal({
  orderCode,
  onSuccess,
  onClose,
}: UseDeliveryReviewModalParams) {
  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Giao đúng hẹn', 'Hàng nguyên vẹn']);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleClose = useCallback(() => {
    setErrorMsg(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!orderCode) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await deliveryReviewController.createDeliveryReview(orderCode, {
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
      });
      if (res?.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể gửi đánh giá giao hàng, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }, [orderCode, rating, selectedTags, comment, onSuccess, onClose]);

  return {
    rating,
    setRating,
    selectedTags,
    toggleTag,
    comment,
    setComment,
    submitting,
    errorMsg,
    ratingLabel: DELIVERY_RATING_LABELS[rating] || 'Tuyệt vời',
    handleSubmit,
    handleClose,
  };
}
