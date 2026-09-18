'use client';

import React, { useState } from 'react';
import { useWarehouseInventory } from '@/hooks/useWarehouseInventory';
import { useSuppliers } from '@/hooks/useSuppliers';
import { InventoryOverviewCards } from './InventoryOverviewCards';
import { InventoryTransactionTable } from './InventoryTransactionTable';
import { LowStockAlertsTable } from './LowStockAlertsTable';
import { CreateImportModal } from './CreateImportModal';
import { CreateExportModal } from './CreateExportModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { StockTicketPrintModal } from './StockTicketPrintModal';
import { InventoryTransaction, LowStockItem } from '@/types/inventory';
import Link from 'next/link';
import {
  Warehouse,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Building2,
  AlertTriangle,
  History,
  RotateCcw,
} from 'lucide-react';

export function InventoryPageContentUI() {
  const inventoryHook = useWarehouseInventory();
  const suppliersHook = useSuppliers();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'transactions' | 'low-stock'>('transactions');

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importModalLowStockItems, setImportModalLowStockItems] = useState<LowStockItem[] | undefined>(undefined);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [ticketToPrint, setTicketToPrint] = useState<InventoryTransaction | null>(null);

  const handleOpenImportModal = (initialItems?: LowStockItem[]) => {
    setImportModalLowStockItems(initialItems);
    setIsImportModalOpen(true);
  };

  const handleCreateImportSubmit = async (data: any) => {
    const createdTx = await inventoryHook.createImport(data);
    if (createdTx) {
      setTicketToPrint(createdTx);
    }
    return createdTx;
  };

  const handleCreateExportSubmit = async (data: any) => {
    const createdTx = await inventoryHook.createExport(data);
    if (createdTx) {
      setTicketToPrint(createdTx);
    }
    return createdTx;
  };

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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => inventoryHook.refreshAll()}
            title="Làm mới dữ liệu kho"
            className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            href="/admin/suppliers"
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:text-orange-600 font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-orange-500" />
            <span>Nhà Cung Cấp</span>
          </Link>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-orange-500" />
            <span>Kiểm Kê Kho</span>
          </button>

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
          >
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
            <span>Xuất Kho</span>
          </button>

          <button
            onClick={() => handleOpenImportModal()}
            className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5"
          >
            <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
            <span>Lập Phiếu Nhập Kho</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <InventoryOverviewCards stats={inventoryHook.stats} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'transactions'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Nhật Ký Giao Dịch Kho ({inventoryHook.totalElements})</span>
        </button>

        <button
          onClick={() => setActiveTab('low-stock')}
          className={`pb-3.5 px-4 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 relative ${
            activeTab === 'low-stock'
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
      </div>

      {/* Active Tab Content */}
      {activeTab === 'transactions' ? (
        <InventoryTransactionTable
          transactions={inventoryHook.transactions}
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
          onSelectTicketToPrint={(tx) => setTicketToPrint(tx)}
        />
      ) : (
        <LowStockAlertsTable
          items={inventoryHook.lowStockItems}
          onOpenImportModal={(items) => handleOpenImportModal(items)}
        />
      )}

      {/* Modals */}
      <CreateImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSubmit={handleCreateImportSubmit}
        suppliers={suppliersHook.suppliers}
        initialLowStockItems={importModalLowStockItems}
      />

      <CreateExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onSubmit={handleCreateExportSubmit}
      />

      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onSubmit={inventoryHook.adjustStock}
      />

      <StockTicketPrintModal
        isOpen={!!ticketToPrint}
        onClose={() => setTicketToPrint(null)}
        transaction={ticketToPrint}
      />
    </div>
  );
}
