'use client';

import React from 'react';
import { AdminCategoriesContentUI } from '@/components/admin/category/AdminCategoriesContentUI';

/**
 * Trang Quản lý Danh mục Sản phẩm dành cho Quản trị viên (/admin/categories).
 * Tuân thủ nghiêm ngặt kiến trúc Layer Architecture:
 * - Tầng Page chỉ gọi Component giao diện chính (`AdminCategoriesContentUI`), không chứa state hay logic nghiệp vụ.
 */
export default function AdminCategoriesPage() {
  return <AdminCategoriesContentUI />;
}
