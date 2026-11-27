'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react';

/**
 * Section 4: An tâm đặt hàng & Thanh toán trung thực.
 */
export function AboutPaymentTrustSection() {
  return (
    <section
      id="payment-trust"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-widest border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-4 h-4 text-emerald-500" />
            <span>Thanh Toán An Toàn &amp; Trung Thực</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            AN TÂM ĐẶT HÀNG - THANH TOÁN TRUNG THỰC
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Chúng tôi hiểu rằng niềm tin của khách hàng khi mua sắm trực tuyến là vô giá. Tại AP
            Sports, quy trình thanh toán và giao nhận được xây dựng minh bạch 100%:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Kiểm Tra Hàng Trước Khi Thanh Toán (COD Đồng Kiểm)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Quý khách hoàn toàn được quyền mở hộp kiểm tra đúng mẫu mã, đúng size giày/áo rồi
                  mới thanh toán tiền cho nhân viên giao hàng.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bảo Mật Thông Tin Chuyển Khoản &amp; Ví Điện Tử
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Các giao dịch chuyển khoản ngân hàng qua mã QR động tự động cập nhật đơn hàng tức
                  thì, mã hóa 256-bit bảo mật tuyệt đối.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Hoàn Tiền Nhanh Chóng Khi Có Sự Cố
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Trong trường hợp đơn hàng hủy hoặc lỗi kỹ thuật từ nhà sản xuất, tiền được hoàn về
                  tài khoản của khách hàng trong 24 giờ làm việc.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold px-6 py-3.5 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:scale-105 uppercase tracking-wider text-xs"
            >
              <span>MUA SẮM NGAY BÂY GIỜ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
            <Image
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80"
              alt="Giày đá bóng chính hãng AP Sports"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
              <span className="font-black text-xl">AP SPORTS GUARANTEE</span>
              <span className="text-xs text-orange-400 font-bold uppercase tracking-widest">
                100% CHÍNH HÃNG - GIAO HÀNG TOÀN QUỐC
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
