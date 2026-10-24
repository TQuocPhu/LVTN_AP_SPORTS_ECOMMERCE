'use client';

import { Search, X } from 'lucide-react';
import { useNavbarSearchBar } from '@/hooks/useNavbarSearchBar';

interface NavbarSearchBarProps {
  className?: string;
  onSearchSubmit?: () => void;
}

/**
 * Component hiển thị ô tìm kiếm sản phẩm trên thanh điều hướng Navbar.
 * Tuân thủ Layer Architecture: Chỉ render UI thuần, toàn bộ logic nằm trong useNavbarSearchBar.
 */
export default function NavbarSearchBar({
  className,
  onSearchSubmit,
}: NavbarSearchBarProps) {
  const { keyword, setKeyword, handleSearch, handleClear } = useNavbarSearchBar({
    onSearchSubmit,
  });

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex items-center transition-all ${
        className || 'w-full sm:w-56 lg:w-64 xl:w-72'
      }`}
    >
      <div className="ap-searchbar relative w-full flex items-center border focus-within:border-orange-500/70 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-2xl px-4 py-2 transition-all shadow-inner">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 mr-2.5 transition-colors" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm dụng cụ, giày đá bóng,..."
          className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
        />
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 ml-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
