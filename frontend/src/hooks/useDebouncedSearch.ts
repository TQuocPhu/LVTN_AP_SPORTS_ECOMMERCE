'use client';

import { useState, useEffect } from 'react';

/**
 * Custom Hook chuẩn hóa quản lý ô tìm kiếm có Debounce.
 *
 * - `keyword`: Giá trị chuỗi tức thời liên kết 2 chiều với Input UI (gõ không bị trễ, cực kỳ mượt mà).
 * - `debouncedKeyword`: Giá trị chỉ được cập nhật sau khi người dùng ngừng gõ sau `delay` mili-giây (mặc định 400ms).
 *   Dùng để đưa vào dependency của useEffect fetch dữ liệu từ Backend nhằm tránh spam API.
 * - `setKeyword`: Hàm cập nhật từ khóa từ onChange của Input.
 * - `clearKeyword`: Hàm xóa rỗng từ khóa tìm kiếm.
 */
export function useDebouncedSearch(initialValue: string = '', delay: number = 400) {
  const [keyword, setKeyword] = useState<string>(initialValue);
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [keyword, delay]);

  return {
    keyword,
    debouncedKeyword,
    setKeyword,
    clearKeyword: () => setKeyword(''),
  };
}
