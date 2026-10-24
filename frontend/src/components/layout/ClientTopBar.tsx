'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Mail } from 'lucide-react';
import { useClientTopBar, ClientSocialLinkItem } from '@/hooks/useClientTopBar';

/**
 * Hàm phụ trợ thuần giao diện hiển thị biểu tượng SVG sắc nét cho từng mạng xã hội (Facebook, YouTube, GitHub).
 */
function renderSocialIcon(id: ClientSocialLinkItem['id']) {
  const iconClass = 'w-3.5 h-3.5 fill-current transition-transform duration-200 group-hover:scale-110';

  switch (id) {
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={iconClass}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
  }
}

/**
 * Component Thanh Thông Tin Đầu Trang Khách Hàng (ClientTopBar).
 * Được gọi từ các trang phía Client (`pages`) và hiển thị trực tiếp ở vị trí trên cùng của trang,
 * nằm **phía trên phần Header Logo (`Navbar`)** thông qua slot `#client-top-bar-slot`.
 * - Tuân thủ nghiêm ngặt Layer Architecture: Chỉ gọi Hook `useClientTopBar`, không chứa useState/useEffect.
 * - Hỗ trợ đầy đủ chế độ Sáng/Tối (Dark/Light Mode) theo đúng chuẩn thiết kế của các trang khách hàng.
 * - Ẩn hoàn toàn trên thiết bị di động (`hidden lg:block`) theo đúng yêu cầu giữ nguyên giao diện Mobile.
 */
export default function ClientTopBar() {
  const { portalTarget, locationText, contactEmail, mailtoHref, socialLinks } = useClientTopBar();

  if (!portalTarget) {
    return null;
  }

  return createPortal(
    <div
      className="hidden lg:block w-full border-b transition-colors duration-300 backdrop-blur-md"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--nav-border)',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-10 flex items-center justify-between text-xs font-semibold">
        {/* Khu vực bên trái: Thông tin Định vị & Email liên hệ */}
        <div className="flex items-center space-x-6">
          {/* Định vị cửa hàng */}
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>{locationText}</span>
          </div>

          {/* Vạch ngăn cách dọc */}
          <span
            className="h-3.5 w-px"
            style={{ backgroundColor: 'var(--bg-border)' }}
            aria-hidden="true"
          />

          {/* Địa chỉ Email liên hệ */}
          <a
            href={mailtoHref}
            className="flex items-center space-x-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors duration-200 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>{contactEmail}</span>
          </a>
        </div>

        {/* Khu vực bên phải: Liên kết mạng xã hội (Facebook, YouTube, GitHub) */}
        <div className="flex items-center space-x-2.5">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              title={social.label}
              className="group w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface-2)',
                borderColor: 'var(--bg-border)',
              }}
            >
              {renderSocialIcon(social.id)}
            </a>
          ))}
        </div>
      </div>
    </div>,
    portalTarget
  );
}
