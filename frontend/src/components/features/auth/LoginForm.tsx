'use client';

import React from 'react';
import Link from 'next/link';
import { useLoginForm } from '@/hooks/useLoginForm';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, Info } from 'lucide-react';

/**
 * UI Component Form Đăng Nhập Khách Hàng (LoginForm).
 * Pure UI Component: Toàn bộ State & Business Logic được quản lý bởi `useLoginForm()` hook.
 * Không dùng useState/useEffect trong Component.
 */
export default function LoginForm() {
  const {
    formData,
    showPassword,
    isSubmitting,
    formError,
    successMessage,
    noticeMessage,
    hasInput,
    handleChange,
    toggleShowPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">
          ĐĂNG NHẬP TÀI KHOẢN
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Chào mừng bạn quay trở lại với AP Sports
        </p>
      </div>

      {/* Thông báo từ các luồng chuyển hướng (như vừa đổi mật khẩu thành công) */}
      {noticeMessage && !successMessage && !formError && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Thông báo Lỗi */}
      {formError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>{formError}</span>
        </div>
      )}

      {/* Thông báo Thành công */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage} Đang chuyển hướng...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Input Email */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 tracking-wider">
            Địa chỉ Email <span className="text-orange-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {/* Input Mật khẩu */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase text-slate-300 tracking-wider">
              Mật khẩu <span className="text-orange-500">*</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-orange-400 transition-colors p-1"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Nút Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !hasInput}
          className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>ĐANG XỬ LÝ...</span>
            </>
          ) : (
            <>
              <span>ĐĂNG NHẬP</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Footer Chuyển hướng */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
