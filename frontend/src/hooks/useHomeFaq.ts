'use client';

import { useState, useMemo, useCallback } from 'react';

/**
 * Định nghĩa các nhóm chủ đề câu hỏi thường gặp tại AP Sports.
 */
export type FaqCategoryKey = 'ALL' | 'SIZE_TECH' | 'RETURN_COD' | 'PAYMENT_WARRANTY';

/**
 * Cấu trúc thông tin của một tùy chọn trong Select Dropdown lọc FAQ.
 */
export interface FaqCategoryOption {
  key: FaqCategoryKey;
  label: string;
}

/**
 * Cấu trúc dữ liệu tĩnh chuẩn hóa cho mỗi câu hỏi thường gặp (FAQ Item).
 * Mọi chuỗi văn bản đều được kiểm soát tĩnh ở tầng mã nguồn, chống XSS 100%.
 */
export interface HomeFaqItem {
  /** Mã định danh duy nhất của câu hỏi */
  id: string;
  /** Nhóm danh mục để lọc nhanh */
  categoryKey: Exclude<FaqCategoryKey, 'ALL'>;
  /** Nhãn chủ đề hiển thị trên thẻ câu hỏi */
  badgeText: string;
  /** Nội dung câu hỏi của khách hàng */
  question: string;
  /** Câu trả lời ngắn gọn, súc tích, đầy đủ chính sách của hệ thống */
  answer: string;
  /** Điểm nhấn tóm tắt ngắn gọn dưới câu trả lời */
  keyTakeaway: string;
}

/**
 * Danh sách các tùy chọn trong Select Dropdown lọc câu hỏi thường gặp.
 */
const FAQ_CATEGORIES: readonly FaqCategoryOption[] = [
  { key: 'ALL', label: 'Tất cả chủ đề câu hỏi (04)' },
  { key: 'SIZE_TECH', label: 'Chủ đề: Chọn Size & Kỹ Thuật' },
  { key: 'RETURN_COD', label: 'Chủ đề: Đồng Kiểm & Đổi Trả 30 Ngày' },
  { key: 'PAYMENT_WARRANTY', label: 'Chủ đề: Thanh Toán & Bảo Hành' },
];

/**
 * Bộ 4 câu hỏi trọng tâm nhất của hệ thống AP Sports, được tinh gọn súc tích
 * để giải đáp toàn diện thắc mắc của khách hàng mà không làm trang chủ bị kéo dài.
 */
