import React from 'react';
import { Copy, ShoppingBag, CheckCircle2 } from 'lucide-react';

/**
 * Component VoucherGuideSection: Hướng dẫn 3 bước ngắn gọn giúp Khách hàng biết cách lưu mã và áp dụng khi thanh toán.
 * Tích hợp 100% Light và Dark mode.
 */
export const VoucherGuideSection: React.FC = () => {
  const STEPS = [
    {
      step: '01',
      title: 'Lưu Mã Giảm Giá',
      desc: 'Bấm nút "Lưu Mã" tại bất kỳ voucher nào bạn thích trong kho voucher để copy mã vào bộ nhớ tạm.',
      icon: Copy,
    },
    {
      step: '02',
      title: 'Chọn Sản Phẩm Yêu Thích',
      desc: 'Thêm đồ thể thao, giày, dụng cụ tập luyện vào Giỏ hàng và tiến hành đặt hàng.',
      icon: ShoppingBag,
    },
    {
      step: '03',
      title: 'Nhập Mã & Nhận Ưu Đãi',
      desc: 'Dán mã voucher đã copy vào ô "Mã giảm giá" ở bước thanh toán để trừ trực tiếp tiền đơn hàng!',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mt-12 p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-3xl transition-colors duration-200">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Hướng Dẫn 3 Bước Áp Dụng Voucher AP Sports
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Đơn giản, nhanh chóng và giúp bạn tiết kiệm chi phí tối đa cho mỗi đơn hàng.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-500 transition-all duration-200"
            >
              <div className="absolute top-3 right-4 font-mono font-black text-4xl text-slate-100 dark:text-slate-800 pointer-events-none group-hover:text-amber-500/10 transition-colors">
                {item.step}
              </div>

              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl w-fit mb-4">
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
