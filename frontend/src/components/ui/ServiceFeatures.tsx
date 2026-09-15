import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

/**
 * Component Tái Sử Dụng ServiceFeatures (Các Cam Kết Dịch Vụ Hàng Đầu).
 * Tách biệt hoàn toàn thành file riêng để có thể gọi ở Footer, Trang Chủ hoặc Trang Chi Tiết Sản Phẩm.
 */
export default function ServiceFeatures() {
  const features = [
    {
      icon: ShieldCheck,
      title: '100% CHÍNH HÃNG',
      description: 'Cam kết hoàn tiền 200% nếu sản phẩm giả',
    },
    {
      icon: Truck,
      title: 'GIAO HÀNG TỐC ĐỘ',
      description: 'Đối tác GHN/GHTK tích hợp theo dõi GPS',
    },
    {
      icon: CreditCard,
      title: 'THANH TOÁN AN TOÀN',
      description: 'Hỗ trợ VNPay, PayPal, VietQR & COD',
    },
    {
      icon: Headphones,
      title: 'TƯ VẤN THỂ THAO 24/7',
      description: 'Đội ngũ chuyên viên tư vấn nhiệt tình',
    },
  ];

  return (
    <div className="border-b border-slate-800/60 bg-slate-900/40 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="flex items-center space-x-3.5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/40 transition-colors shadow-sm"
            >
              <IconComp className="w-8 h-8 text-orange-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
