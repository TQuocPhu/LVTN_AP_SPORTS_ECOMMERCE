'use client';

import React from 'react';
import { useWarehouseInventory } from '@/hooks/useWarehouseInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { InventoryOverviewCards } from './InventoryOverviewCards';
import { InventoryTransactionTable } from './InventoryTransactionTable';
import { LowStockAlertsTable } from './LowStockAlertsTable';
import { PendingPackingOrdersTable } from './PendingPackingOrdersTable';
import { usePendingPackingOrders } from '@/hooks/usePendingPackingOrders';
import { CreateImportModal } from './CreateImportModal';
import { CreateExportModal } from './CreateExportModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockTicketPrintModal } from './StockTicketPrintModal';
import { StockTicketDetailsModal } from './StockTicketDetailsModal';
import { AdminExportExcelButton } from '@/components/admin/common/AdminExportExcelButton';
import Link from 'next/link';
import {
  Warehouse,
  ArrowDownLeft,
  Building2,
  AlertTriangle,
  History,
  RotateCcw,
  PackageCheck,
} from 'lucide-react';

/**
 * Giao diện Quản Lý Kho & Kiểm Kê Doanh Nghiệp (Admin/Warehouse Light Mode).
 * Đã ẩn nút Xuất Kho thủ công trên thanh công cụ (luồng xuất kho tự động hóa qua quét Barcode đóng gói)
 * và chuyển toàn bộ state quản lý giao diện về useWarehouseInventory.
 */
export function InventoryPageContentUI() {
  const inventoryHook = useWarehouseInventory();
  const suppliersHook = useSuppliers();
  const packingHook = usePendingPackingOrders();

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Warehouse className="w-8 h-8 text-orange-500" />
            <span>Quản Lý Kho & Kiểm Kê Doanh Nghiệp</span>
          </h1>
          <p className="text-xs text-slate-500">
            Hệ thống quản lý tồn kho thời gian thực, nhập xuất hàng, tính giá vốn bình quân và in phiếu kho tiêu chuẩn
          </p>
        </div>

        {/* Action Buttons (Đã ẩn nút Xuất Kho thủ công theo nghiệp vụ chuẩn) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => inventoryHook.refreshAll()}
            title="Làm mới dữ liệu kho"
            className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <AdminExportExcelButton
            onClick={() => inventoryHook.handleExportTransactionsExcel()}
            isExporting={inventoryHook.isExporting}
            label="Xuất Lịch Sử Kho"
          />

          <Link
            href="/admin/suppliers"
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:text-orange-600 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-orange-500" />
            <span>Nhà Cung Cấp</span>
          </Link>

          {/* Đã ẩn nút Kiểm Kê Kho trên thanh công cụ theo yêu cầu (giữ nguyên StockAdjustmentModal bên dưới) */}

          <button
            onClick={() => inventoryHook.openImportModal()}
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>Nhập Kho</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <InventoryOverviewCards stats={inventoryHook.stats} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => inventoryHook.setActiveTab('transactions')}
          className={`pb-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 cursor-pointer ${
            inventoryHook.activeTab === 'transactions'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật Ký Giao Dịch Kho ({inventoryHook.totalElements})</span>
        </button>

        <button
          onClick={() => inventoryHook.setActiveTab('low-stock')}
          className={`pb-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 relative cursor-pointer ${
            inventoryHook.activeTab === 'low-stock'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Cảnh Báo Tồn Kho Thấp ({inventoryHook.lowStockItems.length})</span>
          {inventoryHook.lowStockItems.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping absolute top-0 right-2" />
          )}
        </button>

        <button
          onClick={() => inventoryHook.setActiveTab('packing')}
          className={`pb-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 relative cursor-pointer ${
            inventoryHook.activeTab === 'packing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>Đóng Gói & Xuất Kho Đơn Hàng ({packingHook.orders.length})</span>
          {packingHook.orders.length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping absolute top-0 right-2" />
          )}
        </button>
      </div>

      {/* Active Tab Content */}
      {inventoryHook.activeTab === 'transactions' ? (
        <InventoryTransactionTable
          transactions={inventoryHook.groupedTickets}
          loading={inventoryHook.loading}
          totalElements={inventoryHook.totalElements}
          page={inventoryHook.page}
          pageSize={inventoryHook.pageSize}
          onPageChange={inventoryHook.setPage}
          typeFilter={inventoryHook.typeFilter}
          onTypeFilterChange={inventoryHook.setTypeFilter}
          supplierFilter={inventoryHook.supplierFilter}
          onSupplierFilterChange={inventoryHook.setSupplierFilter}
          suppliers={suppliersHook.suppliers}
          keyword={inventoryHook.keyword}
          onKeywordChange={inventoryHook.setKeyword}
          fromDate={inventoryHook.fromDate}
          onFromDateChange={inventoryHook.setFromDate}
          toDate={inventoryHook.toDate}
          onToDateChange={inventoryHook.setToDate}
          onOpenDetailsModal={inventoryHook.openDetailsModal}
          onOpenPrintModal={inventoryHook.openPrintModal}
        />
      ) : inventoryHook.activeTab === 'low-stock' ? (
        <LowStockAlertsTable
          items={inventoryHook.lowStockItems}
          onOpenImportModal={(items) => inventoryHook.openImportModal(items)}
        />
      ) : (
        <PendingPackingOrdersTable
          orders={packingHook.orders}
          loading={packingHook.loading}
          selectedOrder={packingHook.selectedOrder}
          onSelectOrder={packingHook.setSelectedOrder}
          onOrderPacked={(updated) => {
            packingHook.handleOrderPacked(updated);
            inventoryHook.refreshAll();
          }}
        />
      )}

      {/* Modals (Giữ nguyên component CreateExportModal bên dưới nhưng nút gọi đã được ẩn theo yêu cầu) */}
      <CreateImportModal
        isOpen={inventoryHook.isImportModalOpen}
        onClose={inventoryHook.closeImportModal}
        onSubmit={inventoryHook.createImport}
        suppliers={suppliersHook.suppliers}
        initialLowStockItems={inventoryHook.importModalLowStockItems}
      />

      <CreateExportModal
        isOpen={inventoryHook.isExportModalOpen}
        onClose={() => inventoryHook.setIsExportModalOpen(false)}
        onSubmit={inventoryHook.createExport}
      />

      <StockAdjustmentModal
        isOpen={inventoryHook.isAdjustModalOpen}
        onClose={() => inventoryHook.setIsAdjustModalOpen(false)}
        onSubmit={inventoryHook.adjustStock}
      />

      <StockTicketDetailsModal
        isOpen={!!inventoryHook.ticketToViewDetails}
        onClose={inventoryHook.closeDetailsModal}
        transaction={inventoryHook.ticketToViewDetails}
        onPrint={inventoryHook.openPrintModal}
      />

      <StockTicketPrintModal
        isOpen={!!inventoryHook.ticketToPrint}
        onClose={inventoryHook.closePrintModal}
        transaction={inventoryHook.ticketToPrint}
      />
    </div>
  );
}
