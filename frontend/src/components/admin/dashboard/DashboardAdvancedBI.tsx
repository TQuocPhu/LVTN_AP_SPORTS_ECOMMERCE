'use client';

import React from 'react';
import { FootballCategorySalesChart } from './FootballCategorySalesChart';
import { InventoryHealthMatrix } from './InventoryHealthMatrix';
import { FootballTopProduct, InventoryRunoutAnalysis } from '@/types/dashboard';

interface DashboardAdvancedBIProps {
  isAdmin: boolean;
  isStaff: boolean;
  isWarehouse: boolean;
  topFootballProducts?: FootballTopProduct[];
  inventoryRunoutMatrix?: InventoryRunoutAnalysis[];
  loading: boolean;
}

/**
 * Tầng 4 Dashboard: BI Nâng Cao Ngành Bóng Đá & Ma Trận Tồn Kho Runout Days
 * Phân quyền hiển thị theo Role (RBAC):
 * - ADMIN: Xem trọn vẹn cả 2 phân hệ (Top 10 Bóng Đá & Ma Trận Tồn Kho Runout).
 * - WAREHOUSE_MANAGER: Tập trung xem Ma Trận Tồn Kho Runout Days phục vụ nhập hàng.
 * - STAFF: Tập trung xem Top 10 Bóng Đá để tư vấn khách hàng.
 */
export function DashboardAdvancedBI({
  isAdmin,
  isStaff,
  isWarehouse,
  topFootballProducts,
  inventoryRunoutMatrix,
  loading,
}: DashboardAdvancedBIProps) {
  // Nếu là quản lý kho: chỉ hiển thị ma trận tồn kho
  if (isWarehouse) {
    return (
      <div className="space-y-6">
        <InventoryHealthMatrix
          items={inventoryRunoutMatrix}
          loading={loading}
        />
      </div>
    );
  }

  // Nếu là nhân viên tư vấn: chỉ hiển thị phân tích mặt hàng bóng đá
  if (isStaff) {
    return (
      <div className="space-y-6">
        <FootballCategorySalesChart
          products={topFootballProducts}
          loading={loading}
        />
      </div>
    );
  }

  // Nếu là Admin: Hiển thị cả 2 khối phân tích BI mạnh mẽ
  return (
    <div className="space-y-6">
      {/* Phân hệ 1: Top 10 Mặt Hàng Bóng Đá & Tỷ Trọng Thị Phần */}
      <FootballCategorySalesChart
        products={topFootballProducts}
        loading={loading}
      />

      {/* Phân hệ 2: Ma Trận Phân Tích Tồn Kho Runout Days & Đề Xuất Nhập Hàng */}
      <InventoryHealthMatrix
        items={inventoryRunoutMatrix}
        loading={loading}
      />
    </div>
  );
}
