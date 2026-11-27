/**
 * Dữ liệu 6 thẻ dịch vụ cốt lõi của hệ thống thương mại điện tử AP Sports.
 * Bám sát quy trình thực tế của cửa hàng dụng cụ bóng đá & thể thao.
 */
export interface SystemServiceItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  iconName: 'sparkles' | 'barcode' | 'truck' | 'creditCard' | 'refreshCw' | 'headphones';
  accentClass: string;
  iconBgClass: string;
  href: string;
  ctaLabel: string;
}

export const SYSTEM_SERVICES_LIST: SystemServiceItem[] = [
  {
    id: 'ai-advisor',
    title: 'Tư Vấn Chọn Giày & Dụng Cụ AI',
    description:
      'Trợ lý AI AP Sports phân tích mặt sân (cỏ tự nhiên FG, cỏ nhân tạo TF, futsal IC), form chân và kích cỡ để đề xuất đúng mẫu giày, vợt và trang phục phù hợp nhất.',
    badge: 'Công nghệ AI',
    iconName: 'sparkles',
    accentClass: 'text-orange-600 dark:text-orange-400',
    iconBgClass: 'bg-orange-500/10 text-orange-500',
    href: '/products',
    ctaLabel: 'Khám phá sản phẩm',
  },
  {
    id: 'barcode-pack',
    title: 'Kiểm Đếm Barcode & Niêm Phong Đơn',
    description:
      'Mỗi đơn hàng trước khi rời kho đều được nhân viên quét mã vạch (Barcode/SKU) đối chiếu từng biến thể màu sắc, kích cỡ và dán tem niêm phong kiểm đếm an toàn.',
    badge: 'Chuẩn kho vận',
    iconName: 'barcode',
    accentClass: 'text-sky-600 dark:text-sky-400',
    iconBgClass: 'bg-sky-500/10 text-sky-500',
    href: '/about',
    ctaLabel: 'Xem quy trình chuẩn',
  },
  {
    id: 'ghn-tracking',
    title: 'Giao Hàng GHN & Định Vị Lộ Trình',
    description:
      'Tự động tính phí giao hàng GHN minh bạch theo Quận/Huyện – Phường/Xã, cấp mã vận đơn tức thì và theo dõi hành trình bưu cục – shipper trên bản đồ trực quan.',
    badge: 'Giao vận 63 tỉnh',
    iconName: 'truck',
    accentClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/10 text-emerald-500',
    href: '/shipping-policy',
    ctaLabel: 'Chính sách giao hàng',
  },
  {
    id: 'payment-flex',
    title: 'Thanh Toán COD & VNPay Bảo Mật',
    description:
      'Hỗ trợ đồng kiểm COD khi nhận hàng hoặc thanh toán nhanh qua cổng VNPay QR/ATM bảo mật. Hệ thống tự động cho phép thanh toán lại trong vòng 24 giờ nếu gián đoạn.',
    badge: 'An toàn 256-bit',
    iconName: 'creditCard',
    accentClass: 'text-indigo-600 dark:text-indigo-400',
    iconBgClass: 'bg-indigo-500/10 text-indigo-500',
    href: '/faq',
    ctaLabel: 'Xem câu hỏi thường gặp',
  },
  {
    id: 'warranty-exchange',
    title: 'Đổi Size Nhanh & Bảo Hành Chính Hãng',
    description:
      'Cam kết 100% hàng chính hãng có chứng từ CO/CQ. Hỗ trợ đổi size giày/trang phục trong 7–30 ngày và bảo hành keo, đế theo chính sách tiêu chuẩn của AP Sports.',
    badge: 'Cam kết 100%',
    iconName: 'refreshCw',
    accentClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-500/10 text-amber-500',
    href: '/return-policy',
    ctaLabel: 'Chính sách đổi trả',
  },
  {
    id: 'cskh-review',
    title: 'CSKH 1-1 & Đánh Giá Minh Bạch',
    description:
      'Kết nối trực tiếp với chuyên viên tư vấn qua Live Chat, săn kho Voucher ưu đãi thành viên và gửi đánh giá công khai cả chất lượng sản phẩm lẫn thái độ giao hàng của shipper.',
    badge: 'Hỗ trợ tận tâm',
    iconName: 'headphones',
    accentClass: 'text-rose-600 dark:text-rose-400',
    iconBgClass: 'bg-rose-500/10 text-rose-500',
    href: '/contact',
    ctaLabel: 'Liên hệ hỗ trợ',
  },
];
