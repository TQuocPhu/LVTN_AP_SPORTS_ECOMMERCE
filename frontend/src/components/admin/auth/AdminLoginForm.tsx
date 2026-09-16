'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const res = await login({ email, password });
      if (res?.success || res?.data) {
        router.push('/admin/dashboard');
      } else {
        setErrorMessage(res?.message || 'Đăng nhập không thành công.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-48 h-16 mb-2">
            <Image
              src="/images/ap-sports_logo_no-back.png"
              alt="AP SPORTS Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            HỆ THỐNG QUẢN TRỊ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Đăng nhập tài khoản quản trị viên / nhân viên
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start space-x-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Input Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email quản trị
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Đang đăng nhập...
                </>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">
          © {new Date().getFullYear()} AP SPORTS Enterprise Portal. All rights reserved.
        </div>
      </div>
    </div>
  );
}
