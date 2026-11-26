'use client';

import { useState, useCallback } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  ChartDrilldownRequest,
  ReportDrilldownOrder,
  WarehouseDrilldownStock,
  WarehouseDrilldownTransaction,
} from '@/types/report';

/**
 * Custom Hook quản lý trạng thái, phân trang và gọi API cho Modal Bảng Thống Kê Chi Tiết
 * khi người dùng bấm vào bất kỳ nút giao / cột / lát cắt nào trên các biểu đồ Báo cáo & Dashboard.
 */
export function useChartDrilldownModal() {
  const [activeRequest, setActiveRequest] = useState<ChartDrilldownRequest | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [page, setPage] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [orders, setOrders] = useState<ReportDrilldownOrder[]>([]);
  const [stocks, setStocks] = useState<WarehouseDrilldownStock[]>([]);
  const [transactions, setTransactions] = useState<WarehouseDrilldownTransaction[]>([]);

  const fetchDrilldownPage = useCallback(
    async (req: ChartDrilldownRequest, targetPage: number) => {
      setLoading(true);
      try {
        if (req.mode === 'ORDERS') {
          const res = await reportController.getDrilldownOrders(req, targetPage, 8);
          if (res.data) {
            setOrders(res.data.content || []);
            setTotalElements(res.data.totalElements || 0);
            setTotalPages(res.data.totalPages || 0);
          }
        } else if (req.mode === 'STOCKS') {
          const res = await reportController.getDrilldownStocks(req, targetPage, 10);
          if (res.data) {
            setStocks(res.data.content || []);
            setTotalElements(res.data.totalElements || 0);
            setTotalPages(res.data.totalPages || 0);
          }
        } else if (req.mode === 'TRANSACTIONS') {
          const res = await reportController.getDrilldownTransactions(req, targetPage, 10);
          if (res.data) {
            setTransactions(res.data.content || []);
            setTotalElements(res.data.totalElements || 0);
            setTotalPages(res.data.totalPages || 0);
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu bảng chi tiết biểu đồ:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const openDrilldown = useCallback(
    (req: ChartDrilldownRequest) => {
      setActiveRequest(req);
      setPage(0);
      setOrders([]);
      setStocks([]);
      setTransactions([]);
      setTotalElements(0);
      setTotalPages(0);
      setIsOpen(true);
      fetchDrilldownPage(req, 0);
    },
    [fetchDrilldownPage]
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      if (!activeRequest) return;
      setPage(nextPage);
      fetchDrilldownPage(activeRequest, nextPage);
    },
    [activeRequest, fetchDrilldownPage]
  );

  const closeDrilldown = useCallback(() => {
    setIsOpen(false);
    setActiveRequest(null);
  }, []);

  return {
    isOpen,
    loading,
    activeRequest,
    page,
    totalElements,
    totalPages,
    orders,
    stocks,
    transactions,
    openDrilldown,
    handlePageChange,
    closeDrilldown,
  };
}
