"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { toast } from "sonner";

export default function NavbarSearchBar() {
  const [keyword, setKeyword] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = keyword.trim();
    if (!query) {
      toast.error("Vui lòng nhập từ khóa để tìm kiếm sản phẩm.");
      return;
    }
    if (query.length < 2) {
      toast.error("Từ khóa tìm kiếm phải có ít nhất 2 ký tự.");
      return;
    }
    router.push(`/search?keyword=${encodeURIComponent(query)}`);
  };

  const handleClear = () => {
    setKeyword("");
  };

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex items-center w-64 sm:w-80 lg:w-[380px] xl:w-[440px] transition-all"
    >
      <div className="ap-searchbar relative w-full flex items-center border focus-within:border-orange-500/70 focus-within:ring-2 focus-within:ring-orange-500/20 rounded-2xl px-4 py-2 transition-all shadow-inner">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0 mr-2.5 transition-colors" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm dụng cụ, giày đá bóng, vợt cầu lông..."
          className="w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none"
        />
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shrink-0 ml-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
