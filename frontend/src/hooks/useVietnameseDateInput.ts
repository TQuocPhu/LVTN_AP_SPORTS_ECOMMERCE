'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseVietnameseDateInputParams {
  /**
   * Giá trị chuẩn ISO truyền từ tầng cha:
   * - Chế độ ngày: "YYYY-MM-DD" hoặc ""
   * - Chế độ ngày giờ (enableTime = true): "YYYY-MM-DDTHH:mm" hoặc ""
   */
  value: string;
  onChange: (isoValue: string) => void;
  enableTime?: boolean;
  min?: string;
  max?: string;
}

/**
 * Chuyển chuỗi ISO ("YYYY-MM-DD" hoặc "YYYY-MM-DDTHH:mm") sang định dạng hiển thị Việt Nam ("dd/mm/yyyy" hoặc "dd/mm/yyyy HH:mm").
 */
export function formatIsoToVietnameseDisplay(iso: string | undefined | null, enableTime = false): string {
  if (!iso || !iso.trim()) return '';
  const trimmed = iso.trim();

  if (enableTime) {
    const [datePart, timePartRaw] = trimmed.split('T');
    if (!datePart) return '';
    const parts = datePart.split('-');
    if (parts.length !== 3) return trimmed;
    const [yyyy, mm, dd] = parts;
    const hhmm = timePartRaw ? timePartRaw.slice(0, 5) : '00:00';
    return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy} ${hhmm}`;
  }

  const cleanDate = trimmed.split('T')[0];
  const parts = cleanDate.split('-');
  if (parts.length !== 3) return trimmed;
  const [yyyy, mm, dd] = parts;
  return `${dd.padStart(2, '0')}/${mm.padStart(2, '0')}/${yyyy}`;
}

/**
 * Kiểm tra tính hợp lệ thực tế của ngày/tháng/năm dương lịch (bao gồm năm nhuận tháng 2)
 * và chuyển từ chuỗi Việt Nam "dd/mm/yyyy" (hoặc "dd/mm/yyyy HH:mm") sang chuẩn ISO cho API.
 */
export function parseVietnameseDisplayToIso(display: string, enableTime = false): string | null {
  const trimmed = display.trim();
  if (!trimmed) return '';

  if (enableTime) {
    const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
    if (!match) return null;
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);

    if (!isValidCalendarDate(day, month, year)) return null;
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!isValidCalendarDate(day, month, year)) return null;

  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

/**
 * Tự động định dạng chuỗi chữ số đang gõ thành khuôn "dd/mm/yyyy" hoặc "dd/mm/yyyy HH:mm".
 */
function applyVietnameseDateMask(rawInput: string, enableTime: boolean): string {
  const digits = rawInput.replace(/\D/g, '');
  const maxDigits = enableTime ? 12 : 8;
  const sliced = digits.slice(0, maxDigits);

  if (sliced.length <= 2) return sliced;
  if (sliced.length <= 4) return `${sliced.slice(0, 2)}/${sliced.slice(2)}`;
  if (sliced.length <= 8) return `${sliced.slice(0, 2)}/${sliced.slice(2, 4)}/${sliced.slice(4)}`;

  // Có thêm giờ phút HH:mm
  const dateStr = `${sliced.slice(0, 2)}/${sliced.slice(2, 4)}/${sliced.slice(4, 8)}`;
  const timeDigits = sliced.slice(8);
  if (timeDigits.length <= 2) return `${dateStr} ${timeDigits}`;
  return `${dateStr} ${timeDigits.slice(0, 2)}:${timeDigits.slice(2, 4)}`;
}

/**
 * Hook xử lý toàn bộ nghiệp vụ cho ô nhập ngày chuẩn Việt Nam (dd/mm/yyyy):
 * - Đồng bộ 2 chiều giữa chuỗi hiển thị tiếng Việt và giá trị ISO chuẩn hệ thống.
 * - Hỗ trợ cả gõ phím có mask tự động lẫn mở popup chọn lịch trực quan.
 */
export function useVietnameseDateInput({
  value,
  onChange,
  enableTime = false,
  min,
  max,
}: UseVietnameseDateInputParams) {
  const [displayText, setDisplayText] = useState<string>(() =>
    formatIsoToVietnameseDisplay(value, enableTime)
  );
  const hiddenPickerRef = useRef<HTMLInputElement | null>(null);

  // Đồng bộ khi prop value bên ngoài thay đổi (VD: người dùng bấm nút Đặt lại bộ lọc hoặc chọn Kỳ nhanh)
  useEffect(() => {
    setDisplayText(formatIsoToVietnameseDisplay(value, enableTime));
  }, [value, enableTime]);

  const isWithinBounds = useCallback(
    (isoCandidate: string): boolean => {
      if (!isoCandidate) return true;
      const cmpVal = enableTime ? isoCandidate : isoCandidate.split('T')[0];
      if (min && cmpVal < min) return false;
      if (max && cmpVal > max) return false;
      return true;
    },
    [min, max, enableTime]
  );

  // Xử lý khi người dùng gõ trực tiếp vào ô text dd/mm/yyyy
  const handleTextChange = useCallback(
    (rawVal: string) => {
      if (!rawVal.trim()) {
        setDisplayText('');
        onChange('');
        return;
      }

      const masked = applyVietnameseDateMask(rawVal, enableTime);
      setDisplayText(masked);

      const expectedLength = enableTime ? 16 : 10;
      if (masked.length === expectedLength) {
        const parsedIso = parseVietnameseDisplayToIso(masked, enableTime);
        if (parsedIso && isWithinBounds(parsedIso)) {
          onChange(parsedIso);
        }
      }
    },
    [enableTime, isWithinBounds, onChange]
  );

  // Khôi phục về giá trị hợp lệ gần nhất nếu người dùng gõ dở dang rồi rời khỏi ô input
  const handleBlur = useCallback(() => {
    if (!displayText.trim()) {
      if (value) onChange('');
      return;
    }
    const parsedIso = parseVietnameseDisplayToIso(displayText, enableTime);
    if (!parsedIso || !isWithinBounds(parsedIso)) {
      setDisplayText(formatIsoToVietnameseDisplay(value, enableTime));
    }
  }, [displayText, enableTime, isWithinBounds, onChange, value]);

  // Mở popup lịch hệ thống khi bấm icon Calendar
  const handleOpenPicker = useCallback(() => {
    const picker = hiddenPickerRef.current;
    if (!picker) return;
    try {
      if (typeof picker.showPicker === 'function') {
        picker.showPicker();
      } else {
        picker.focus();
        picker.click();
      }
    } catch {
      picker.focus();
    }
  }, []);

  // Nhận ngày từ popup lịch và chuyển sang hiển thị dd/mm/yyyy
  const handleNativePickerChange = useCallback(
    (nativeIsoVal: string) => {
      if (!nativeIsoVal) {
        setDisplayText('');
        onChange('');
        return;
      }
      setDisplayText(formatIsoToVietnameseDisplay(nativeIsoVal, enableTime));
      onChange(nativeIsoVal);
    },
    [enableTime, onChange]
  );

  return {
    displayText,
    hiddenPickerRef,
    handleTextChange,
    handleBlur,
    handleOpenPicker,
    handleNativePickerChange,
  };
}
