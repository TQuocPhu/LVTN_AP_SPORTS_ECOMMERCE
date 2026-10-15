'use client';

import React from 'react';
import Link from 'next/link';
import {
  User,
  Calendar,
  Package,
  Star,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { SupportConversation } from '@/types/support-chat';

interface Props {
  conversation: SupportConversation | null;
}

export default function SupportCustomerDetailUI({ conversation }: Props) {
  if (!conversation) {
    return (
      <aside className="w-72 border-l border-slate-200 bg-white p-6 flex flex-col items-center justify-center text-slate-400 text-xs text-center shrink-0 select-none">
        <User className="w-8 h-8 text-slate-300 mb-2" />
        <p>Chọn cuộc trò chuyện để xem chi tiết khách hàng</p>
      </aside>
    );
  }

  return (
    <aside className="w-72 border-l border-slate-200 bg-white p-4 flex flex-col h-full overflow-y-auto space-y-4 shrink-0 select-none">
      {/* Customer Avatar & Name */}
      <div className="text-center pb-4 border-b border-slate-200">
        <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 font-bold text-xl flex items-center justify-center mx-auto mb-2.5 border-2 border-orange-200 shadow-2xs overflow-hidden">
          {conversation.customerAvatar ? (
            <img
              src={conversation.customerAvatar}
              alt={conversation.customerName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{conversation.customerName ? conversation.customerName.charAt(0).toUpperCase() : 'K'}</span>
          )}
        </div>
        <h4 className="font-bold text-sm text-slate-800">{conversation.customerName}</h4>
        <p className="text-xs text-slate-500 break-all">{conversation.customerEmail}</p>
        {conversation.customerPhone && (
          <p className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1 font-mono">
            <Phone className="w-3 h-3 text-orange-600" />
            <span>{conversation.customerPhone}</span>
          </p>
        )}
        <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 border border-slate-200">
          ID Khách Hàng: #{conversation.customerId}
        </span>
      </div>

      {/* Thông tin ca hỗ trợ */}
      <div className="space-y-2 text-xs">
        <h5 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
          Thông Tin Phiên Tư Vấn
        </h5>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Khởi tạo:
            </span>
            <span className="text-slate-700 font-medium">
              {new Date(conversation.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          {conversation.acceptedAt && (
            <div className="flex items-center justify-between text-slate-500">
              <span>Tiếp nhận:</span>
              <span className="text-slate-700 font-medium">
                {new Date(conversation.acceptedAt).toLocaleTimeString('vi-VN')}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-slate-500">
            <span>Trạng thái:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full text-[10px] border ${
                conversation.status === 'IN_PROGRESS'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : conversation.status === 'WAITING'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : conversation.status === 'RESOLVED'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {conversation.status === 'IN_PROGRESS'
                ? 'Đang hỗ trợ'
                : conversation.status === 'WAITING'
                ? 'Chờ tiếp nhận'
                : conversation.status === 'RESOLVED'
                ? 'Đã hoàn tất'
                : conversation.status === 'CLOSED'
                ? 'Đã đóng ca'
                : conversation.status}
            </span>
          </div>
        </div>
      </div>

      {/* Đơn hàng gắn kèm (nếu có) */}
      {conversation.orderId ? (
        <div className="space-y-2 text-xs">
          <h5 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
            Đơn Hàng Đang Hỏi
          </h5>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="font-bold text-slate-800 font-mono">
                #{conversation.orderCode || conversation.orderId}
              </span>
            </div>
            <Link
              href={`/admin/orders?code=${conversation.orderCode || conversation.orderId}`}
              className="inline-flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold hover:underline pt-1"
            >
              <span>Xem chi tiết đơn</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-400">
          Khách không gắn kèm đơn hàng cụ thể.
        </div>
      )}

      {/* Đánh giá dịch vụ từ khách (nếu có) */}
      {conversation.rating !== null && conversation.rating !== undefined && (
        <div className="space-y-1.5 text-xs">
          <h5 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">
            Đánh Giá Dịch Vụ
          </h5>
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    s <= (conversation.rating || 0)
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
              <span className="font-bold text-amber-800 ml-1.5">
                {conversation.rating}/5
              </span>
            </div>
            {conversation.feedbackNote && (
              <p className="text-[11px] text-slate-600 italic pt-1">
                &ldquo;{conversation.feedbackNote}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
