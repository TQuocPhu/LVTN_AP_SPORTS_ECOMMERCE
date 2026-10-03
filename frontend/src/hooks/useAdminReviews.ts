'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminReviewController } from '@/controllers/admin-review-controller';
import { AdminReviewDetail, AdminReviewFilterRequest } from '@/types/review';

export function useAdminReviews() {
  const [reviews, setReviews] = useState<AdminReviewDetail[]>([]);
  const [filter, setFilter] = useState<AdminReviewFilterRequest>({
    page: 0,
    size: 10,
    status: 'ALL',
  });
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State cho Phản hồi 1-1
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReviewDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchAdminReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminReviewController.getAdminReviews(filter);
      if (res && res.data) {
        setReviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      console.error('Lỗi khi nạp danh sách đánh giá admin:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const setPage = (page: number) => {
    setFilter(prev => ({ ...prev, page }));
  };

  const setStatusFilter = (status: string) => {
    setFilter(prev => ({ ...prev, status, page: 0 }));
  };

  const setRatingFilter = (rating?: number) => {
    setFilter(prev => ({ ...prev, rating, page: 0 }));
  };

  const setKeywordFilter = (keyword: string) => {
    setFilter(prev => ({ ...prev, keyword, page: 0 }));
  };

  const openReplyModal = (review: AdminReviewDetail) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setReplyModalOpen(true);
  };

  const closeReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedReview(null);
    setReplyText('');
  };

  const submitReply = async () => {
    if (!selectedReview) return;
    if (replyText.trim().length < 2) return;

    setIsSubmittingReply(true);
    try {
      const res = await adminReviewController.replyReview(selectedReview.id, replyText.trim());
      if (res && res.data) {
        closeReplyModal();
        fetchAdminReviews();
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi phản hồi:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleStatus = async (reviewId: number) => {
    try {
      const res = await adminReviewController.toggleReviewStatus(reviewId);
      if (res && res.data) {
        fetchAdminReviews();
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái bài đánh giá:', err);
    }
  };

  return {
    reviews,
    filter,
    totalPages,
    totalElements,
    isLoading,
    replyModalOpen,
    selectedReview,
    replyText,
    setReplyText,
    isSubmittingReply,
    setPage,
    setStatusFilter,
    setRatingFilter,
    setKeywordFilter,
    openReplyModal,
    closeReplyModal,
    submitReply,
    toggleStatus,
    refreshAdminReviews: fetchAdminReviews,
  };
}
