"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
    setLoading(true);
    try {
      const res = await warehouseInventoryController.searchTransactions(
        typeFilter,
        supplierFilter,
        keyword.trim() || undefined,
        fromDate || undefined,
        toDate || undefined,
        page,
        pageSize,
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
      const res = await warehouseInventoryController.getLowStockVariants(
        5,
        0,
        20,
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
  }, [refreshAll]);

  // Ticket Print & Details Modal States

  const [ticketToViewDetails, setTicketToViewDetails] =
    useState<InventoryTransaction | null>(null);

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

  const handleCreateImport = async (
    data: CreateInventoryTransactionRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createImport(data);
      if (res.data) {
        // toast.success(`Tạo phiếu nhập kho [${res.data.code || 'MỚI'}] thành công!`);
        setTicketToPrint(res.data);
        await refreshAll();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleCreateExport = async (
    data: CreateInventoryTransactionRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.createExport(data);
      if (res.data) {
        // toast.success(`Tạo phiếu xuất kho [${res.data.code || 'MỚI'}] thành công!`);
        setTicketToPrint(res.data);
        await refreshAll();
        return res.data;
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleAdjustStock = async (
    data: InventoryAuditRequest,
  ): Promise<InventoryTransaction | null> => {
    try {
      const res = await warehouseInventoryController.adjustStock(data);
      if (res.data) {
        // toast.success('Cập nhật kiểm kê điều chỉnh tồn kho thành công!');
        setTicketToPrint(res.data);
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
