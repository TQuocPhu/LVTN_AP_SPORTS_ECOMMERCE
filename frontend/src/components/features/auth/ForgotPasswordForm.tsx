'use client';

import Link from 'next/link';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft, KeyRound } from 'lucide-react';

/**
 * UI Component Form Quên Mật Khẩu (ForgotPasswordForm).
 * Pure UI Component: Toàn bộ State & Business Logic được quản lý bởi `useForgotPassword()` hook.
 */
export default function ForgotPasswordForm() {
  const {
    email,
    setEmail,
    loading,
    error,
    successMessage,
    submitForgotPassword,
  } = useForgotPassword();

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-4">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">
          QUÊN MẬT KHẨU?
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu
        </p>
      </div>

      {/* Thông báo Lỗi */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Thông báo Thành công */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white mb-1">Đã gửi yêu cầu!</p>
            <p className="text-emerald-300/90 text-xs leading-relaxed">{successMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={submitForgotPassword} className="space-y-5">
        {/* Input Email */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Địa chỉ Email Tài khoản <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>ĐANG GỬI YÊU CẦU...</span>
            </>
          ) : (
            <>
              <span>GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Chuyển hướng */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <Link
          href="/login"
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-orange-400 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang Đăng Nhập</span>
        </Link>
      </div>
    </div>
  );
}