const HOME_FAQ_ITEMS: readonly HomeFaqItem[] = [
  {
    id: 'faq-size-selection',
    categoryKey: 'SIZE_TECH',
    badgeText: 'TƯ VẤN SIZE & THÔNG SỐ',
    question:
      'Làm sao để chọn đúng size giày bóng đá, mức căng vợt cầu lông hoặc võ phục khi đặt online?',
    answer:
      'Mỗi sản phẩm đều tích hợp bảng quy đổi kích thước theo chiều dài bàn chân (cm) chuẩn form người Việt (chân thon/chân bè) và thông số kỹ thuật chi tiết. Ngoài ra, bạn có thể hỏi Trợ lý AI ở góc phải màn hình để được gợi ý size chuẩn 100% chỉ sau vài giây.',
    keyTakeaway: 'Hỗ trợ đo size theo form chân & tư vấn mức căng vợt 24/7 qua Trợ lý AI.',
  },
  {
    id: 'faq-cod-and-return',
    categoryKey: 'RETURN_COD',
    badgeText: 'ĐỒNG KIỂM COD & ĐỔI TRẢ 30 NGÀY',
    question:
      'Tôi có được mở hộp kiểm tra hàng trước khi thanh toán (COD) và đổi size nếu không vừa không?',
    answer:
      'Hoàn toàn ĐƯỢC. 100% đơn hàng xuất kho AP WMS cho phép mở hộp kiểm tra đúng mẫu, đúng size, nguyên tem chống giả cùng bưu tá trước khi thanh toán. Nếu mang chưa vừa, AP Sports hỗ trợ bưu tá đến tận nhà đổi size miễn phí trong vòng 30 ngày.',
    keyTakeaway: 'Được mở hộp đồng kiểm khi nhận hàng & đổi size tận nhà miễn phí 30 ngày.',
  },
  {
    id: 'faq-vnpay-security',
    categoryKey: 'PAYMENT_WARRANTY',
    badgeText: 'AN TOÀN THANH TOÁN VNPAY',
    question:
      'Thanh toán trực tuyến qua cổng VNPay trên website có an toàn và xác nhận đơn ngay không?',
    answer:
      'Cổng thanh toán VNPay tại AP Sports đạt chuẩn bảo mật quốc tế PCI-DSS, mã hóa SSL 256-bit, chữ ký số HMAC-SHA512 và xác thực OTP 2 lớp. Ngay khi thanh toán hoàn tất, hệ thống tự động đối soát IPN và xác nhận đơn hàng tức thì.',
    keyTakeaway: 'Bảo mật chữ ký số HMAC-SHA512 & tự động cập nhật trạng thái đơn tức thì.',
  },
  {
    id: 'faq-warranty-authentic',
    categoryKey: 'PAYMENT_WARRANTY',
    badgeText: 'CAM KẾT & BẢO HÀNH CHÍNH HÃNG',
    question:
      'Chính sách cam kết hàng chính hãng và chế độ bảo hành dụng cụ thể thao tại AP Sports như thế nào?',
    answer:
      'AP Sports cam kết 100% sản phẩm chính hãng nguyên hộp, đền bù 200% giá trị nếu phát hiện hàng giả. Giày thể thao được bảo hành keo đế từ 6 – 12 tháng, vợt cầu lông và trang thiết bị thi đấu được bảo hành chính hãng theo tiêu chuẩn nhà sản xuất.',
    keyTakeaway: 'Đền bù 200% nếu phát hiện hàng giả — Bảo hành keo đế & lỗi kỹ thuật 6–12 tháng.',
  },
];

/**
 * Custom Hook quản lý trạng thái lọc danh mục (qua Select Dropdown) và đóng/mở Accordion cho khối FAQ.
 * Tuân thủ kiến trúc Layer Architecture: Giúp Component HomeFaqSection chỉ đảm nhiệm việc hiển thị thuần túy.
 */
export function useHomeFaq() {
  // Danh mục đang được chọn trong Select Dropdown (mặc định hiển thị tất cả)
  const [selectedCategory, setSelectedCategory] = useState<FaqCategoryKey>('ALL');
  // Mã ID của câu hỏi đang được mở nội dung trả lời (mặc định mở câu đầu tiên)
  const [openFaqId, setOpenFaqId] = useState<string | null>(HOME_FAQ_ITEMS[0]?.id ?? null);

  /**
   * Danh sách câu hỏi sau khi lọc theo danh mục đã chọn trong Select Dropdown.
   */
  const filteredFaqs = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return HOME_FAQ_ITEMS;
    }
    return HOME_FAQ_ITEMS.filter((item) => item.categoryKey === selectedCategory);
  }, [selectedCategory]);

  /**
   * Hàm xử lý khi người dùng chọn chủ đề từ Select Option Dropdown.
   * Kiểm tra tính hợp lệ của giá trị chọn trước khi cập nhật state.
   */
  const handleSelectCategory = useCallback((value: string) => {
    const validKey = FAQ_CATEGORIES.find((cat) => cat.key === value)?.key ?? 'ALL';
    setSelectedCategory(validKey);

    const firstMatch =
      validKey === 'ALL'
        ? HOME_FAQ_ITEMS[0]
        : HOME_FAQ_ITEMS.find((item) => item.categoryKey === validKey);
    setOpenFaqId(firstMatch ? firstMatch.id : null);
  }, []);

  /**
   * Hàm đóng/mở một câu hỏi cụ thể khi người dùng nhấn vào tiêu đề Accordion.
   */
  const handleToggleFaq = useCallback((faqId: string) => {
    setOpenFaqId((prevId) => (prevId === faqId ? null : faqId));
  }, []);

  return {
    categories: FAQ_CATEGORIES,
    selectedCategory,
    filteredFaqs,
    openFaqId,
    handleSelectCategory,
    handleToggleFaq,
  };
}
