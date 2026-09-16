'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CategoryResponse } from '@/types/category';
import { Search, X, Check, ChevronDown, FolderTree } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCategorySelectProps {
  categoryTree: CategoryResponse[];
  selectedCategoryIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}

export interface FlattenedCategory {
  id: number;
  name: string;
  path: string;
  parentId?: number | null;
  isParent: boolean;
}

export function ProductCategorySelect({
  categoryTree,
  selectedCategoryIds,
  onChange,
  error,
}: ProductCategorySelectProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Flatten categories hierarchy into searchable list with breadcrumb paths
  const flattenedCategories = useMemo<FlattenedCategory[]>(() => {
    const result: FlattenedCategory[] = [];

    const traverse = (items: CategoryResponse[], parentPath = '') => {
      items.forEach((item) => {
        const path = parentPath ? `${parentPath} > ${item.name}` : item.name;
        const hasChildren = !!(item.children && item.children.length > 0);

        result.push({
          id: item.id,
          name: item.name,
          path,
          parentId: item.parentId,
          isParent: hasChildren,
        });

        if (hasChildren) {
          traverse(item.children!, path);
        }
      });
    };

    traverse(categoryTree);
    return result;
  }, [categoryTree]);

  // Filter categories dynamically based on typed search query ("nhập tới đâu hiện tới đó")
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return flattenedCategories;
    const query = searchQuery.toLowerCase().trim();
    return flattenedCategories.filter((cat) =>
      cat.path.toLowerCase().includes(query) || cat.name.toLowerCase().includes(query)
    );
  }, [flattenedCategories, searchQuery]);

  const handleSelectCategory = (cat: FlattenedCategory) => {
    const isSelected = selectedCategoryIds.includes(cat.id);

    if (isSelected) {
      onChange(selectedCategoryIds.filter((id) => id !== cat.id));
      return;
    }

    // Rule: If user selects a parent category when its child is already selected -> Block & Warn
    const isParentOfAnySelected = flattenedCategories.some(
      (child) => child.parentId === cat.id && selectedCategoryIds.includes(child.id)
    );
    if (isParentOfAnySelected) {
      toast.error(`Không thể chọn danh mục cha '${cat.name}' vì bạn đã chọn danh mục con của nó.`);
      return;
    }

    // Rule: If user selects a child category, suppress its parent if parent was selected
    let nextSelected = [...selectedCategoryIds];
    if (cat.parentId && nextSelected.includes(cat.parentId)) {
      nextSelected = nextSelected.filter((id) => id !== cat.parentId);
      toast.success(`Đã chuyển sang danh mục con '${cat.name}'.`);
    }

    nextSelected.push(cat.id);
    onChange(nextSelected);
    setSearchQuery('');
  };

  const handleRemoveBadge = (id: number) => {
    onChange(selectedCategoryIds.filter((item) => item !== id));
  };

  return (
    <div ref={containerRef} className="space-y-2 relative">
      {/* Selected Categories Badges list */}
      {selectedCategoryIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          {selectedCategoryIds.map((id) => {
            const item = flattenedCategories.find((c) => c.id === id);
            if (!item) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500 text-white text-sm font-semibold rounded-full shadow-sm"
              >
                {item.path}
                <button
                  type="button"
                  onClick={() => handleRemoveBadge(id)}
                  className="hover:bg-black/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Dynamic Dropdown Search Combobox ("nhập tới đâu hiện tới đó") */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Nhập tên danh mục để tìm kiếm và chọn (VD: Giày bóng đá, Vợt cầu lông)..."
            value={searchQuery}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
          <ChevronDown
            onClick={() => setIsOpen(!isOpen)}
            className={`w-5 h-5 absolute right-3.5 text-slate-400 cursor-pointer transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Options List */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {filteredCategories.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400 italic">
                Không tìm thấy danh mục nào phù hợp với từ khóa "{searchQuery}"
              </div>
            ) : (
              filteredCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className={`p-3.5 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-orange-50 text-orange-600 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree className={`w-4 h-4 ${isSelected ? 'text-orange-500' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium">{cat.path}</span>
                    </div>

                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Đã chọn
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-rose-500 mt-1">{error}</p>}
    </div>
  );
}
