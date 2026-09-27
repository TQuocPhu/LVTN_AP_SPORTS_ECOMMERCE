'use client';

import React from 'react';
import Link from 'next/link';
import { useVNPayReturn } from '@/hooks/useVNPayReturn';
import { CheckCircle2, XCircle, RefreshCw, ShoppingBag, MapPin, Truck } from 'lucide-react';

export default function VNPayReturnContentUI() {
  const {
    loading,
    order,
    errorMsg,
    retryingPayment,
    responseCode,
    txnRef,
    transactionNo,
    amountStr,
    handleRetryPayment,
  } = useVNPayReturn();

  const onRetryClick = async () => {
    const url = await handleRetryPayment();
    if (url) {
      window.location.href = url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-gray-100">Đang đối soát kết quả thanh toán VNPay...</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Vui lòng chờ trong giây lát, hệ thống đang cập nhật trạng thái đơn hàng của bạn.</p>
      </div>
    );
  }

  const isSuccess = responseCode === '00' && order?.paymentStatus === 'completed';
  const displayAmount = amountStr ? (parseInt(amountStr, 10) / 100).toLocaleString('vi-VN') : (order?.finalAmount || 0).toLocaleString('vi-VN');

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-slate-900/50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700/60 overflow-hidden">
          {/* Header Status Banner */}
          <div className={`p-6 sm:p-8 text-center text-white ${isSuccess ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' : 'bg-gradient-to-r from-rose-600 via-red-600 to-amber-600'}`}>
            <div className="inline-flex items-center justify-center p-3 bg-white/20 backdrop-blur-md rounded-full mb-4 ring-8 ring-white/10">
              {isSuccess ? <CheckCircle2 className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isSuccess ? 'Thanh Toán Thành Công!' : 'Thanh Toán Không Thành Công'}
            </h1>
            <p className="mt-2 text-emerald-100/90 dark:text-rose-100/90 text-sm sm:text-base">
              {isSuccess
                ? `Cảm ơn bạn! Giao dịch thanh toán trực tuyến qua cổng VNPay cho đơn hàng #${order?.orderCode || txnRef} đã được hoàn tất.`
                : `Giao dịch cho đơn hàng #${order?.orderCode || txnRef} bị hủy bỏ hoặc không thành công (Mã lỗi: ${responseCode || 'FAILED'}).`}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-gray-50 dark:bg-slate-900/80 rounded-xl p-5 border border-gray-100 dark:border-slate-700/50 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-base">{order?.orderCode || txnRef}</span>
              </div>
              {transactionNo && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Mã giao dịch VNPay:</span>
                  <span className="font-mono text-gray-700 dark:text-gray-300">{transactionNo}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Phương thức:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Thanh toán qua cổng VNPay Sandbox</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">Trạng thái thanh toán:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isSuccess ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'}`}>
                  {isSuccess ? 'Đã thanh toán (Completed)' : 'Thất bại / Hủy bỏ (Failed)'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700/60 flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Số tiền thanh toán:</span>
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{displayAmount} đ</span>
              </div>
            </div>



            {/* Thông báo lỗi nếu thất bại */}
            {(!isSuccess || errorMsg) && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
                <p className="font-semibold mb-1">Đơn hàng của bạn vẫn đang ở trạng thái chờ (Pending).</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  {errorMsg || 'Bạn có thể nhấn nút Thanh toán lại bên dưới để thực hiện lại giao dịch qua cổng VNPay mà không cần tạo mới đơn hàng.'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!isSuccess && (
                <button
                  type="button"
                  onClick={onRetryClick}
                  disabled={retryingPayment}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/20 font-semibold transition-all disabled:opacity-50"
                >
                  {retryingPayment ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Đang kết nối lại VNPay...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-5 h-5" />
                      <span>Thanh Toán Lại Bằng VNPay</span>
                    </>
                  )}
                </button>
              )}

              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 font-semibold transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Trở Về Trang Chủ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
