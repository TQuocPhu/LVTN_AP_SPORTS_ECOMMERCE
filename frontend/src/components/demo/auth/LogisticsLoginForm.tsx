'use client';

import React from 'react';
import Image from 'next/image';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useLogisticsLogin } from '@/hooks/useLogisticsLogin';

export default function LogisticsLoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    errorMessage,
    handleSubmit
  } = useLogisticsLogin();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative w-48 h-16 mb-2">
            <Image
              src="/images/ap-sports_logo_no-back.png"
              alt="AP SPORTS Logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
            />
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            GHN LOGISTICS PORTAL
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Đăng nhập hệ thống Bưu cục / Shipper (Mô phỏng)
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
              <label htmlFor="logistics-email" className="block text-sm font-medium text-gray-700 mb-1">
                Tài khoản (Email)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="logistics-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="station1@ghn.vn"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="logistics-password" className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="logistics-password"
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
              id="logistics-login-submit-btn"
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
        
        {/* Helper info */}
        <div className="mt-6 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-500 mb-2 font-semibold">Tài khoản mẫu:</p>
          <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
            <li>Quản lý Bưu cục: <code className="bg-gray-100 px-1 py-0.5 rounded">station1@ghn.vn</code> - Role: GHN_STATION</li>
            <li>Tài xế/Shipper: <code className="bg-gray-100 px-1 py-0.5 rounded">shipper@ghn.vn</code> - Role: GHN_SHIPPER</li>
            <li>Pass chung: <code className="bg-gray-100 px-1 py-0.5 rounded">Station@123</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">Shipper@123</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
