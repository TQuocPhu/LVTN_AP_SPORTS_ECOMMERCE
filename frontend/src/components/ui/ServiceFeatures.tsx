import { ShieldCheck, Truck, CreditCard, Headphones } from 'lucide-react';

/**
 * Component Tái Sử Dụng ServiceFeatures (Các Cam Kết Dịch Vụ Hàng Đầu).
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
    <div className="ap-service-bar border-b py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div
              key={idx}
              className="ap-service-card flex items-center space-x-3.5 p-4 rounded-2xl border hover:border-orange-500/40 transition-colors shadow-sm"
            >
              <IconComp className="w-8 h-8 text-orange-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wide">{item.title}</h4>
                <p className="text-xs mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
