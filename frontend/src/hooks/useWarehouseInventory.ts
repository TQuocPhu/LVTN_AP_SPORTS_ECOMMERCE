'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  InventoryTransaction,
  InventoryOverviewStats,
  LowStockItem,
  CreateInventoryTransactionRequest,
  InventoryAuditRequest,
  TransactionType,
} from '@/types/inventory';
import { warehouseInventoryController } from '@/controllers/warehouse-inventory-controller';
import { toast } from 'sonner';

export function useWarehouseInventory() {
  const [stats, setStats] = useState<InventoryOverviewStats | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(undefined);
  const [supplierFilter, setSupplierFilter] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fetchOverview = useCallback(async () => {
    try {
      const res = await warehouseInventoryController.getOverviewStats();
      if (res.data) {
        setStats(res.data);
      }
    } catch {
      // Error Toast handled
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warehouseInventoryController.searchTransactions(
        typeFilter,
        supplierFilter,
        keyword.trim() || undefined,
        fromDate || undefined,
        toDate || undefined,
        page,
        pageSize
      );
      if (res.data) {
        setTransactions(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch {
      // Error Toast handled
    } finally {
      setLoading(false);
    }
  }, [typeFilter, supplierFilter, keyword, fromDate, toDate, page, pageSize]);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await warehouseInventoryController.getLowStockVariants(5, 0, 20);
      if (res.data) {
        setLowStockItems(res.data.content || []);
      }
    } catch {
      // Error Toast handled
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchOverview(), fetchTransactions(), fetchLowStock()]);
  }, [fetchOverview, fetchTransactions, fetchLowStock]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleCreateImport = async (data: CreateInventoryTransactionRequest): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createImport(data);
      if (res.data) {
        await refreshAll();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleCreateExport = async (data: CreateInventoryTransactionRequest): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createExport(data);
      if (res.data) {
        await refreshAll();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAdjustStock = async (data: InventoryAuditRequest): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.adjustStock(data);
      if (res.data) {
        await refreshAll();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  return {
    stats,
    transactions,
    lowStockItems,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalElements,
    typeFilter,
    setTypeFilter,
    supplierFilter,
    setSupplierFilter,
    keyword,
    setKeyword,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    refreshAll,
    createImport: handleCreateImport,
    createExport: handleCreateExport,
    adjustStock: handleAdjustStock,
  };
}
