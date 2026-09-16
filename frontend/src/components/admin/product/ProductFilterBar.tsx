'use client';

import React from 'react';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';
import { ProductFilterParams } from '@/types/product';
import { CategoryResponse } from '@/types/category';

interface ProductFilterBarProps {
  filters: ProductFilterParams;
  categoryTree: CategoryResponse[];
  loading: boolean;
  onUpdateFilters: (newFilters: Partial<ProductFilterParams>) => void;
  onRefresh: () => void;
}

export function ProductFilterBar({
  filters,
  categoryTree,
  loading,
  onUpdateFilters,
  onRefresh,
}: ProductFilterBarProps) {
  // Combine sortBy and sortDir for dropdown selection
  const currentSortValue = `${filters.sortBy || 'createdAt'}_${filters.sortDir || 'DESC'}`;

  const handleSortChange = (value: string) => {
    const [sortBy, sortDir] = value.split('_');
    onUpdateFilters({ sortBy, sortDir });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, slug hoặc mã SKU..."
            value={filters.keyword || ''}
            onChange={(e) => onUpdateFilters({ keyword: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative md:col-span-3">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.categoryId || ''}
            onChange={(e) =>
              onUpdateFilters({ categoryId: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categoryTree.map((cat) => (
              <React.Fragment key={cat.id}>
                <option value={cat.id} className="font-bold">
                  {cat.name}
                </option>
                {cat.children?.map((child: CategoryResponse) => (
                  <option key={child.id} value={child.id}>
                    &nbsp;&nbsp;-- {child.name}
                  </option>
                ))}
              </React.Fragment>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative md:col-span-2">
          <SlidersHorizontal className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.status || ''}
            onChange={(e) => onUpdateFilters({ status: e.target.value || undefined })}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="in_stock">Đang kinh doanh</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="discontinued">Ngừng kinh doanh</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div className="relative md:col-span-3">
          <ArrowUpDown className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={currentSortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all appearance-none cursor-pointer font-medium"
          >
            <option value="createdAt_DESC">Mới nhất (Mặc định)</option>
            <option value="createdAt_ASC">Cũ nhất (Tạo sớm nhất)</option>
            <option value="price_DESC">Giá giảm dần (Cao ➔ Thấp)</option>
            <option value="price_ASC">Giá tăng dần (Thấp ➔ Cao)</option>
            <option value="name_ASC">Tên sản phẩm (A ➔ Z)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
