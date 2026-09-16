'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, X, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface ProductImageUploadProps {
  // Single image mode
  value?: string;
  onChange?: (value: string) => void;

  // Multiple image mode
  images?: string[];
  onImagesChange?: (urls: string[]) => void;
  multiple?: boolean;

  label?: string;
  compact?: boolean;
}

export function ProductImageUpload({
  value,
  onChange,
  images = [],
  onImagesChange,
  multiple = false,
  label,
  compact = false,
}: ProductImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Tệp không phải là hình ảnh'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Kích thước ảnh vượt quá 10MB'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  };

  const handleFilesSelect = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    const validDataUrls: string[] = [];

    for (const file of filesArray) {
      try {
        const url = await readFileAsDataUrl(file);
        if (url) validDataUrls.push(url);
      } catch (err: any) {
        toast.error(err.message || 'Lỗi đọc tệp ảnh');
      }
    }

    if (validDataUrls.length > 0) {
      if (multiple && onImagesChange) {
        onImagesChange([...images, ...validDataUrls]);
        toast.success(`Đã thêm ${validDataUrls.length} hình ảnh!`);
      } else if (onChange) {
        onChange(validDataUrls[0]);
        toast.success('Đã chọn hình ảnh thành công!');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelect(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleRemoveSingle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveMultiIndex = (index: number) => {
    if (onImagesChange) {
      const next = images.filter((_, i) => i !== index);
      onImagesChange(next);
    }
  };

  // Compact Mode (used in table cells)
  if (compact) {
    if (multiple) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          {images.map((imgUrl, i) => (
            <div key={i} className="relative group w-11 h-11 flex-shrink-0">
              <img
                src={imgUrl}
                alt={`Variant img ${i}`}
                className="w-11 h-11 object-cover rounded-lg border border-slate-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveMultiIndex(i)}
                className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Xóa ảnh này"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-2 bg-slate-50 hover:bg-orange-50 border border-dashed border-slate-300 hover:border-orange-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-orange-600 flex items-center justify-center gap-1 transition-all shadow-sm"
            title="Thêm ảnh cho biến thể này"
          >
            <Plus className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Thêm ảnh ({images.length})</span>
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        {value ? (
          <div className="relative group w-11 h-11 flex-shrink-0">
            <img
              src={value}
              alt="Variant Preview"
              className="w-11 h-11 object-cover rounded-lg border border-slate-200"
            />
            <button
              type="button"
              onClick={handleRemoveSingle}
              className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Xóa ảnh"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-32 py-2 px-2.5 bg-slate-50 hover:bg-orange-50 border border-dashed border-slate-300 hover:border-orange-500 rounded-lg text-xs font-semibold text-slate-700 hover:text-orange-600 flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-orange-500" /> Chọn Tệp Ảnh
          </button>
        )}
      </div>
    );
  }

  // Full Mode (Main Product Image Upload)
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group w-full max-w-md p-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
          <img
            src={value}
            alt="Product Main Preview"
            className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-inner"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 line-clamp-1">Tệp ảnh đã được tải lên</p>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Sẵn sàng lưu sản phẩm</p>
            <div className="flex gap-3 mt-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                Đổi ảnh khác
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleRemoveSingle}
                className="text-sm font-semibold text-rose-600 hover:underline"
              >
                Xóa ảnh
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-orange-500 bg-orange-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-orange-400 bg-slate-50/60 hover:bg-orange-50/20'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-800">
            Nhấp để chọn tệp ảnh hoặc kéo thả tệp vào đây
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Hỗ trợ chọn nhiều tệp cùng lúc (.PNG, .JPG, .WEBP - tối đa 10MB/tệp)
          </p>
        </div>
      )}
    </div>
  );
}
