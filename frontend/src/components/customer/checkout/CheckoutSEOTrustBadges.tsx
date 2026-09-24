'use client';

import React from 'react';
import { ShieldCheck, RefreshCw, Truck, Award } from 'lucide-react';

export function CheckoutSEOTrustBadges() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block border-b border-slate-100 dark:border-slate-800 pb-2">
        Cam Kết Dịch Vụ AP Sports Enterprise:
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Card 1: 100% Chính Hãng */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
              Cam Kết 100% Chính Hãng
            </strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
              Sản phẩm chính hãng AP Sports, đầy đủ tem mác & chứng từ CO/CQ. Đền tiền gấp 2 lần nếu phát hiện hàng nhái.
            </p>
          </div>
        </div>

        {/* Card 2: Đổi Trả 7 Ngày */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <RefreshCw className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
              Đổi Trả 7 Ngày Miễn Phí
            </strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
              Hỗ trợ đổi size, đổi màu hoặc đổi sản phẩm mới trong 7 ngày nhanh chóng nếu không vừa hoặc có lỗi sản xuất.
            </p>
          </div>
        </div>

        {/* Card 3: Giao Hàng GHN GPS */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
              Vận Chuyển GHN GPS Toàn Quốc
            </strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
              Tự động kết nối đối tác GHN Express và định vị GPS chuẩn xác, theo dõi hành trình đơn hàng 63 tỉnh thành.
            </p>
          </div>
        </div>

        {/* Card 4: Bảo Mật SSL */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-slate-900 dark:text-white block">
              Bảo Mật SSL PCI-DSS Enterprise
            </strong>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5 leading-relaxed">
              Toàn bộ dữ liệu đặt hàng, thông tin cá nhân và giao dịch của bạn được mã hóa 256-bit an toàn tuyệt đối.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
