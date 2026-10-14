'use client';

import React from 'react';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { AdminReviewListUI } from '@/components/admin/review/AdminReviewListUI';
import { AdminReviewReplyModalUI } from '@/components/admin/review/AdminReviewReplyModalUI';

export default function AdminReviewsPage() {
  const {
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
  } = useAdminReviews();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminReviewListUI
        reviews={reviews}
        filter={filter}
        totalPages={totalPages}
        totalElements={totalElements}
        isLoading={isLoading}
        zoomImageUrl={zoomImageUrl}
        onZoomImage={openZoomModal}
        onCloseZoomModal={closeZoomModal}
        onPageChange={setPage}
        onStatusFilter={setStatusFilter}
        onRatingFilter={setRatingFilter}
        onKeywordFilter={setKeywordFilter}
        onOpenReplyModal={openReplyModal}
        onToggleStatus={toggleStatus}
      />

      <AdminReviewReplyModalUI
        isOpen={replyModalOpen}
        review={selectedReview}
        replyText={replyText}
        setReplyText={setReplyText}
        isSubmitting={isSubmittingReply}
        onClose={closeReplyModal}
        onSubmit={submitReply}
      />
    </div>
  );
}
