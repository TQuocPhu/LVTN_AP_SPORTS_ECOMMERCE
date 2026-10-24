'use client';

import { useState, useEffect, useMemo } from 'react';

/**
 * Định nghĩa kiểu dữ liệu cho từng liên kết mạng xã hội trên thanh Top Bar phía Client.
 */
export interface ClientSocialLinkItem {
  /** Định danh loại mạng xã hội để Component ánh xạ đúng biểu tượng SVG */
  id: 'facebook' | 'youtube' | 'github';
  /** Nhãn mô tả phục vụ khả năng tiếp cận (aria-label / title) */
  label: string;
  /** Đường dẫn URL hợp lệ đã qua bước kiểm tra giao thức an toàn */
  href: string;
}

/**
 * Giá trị đọc trực tiếp từ biến môi trường (Frontend .env) kèm giá trị dự phòng chuẩn hóa.
 */
const ENV_STORE_LOCATION =
  process.env.NEXT_PUBLIC_STORE_LOCATION || 'Trà Vinh, Vĩnh Long, Việt Nam';
const ENV_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'tranquocphutv2019@gmail.com';
const ENV_SOCIAL_FACEBOOK =
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || 'https://www.facebook.com/tqp.2484';
const ENV_SOCIAL_YOUTUBE =
  process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || 'https://www.youtube.com/@QuốcPhú-ttv';
const ENV_SOCIAL_GITHUB =
  process.env.NEXT_PUBLIC_SOCIAL_GITHUB || 'https://github.com/TQuocPhu';

/**
 * Hàm kiểm tra tính an toàn của URL ngoại vi (chỉ cho phép giao thức http:// hoặc https://)
 * nhằm ngăn chặn tuyệt đối nguy cơ chèn mã độc qua giao thức javascript: hoặc data:.
 */
function sanitizeExternalUrl(rawUrl: string, fallbackUrl: string): string {
  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return fallbackUrl;
}

/**
 * Custom Hook cung cấp dữ liệu định vị, email liên hệ, các liên kết mạng xã hội
 * và phần tử DOM đích (`#client-top-bar-slot` nằm phía trên Header Logo Navbar)
 * cho thanh thông tin đầu trang khách hàng (ClientTopBar).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture: Đóng gói toàn bộ useState/useEffect tại tầng Hook.
 */
export function useClientTopBar() {
  // Phần tử DOM đích nằm ngay phía trên Header Logo Navbar trong RootLayout
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const slotElement = document.getElementById('client-top-bar-slot');
    if (slotElement) {
      setPortalTarget(slotElement);
    }
  }, []);

  // Chuẩn hóa thông tin địa chỉ và đường dẫn gửi thư điện tử (mailto:)
  const locationText = ENV_STORE_LOCATION.trim();
  const contactEmail = ENV_CONTACT_EMAIL.trim();
  const mailtoHref = `mailto:${contactEmail}`;

  // Danh sách các liên kết mạng xã hội (Facebook, YouTube, GitHub) lấy từ biến môi trường .env
  const socialLinks = useMemo<readonly ClientSocialLinkItem[]>(
    () => [
      {
        id: 'facebook',
        label: 'Facebook chính thức',
        href: sanitizeExternalUrl(
          ENV_SOCIAL_FACEBOOK,
          'https://www.facebook.com/tqp.2484'
        ),
      },
      {
        id: 'youtube',
        label: 'Kênh YouTube chính thức',
        href: sanitizeExternalUrl(
          ENV_SOCIAL_YOUTUBE,
          'https://www.youtube.com/@QuốcPhú-ttv'
        ),
      },
      {
        id: 'github',
        label: 'Trang GitHub chính thức',
        href: sanitizeExternalUrl(
          ENV_SOCIAL_GITHUB,
          'https://github.com/TQuocPhu'
        ),
      },
    ],
    []
  );

  return {
    portalTarget,
    locationText,
    contactEmail,
    mailtoHref,
    socialLinks,
  };
}
