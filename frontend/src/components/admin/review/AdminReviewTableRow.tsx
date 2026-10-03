'use client';

import React from 'react';
import { Star, Eye, EyeOff, CheckCircle2, CornerDownRight } from 'lucide-react';
import { AdminReviewDetail } from '@/types/review';

interface AdminReviewTableRowProps {
  item: AdminReviewDetail;
  onOpenReplyModal: (review: AdminReviewDetail) => void;
  onToggleStatus: (reviewId: number) => void;
}

export const AdminReviewTableRow: React.FC<AdminReviewTableRowProps> = ({
  item,
  onOpenReplyModal,
  onToggleStatus,
}) => {
  return (
    <tr className="hover:bg-slate-50/60 transition-colors">
      {/* User */}
      <td className="py-4 px-4 align-top">
        <div className="font-bold text-slate-900">{item.userName}</div>
        <div className="text-[11px] text-slate-500">{item.userEmail || 'Khách hàng'}</div>
        <div className="text-[10px] text-slate-400 mt-1">
          {new Date(item.createdAt).toLocaleDateString('vi-VN')}
        </div>
      </td>

      {/* Product */}
      <td className="py-4 px-4 align-top max-w-[200px]">
        <div className="font-semibold text-slate-800 truncate" title={item.productName}>
          {item.productName || `SP #${item.productId}`}
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">
          Mục đơn: #{item.orderItemId}
        </div>
      </td>

      {/* Rating & Comment */}
      <td className="py-4 px-4 align-top max-w-[280px]">
        <div className="flex items-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-3.5 h-3.5 ${
                s <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
              }`}
            />
          ))}
          <span className="font-bold text-amber-600 ml-1">{item.rating}/5</span>
        </div>
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">
          {item.comment}
        </p>

        {/* Existing Admin Reply preview */}
        {item.adminReply && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
            <div className="flex items-center gap-1 font-bold text-blue-800">
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Phản hồi từ {item.repliedByName || 'AP Sports'}:</span>
            </div>
            <p className="mt-0.5 pl-4 text-slate-700">{item.adminReply}</p>
          </div>
        )}
      </td>

      {/* Images */}
      <td className="py-4 px-4 align-top">
        {item.imageUrls && item.imageUrls.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-w-[120px]">
            {item.imageUrls.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Review att"
                className="w-10 h-10 object-cover rounded border border-slate-200"
              />
            ))}
          </div>
        ) : (
          <span className="text-slate-400 italic">Không có ảnh</span>
        )}
      </td>

      {/* Status Badge */}
      <td className="py-4 px-4 align-top">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            item.status === 'approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {item.status === 'approved' ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Hiển thị
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3" />
              Đã ẩn
            </>
          )}
        </span>
      </td>

      {/* Actions */}
      <td className="py-4 px-4 align-top text-right space-x-1">
        <button
          onClick={() => onOpenReplyModal(item)}
          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
        >
          {item.adminReply ? 'Sửa phản hồi' : 'Phản hồi 1-1'}
        </button>

        <button
          onClick={() => onToggleStatus(item.id)}
          className={`px-2 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
            item.status === 'approved'
              ? 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
              : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
          }`}
          title={item.status === 'approved' ? 'Ẩn bài đánh giá này' : 'Phê duyệt hiển thị'}
        >
          {item.status === 'approved' ? <EyeOff className="w-3.5 h-3.5 inline" /> : <Eye className="w-3.5 h-3.5 inline" />}
        </button>
      </td>
    </tr>
  );
};
