import { useCallback, useEffect, useState } from 'react';
import { deliveryReviewController } from '@/controllers/delivery-review-controller';
import {
  AdminDeliveryReviewFilter,
  AdminDeliveryReviewItem,
  AdminDeliveryReviewSummary,
} from '@/types/delivery-review';

/**
 * Custom Hook quản lý Đánh giá Giao hàng (Shipper) cho Admin & Staff CSKH.
 */
export function useAdminDeliveryReviews() {
  const [reviews, setReviews] = useState<AdminDeliveryReviewItem[]>([]);
  const [summary, setSummary] = useState<AdminDeliveryReviewSummary>({
    totalReviews: 0,
    averageRating: 0,
    positiveReviews: 0,
    pendingReplyCount: 0,
  });
  const [filter, setFilter] = useState<AdminDeliveryReviewFilter>({
    keyword: '',
    page: 0,
    size: 10,
  });
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [replyModalOpen, setReplyModalOpen] = useState<boolean>(false);
  const [selectedReview, setSelectedReview] = useState<AdminDeliveryReviewItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

  const fetchAll = useCallback(async (activeFilter: AdminDeliveryReviewFilter) => {
    setIsLoading(true);
    try {
      const [listRes, sumRes] = await Promise.all([
        deliveryReviewController.getAdminDeliveryReviews(activeFilter),
        deliveryReviewController.getAdminSummary(),
      ]);
      if (listRes?.data) {
        setReviews(listRes.data.content || []);
        setTotalPages(listRes.data.totalPages || 0);
        setTotalElements(listRes.data.totalElements || 0);
      }
      if (sumRes?.data) {
        setSummary(sumRes.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách đánh giá giao hàng:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(filter);
  }, [filter, fetchAll]);

  const setKeywordFilter = useCallback((keyword: string) => {
    setFilter((prev) => ({ ...prev, keyword, page: 0 }));
  }, []);

  const setRatingFilter = useCallback((rating?: number) => {
    setFilter((prev) => ({ ...prev, rating, page: 0 }));
  }, []);

  const setStatusFilter = useCallback((status?: string) => {
    setFilter((prev) => ({ ...prev, status, page: 0 }));
  }, []);

  const setHasReplyFilter = useCallback((hasReply?: boolean) => {
    setFilter((prev) => ({ ...prev, hasReply, page: 0 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  }, []);

  const openReplyModal = useCallback((item: AdminDeliveryReviewItem) => {
    setSelectedReview(item);
    setReplyText(item.adminReply || '');
    setReplyModalOpen(true);
  }, []);

  const closeReplyModal = useCallback(() => {
    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText('');
  }, []);

  const submitReply = useCallback(async () => {
    if (!selectedReview || replyText.trim().length < 5) return;
    setIsSubmittingReply(true);
    try {
      await deliveryReviewController.replyDeliveryReview(selectedReview.id, replyText.trim());
      closeReplyModal();
      await fetchAll(filter);
    } catch (err) {
      console.error('Lỗi gửi phản hồi đánh giá giao hàng:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  }, [selectedReview, replyText, closeReplyModal, fetchAll, filter]);

  const toggleStatus = useCallback(
    async (id: number) => {
      try {
        await deliveryReviewController.toggleDeliveryReviewStatus(id);
        await fetchAll(filter);
      } catch (err) {
        console.error('Lỗi thay đổi trạng thái đánh giá giao hàng:', err);
      }
    },
    [fetchAll, filter]
  );

  return {
    reviews,
    summary,
    filter,
    totalPages,
    totalElements,
    isLoading,
    replyModalOpen,
    selectedReview,
    replyText,
    setReplyText,
    isSubmittingReply,
    setKeywordFilter,
    setRatingFilter,
    setStatusFilter,
    setHasReplyFilter,
    setPage,
    openReplyModal,
    closeReplyModal,
    submitReply,
    toggleStatus,
    refresh: () => fetchAll(filter),
  };
}
