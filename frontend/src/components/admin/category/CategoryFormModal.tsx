'use client';

import React from 'react';
import { X, FolderPlus, AlertCircle, Info } from 'lucide-react';
import { CategoryResponse } from '@/types/category';
import { ProductImageUpload } from '@/components/admin/product/ProductImageUpload';
import { useCategoryForm } from '@/hooks/useCategoryForm';

interface CategoryFormModalProps {
  isOpen: boolean;
  editingCategory: CategoryResponse | null;
  presetParentId?: number | null;
  rootCategories: CategoryResponse[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryFormModal({
  isOpen,
  editingCategory,
  presetParentId,
  rootCategories,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const {
    isEdit,
    name,
    setName,
    slug,
    description,
    setDescription,
    image,
    setImage,
    parentId,
    setParentId,
    submitting,
    errors,
    handleSubmit,
  } = useCategoryForm({ editingCategory, presetParentId, onSuccess, onClose });

  if (!isOpen) return null;

  const isRootCategory = parentId === null;

  // Flatten available parent categories: ONLY Level 1 and Level 2 can be parent (Level 3 is max depth)
  const getParentOptions = () => {
    const options: { id: number; label: string; level: number }[] = [];

    rootCategories.forEach((root) => {
      // Exclude current category when editing
      if (editingCategory && root.id === editingCategory.id) return;

      options.push({
        id: root.id,
        label: `📂 Cấp 1 (Gốc): ${root.name}`,
        level: 1,
      });

      // Add Level 2 children if available (which can be parents of Level 3)
      if (root.children && root.children.length > 0) {
        root.children.forEach((child) => {
          if (editingCategory && child.id === editingCategory.id) return;
          options.push({
            id: child.id,
            label: `    └─ 📁 Cấp 2: ${child.name} (Thuộc ${root.name})`,
            level: 2,
          });
        });
      }
    });

    return options;
  };

  const parentOptions = getParentOptions();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
              <FolderPlus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {isEdit ? 'Chỉnh Sửa Danh Mục Sản Phẩm' : 'Thêm Danh Mục Sản Phẩm Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit
                  ? `Cập nhật thông tin cho danh mục #${editingCategory?.id}`
                  : 'Phân cấp tối đa 3 cấp (Gốc Cấp 1 ➔ Cấp 2 ➔ Cấp 3)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Type / Parent Select */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Cấp danh mục (Chọn danh mục cha)
            </label>
            <select
              value={parentId === null ? '' : parentId}
              onChange={(e) => {
                const val = e.target.value;
                setParentId(val === '' ? null : Number(val));
              }}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
            >
              <option value="">📂 Danh mục gốc (Cấp 1 - Có hình ảnh đại diện)</option>
              {parentOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              * Hệ thống hỗ trợ tối đa 3 cấp. Danh mục Cấp 3 không thể tạo thêm con.
            </p>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Tên danh mục <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Giày Bóng Đá, Vợt Cầu Lông..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {errors.name && (
              <p className="text-xs font-semibold text-rose-500 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
              </p>
            )}
          </div>

          {/* Slug (Read-only / Disabled) */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Đường dẫn tĩnh (Slug SEO)
            </label>
            <input
              type="text"
              disabled
              readOnly
              placeholder="Tự động khởi tạo từ tên danh mục..."
              value={slug}
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed select-none opacity-80"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Mô tả ngắn danh mục
            </label>
            <textarea
              rows={3}
              placeholder="Nhập mô tả giới thiệu về nhóm sản phẩm này..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>

          {/* Category Image Upload (ONLY for Root Category parentId === null) */}
          {isRootCategory ? (
            <div className="pt-2 border-t border-slate-100">
              <ProductImageUpload
                label="Hình ảnh đại diện danh mục gốc Cấp 1 (Tải ảnh từ máy tính)"
                value={image}
                onChange={setImage}
              />
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-800">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-0.5">Quy tắc hình ảnh danh mục:</strong>
                Hình ảnh đại diện chỉ áp dụng cho <strong>Danh mục gốc (Cấp 1)</strong> để hiển thị trên Banner / Mega Menu. Danh mục con tự động kế thừa và không cần thêm ảnh riêng.
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 hover:shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {submitting
                ? 'Đang lưu...'
                : isEdit
                ? 'Cập nhật danh mục'
                : 'Tạo mới danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
