'use client';

import { useState, useCallback } from 'react';

/**
 * Định nghĩa cấu trúc dữ liệu cho từng bước trong quy trình mua sắm tại AP Sports.
 * Tuân thủ nghiêm ngặt kiểu dữ liệu tĩnh để chống XSS và đảm bảo toàn vẹn hiển thị.
 */
export interface ShoppingStepItem {
  /** Số thứ tự bước (ví dụ: '01', '02') */
  stepNumber: string;
  /** Định danh icon đại diện để tầng Component ánh xạ sang SVG/Lucide Icon */
  iconKey: 'target' | 'ruler' | 'shield-box' | 'truck-check';
  /** Nhãn phụ phía trên tiêu đề */
  badge: string;
  /** Tiêu đề chính của bước */
  title: string;
  /** Mô tả chi tiết quy trình thực hiện */
  description: string;
  /** Điểm nhấn cam kết ở chân thẻ */
  highlightText: string;
}

/**
 * Danh sách 4 bước mua sắm chuẩn vận động viên tại AP Sports (dữ liệu tĩnh chuẩn hóa).
 * Không chứa thông tin định vị trực tiếp theo đúng yêu cầu nghiệp vụ.
 */
const SHOPPING_STEPS_DATA: readonly ShoppingStepItem[] = [
  {
    stepNumber: '01',
    iconKey: 'target',
    badge: 'ĐỊNH HƯỚNG BỘ MÔN',
    title: 'Chọn Môn & Vị Trí Thi Đấu',
    description:
      'Lựa chọn trang thiết bị chuyên biệt theo từng bộ môn: Bóng đá sân cỏ nhân tạo/tự nhiên, Cầu lông công thủ toàn diện, Bóng rổ, Võ thuật (Karate, Taekwondo, Boxing) và Gym.',
    highlightText: 'Phân loại chuẩn xác theo trình độ & mặt sân',
  },
  {
    stepNumber: '02',
    iconKey: 'ruler',
    badge: 'CHUẨN HÓA THÔNG SỐ',
    title: 'Bảng Size & Tư Vấn AI',
    description:
      'Tra cứu bảng thông số kích cỡ chuẩn form thể trạng người Việt hoặc sử dụng Trợ lý AI thông minh để chọn size giày, mức căng dây vợt (kg) và giáp bảo hộ vừa vặn 100%.',
    highlightText: 'Tư vấn kỹ thuật chuyên sâu 24/7',
  },
  {
    stepNumber: '03',
    iconKey: 'shield-box',
    badge: 'KIỂM ĐỊNH XUẤT KHO',
    title: 'Niêm Phong Chuẩn AP WMS',
    description:
      'Mỗi sản phẩm đều trải qua quy trình kiểm định ngoại quan 3 lớp tại kho AP WMS, đóng gói chống sốc tiêu chuẩn và dán tem niêm phong chống hàng giả trước khi bàn giao vận chuyển.',
    highlightText: 'Cam kết 100% chính hãng nguyên hộp',
  },
  {
    stepNumber: '04',
    iconKey: 'truck-check',
    badge: 'AN TÂM NHẬN HÀNG',
    title: 'Đồng Kiểm & Đổi Trả 30 Ngày',
    description:
      'Khách hàng được quyền mở hộp kiểm tra đúng mẫu mã, kích cỡ và phụ kiện tặng kèm cùng bưu tá trước khi thanh toán (COD). Hỗ trợ đổi size miễn phí tận nhà trong 30 ngày.',
    highlightText: 'Đổi size nhanh gọn không cần ra bưu cục',
  },
];

/**
 * Custom Hook quản lý trạng thái và dữ liệu cho khối Quy trình Mua sắm (HomeShoppingSteps).
 * Đảm bảo Component hoàn toàn thuần UI (Pure Component), không chứa useState/useEffect.
 */
export function useHomeShoppingSteps() {
  // Lưu vị trí bước đang được người dùng tương tác (hover hoặc click), mặc định chọn bước đầu tiên (index 0)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  /**
   * Hàm cập nhật bước đang được chọn khi người dùng di chuột hoặc chạm vào thẻ trên thiết bị di động.
   * Kiểm tra giới hạn index an toàn trước khi cập nhật state.
   */
  const handleSelectStep = useCallback((index: number) => {
    if (index >= 0 && index < SHOPPING_STEPS_DATA.length) {
      setActiveStepIndex(index);
    }
  }, []);

  return {
    steps: SHOPPING_STEPS_DATA,
    activeStepIndex,
    handleSelectStep,
  };
}
