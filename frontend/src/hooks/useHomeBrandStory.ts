'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Chiều cao chuẩn của mỗi ô chữ số trong băng chuyền dọc (tính theo đơn vị em).
 * Sử dụng đơn vị em tuyệt đối theo từng bước chữ số giúp triệt tiêu hoàn toàn sai số co giãn của Flexbox.
 */
export const DIGIT_CELL_HEIGHT_EM = 1.15;

/**
 * Token biểu diễn một cột chữ số có hiệu ứng cuộn dọc 1 vòng (Odometer Digit Reel)
 * hoặc một ký tự tĩnh (dấu phẩy, phần trăm, hậu tố chữ).
 */
export type StatCharacterToken =
  | {
      type: 'digit';
      /** Khóa định danh duy nhất cho cột chữ số */
      key: string;
      /** Dãy số trong cuộn băng dọc: 1 vòng đầy đủ (0 -> 9) nối tiếp từ 0 tới chữ số đích */
      reelDigits: number[];
      /** Độ dịch chuyển dọc tính bằng đơn vị em (chính xác tuyệt đối theo vị trí chữ số đích) */
      translateYEm: number;
      /** Độ trễ nhỏ giữa các hàng chữ số (ms) để tạo độ mượt tự nhiên */
      delayMs: number;
      /** Thời gian cuộn mượt (ms) của cột chữ số */
      durationMs: number;
    }
  | {
      type: 'static';
      /** Khóa định danh duy nhất cho ký tự tĩnh */
      key: string;
      /** Chuỗi ký tự tĩnh (ví dụ: ',', '+', '%', ' Ngày', '/7') */
      value: string;
    };

/**
 * Cấu trúc dữ liệu cho từng chỉ số thống kê tự hào của thương hiệu AP Sports.
 */
export interface BrandStatItem {
  /** Mã định danh duy nhất của chỉ số */
  id: string;
  /** Định danh icon để Component ánh xạ sang biểu tượng SVG tương ứng */
  iconKey: 'users' | 'shield-award' | 'refresh-clock' | 'headset';
  /** Chuỗi giá trị hiển thị mục tiêu (ví dụ: '15,000+', '100%', '30 Ngày', '24/7') */
  targetText: string;
  /** Tiêu đề ngắn gọn của con số thống kê */
  label: string;
  /** Mô tả chi tiết ý nghĩa cam kết */
  subLabel: string;
}

/**
 * Cấu trúc điểm nhấn giá trị cốt lõi trong câu chuyện thương hiệu.
 */
export interface BrandPillarItem {
  /** Tiêu đề giá trị cốt lõi */
  title: string;
  /** Nội dung diễn giải ngắn gọn */
  description: string;
}

/**
 * Thời gian tổng thể cho hiệu ứng xoay 1 vòng từng chữ số (3 giây = 3000ms).
 */
const ROLL_DURATION_MS = 3000;

/**
 * Dữ liệu tĩnh 4 con số thống kê uy tín của AP Sports.
 */
const BRAND_STATS_CONFIG: readonly BrandStatItem[] = [
  {
    id: 'stat-athletes',
    iconKey: 'users',
    targetText: '15,000+',
    label: 'Khách Hàng & Vận Động Viên',
    subLabel: 'Tin tưởng trang bị thi đấu & tập luyện trên toàn quốc',
  },
  {
    id: 'stat-authentic',
    iconKey: 'shield-award',
    targetText: '100%',
    label: 'Thiết Bị Chuẩn Thi Đấu',
    subLabel: 'Cam kết chính hãng — Đền bù 200% nếu phát hiện hàng giả',
  },
  {
    id: 'stat-return-days',
    iconKey: 'refresh-clock',
    targetText: '30 Ngày',
    label: 'Đổi Size & Đổi Trả Linh Hoạt',
    subLabel: 'Hỗ trợ đổi size miễn phí tận nhà nhanh chóng, minh bạch',
  },
  {
    id: 'stat-support',
    iconKey: 'headset',
    targetText: '24/7',
    label: 'Chuyên Viên & AI Đồng Hành',
    subLabel: 'Tư vấn chọn form giày, mức căng vợt và bảo hộ chuẩn xác',
  },
];

/**
 * Dữ liệu tĩnh 3 trụ cột tinh thần thể thao của AP Sports.
 */
const BRAND_PILLARS: readonly BrandPillarItem[] = [
  {
    title: 'Tuyển Chọn Khắt Khe Theo Tiêu Chuẩn Thi Đấu',
    description:
      'Mọi đôi giày sân cỏ, cây vợt carbon hay võ phục WKF đều được kiểm tra độ nảy, độ bám và chất liệu trước khi lên kệ.',
  },
  {
    title: 'Công Nghệ Kho Vận & Kiểm Định AP WMS',
    description:
      'Quy trình lưu kho tiêu chuẩn độ ẩm, kiểm định 3 bước và niêm phong chống tráo đổi giúp sản phẩm nguyên vẹn 100% tới tay bạn.',
  },
  {
    title: 'Đồng Hành Trọn Vòng Đời Trang Thiết Bị',
    description:
      'Không chỉ bán sản phẩm, AP Sports bảo hành keo đế, hỗ trợ đan vợt chuẩn lực và đồng hành cùng phong độ của bạn trên mọi mặt sân.',
  },
];

