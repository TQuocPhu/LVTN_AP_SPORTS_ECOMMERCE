'use client';

import React from 'react';
import { Bell, X, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Trash2 } from 'lucide-react';

interface RestockNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  variantInfo: string;
  isSubscribed: boolean;
  email: string;
  onEmailChange: (email: string) => void;
  onRegister: () => Promise<void>;
  onCancel: () => Promise<void>;
  loading: boolean;
}

/**
 * Modal đăng ký nhận thông báo khi sản phẩm / biến thể về kho.
 * Tuân thủ quy chuẩn thiết kế Dark/Light mode cao cấp của AP Sports.
 */
export function RestockNotificationModal({
  isOpen,
  onClose,
  productName,
  variantInfo,
  isSubscribed,
  email,
  onEmailChange,
  onRegister,
  onCancel,
  loading,
}: RestockNotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all z-10">
        {/* Header Gradient */}
        <div className="relative bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bell className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-200 block">
                AP Sports Restock Alert
              </span>
              <h2 className="text-xl font-black text-white leading-tight">
                Nhận Thông Báo Khi Có Hàng
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Box tóm tắt sản phẩm đang chọn */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sản phẩm quan tâm:</div>
            <div className="text-sm font-black text-slate-900 dark:text-white leading-snug">
              {productName}
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs border border-orange-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phân loại: {variantInfo || 'Tiêu chuẩn'}</span>
            </div>
          </div>

          {/* Trạng thái hiện tại: Đã đăng ký hay Chưa đăng ký */}
          {isSubscribed ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Bạn đã đăng ký theo dõi biến thể này</span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Hệ thống sẽ gửi email tới <strong>{email}</strong> và đẩy thông báo chuông ngay khi kho AP Sports nhập thêm hàng.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Để không bỏ lỡ đợt hàng mới nhất, hãy xác nhận địa chỉ email của bạn. Chúng tôi cam kết chỉ gửi thông báo khi sản phẩm thực sự sẵn sàng xuất kho.
              </p>

              {/* Ô nhập Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-500" />
                  <span>Email nhận thông báo:</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="nhap-email-cua-ban@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {isSubscribed ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/80 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Hủy Theo Dõi</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  Đóng
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Để sau
                </button>
                <button
                  type="button"
                  onClick={onRegister}
                  disabled={loading || !email.trim()}
                  className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4 fill-current" />
                  )}
                  <span>Xác Nhận Nhận Tin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
