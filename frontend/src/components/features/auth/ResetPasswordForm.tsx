'use client';

import Link from 'next/link';
import { useResetPassword } from '@/hooks/useResetPassword';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * UI Component Form Đặt Lại Mật Khẩu Mới (ResetPasswordForm).
 * Pure UI Component: Toàn bộ State & Business Logic được quản lý bởi `useResetPassword()` hook.
 */
export default function ResetPasswordForm() {
  const {
    email,
    token,
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    error,
    successMessage,
    submitResetPassword,
  } = useResetPassword();

  const isMissingParams = !email || !token;

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">
          ĐẶT LẠI MẬT KHẨU
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Nhập mật khẩu mới bảo mật cho tài khoản của bạn
        </p>
      </div>

      {/* Cảnh báo nếu thiếu Token/Email trên URL */}
      {isMissingParams && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <p className="font-bold">Liên kết không hợp lệ!</p>
            <p className="text-xs text-amber-300/80 mt-1">
              Vui lòng mở đúng liên kết đặt lại mật khẩu đã được gửi trong hộp thư Email của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Thông báo Lỗi */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Thông báo Thành công */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white">{successMessage}</p>
            <p className="text-xs text-emerald-300/80 mt-0.5">Đang tự động chuyển hướng về trang Đăng nhập...</p>
          </div>
        </div>
      )}

      <form onSubmit={submitResetPassword} className="space-y-5">
        {/* Email Readonly */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5 tracking-wider">
            Tài khoản Email
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              disabled
              readOnly
              className="w-full bg-slate-950/40 border border-slate-800/80 rounded-xl py-3 pl-11 pr-4 text-slate-400 text-sm cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Mật khẩu mới */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Mật khẩu Mới <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Ít nhất 8 ký tự (gồm chữ & số)"
              disabled={isMissingParams}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Xác nhận mật khẩu mới */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Xác nhận Mật khẩu Mới <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              disabled={isMissingParams}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1"
              title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={loading || isMissingParams || !formData.newPassword || !formData.confirmPassword}
          className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>ĐANG XỬ LÝ...</span>
            </>
          ) : (
            <>
              <span>XÁC NHẬN ĐẶT LẠI MẬT KHẨU</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Chuyển hướng */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <Link
          href="/login"
          className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors"
        >
          Quay lại trang Đăng Nhập
        </Link>
      </div>
    </div>
  );
}
