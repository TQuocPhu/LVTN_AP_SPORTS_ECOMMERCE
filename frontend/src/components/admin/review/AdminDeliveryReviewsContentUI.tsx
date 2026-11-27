'use client';

import React from 'react';
import {
  Truck,
  Star,
  Search,
  MessageSquare,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  ThumbsUp,
  X,
  RefreshCw,
} from 'lucide-react';
import { useAdminDeliveryReviews } from '@/hooks/useAdminDeliveryReviews';

/**
 * Giao diện Quản Lý Đánh Giá Giao Hàng (Shipper) dành cho Admin & Staff CSKH.
 * Tuân thủ chuẩn Light Mode Admin UI.
 */
export function AdminDeliveryReviewsContentUI() {
  const {
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
    refresh,
  } = useAdminDeliveryReviews();

  const positiveRate =
    summary.totalReviews > 0
      ? ((summary.positiveReviews * 100) / summary.totalReviews).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              Quản Lý Đánh Giá Giao Hàng (Shipper)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi chất lượng giao vận, thái độ shipper và phản hồi CSKH 1-1 cho khách hàng
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tổng Đánh Giá</span>
            <Truck className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{summary.totalReviews}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Lượt đánh giá sau nhận hàng</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Điểm TB Giao Hàng</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">{summary.averageRating} / 5.0</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Chất lượng phục vụ Shipper</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Tỷ Lệ Hài Lòng (4-5★)</span>
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">{positiveRate}%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {summary.positiveReviews} lượt đánh giá tích cực
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Chờ CSKH Phản Hồi</span>
            <Clock className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-orange-600">{summary.pendingReplyCount}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Đánh giá chưa có phản hồi</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filter.keyword || ''}
            onChange={(e) => setKeywordFilter(e.target.value)}
            placeholder="Mã đơn, mã vận đơn, tên khách, shipper..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <select
          value={filter.rating ?? ''}
          onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Tất cả số sao</option>
          <option value="5">5 Sao (Tuyệt vời)</option>
          <option value="4">4 Sao (Hài lòng)</option>
          <option value="3">3 Sao (Bình thường)</option>
          <option value="2">2 Sao (Không hài lòng)</option>
          <option value="1">1 Sao (Rất tệ)</option>
        </select>

        <select
          value={filter.hasReply === undefined ? '' : String(filter.hasReply)}
          onChange={(e) =>
            setHasReplyFilter(
              e.target.value === '' ? undefined : e.target.value === 'true'
            )
          }
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Tất cả trạng thái phản hồi</option>
          <option value="false">Chưa phản hồi</option>
          <option value="true">Đã phản hồi</option>
        </select>

        <select
          value={filter.status || ''}
          onChange={(e) => setStatusFilter(e.target.value || undefined)}
          className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Tất cả hiển thị</option>
          <option value="approved">Đang hiển thị</option>
          <option value="hidden">Đã ẩn</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
              <tr>
                <th className="py-3 px-4">Đơn Hàng / Shipper</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Đánh Giá</th>
                <th className="py-3 px-4">Phản Hồi CSKH</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Đang tải dữ liệu đánh giá giao hàng...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Chưa có đánh giá giao hàng nào phù hợp bộ lọc.
                  </td>
                </tr>
              ) : (
                reviews.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-black text-slate-900">#{item.orderCode}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Shipper: <span className="font-semibold text-slate-700">{item.shipperName}</span>
                      </div>
                      {item.trackingCode && (
                        <div className="text-[10px] font-mono text-sky-600 mt-0.5">
                          {item.trackingCode}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">{item.customerName}</div>
                      {item.customerEmail && (
                        <div className="text-[11px] text-slate-500">{item.customerEmail}</div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="flex items-center gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= item.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1.5">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {item.comment && (
                        <p className="text-slate-700 text-xs leading-relaxed line-clamp-3">
                          “{item.comment}”
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      {item.adminReply ? (
                        <div className="rounded-xl bg-emerald-50/70 border border-emerald-200 p-2.5">
                          <div className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{item.repliedByName || 'CSKH'}</span>
                          </div>
                          <p className="text-[11px] text-slate-700 line-clamp-3">
                            {item.adminReply}
                          </p>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Chờ phản hồi
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          item.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.status === 'approved' ? 'Hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap space-x-2">
                      <button
                        type="button"
                        onClick={() => openReplyModal(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{item.adminReply ? 'Sửa' : 'Phản hồi'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(item.id)}
                        title={item.status === 'approved' ? 'Ẩn đánh giá' : 'Hiện đánh giá'}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-[11px] cursor-pointer"
                      >
                        {item.status === 'approved' ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
            <span>
              Tổng {totalElements} đánh giá • Trang {(filter.page ?? 0) + 1}/{totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(filter.page ?? 0) <= 0}
                onClick={() => setPage((filter.page ?? 0) - 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={(filter.page ?? 0) + 1 >= totalPages}
                onClick={() => setPage((filter.page ?? 0) + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 bg-white disabled:opacity-40 cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Phản Hồi Đánh Giá Giao Hàng #{selectedReview.orderCode}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Khách hàng: {selectedReview.customerName} • Shipper: {selectedReview.shipperName}
                </p>
              </div>
              <button
                type="button"
                onClick={closeReplyModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-amber-600">{selectedReview.rating} ★</div>
                {selectedReview.comment && <p>“{selectedReview.comment}”</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nội dung phản hồi CSKH (tối thiểu 5 ký tự):
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ví dụ: Cảm ơn bạn đã tin tưởng AP Sports! Chúng tôi sẽ ghi nhận góp ý để nâng cao chất lượng giao vận..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={closeReplyModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitReply}
                disabled={isSubmittingReply || replyText.trim().length < 5}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReply ? 'Đang Gửi...' : 'Gửi Phản Hồi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