/**
 * Hàm phân tách chuỗi mục tiêu (ví dụ '15,000+' hoặc '24/7') thành mảng Token:
 * - Từng chữ số ở phần số chính sẽ tạo thành một băng chuyền dọc (Digit Reel) quay đúng 1 vòng (0..9)
 *   rồi trượt mượt mà tới đúng chữ số đích (`targetDigit`) trong vòng 3 giây.
 * - Các dấu phân cách (',') hoặc hậu tố ('+', '%', ' Ngày', '/7') được giữ cố định.
 */
function buildStatTokens(stat: BrandStatItem, isAnimated: boolean): StatCharacterToken[] {
  // Tách phần chuỗi số dẫn đầu (gồm chữ số và dấu phẩy) và phần hậu tố phía sau (như '+', '%', ' Ngày', '/7')
  const match = stat.targetText.match(/^([\d,]+)(.*)$/);
  const numericPart = match ? match[1] : stat.targetText;
  const suffixPart = match ? match[2] : '';

  const tokens: StatCharacterToken[] = [];
  let digitOrder = 0;

  for (let i = 0; i < numericPart.length; i++) {
    const ch = numericPart[i];
    if (ch >= '0' && ch <= '9') {
      const targetDigit = Number(ch);
      // Xây dựng dải số quay đúng 1 vòng tuần tự (0 -> 9) rồi tiến thẳng tới đúng targetDigit
      const reelDigits: number[] = [];
      for (let d = 0; d <= 9; d++) {
        reelDigits.push(d);
      }
      for (let d = 0; d <= targetDigit; d++) {
        reelDigits.push(d);
      }

      // Vị trí index cuối cùng trong mảng luôn chính là targetDigit
      const finalIndex = reelDigits.length - 1;
      // Dịch chuyển chính xác bằng số bước * chiều cao mỗi ô (em)
      const translateYEm = isAnimated ? -(finalIndex * DIGIT_CELL_HEIGHT_EM) : 0;
      // Độ trễ nhẹ giữa các chữ số liền kề (90ms) và tổng thời gian khớp gói gọn trong 3000ms
      const delayMs = digitOrder * 90;
      const durationMs = Math.max(2400, ROLL_DURATION_MS - delayMs);

      tokens.push({
        type: 'digit',
        key: `${stat.id}-digit-${i}`,
        reelDigits,
        translateYEm,
        delayMs,
        durationMs,
      });

      digitOrder++;
    } else {
      tokens.push({
        type: 'static',
        key: `${stat.id}-sep-${i}`,
        value: ch,
      });
    }
  }

  if (suffixPart) {
    tokens.push({
      type: 'static',
      key: `${stat.id}-suffix`,
      value: suffixPart,
    });
  }

  return tokens;
}

/**
 * Custom Hook quản lý câu chuyện thương hiệu và hiệu ứng cuộn từng chữ số 1 vòng mượt mà trong 3 giây.
 * Sử dụng IntersectionObserver để kích hoạt khi người dùng cuộn tới khối,
 * đảm bảo dừng chính xác tại các số 15,000+, 100%, 30 Ngày, 24/7.
 */
export function useHomeBrandStory() {
  // Tham chiếu tới phần tử DOM của khối để theo dõi trạng thái cuộn màn hình
  const sectionRef = useRef<HTMLElement | null>(null);
  // Cờ đánh dấu chỉ kích hoạt hiệu ứng cuộn số 1 lần duy nhất
  const hasAnimatedRef = useRef<boolean>(false);

  // Trạng thái đã kích hoạt cuộn các dải băng chữ số tới đích hay chưa
  const [isAnimated, setIsAnimated] = useState<boolean>(false);
  // Trạng thái đang trong thời gian 3 giây chuyển động (phục vụ hiệu ứng đèn báo)
  const [isSpinning, setIsSpinning] = useState<boolean>(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;
    let rafId: number | null = null;

    // Khởi tạo IntersectionObserver theo dõi khi khối xuất hiện ít nhất 20% trong khung nhìn
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setIsSpinning(true);

          // Kích hoạt translateY ở frame kế tiếp để trình duyệt áp dụng CSS transition 3 giây mượt mà
          rafId = window.requestAnimationFrame(() => {
            setIsAnimated(true);
          });

          timerId = setTimeout(() => {
            setIsSpinning(false);
          }, ROLL_DURATION_MS);

          // Ngắt kết nối observer ngay sau khi đã kích hoạt lần đầu
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(element);

    // Dọn dẹp triệt để khi Component unmount
    return () => {
      observer.disconnect();
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }, []);

  // Tính toán danh sách băng chuyền chữ số (Odometer Tokens) cho cả 4 ô thống kê
  const statTokenGroups = useMemo(
    () => BRAND_STATS_CONFIG.map((stat) => buildStatTokens(stat, isAnimated)),
    [isAnimated]
  );

  return {
    sectionRef,
    stats: BRAND_STATS_CONFIG,
    pillars: BRAND_PILLARS,
    statTokenGroups,
    isSpinning,
  };
}
