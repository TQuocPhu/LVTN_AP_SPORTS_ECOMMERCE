'use client';

import { useState, useCallback } from 'react';
import { reportController } from '@/controllers/report-controller';
import {
  ChartDrilldownRequest,
  ReportDrilldownOrder,
  WarehouseDrilldownStock,
  WarehouseDrilldownTransaction,
} from '@/types/report';
import { useExcelExport } from '@/hooks/useExcelExport';
import { downloadStyledExcelWorkbook } from '@/utils/excelExportBuilder';

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
  const { isExporting, runExport } = useExcelExport();

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

  /**
   * Xuất toàn bộ dữ liệu khớp điểm drill-down trên biểu đồ (tối đa 5.000 dòng, bỏ phân trang) ra file Excel (.xlsx).
   */
  const handleExportDrilldownExcel = useCallback(() => {
    if (!activeRequest) return;
    runExport(async () => {
      const dateStr = new Date().toISOString().slice(0, 10);
      if (activeRequest.mode === 'ORDERS') {
        const res = await reportController.getDrilldownOrders(activeRequest, 0, 5000);
        const rows = res.data?.content || [];
        await downloadStyledExcelWorkbook(`Chi_Tiet_Bieu_Do_Don_Hang_${dateStr}.xlsx`, [
          {
            sheetName: 'Don hang chi tiet',
            title: activeRequest.title,
            filterSummary: activeRequest.subtitle,
            columns: [
              { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
              { header: 'Mã đơn hàng', key: 'orderCode', type: 'text' },
              { header: 'Ngày đặt', key: 'createdAt', type: 'datetime' },
              { header: 'Khách hàng', key: 'customerName', type: 'text' },
              { header: 'Số điện thoại', key: 'customerPhone', type: 'text' },
              {
                header: 'Sản phẩm & Biến thể',
                key: 'itemsSummary',
                type: 'text',
                width: 44,
                valueGetter: (o: any) =>
                  (o.items || [])
                    .map((it: any) => `${it.productName} [${it.variantLabel || 'Tiêu chuẩn'}] x${it.quantity}`)
                    .join('; '),
              },
              { header: 'Tổng SL', key: 'totalQuantity', type: 'number' },
              { header: 'Giá trị đơn', key: 'finalAmount', type: 'currency' },
              { header: 'Thanh toán', key: 'paymentMethod', type: 'text' },
              { header: 'Trạng thái', key: 'status', type: 'text' },
            ],
            rows,
          },
        ]);
        return rows.length;
      } else if (activeRequest.mode === 'STOCKS') {
        const res = await reportController.getDrilldownStocks(activeRequest, 0, 5000);
        const rows = res.data?.content || [];
        await downloadStyledExcelWorkbook(`Chi_Tiet_Ton_Kho_${dateStr}.xlsx`, [
          {
            sheetName: 'Ton kho bien the',
            title: activeRequest.title,
            filterSummary: activeRequest.subtitle,
            columns: [
              { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
              { header: 'SKU', key: 'sku', type: 'text' },
              { header: 'Tên sản phẩm', key: 'productName', type: 'text' },
              { header: 'Danh mục', key: 'categoryName', type: 'text' },
              { header: 'Phân loại biến thể', key: 'variantLabel', type: 'text' },
              { header: 'Tồn kho', key: 'stockQuantity', type: 'number' },
              { header: 'Giá vốn', key: 'costPrice', type: 'currency' },
              { header: 'Giá bán', key: 'price', type: 'currency' },
              { header: 'Tổng giá trị vốn', key: 'inventoryValue', type: 'currency' },
              { header: 'Tình trạng', key: 'stockStatus', type: 'text' },
            ],
            rows,
          },
        ]);
        return rows.length;
      } else {
        const res = await reportController.getDrilldownTransactions(activeRequest, 0, 5000);
        const rows = res.data?.content || [];
        await downloadStyledExcelWorkbook(`Chi_Tiet_Phieu_Kho_${dateStr}.xlsx`, [
          {
            sheetName: 'Phieu nhap xuat',
            title: activeRequest.title,
            filterSummary: activeRequest.subtitle,
            columns: [
              { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, i) => i + 1 },
              { header: 'Mã phiếu', key: 'ticketCode', type: 'text' },
              { header: 'Loại', key: 'transactionType', type: 'text' },
              { header: 'SKU', key: 'sku', type: 'text' },
              { header: 'Sản phẩm', key: 'productName', type: 'text' },
              { header: 'Biến thể', key: 'variantLabel', type: 'text' },
              { header: 'Số lượng', key: 'quantity', type: 'number' },
              { header: 'Đơn giá vốn', key: 'unitCost', type: 'currency' },
              { header: 'Thành tiền', key: 'totalAmount', type: 'currency' },
              { header: 'Người tạo', key: 'createdByName', type: 'text' },
              { header: 'Ngày tạo', key: 'createdAt', type: 'datetime' },
            ],
            rows,
          },
        ]);
        return rows.length;
      }
    });
  }, [activeRequest, runExport]);

  return {
    isOpen,
    loading,
    isExporting,
    activeRequest,
    page,
    totalElements,
    totalPages,
    orders,
    stocks,
    transactions,
    openDrilldown,
    handlePageChange,
    handleExportDrilldownExcel,
    closeDrilldown,
  };
}
