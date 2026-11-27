'use client';

import React from 'react';
import { Award, BadgePercent, CheckCircle2, RefreshCw, ShieldCheck } from 'lucide-react';

/**
 * Section 3: Minh bạch nguồn hàng & Cam kết chính hãng 100%.
 */
export function AboutTransparencySection() {
  return (
    <section id="transparency-guarantee" className="space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-bold text-xs uppercase tracking-widest border border-orange-200 dark:border-orange-800">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
          <span>Cam Kết Chất Lượng Tuyệt Đối</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          MINH BẠCH NGUỒN HÀNG - CAM KẾT CHÍNH HÃNG 100%
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tại AP Sports, tính chân thật và sự minh bạch trong mọi nguồn nhập hàng là tôn chỉ hoạt
          động không bao giờ đánh đổi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Đối Tác Ủy Quyền Chính Thức
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Tất cả các dòng giày đá bóng, vợt cầu lông, phụ kiện gym... đều được nhập trực tiếp từ
            nhà phân phối chính hãng của{' '}
            <strong className="text-slate-900 dark:text-slate-200">
              Nike, Yonex, Mizuno, Jordan, Adidas
            </strong>{' '}
            có chứng nhận CO/CQ và tem niêm phong tiêu chuẩn.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-orange-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đền bù 200% nếu phát hiện hàng giả</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BadgePercent className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Giá Cả Niêm Yết Công Khai
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Mọi giá bán niêm yết trên website đều đã bao gồm thuế GTGT (VAT), không phát sinh bất kỳ
            khoản phí phụ thu bất ngờ nào. Khách hàng hoàn toàn chủ động ngân sách và được cấp hóa
            đơn tài chính VAT hợp lệ.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-amber-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Minh bạch 100% chi phí hóa đơn</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-4 hover:border-orange-500/50 transition-all group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Đổi Trả Dễ Dàng Trong 7 Ngày
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Khi nhận hàng nếu chọn nhầm size hoặc không hài lòng về màu sắc, AP Sports hỗ trợ đổi
            size/mẫu mới nhanh chóng trong vòng 7 ngày làm việc với thủ tục tối giản, tận tâm phục
            vụ quý khách.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
            <span>Hỗ trợ đổi trả tận nhà</span>
          </div>
        </div>
      </div>
    </section>
  );
}
