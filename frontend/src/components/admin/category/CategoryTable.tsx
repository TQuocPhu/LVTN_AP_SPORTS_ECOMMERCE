'use client';

import React from 'react';
import { CategoryResponse } from '@/types/category';
import {
  FolderOpen,
  Folder,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface CategoryTableProps {
  categories: CategoryResponse[];
  loading: boolean;
  actionLoading: boolean;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
  onAddSubcategory: (parentId: number) => void;
}

export function CategoryTable({
  categories,
  loading,
  actionLoading,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryTableProps) {
  if (loading) {
    return (
      <div className="border border-slate-200 rounded-2xl p-14 text-center bg-white text-slate-400 shadow-sm">
        <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-orange-500" />
        <span className="text-sm font-semibold">Đang tải cây phân cấp danh mục sản phẩm...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="border border-slate-200 rounded-2xl p-14 text-center bg-white text-slate-400 shadow-sm text-sm font-medium">
        Không tìm thấy danh mục nào phù hợp với bộ lọc.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm space-y-0.5">
      {/* Table Header */}
      <div className="bg-slate-100/80 px-6 py-4 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
        <div className="flex-1 min-w-[280px]">Cấu Trúc Cây Phân Cấp Danh Mục (Tối Đa 3 Cấp)</div>
        <div className="w-36 text-center">Cấp Phân Loại</div>
        <div className="w-72 text-left pl-4">Mô Tả Danh Mục</div>
        <div className="w-60 text-right">Thao Tác Quản Lý</div>
      </div>

      {/* Tree Content List */}
      <div className="divide-y divide-slate-100">
        {categories.map((rootCategory) => (
          <CategoryTreeNode
            key={rootCategory.id}
            category={rootCategory}
            level={1}
            expandedIds={expandedIds}
            actionLoading={actionLoading}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddSubcategory={onAddSubcategory}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryTreeNodeProps {
  category: CategoryResponse;
  level: number; // 1, 2, or 3
  expandedIds: Set<number>;
  actionLoading: boolean;
  onToggleExpand: (id: number) => void;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
  onAddSubcategory: (parentId: number) => void;
}

function CategoryTreeNode({
  category,
  level,
  expandedIds,
  actionLoading,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddSubcategory,
}: CategoryTreeNodeProps) {
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedIds.has(category.id);

  // Indentation and Tree styling according to level
  const levelIndentClasses =
    level === 1
      ? 'pl-6 bg-white'
      : level === 2
      ? 'pl-12 bg-slate-50/60 border-l-2 border-orange-200/80 ml-6'
      : 'pl-16 bg-slate-100/50 border-l-2 border-purple-200 ml-12';

  return (
    <div className="transition-colors">
      {/* Node Row Card */}
      <div
        className={`flex items-center justify-between py-4 pr-6 ${levelIndentClasses} hover:bg-slate-50 group border-b border-slate-100`}
      >
        {/* Left Side: Icon, Expand Toggle, Name & Slug */}
        <div className="flex items-center gap-3.5 flex-1 min-w-[280px] pr-4">
          {/* Expand/Collapse Toggle Button (only if has children) */}
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(category.id)}
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-orange-600 stroke-[2.5]" />
              ) : (
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>
          ) : (
            <div className="w-7 flex-shrink-0" />
          )}

          {/* Level Icon / Image */}
          {level === 1 ? (
            category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 object-cover rounded-xl border border-slate-200 shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center border border-orange-200/60 flex-shrink-0">
                <FolderOpen className="w-6 h-6" />
              </div>
            )
          ) : level === 2 ? (
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200/60 flex-shrink-0">
              <Folder className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center border border-purple-200/60 flex-shrink-0">
              <Tag className="w-4 h-4" />
            </div>
          )}

          {/* Name & Slug */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors break-words ${
                  level === 1 ? 'text-base' : level === 2 ? 'text-sm' : 'text-sm font-bold'
                }`}
              >
                {category.name}
              </span>
              {hasChildren && (
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex-shrink-0">
                  {category.children.length} danh mục con
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-mono block break-all pt-0.5">
              /{category.slug}
            </span>
          </div>
        </div>

        {/* Center: Level Badge */}
        <div className="w-36 text-center flex-shrink-0">
          {level === 1 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200/80">
              <FolderOpen className="w-3.5 h-3.5 text-orange-500" /> Cấp 1 (Gốc)
            </span>
          ) : level === 2 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200/80">
              <Folder className="w-3.5 h-3.5 text-blue-500" /> Cấp 2
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200/80">
              <Tag className="w-3.5 h-3.5 text-purple-500" /> Cấp 3 (Cấp cuối)
            </span>
          )}
        </div>

        {/* Dedicated Description Column */}
        <div className="w-72 text-left pl-4 pr-3 flex-shrink-0">
          {category.description ? (
            <p className="text-xs font-medium text-slate-700 break-words line-clamp-2 leading-relaxed" title={category.description}>
              {category.description}
            </p>
          ) : (
            <span className="text-xs text-slate-400 italic">Chưa có mô tả</span>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="w-60 text-right flex items-center justify-end gap-2 flex-shrink-0">
          {/* Add Subcategory Quick Button (Only for Level 1 and Level 2, disabled/hidden for Level 3) */}
          {level < 3 ? (
            <button
              onClick={() => onAddSubcategory(category.id)}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg border border-orange-200/80 transition-colors cursor-pointer"
              title={`Thêm danh mục Cấp ${level + 1} vào "${category.name}"`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> Thêm Cấp {level + 1}
            </button>
          ) : (
            <span className="text-xs text-slate-400 italic px-2">Cấp tối đa</span>
          )}

          {/* Edit Button */}
          <button
            onClick={() => onEdit(category)}
            disabled={actionLoading}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Chỉnh sửa danh mục"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(category)}
            disabled={actionLoading}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Xóa danh mục"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Render Subcategories Recursively if Expanded */}
      {hasChildren && isExpanded && (
        <div className="animate-in fade-in duration-150">
          {category.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              expandedIds={expandedIds}
              actionLoading={actionLoading}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubcategory={onAddSubcategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
