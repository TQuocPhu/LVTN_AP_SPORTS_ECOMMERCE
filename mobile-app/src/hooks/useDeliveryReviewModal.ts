import { useCallback, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { appAlert } from '../context/AlertContext';
import { deliveryReviewController } from '../controllers/delivery-review-controller';
import { DeliveryReview } from '../types';
import { useKeyboardOffset } from './useKeyboardOffset';

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
  onSuccess: (review: DeliveryReview) => void;
  onClose: () => void;
}

export const useDeliveryReviewModal = ({
  orderCode,
  onSuccess,
  onClose,
}: UseDeliveryReviewModalParams) => {
  const { height: windowHeight } = useWindowDimensions();
  const { scrollRef, keyboardHeight, scrollToEndOnFocus } = useKeyboardOffset();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Giao đúng hẹn',
    'Hàng nguyên vẹn',
  ]);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!orderCode) return;
    try {
      setSubmitting(true);
      const res = await deliveryReviewController.createDeliveryReview(orderCode, {
        rating,
        tags: selectedTags,
        comment: comment.trim() || undefined,
      });
      if (res?.data) {
        onSuccess(res.data);
        onClose();
        appAlert('Thành công', 'Cảm ơn bạn đã đánh giá chất lượng giao hàng!');
      }
    } catch (err: any) {
      appAlert(
        'Lỗi',
        err?.response?.data?.message || 'Không thể gửi đánh giá giao hàng, vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  }, [orderCode, rating, selectedTags, comment, onSuccess, onClose]);

  const modalMaxHeight =
    keyboardHeight > 0
      ? Math.max(280, windowHeight - keyboardHeight - 40)
      : Math.round(windowHeight * 0.85);

  return {
    scrollRef,
    keyboardHeight,
    modalMaxHeight,
    scrollToEndOnFocus,
    rating,
    setRating,
    selectedTags,
    toggleTag,
    comment,
    setComment,
    submitting,
    ratingLabel: DELIVERY_RATING_LABELS[rating] || 'Tuyệt vời',
    handleSubmit,
  };
};
