'use client';

import React from 'react';
import { MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminReviewDetail, AdminReviewFilterRequest } from '@/types/review';
import { AdminReviewFilterToolbar } from './AdminReviewFilterToolbar';
import { AdminReviewTableRow } from './AdminReviewTableRow';
import { AdminReviewImageModal } from './AdminReviewImageModal';

interface AdminReviewListUIProps {
  reviews: AdminReviewDetail[];
  filter: AdminReviewFilterRequest;
  totalPages: number;
  totalElements: number;
  isLoading: boolean;
  zoomImageUrl?: string | null;
  onZoomImage?: (url: string) => void;
  onCloseZoomModal?: () => void;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: string) => void;
  onRatingFilter: (rating?: number) => void;
  onKeywordFilter: (keyword: string) => void;
  onOpenReplyModal: (review: AdminReviewDetail) => void;
  onToggleStatus: (reviewId: number) => void;
}

export const AdminReviewListUI: React.FC<AdminReviewListUIProps> = ({
  reviews,
  filter,
  totalPages,
  totalElements,
  isLoading,
  zoomImageUrl = null,
  onZoomImage,
  onCloseZoomModal,
  onPageChange,
  onStatusFilter,
  onRatingFilter,
  onKeywordFilter,
  onOpenReplyModal,
  onToggleStatus,
}) => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quản Lý Đánh Giá Sản Phẩm
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kiểm duyệt nhận xét, gửi phản hồi chính thức 1-1 và ẩn các bài viết vi phạm
          </p>
        </div>
      </div>

      {/* 1. Filter Toolbar */}
      <AdminReviewFilterToolbar
        filter={filter}
        totalElements={totalElements}
        currentCount={reviews.length}
        onStatusFilter={onStatusFilter}
        onRatingFilter={onRatingFilter}
        onKeywordFilter={onKeywordFilter}
      />

      {/* 2. Table Container */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-sm animate-pulse">
            Đang tải dữ liệu đánh giá...
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">Không tìm thấy bài đánh giá nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-4">Sản Phẩm</th>
                  <th className="py-3.5 px-4">Đánh Giá & Nhận Xét</th>
                  <th className="py-3.5 px-4">Ảnh Đính Kèm</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {reviews.map((item) => (
                  <AdminReviewTableRow
                    key={item.id}
                    item={item}
                    onOpenReplyModal={onOpenReplyModal}
                    onToggleStatus={onToggleStatus}
                    onZoomImage={onZoomImage}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-slate-500 font-medium">
              Trang {(filter.page || 0) + 1} / {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onPageChange((filter.page || 0) - 1)}
                disabled={(filter.page || 0) === 0}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange((filter.page || 0) + 1)}
                disabled={(filter.page || 0) >= totalPages - 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Lightbox Modal xem ảnh to và mở ảnh gốc Cloudinary */}
      <AdminReviewImageModal
        imageUrl={zoomImageUrl}
        onClose={onCloseZoomModal || (() => {})}
      />
    </div>
  );
};
