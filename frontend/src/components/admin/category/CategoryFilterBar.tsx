'use client';

import React from 'react';
import { Search, Plus, Filter, FolderTree, RefreshCw } from 'lucide-react';
import { CategoryResponse } from '@/types/category';

interface CategoryFilterBarProps {
  keyword: string;
  parentId: number | null;
  rootCategories: CategoryResponse[];
  sortBy: string;
  sortDir: string;
  loading: boolean;
  onKeywordChange: (val: string) => void;
  onParentIdChange: (id: number | null) => void;
  onSortChange: (field: string, dir: string) => void;
  onOpenCreateModal: () => void;
  onReload: () => void;
}

export function CategoryFilterBar({
  keyword,
  parentId,
  rootCategories,
  sortBy,
  sortDir,
  loading,
  onKeywordChange,
  onParentIdChange,
  onSortChange,
  onOpenCreateModal,
  onReload,
}: CategoryFilterBarProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên danh mục, slug hoặc mô tả..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Parent Category Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <FolderTree className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <select
              value={parentId === null ? '' : parentId}
              onChange={(e) => {
                const val = e.target.value;
                onParentIdChange(val === '' ? null : Number(val));
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="">Tất cả loại danh mục</option>
              <option value="0">Chỉ danh mục gốc (Cấp 1)</option>
              {rootCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  Danh mục con thuộc: {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={`${sortBy}_${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('_');
                onSortChange(field, dir);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="createdAt_DESC">Mới nhất (Tạo gần đây)</option>
              <option value="createdAt_ASC">Cũ nhất (Tạo sớm nhất)</option>
              <option value="name_ASC">Tên danh mục (A ➔ Z)</option>
              <option value="name_DESC">Tên danh mục (Z ➔ A)</option>
            </select>
          </div>
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={onReload}
            disabled={loading}
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>

          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Thêm Danh Mục Mới
          </button>
        </div>
      </div>
    </div>
  );
}
