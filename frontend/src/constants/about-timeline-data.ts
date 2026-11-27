/**
 * Dữ liệu 6 cột mốc hình thành & phát triển hệ thống AP Sports (16 năm: 08/2010 → 11/2026).
 */
export interface AboutTimelineMilestone {
  id: string;
  monthYear: string;
  shortLabel: string;
  title: string;
  description: string;
  iconName: 'store' | 'award' | 'layers' | 'barcode' | 'truck' | 'sparkles';
}

export const ABOUT_TIMELINE_MILESTONES: AboutTimelineMilestone[] = [
  {
    id: '2010-08',
    monthYear: 'Tháng 08/2010',
    shortLabel: '08/2010',
    title: 'Khởi Nghiệp Cửa Hàng Đầu Tiên',
    description:
      'Thành lập cửa hàng dụng cụ bóng đá AP Sports đầu tiên vào tháng 08/2010 với niềm đam mê sân cỏ phủi và khát vọng mang giày thể thao chuẩn mực đến cộng đồng.',
    iconName: 'store',
  },
  {
    id: '2014-05',
    monthYear: 'Tháng 05/2014',
    shortLabel: '05/2014',
    title: 'Chuẩn Hóa Nguồn Hàng Chính Hãng',
    description:
      'Trở thành đối tác phân phối ủy quyền của các thương hiệu giày và dụng cụ thể thao quốc tế (Nike, Adidas, Mizuno, Yonex) với đầy đủ chứng nhận CO/CQ.',
    iconName: 'award',
  },
  {
    id: '2018-09',
    monthYear: 'Tháng 09/2018',
    shortLabel: '09/2018',
    title: 'Mở Rộng Hệ Sinh Thái Đa Môn',
    description:
      'Phát triển toàn diện các ngành hàng Bóng đá, Bóng rổ, Cầu lông, Bóng chuyền, Gym & Võ thuật với hàng ngàn mã biến thể SKU đa kích cỡ.',
    iconName: 'layers',
  },
  {
    id: '2021-03',
    monthYear: 'Tháng 03/2021',
    shortLabel: '03/2021',
    title: 'Số Hóa Kho Vận & Kiểm Đếm Barcode',
    description:
      'Áp dụng quy trình đóng gói kiểm đếm mã vạch từng đơn hàng và quản lý tồn kho đa biến thể theo thời gian thực, loại bỏ sai sót giao nhầm size.',
    iconName: 'barcode',
  },
  {
    id: '2024-06',
    monthYear: 'Tháng 06/2024',
    shortLabel: '06/2024',
    title: 'Tích Hợp Giao Vận GHN & Thanh Toán VNPay',
    description:
      'Kết nối API tính phí vận chuyển GHN toàn quốc, bản đồ định vị lộ trình đơn hàng trực quan và cổng thanh toán trực tuyến VNPay bảo mật cao.',
    iconName: 'truck',
  },
  {
    id: '2026-11',
    monthYear: 'Tháng 11/2026',
    shortLabel: '11/2026',
    title: 'Nền Tảng Thương Mại Thể Thao Thông Minh',
    description:
      'Ra mắt Trợ lý AI Tư vấn chọn giày/vợt, hệ thống đánh giá minh bạch (sản phẩm & shipper) cùng ứng dụng Mobile đồng bộ đa nền tảng.',
    iconName: 'sparkles',
  },
];
