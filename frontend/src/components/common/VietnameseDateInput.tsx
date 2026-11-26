'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { useVietnameseDateInput } from '@/hooks/useVietnameseDateInput';

export interface VietnameseDateInputProps {
  /**
   * Giá trị ISO ("YYYY-MM-DD" hoặc "YYYY-MM-DDTHH:mm")
   */
  value: string;
  onChange: (isoValue: string) => void;
  /**
   * Chế độ giao diện:
   * - 'admin': Cố định giao diện sáng (Light mode), tuyệt đối không dùng class dark
   * - 'customer': Tự động thích ứng Dark / Light mode theo trang khách hàng
   */
  themeVariant?: 'admin' | 'customer';
  /**
   * Kích thước hiển thị:
   * - 'bare': Không viền nền riêng (dùng bên trong các pill lọc "Từ: ... Đến: ..." đã có sẵn khung)
   * - 'compact': Ô nhỏ gọn có viền riêng (dùng trong thanh công cụ bảng)
   * - 'form': Ô nhập liệu đầy đủ độ rộng (dùng trong Modal form như VoucherFormModal)
   */
  sizeVariant?: 'bare' | 'compact' | 'form';
  enableTime?: boolean;
  placeholder?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  title?: string;
  className?: string;
}

/**
 * Component Ô Nhập Ngày Tháng Năm Chuẩn Việt Nam (dd/mm/yyyy).
 * Tuân thủ nghiêm ngặt kiến trúc 7 tầng: toàn bộ state & hiệu ứng nằm trong useVietnameseDateInput.
 */
export const VietnameseDateInput: React.FC<VietnameseDateInputProps> = ({
  value,
  onChange,
  themeVariant = 'admin',
  sizeVariant = 'bare',
  enableTime = false,
  placeholder,
  min,
  max,
  disabled = false,
  required = false,
  title,
  className = '',
}) => {
  const {
    displayText,
    hiddenPickerRef,
    handleTextChange,
    handleBlur,
    handleOpenPicker,
    handleNativePickerChange,
  } = useVietnameseDateInput({
    value,
    onChange,
    enableTime,
    min,
    max,
  });

  const resolvedPlaceholder = placeholder || (enableTime ? 'dd/mm/yyyy HH:mm' : 'dd/mm/yyyy');
  const widthClass =
    sizeVariant === 'form'
      ? 'w-full'
      : enableTime
      ? 'w-[138px]'
      : 'w-[98px]';

  // Phân tách hoàn toàn bảng màu Admin (Light cố định) và Customer (Dark/Light)
  const containerThemeClass =
    themeVariant === 'customer'
      ? sizeVariant === 'form'
        ? 'px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-orange-500'
        : sizeVariant === 'compact'
        ? 'px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:border-orange-500'
        : 'bg-transparent'
      : sizeVariant === 'form'
      ? 'px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-amber-500'
      : sizeVariant === 'compact'
      ? 'px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg focus-within:border-orange-500'
      : 'bg-transparent';

  const inputTextThemeClass =
    themeVariant === 'customer'
      ? 'text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500'
      : 'text-slate-800 placeholder:text-slate-400';

  const iconThemeClass =
    themeVariant === 'customer'
      ? 'text-slate-400 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400'
      : 'text-slate-400 hover:text-orange-600';

  return (
    <div
      title={title}
      className={`relative inline-flex items-center gap-1 ${widthClass} ${containerThemeClass} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <input
        type="text"
        inputMode="numeric"
        value={displayText}
        onChange={(e) => handleTextChange(e.target.value)}
        onBlur={handleBlur}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        required={required}
        className={`w-full bg-transparent border-none outline-none focus:outline-none font-medium ${
          sizeVariant === 'form' ? 'text-sm' : 'text-xs'
        } ${inputTextThemeClass}`}
      />

      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={handleOpenPicker}
        title="Mở lịch chọn ngày (dd/mm/yyyy)"
        className={`shrink-0 p-0.5 rounded transition-colors cursor-pointer ${iconThemeClass}`}
      >
        <Calendar className={sizeVariant === 'form' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      </button>

      {/* Input lịch ẩn dùng để gọi bảng lịch popup trực quan của trình duyệt */}
      <input
        ref={hiddenPickerRef}
        type={enableTime ? 'datetime-local' : 'date'}
        value={value || ''}
        min={min}
        max={max}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handleNativePickerChange(e.target.value)}
        className="sr-only pointer-events-none w-0 h-0 opacity-0 absolute right-0 bottom-0"
      />
    </div>
  );
};
