"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  InventoryTransaction,
  InventoryOverviewStats,
  LowStockItem,
  CreateInventoryTransactionRequest,
  InventoryAuditRequest,
  TransactionType,
} from "@/types/inventory";
import { warehouseInventoryController } from "@/controllers/warehouse-inventory-controller";
import { toast } from "sonner";
import { useExcelExport } from "@/hooks/useExcelExport";
import { downloadStyledExcelWorkbook } from "@/utils/excelExportBuilder";

export function useWarehouseInventory() {
  const [stats, setStats] = useState<InventoryOverviewStats | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Pagination
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [typeFilter, setTypeFilter] = useState<TransactionType | undefined>(
    undefined,
  );
  const [supplierFilter, setSupplierFilter] = useState<number | undefined>(
    undefined,
  );
  const [keyword, setKeyword] = useState<string>("");
  // Debounce 400ms cho từ khóa tìm kiếm kho hàng
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  // Quản lý AbortController để hủy request cũ khi thay đổi từ khóa / bộ lọc
  const abortControllerRef = useRef<AbortController | null>(null);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Ticket Print State
  const [ticketToPrint, setTicketToPrint] =
    useState<InventoryTransaction | null>(null);

  // Grouped Tickets calculation (1 row per code)
  const groupedTickets = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const map = new Map<string, InventoryTransaction>();
    const order: string[] = [];

    for (const tx of transactions) {
      const codeKey = tx.code || tx.ticketNumber || `ID-${tx.id}`;
      if (!map.has(codeKey)) {
        order.push(codeKey);
        map.set(codeKey, {
          ...tx,
          items:
            tx.items && tx.items.length > 0 ? (tx.items as any) : [tx as any],
          quantity: tx.quantity || 0,
          totalAmount:
            tx.totalAmount || (tx.unitCost || 0) * (tx.quantity || 0),
        });
      } else {
        const existing = map.get(codeKey)!;
        const currentItems = (existing.items || []) as any[];
        if (!currentItems.some((i: any) => i.id === tx.id)) {
          currentItems.push(tx);
          existing.quantity = (existing.quantity || 0) + (tx.quantity || 0);
          existing.totalAmount =
            (existing.totalAmount || 0) +
            (tx.totalAmount || (tx.unitCost || 0) * (tx.quantity || 0));
          existing.items = currentItems;
        }
      }
    }

    return order.map((key) => map.get(key)!);
  }, [transactions]);

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
    // 1. Hủy request đang bay trước đó để chống Race Condition
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    try {
      const res = await warehouseInventoryController.searchTransactions(
        typeFilter,
        supplierFilter,
        debouncedKeyword.trim() || undefined,
        fromDate || undefined,
        toDate || undefined,
        page,
        pageSize,
        'createdAt',
        'DESC',
        { signal: controller.signal }
      );
      if (res.data) {
        setTransactions(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (err: unknown) {
      if (
        controller.signal.aborted ||
        (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError'))
      ) {
        return; // Bỏ qua lỗi hủy request
      }
      // Error Toast handled
    } finally {
      setLoading(false);
    }
  }, [typeFilter, supplierFilter, debouncedKeyword, fromDate, toDate, page, pageSize]);

  const fetchLowStock = useCallback(async () => {
    try {
      const res = await warehouseInventoryController.getLowStockVariants(
        5,
        0,
        50,
      );
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
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [refreshAll]);

  // Tự động đồng bộ và làm mới Nhật ký giao dịch kho tức thì khi có sự kiện xuất/nhập kho (không cần F5)
  useEffect(() => {
    const handleSync = () => {
      refreshAll();
    };

    window.addEventListener('inventory_updated', handleSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('apsports_inventory');
      bc.onmessage = (event) => {
        if (event.data?.type === 'INVENTORY_UPDATED') {
          refreshAll();
        }
      };
    } catch {
      // Ignore if BroadcastChannel not supported
    }

    // Tự động làm mới khi người dùng quay lại tab quản lý kho
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('inventory_updated', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (bc) {
        bc.close();
      }
    };
  }, [refreshAll]);

  // Ticket Print & Details Modal States

  const [ticketToViewDetails, setTicketToViewDetails] =
    useState<InventoryTransaction | null>(null);

  // Quản lý tab đang mở và các modal trên trang Quản lý kho (đưa toàn bộ useState về Hook chuẩn kiến trúc 7 tầng)
  const [activeTab, setActiveTab] = useState<'transactions' | 'low-stock' | 'packing'>('transactions');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importModalLowStockItems, setImportModalLowStockItems] = useState<LowStockItem[] | undefined>(undefined);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);

  const handleOpenImportModal = useCallback((initialItems?: LowStockItem[]) => {
    setImportModalLowStockItems(initialItems);
    setIsImportModalOpen(true);
  }, []);

  const handleCloseImportModal = useCallback(() => {
    setIsImportModalOpen(false);
  }, []);

  const handleOpenDetailsModal = useCallback(
    async (tx: InventoryTransaction) => {
      try {
        const res = await warehouseInventoryController.getTransactionById(
          tx.id,
        );
        if (res.data) {
          setTicketToViewDetails(res.data);
        } else {
          setTicketToViewDetails(tx);
        }
      } catch {
        setTicketToViewDetails(tx);
      }
    },
    [],
  );

  const handleCloseDetailsModal = useCallback(() => {
    setTicketToViewDetails(null);
  }, []);

  const handleOpenPrintModal = useCallback(async (tx: InventoryTransaction) => {
    try {
      const res = await warehouseInventoryController.getTransactionById(tx.id);
      if (res.data) {
        setTicketToPrint(res.data);
      } else {
        setTicketToPrint(tx);
      }
    } catch {
      setTicketToPrint(tx);
    }
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setTicketToPrint(null);
  }, []);

  const notifyInventorySync = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('inventory_updated'));
      try {
        const bc = new BroadcastChannel('apsports_inventory');
        bc.postMessage({ type: 'INVENTORY_UPDATED' });
        bc.close();
      } catch {
        // Ignore if BroadcastChannel not supported
      }
    }
  };

  const handleCreateImport = async (
    data: CreateInventoryTransactionRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createImport(data);
      if (res.data) {
        setTicketToPrint(res.data);
        setPage(0);
        await refreshAll();
        notifyInventorySync();
        return res.data;
      }
      return null;
    } catch (err: any) {
      console.error('Lỗi khi lập phiếu nhập kho:', err);
      return null;
    }
  };

  const handleCreateExport = async (
    data: CreateInventoryTransactionRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createExport(data);
      if (res.data) {
        setTicketToPrint(res.data);
        setPage(0);
        await refreshAll();
        notifyInventorySync();
        return res.data;
      }
      return null;
    } catch (err: any) {
      console.error('Lỗi khi lập phiếu xuất kho:', err);
      return null;
    }
  };

  const handleAdjustStock = async (
    data: InventoryAuditRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.adjustStock(data);
      if (res.data) {
        setTicketToPrint(res.data);
        await refreshAll();
        notifyInventorySync();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const { isExporting, runExport } = useExcelExport();

  /**
   * Xuất toàn bộ lịch sử giao dịch kho khớp bộ lọc hiện tại (không phân trang, tối đa 5.000 dòng) ra file Excel (.xlsx).
   */
  const handleExportTransactionsExcel = useCallback(() => {
    runExport(async () => {
      const res = await warehouseInventoryController.exportTransactions(
        typeFilter,
        supplierFilter,
        keyword || undefined,
        fromDate || undefined,
        toDate || undefined
      );
      const rows = res.data || [];
      const dateStr = new Date().toISOString().slice(0, 10);
      await downloadStyledExcelWorkbook(`Lich_Su_Giao_Dich_Kho_${dateStr}.xlsx`, [
        {
          sheetName: 'Giao dich kho',
          title: 'LỊCH SỬ GIAO DỊCH NHẬP - XUẤT - KIỂM KÊ KHO',
          filterSummary: `Loại: ${typeFilter || 'Tất cả'} | Từ: ${fromDate || '---'} đến ${toDate || '---'}`,
          columns: [
            { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
            { header: 'Mã phiếu', key: 'ticketNumber', type: 'text', valueGetter: (t: any) => t.ticketNumber || t.code || `TX-${t.id}` },
            { header: 'Loại phiếu', key: 'type', type: 'text' },
            { header: 'Ngày tạo', key: 'createdAt', type: 'datetime' },
            { header: 'Người thực hiện', key: 'createdByUserName', type: 'text', valueGetter: (t: any) => t.createdByUserName || '' },
            { header: 'Nhà cung cấp', key: 'supplierName', type: 'text', valueGetter: (t: any) => t.supplierName || '' },
            {
              header: 'Chi tiết biến thể & SL',
              key: 'itemsSummary',
              type: 'text',
              width: 42,
              valueGetter: (t: any) =>
                t.items && t.items.length > 0
                  ? t.items.map((i: any) => `${i.variantSku || i.productName} x${i.quantity}`).join('; ')
                  : `${t.variantSku || t.productName || ''} x${t.quantity || 0}`,
            },
            { header: 'Tổng SL', key: 'quantity', type: 'number' },
            { header: 'Tổng giá trị', key: 'totalAmount', type: 'currency' },
            { header: 'Ghi chú', key: 'note', type: 'text', valueGetter: (t: any) => t.note || '' },
          ],
          rows,
        },
      ]);
      return rows.length;
    });
  }, [typeFilter, supplierFilter, keyword, fromDate, toDate, runExport]);

  return {
    stats,
    transactions,
    groupedTickets,
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
    ticketToPrint,
    openPrintModal: handleOpenPrintModal,
    closePrintModal: handleClosePrintModal,
    ticketToViewDetails,
    openDetailsModal: handleOpenDetailsModal,
    closeDetailsModal: handleCloseDetailsModal,
    getTicketSummary,
    refreshAll,
    createImport: handleCreateImport,
    createExport: handleCreateExport,
    adjustStock: handleAdjustStock,
    activeTab,
    setActiveTab,
    isImportModalOpen,
    openImportModal: handleOpenImportModal,
    closeImportModal: handleCloseImportModal,
    importModalLowStockItems,
    isExportModalOpen,
    setIsExportModalOpen,
    isAdjustModalOpen,
    setIsAdjustModalOpen,
    isExporting,
    handleExportTransactionsExcel,
  };
}

export function getTicketSummary(tx: InventoryTransaction | null) {
  if (!tx) {
    return {
      ticketTitle: "",
      formattedDate: "",
      itemsToRender: [],
      totalTicketValue: 0,
      formattedTotalTicketValue: "0 ₫",
      totalTicketQty: 0,
    };
  }

  const isImport = tx.type === "IMPORT";
  const isExport = tx.type === "EXPORT";
  const ticketTitle = isImport
    ? "PHIẾU NHẬP KHO THÀNH PHẨM"
    : isExport
      ? "PHIẾU XUẤT KHO THÀNH PHẨM"
      : "PHIẾU KIỂM KÊ ĐIỀU CHỈNH TỒN KHO";

  const formattedDate = new Date(tx.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val || 0);

  const rawItems =
    tx.items && tx.items.length > 0
      ? tx.items
      : [
          {
            variantId: tx.variantId,
            variantSku: tx.variantSku || "SKU",
            productName: tx.productName || "Sản phẩm",
            variantSize: tx.variantSize,
            variantColor: tx.variantColor,
            quantity: tx.quantity,
            unitCost: tx.unitCost || 0,
            totalAmount:
              tx.totalAmount || (tx.unitCost || 0) * (tx.quantity || 0),
          },
        ];

  const itemsToRender = rawItems.map((item: any) => ({
    variantId: item.variantId || item.id || tx.variantId,
    variantSku: item.variantSku || "SKU",
    productName: item.productName || "Sản phẩm",
    variantSize: item.variantSize,
    variantColor: item.color || item.variantColor,
    quantity: item.quantity || 0,
    unitCost: item.unitCost || 0,
    totalAmount:
      item.totalAmount || (item.unitCost || 0) * (item.quantity || 0),
    formattedUnitCost: formatCurrency(item.unitCost),
    formattedTotalAmount: formatCurrency(
      item.totalAmount || (item.unitCost || 0) * (item.quantity || 0),
    ),
  }));

  const totalTicketValue = rawItems.reduce(
    (sum: number, item: any) =>
      sum + (item.totalAmount || (item.unitCost || 0) * (item.quantity || 0)),
    0,
  );
  const totalTicketQty = rawItems.reduce(
    (sum: number, item: any) => sum + (item.quantity || 0),
    0,
  );

  return {
    ticketTitle,
    formattedDate,
    itemsToRender,
    totalTicketValue,
    formattedTotalTicketValue: formatCurrency(totalTicketValue),
    totalTicketQty,
  };
}
