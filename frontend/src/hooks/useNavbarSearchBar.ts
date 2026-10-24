'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseNavbarSearchBarProps {
  onSearchSubmit?: () => void;
}

/**
 * Custom Hook quản lý trạng thái nhập liệu và điều hướng tìm kiếm trên Navbar.
 * Tuân thủ quy chuẩn Layer Architecture (Component -> Hook -> Controller -> Service).
 */
export function useNavbarSearchBar({ onSearchSubmit }: UseNavbarSearchBarProps = {}) {
  const [keyword, setKeyword] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim();
    if (!query) {
      return;
    }
    if (query.length < 2) {
      return;
    }
    router.push(`/search?keyword=${encodeURIComponent(query)}`);
    if (onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const handleClear = () => {
    setKeyword('');
  };

  return {
    keyword,
    setKeyword,
    handleSearch,
    handleClear,
  };
}
