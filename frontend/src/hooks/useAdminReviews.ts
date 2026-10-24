'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { adminReviewController } from '@/controllers/admin-review-controller';
import { AdminReviewDetail, AdminReviewFilterRequest } from '@/types/review';

export const MIN_ADMIN_REPLY_LENGTH = 5;

export function useAdminReviews() {
  const [reviews, setReviews] = useState<AdminReviewDetail[]>([]);
  const [filter, setFilter] = useState<AdminReviewFilterRequest>({
    page: 0,
    size: 10,
    status: 'ALL',
  });

  // Debounce 400ms cho từ khóa tìm kiếm đánh giá
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(filter.keyword || '');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(filter.keyword || '');
    }, 400);
    return () => clearTimeout(timer);
  }, [filter.keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi từ khóa / bộ lọc
  const abortControllerRef = useRef<AbortController | null>(null);

  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modal State cho Phản hồi 1-1
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReviewDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const fetchAdminReviews = useCallback(async () => {
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const queryParams: AdminReviewFilterRequest = {
        ...filter,
        keyword: debouncedKeyword.trim() || undefined,
      };
      const res = await adminReviewController.getAdminReviews(queryParams, {
        signal: controller.signal,
      });
      if (res && res.data) {
        setReviews(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: any) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return; // Bỏ qua lỗi hủy request
      }
      console.error('Lỗi khi nạp danh sách đánh giá admin:', err);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedKeyword, filter.page, filter.size, filter.status, filter.rating]);

  useEffect(() => {
    fetchAdminReviews();
    return () => {
      abortControllerRef.current?.abort();
    };
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
    if (replyText.trim().length < MIN_ADMIN_REPLY_LENGTH) return;

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

  // Lightbox Modal xem ảnh to
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  const openZoomModal = (url: string) => {
    setZoomImageUrl(url);
  };

  const closeZoomModal = () => {
    setZoomImageUrl(null);
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
    zoomImageUrl,
    openZoomModal,
    closeZoomModal,
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
