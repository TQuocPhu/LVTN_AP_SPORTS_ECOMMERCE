import {
  FinancialReconciliationResponse,
  ReportTabType,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TimeRangePreset,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
} from '@/types/report';
import { AdminOrderDetail } from '@/types/admin-order';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { downloadStyledExcelWorkbook, ExcelSheetConfig } from '@/utils/excelExportBuilder';

export interface EnterpriseReportExportParams {
  activeTab: ReportTabType;
  timeRange: TimeRangePreset;
  startDate?: string;
  endDate?: string;
  overviewData: RevenueOverviewReportResponse | null;
  staffPerformance: StaffPerformanceReportResponse[];
  warehouseData: WarehouseReportResponse | null;
  merchandiseData: TopMerchandiseReportResponse | null;
  reconciliationData?: FinancialReconciliationResponse | null;
  currentUserName?: string;
}

export interface StaffPersonalExportParams {
  timeRange: TimeRangePreset;
  performance: StaffPerformanceReportResponse | null;
  revenue: RevenueOverviewReportResponse | null;
  myOrders: AdminOrderDetail[];
  staffName?: string;
}

/**
 * Trả về tên hiển thị kỳ báo cáo bằng tiếng Việt
 */
export function getFriendlyTimeRangeLabel(
  timeRange: TimeRangePreset,
  startDate?: string,
  endDate?: string
): string {
  switch (timeRange) {
    case 'TODAY':
      return 'Hôm nay';
    case 'LAST_7_DAYS':
      return '7 ngày qua';
    case 'LAST_30_DAYS':
      return '30 ngày qua';
    case 'THIS_MONTH':
      return 'Tháng này';
    case 'LAST_MONTH':
      return 'Tháng trước';
    case 'THIS_QUARTER':
      return 'Quý này';
    case 'ALL_TIME':
      return 'Toàn bộ thời gian';
    case 'CUSTOM':
      return `Từ ${startDate || '---'} đến ${endDate || '---'}`;
    default:
      return timeRange;
  }
}

/**
 * Trả về tiêu đề báo cáo tiếng Việt theo Tab
 */
export function getReportTabTitle(tab: ReportTabType): string {
  switch (tab) {
    case 'overview':
      return 'BÁO CÁO DOANH THU & DÒNG TIỀN KINH DOANH';
    case 'staff':
      return 'BÁO CÁO ĐÁNH GIÁ NĂNG LỰC & DOANH SỐ NHÂN SỰ';
    case 'warehouse':
      return 'BÁO CÁO TỒN KHO & CÂN ĐỐI LƯU THÔNG HÀNG HÓA';
    case 'merchandise':
      return 'BÁO CÁO PHÂN TÍCH HÀNG HÓA & CƠ CẤU DOANH THU';
  }
}

/**
 * Escape chuỗi an toàn theo chuẩn RFC-4180 cho CSV
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Tải file CSV với UTF-8 BOM (\uFEFF) giúp Microsoft Excel hiển thị tiếng Việt hoàn hảo không lỗi font
 */
function downloadCsvWithBom(csvContent: string, fileName: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// 1. XUẤT EXCEL (.XLSX) BÁO CÁO QUẢN TRỊ ADMIN ĐA SHEET CHUYÊN NGHIỆP
// ============================================================================
export async function exportEnterpriseReportToCSV({
  activeTab,
  timeRange,
  startDate,
  endDate,
  overviewData,
  staffPerformance,
  warehouseData,
  merchandiseData,
  reconciliationData,
  currentUserName = 'Quản trị viên',
}: EnterpriseReportExportParams): Promise<void> {
  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange, startDate, endDate);
  const title = getReportTabTitle(activeTab);
  const sheets: ExcelSheetConfig[] = [];

  if (activeTab === 'overview' && overviewData) {
    sheets.push({
      sheetName: 'Doanh thu theo thoi gian',
      title,
      filterSummary: timeRangeText,
      exportedBy: currentUserName,
      summaryRows: [
        { label: 'Tổng doanh thu hoàn thành', value: overviewData.totalDeliveredRevenue || 0, type: 'currency' },
        { label: 'Tổng doanh thu gộp', value: overviewData.totalGrossRevenue || 0, type: 'currency' },
        { label: 'Doanh thu thuần (trừ ship)', value: overviewData.totalNetRevenue || 0, type: 'currency' },
        { label: 'Tổng giá vốn hàng bán (COGS)', value: overviewData.totalCostOfGoodsSold || 0, type: 'currency' },
        { label: 'Lợi nhuận gộp ước tính', value: overviewData.grossProfit || 0, type: 'currency' },
        { label: 'Biên lợi nhuận gộp', value: overviewData.grossMarginPercent || 0, type: 'percent' },
        { label: 'Tổng giá trị Voucher giảm giá', value: overviewData.totalDiscountAmount || 0, type: 'currency' },
        { label: 'Tổng phí vận chuyển thu hộ', value: overviewData.totalShippingFee || 0, type: 'currency' },
        { label: 'Tổng số đơn phát sinh', value: overviewData.totalOrders || 0, type: 'number' },
        { label: 'Đơn hoàn thành', value: overviewData.completedOrders || 0, type: 'number' },
        { label: 'Đơn đang giao', value: overviewData.deliveringOrders || 0, type: 'number' },
        { label: 'Đơn bị hủy', value: overviewData.cancelledOrders || 0, type: 'number' },
        { label: 'Đơn trả hàng/hoàn tiền', value: overviewData.returnedOrders || 0, type: 'number' },
        { label: 'Tỷ lệ giao hàng thành công', value: overviewData.successRate || 0, type: 'percent' },
        { label: 'Tỷ lệ hủy đơn', value: overviewData.cancellationRate || 0, type: 'percent' },
        { label: 'Giá trị đơn trung bình (AOV)', value: overviewData.averageOrderValue || 0, type: 'currency' },
        { label: 'Doanh thu COD', value: overviewData.cashPaymentRevenue || 0, type: 'currency' },
        { label: 'Doanh thu VNPay', value: overviewData.vnpayPaymentRevenue || 0, type: 'currency' },
      ],
      columns: [
        { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Ngày', key: 'date', type: 'text', width: 16 },
        { header: 'Nhãn thời gian', key: 'label', type: 'text', width: 20 },
        { header: 'Doanh thu hoàn thành', key: 'revenue', type: 'currency' },
        { header: 'Tổng đơn phát sinh', key: 'orderCount', type: 'number' },
        { header: 'Đơn hoàn thành', key: 'completedCount', type: 'number' },
        { header: 'Đơn bị hủy', key: 'cancelledCount', type: 'number' },
      ],
      rows: overviewData.timeSeries || [],
    });

    if (reconciliationData) {
      sheets.push({
        sheetName: 'Doi soat dong tien',
        title: 'BẢNG ĐỐI SOÁT DÒNG TIỀN THEO NGÀY & KÊNH THANH TOÁN',
        filterSummary: timeRangeText,
        exportedBy: currentUserName,
        summaryRows: [
          { label: 'Tổng phát sinh gộp', value: reconciliationData.grossRevenue || 0, type: 'currency' },
          { label: 'Thực thu VNPay', value: reconciliationData.vnpayCollectedRevenue || 0, type: 'currency' },
          { label: 'Thực thu COD', value: reconciliationData.codCollectedRevenue || 0, type: 'currency' },
          { label: 'Tổng thực thu (Đã giao)', value: reconciliationData.netCollectedRevenue || 0, type: 'currency' },
          { label: 'Tạm thu VNPay (Chờ giao)', value: reconciliationData.vnpayPrepaidPendingRevenue || 0, type: 'currency' },
          { label: 'Chờ thu COD (Chờ đối soát)', value: reconciliationData.pendingReconciliationRevenue || 0, type: 'currency' },
          { label: 'Hủy chưa thu / Lỗi TT', value: (reconciliationData.cancelledUnpaidRevenue || 0) + (reconciliationData.paymentFailedRevenue || 0), type: 'currency' },
          { label: 'Cần hoàn tiền thủ công (VNPay)', value: reconciliationData.pendingRefundRevenue || 0, type: 'currency' },
          { label: 'Đã hoàn tiền', value: reconciliationData.refundedRevenue || 0, type: 'currency' },
          { label: 'Tỷ lệ thực thu toàn kỳ', value: reconciliationData.collectionRate || 0, type: 'percent' },
        ],
        columns: [
          { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
          { header: 'Ngày', key: 'label', type: 'text', width: 14 },
          { header: 'Số đơn', key: 'orderCount', type: 'number' },
          { header: 'Doanh thu gộp', key: 'grossRevenue', type: 'currency' },
          { header: 'Giảm Voucher', key: 'discountAmount', type: 'currency' },
          { header: 'Phí Ship', key: 'shippingFee', type: 'currency' },
          { header: 'Thực thu VNPay', key: 'vnpayCollectedRevenue', type: 'currency' },
          { header: 'Thực thu COD', key: 'codCollectedRevenue', type: 'currency' },
          { header: 'Thực thu (Đã giao)', key: 'netCollectedRevenue', type: 'currency' },
          { header: 'Tạm thu VNPay (Chờ giao)', key: 'vnpayPrepaidPendingRevenue', type: 'currency' },
          { header: 'Chờ thu COD', key: 'pendingReconciliationRevenue', type: 'currency' },
          { header: 'Hủy / Lỗi TT', key: 'cancelledUnpaidRevenue', type: 'currency' },
          { header: 'Cần hoàn tiền', key: 'pendingRefundRevenue', type: 'currency' },
          { header: 'Đã hoàn tiền', key: 'refundedRevenue', type: 'currency' },
          { header: 'Tỷ lệ thực thu', key: 'collectionRate', type: 'percent' },
        ],
        rows: reconciliationData.dailyRows || [],
      });

      if (reconciliationData.exceptions && reconciliationData.exceptions.length > 0) {
        sheets.push({
          sheetName: 'Canh bao chenh lech',
          title: 'DANH SÁCH ĐƠN HÀNG CẢNH BÁO CHÊNH LỆCH ĐỐI SOÁT',
          filterSummary: timeRangeText,
          exportedBy: currentUserName,
          columns: [
            { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
            { header: 'Mã đơn', key: 'orderCode', type: 'text' },
            { header: 'Khách hàng', key: 'customerName', type: 'text' },
            { header: 'Phương thức TT', key: 'paymentMethod', type: 'text' },
            { header: 'Trạng thái TT', key: 'paymentStatus', type: 'text' },
            { header: 'Trạng thái đơn', key: 'orderStatus', type: 'text' },
            { header: 'Giá trị đơn', key: 'amount', type: 'currency' },
            { header: 'Vấn đề cần đối soát', key: 'issueDescription', type: 'text', width: 45 },
            { header: 'Ngày đặt', key: 'createdAt', type: 'datetime' },
          ],
          rows: reconciliationData.exceptions,
        });
      }
    }
  } else if (activeTab === 'staff') {
    sheets.push({
      sheetName: 'Don hang nhan vien',
      title,
      filterSummary: timeRangeText,
      exportedBy: currentUserName,
      columns: [
        { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Mã NV', key: 'employeeCode', type: 'text' },
        { header: 'Họ và tên', key: 'staffName', type: 'text' },
        { header: 'Email', key: 'staffEmail', type: 'text' },
        { header: 'Đơn tiếp nhận', key: 'totalHandledOrders', type: 'number' },
        { header: 'Đơn thành công', key: 'completedOrders', type: 'number' },
        { header: 'Đơn đang giao', key: 'deliveringOrders', type: 'number' },
        { header: 'Đơn bị hủy', key: 'cancelledOrders', type: 'number' },
        { header: 'Tỷ lệ thành công', key: 'successRate', type: 'percent' },
        { header: 'Doanh thu mang lại', key: 'deliveredRevenue', type: 'currency' },
      ],
      rows: staffPerformance || [],
    });
  } else if (activeTab === 'warehouse' && warehouseData) {
    const netFlow = (warehouseData.inboundQuantityInPeriod || 0) - (warehouseData.outboundQuantityInPeriod || 0);
    sheets.push({
      sheetName: 'Ton kho sap het',
      title,
      filterSummary: timeRangeText,
      exportedBy: currentUserName,
      summaryRows: [
        { label: 'Tổng giá trị vốn tồn kho', value: warehouseData.totalInventoryValue || 0, type: 'currency' },
        { label: 'Tổng số lượng tồn kho', value: warehouseData.totalStockQuantity || 0, type: 'number' },
        { label: 'Biến thể sắp hết (<10 cái)', value: warehouseData.lowStockVariantCount || 0, type: 'number' },
        { label: 'Biến thể hết hàng (=0 cái)', value: warehouseData.outOfStockVariantCount || 0, type: 'number' },
        { label: 'Tổng SL nhập kho trong kỳ', value: warehouseData.inboundQuantityInPeriod || 0, type: 'number' },
        { label: 'Tổng SL xuất kho trong kỳ', value: warehouseData.outboundQuantityInPeriod || 0, type: 'number' },
        { label: 'Chênh lệch luân chuyển (Nhập - Xuất)', value: netFlow, type: 'number' },
      ],
      columns: [
        { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Mã SKU', key: 'sku', type: 'text' },
        { header: 'Tên sản phẩm', key: 'productName', type: 'text' },
        { header: 'Kích cỡ', key: 'size', type: 'text', valueGetter: (r) => r.size || 'Mặc định' },
        { header: 'Màu sắc', key: 'color', type: 'text', valueGetter: (r) => r.color || 'Mặc định' },
        { header: 'Tồn kho hiện tại', key: 'stockQuantity', type: 'number' },
        { header: 'Giá bán niêm yết', key: 'price', type: 'currency' },
        { header: 'Giá vốn nhập', key: 'costPrice', type: 'currency' },
        {
          header: 'Tổng giá trị vốn tồn',
          key: 'variantCostTotal',
          type: 'currency',
          valueGetter: (r) => (r.stockQuantity || 0) * (r.costPrice || 0),
        },
        {
          header: 'Tình trạng',
          key: 'statusText',
          type: 'text',
          valueGetter: (r) => (r.stockQuantity === 0 ? 'HẾT HÀNG' : 'SẮP HẾT HÀNG'),
        },
      ],
      rows: warehouseData.lowStockVariants || [],
    });
  } else if (activeTab === 'merchandise' && merchandiseData) {
    const rootCats =
      merchandiseData.rootCategoryBreakdown && merchandiseData.rootCategoryBreakdown.length > 0
        ? merchandiseData.rootCategoryBreakdown
        : merchandiseData.categoryBreakdown || [];
    const totalSoldAll = rootCats.reduce((s, c) => s + (c.totalQuantitySold || 0), 0);
    const totalRevAll = rootCats.reduce((s, c) => s + (c.totalRevenue || 0), 0);
    const footballRoot = rootCats.find((c) => {
      const lower = (c.categoryName || '').toLowerCase();
      return lower.includes('bóng đá') || lower.includes('bong da') || lower.includes('football');
    });

    sheets.push({
      sheetName: 'Top san pham ban chay',
      title: 'TOP SẢN PHẨM BÁN CHẠY NHẤT',
      filterSummary: timeRangeText,
      exportedBy: currentUserName,
      summaryRows: [
        { label: 'Tổng sản lượng tiêu thụ trong kỳ', value: totalSoldAll, type: 'number' },
        { label: 'Tổng doanh thu hàng hóa trong kỳ', value: totalRevAll, type: 'currency' },
        {
          label: 'Ngành chủ chốt Bóng Đá (Tỷ trọng)',
          value: footballRoot ? footballRoot.percentage : 0,
          type: 'percent',
        },
        {
          label: 'Ngành chủ chốt Bóng Đá (Doanh thu)',
          value: footballRoot ? footballRoot.totalRevenue : 0,
          type: 'currency',
        },
      ],
      columns: [
        { header: 'Thứ hạng', key: 'rank', type: 'number', width: 10, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Mã SP', key: 'productId', type: 'number', width: 10 },
        { header: 'Tên sản phẩm', key: 'productName', type: 'text', width: 34 },
        { header: 'Danh mục chi tiết', key: 'categoryName', type: 'text', valueGetter: (p) => p.categoryName || '' },
        { header: 'Nhóm ngành cha', key: 'rootCategoryName', type: 'text', valueGetter: (p) => p.rootCategoryName || '' },
        { header: 'Slug', key: 'slug', type: 'text' },
        { header: 'Số lượng bán', key: 'totalQuantitySold', type: 'number' },
        { header: 'Doanh thu mang lại', key: 'totalRevenue', type: 'currency' },
        {
          header: 'Đơn giá bán TB',
          key: 'avgPrice',
          type: 'currency',
          valueGetter: (p) => (p.totalQuantitySold > 0 ? Math.round(p.totalRevenue / p.totalQuantitySold) : 0),
        },
      ],
      rows: merchandiseData.topProducts || [],
    });

    sheets.push({
      sheetName: 'Co cau danh muc',
      title: 'CƠ CẤU DOANH THU THEO NHÁNH DANH MỤC',
      filterSummary: timeRangeText,
      exportedBy: currentUserName,
      columns: [
        { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Mã danh mục', key: 'categoryId', type: 'number', width: 14 },
        { header: 'Tên nhánh danh mục', key: 'categoryName', type: 'text' },
        { header: 'Số lượng đã bán', key: 'totalQuantitySold', type: 'number' },
        { header: 'Doanh thu', key: 'totalRevenue', type: 'currency' },
        { header: 'Tỷ trọng', key: 'percentage', type: 'percent' },
      ],
      rows: merchandiseData.categoryBreakdown || [],
    });

    if (merchandiseData.rootCategoryBreakdown && merchandiseData.rootCategoryBreakdown.length > 0) {
      sheets.push({
        sheetName: 'Nhom danh muc cha',
        title: 'ĐỐI CHIẾU HIỆU QUẢ THEO NHÓM DANH MỤC CHA (BÓNG ĐÁ VS NGÀNH KHÁC)',
        filterSummary: timeRangeText,
        exportedBy: currentUserName,
        columns: [
          { header: 'Hạng', key: 'rank', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
          { header: 'Nhóm danh mục cha', key: 'categoryName', type: 'text' },
          { header: 'Sản lượng bán', key: 'totalQuantitySold', type: 'number' },
          {
            header: 'Tỷ trọng SL (%)',
            key: 'volumePct',
            type: 'percent',
            valueGetter: (rc) =>
              totalSoldAll > 0 ? Math.round(((rc.totalQuantitySold || 0) / totalSoldAll) * 1000) / 10 : 0,
          },
          {
            header: 'Đơn giá TB',
            key: 'avgUnitRev',
            type: 'currency',
            valueGetter: (rc) => (rc.totalQuantitySold > 0 ? Math.round((rc.totalRevenue || 0) / rc.totalQuantitySold) : 0),
          },
          { header: 'Doanh thu', key: 'totalRevenue', type: 'currency' },
          { header: 'Tỷ trọng DT (%)', key: 'percentage', type: 'percent' },
          {
            header: 'So với Bóng Đá',
            key: 'vsFootball',
            type: 'text',
            valueGetter: (rc) => {
              const lower = (rc.categoryName || '').toLowerCase();
              if (lower.includes('bóng đá') || lower.includes('bong da') || lower.includes('football')) {
                return 'Ngành chủ chốt (Mốc chuẩn)';
              }
              if (!footballRoot) return 'Chưa có Bóng đá';
              const diff = Number(((rc.percentage || 0) - (footballRoot.percentage || 0)).toFixed(1));
              return diff > 0 ? `Cao hơn +${diff}%` : diff < 0 ? `Thấp hơn ${diff}%` : 'Ngang bằng (0%)';
            },
          },
        ],
        rows: merchandiseData.rootCategoryBreakdown,
      });
    }
  }

  if (sheets.length === 0) return;
  const fileName = `Bao_Cao_${activeTab.toUpperCase()}_${timeRange}_${now.toISOString().slice(0, 10)}.xlsx`;
  await downloadStyledExcelWorkbook(fileName, sheets);
}

// ============================================================================
// 2. XUẤT EXCEL (.XLSX) BÁO CÁO ĐƠN HÀNG PHỤ TRÁCH CỦA NHÂN VIÊN (ĐÃ ẨN HOA HỒNG)
// ============================================================================
export async function exportStaffPersonalReportToCSV({
  timeRange,
  performance,
  myOrders,
  staffName = 'Nhân viên kinh doanh',
}: StaffPersonalExportParams): Promise<void> {
  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange);

  const fileName = `Don_Hang_Nhan_Vien_${performance?.employeeCode || 'Staff'}_${now.toISOString().slice(0, 10)}.xlsx`;
  await downloadStyledExcelWorkbook(fileName, [
    {
      sheetName: 'Don hang phu trach',
      title: 'BÁO CÁO ĐƠN HÀNG PHỤ TRÁCH CÁ NHÂN',
      filterSummary: `${timeRangeText} | Nhân viên: ${staffName}`,
      exportedBy: staffName,
      summaryRows: [
        { label: 'Tổng đơn tiếp nhận xử lý', value: performance?.totalHandledOrders || 0, type: 'number' },
        { label: 'Số đơn giao thành công', value: performance?.completedOrders || 0, type: 'number' },
        { label: 'Số đơn đang giao', value: performance?.deliveringOrders || 0, type: 'number' },
        { label: 'Số đơn bị hủy', value: performance?.cancelledOrders || 0, type: 'number' },
        { label: 'Tỷ lệ giao hàng thành công', value: performance?.successRate || 0, type: 'percent' },
        { label: 'Tổng doanh số đơn hoàn tất', value: performance?.deliveredRevenue || 0, type: 'currency' },
      ],
      columns: [
        { header: 'STT', key: 'stt', type: 'number', width: 8, valueGetter: (_r, idx) => idx + 1 },
        { header: 'Mã đơn hàng', key: 'orderCode', type: 'text', valueGetter: (o) => o.orderCode || o.id },
        { header: 'Khách hàng', key: 'customerName', type: 'text', valueGetter: (o) => o.customerName || 'Khách lẻ' },
        { header: 'Số điện thoại', key: 'customerPhone', type: 'text', valueGetter: (o) => o.customerPhone || '---' },
        { header: 'Phương thức TT', key: 'paymentMethod', type: 'text', valueGetter: (o) => o.paymentMethod || 'COD' },
        { header: 'Trạng thái đơn', key: 'status', type: 'text', valueGetter: (o) => o.status || '---' },
        { header: 'Trạng thái TT', key: 'paymentStatus', type: 'text', valueGetter: (o) => o.paymentStatus || '---' },
        { header: 'Tổng tiền', key: 'finalAmount', type: 'currency' },
        { header: 'Ngày đặt', key: 'createdAt', type: 'date' },
      ],
      rows: myOrders || [],
    },
  ]);
}

// ============================================================================
// 3. IN BÁO CÁO DOANH NGHIỆP CHUẨN A4 QUA ISOLATED IFRAME (100% SẠCH SẼ & TRANG TRỌNG)
// ============================================================================
export function printEnterpriseReportDocument(params: EnterpriseReportExportParams): void {
  if (typeof window === 'undefined') return;

  const {
    activeTab,
    timeRange,
    startDate,
    endDate,
    overviewData,
    staffPerformance,
    warehouseData,
    merchandiseData,
    reconciliationData,
    currentUserName = 'Quản trị viên',
  } = params;

  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange, startDate, endDate);
  const title = getReportTabTitle(activeTab);
  const printDateStr = formatDate(now);
  const reportCode = `RP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${activeTab.toUpperCase().slice(0, 3)}`;

  // Tạo phần thân nội dung HTML theo từng tab
  let contentHtml = '';

  if (activeTab === 'overview' && overviewData) {
    const timeRowsHtml = (overviewData.timeSeries || [])
      .map(
        (pt, idx) => `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="font-weight: 600;">${pt.date}</td>
          <td>${pt.label}</td>
          <td style="text-align: right; font-weight: bold; color: #0284c7;">${formatCurrency(pt.revenue)}</td>
          <td style="text-align: center; font-weight: 600;">${pt.orderCount}</td>
          <td style="text-align: center; color: #16a34a; font-weight: bold;">${pt.completedCount}</td>
          <td style="text-align: center; color: #dc2626; font-weight: bold;">${pt.cancelledCount}</td>
        </tr>
      `
      )
      .join('');

    const reconRowsHtml = (reconciliationData?.dailyRows || [])
      .map(
        (r) => `
        <tr>
          <td style="font-weight: 700;">${r.label}</td>
          <td style="text-align: right;">${r.orderCount}</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(r.grossRevenue)}</td>
          <td style="text-align: right;">${formatCurrency(r.discountAmount)}</td>
          <td style="text-align: right; color: #1d4ed8;">${formatCurrency(r.vnpayCollectedRevenue)}</td>
          <td style="text-align: right;">${formatCurrency(r.codCollectedRevenue)}</td>
          <td style="text-align: right; font-weight: bold; color: #15803d;">${formatCurrency(r.netCollectedRevenue)}</td>
          <td style="text-align: right; color: #0e7490;">${formatCurrency(r.vnpayPrepaidPendingRevenue)}</td>
          <td style="text-align: right; color: #b45309;">${formatCurrency(r.pendingReconciliationRevenue)}</td>
          <td style="text-align: right;">${formatCurrency(r.cancelledUnpaidRevenue)}</td>
          <td style="text-align: right; color: #be123c; font-weight: 600;">${formatCurrency(r.pendingRefundRevenue)}</td>
          <td style="text-align: right; color: #4338ca;">${formatCurrency(r.refundedRevenue)}</td>
          <td style="text-align: right; font-weight: 700;">${r.collectionRate.toFixed(1)}%</td>
        </tr>
      `
      )
      .join('');

    const reconExceptionsHtml =
      reconciliationData?.exceptions && reconciliationData.exceptions.length > 0
        ? `
      <div class="section-title" style="color: #be123c; margin-top: 18px;">Đơn Cần Hoàn Tiền & Chênh Lệch Đối Soát (${reconciliationData.exceptions.length} đơn)</div>
      <table class="report-table">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Kênh / TT</th>
            <th>Trạng thái đơn</th>
            <th style="text-align: right;">Số tiền</th>
            <th>Nội dung chênh lệch</th>
          </tr>
        </thead>
        <tbody>
          ${reconciliationData.exceptions
            .map(
              (ex) => `
            <tr>
              <td style="font-weight: 700;">${ex.orderCode}</td>
              <td>${ex.customerName}</td>
              <td>${ex.paymentMethod} (${ex.paymentStatus})</td>
              <td>${ex.orderStatus}</td>
              <td style="text-align: right; font-weight: 700; color: #be123c;">${formatCurrency(ex.amount)}</td>
              <td>${ex.issueDescription}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
        : '';

    contentHtml = `
      <div class="kpi-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="kpi-card">
          <div class="kpi-label">Doanh Thu Phát Sinh Gộp</div>
          <div class="kpi-value">${formatCurrency(reconciliationData?.grossRevenue ?? overviewData.totalGrossRevenue)}</div>
          <div class="kpi-sub">Voucher: ${formatCurrency(reconciliationData?.totalDiscountAmount ?? overviewData.totalDiscountAmount)} | Ship: ${formatCurrency(reconciliationData?.totalShippingFee ?? overviewData.totalShippingFee)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Thực Thu Đã Chốt (${reconciliationData?.collectionRate ?? 0}%)</div>
          <div class="kpi-value text-success">${formatCurrency(reconciliationData?.netCollectedRevenue ?? overviewData.totalDeliveredRevenue)}</div>
          <div class="kpi-sub">VNPay: ${formatCurrency(reconciliationData?.vnpayCollectedRevenue ?? overviewData.vnpayPaymentRevenue)} | COD: ${formatCurrency(reconciliationData?.codCollectedRevenue ?? overviewData.cashPaymentRevenue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Chờ Đối Soát & Tạm Thu</div>
          <div class="kpi-value" style="color: #b45309;">${formatCurrency((reconciliationData?.vnpayPrepaidPendingRevenue ?? 0) + (reconciliationData?.pendingReconciliationRevenue ?? 0))}</div>
          <div class="kpi-sub">Tạm thu VNPay: ${formatCurrency(reconciliationData?.vnpayPrepaidPendingRevenue ?? 0)} | Chờ COD: ${formatCurrency(reconciliationData?.pendingReconciliationRevenue ?? 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Hủy / Lỗi TT & Hoàn Tiền</div>
          <div class="kpi-value" style="color: #be123c;">${formatCurrency(reconciliationData?.lostCancelledRevenue ?? 0)}</div>
          <div class="kpi-sub">Cần hoàn (${reconciliationData?.pendingRefundCount ?? 0}): ${formatCurrency(reconciliationData?.pendingRefundRevenue ?? 0)} | Đã hoàn (${reconciliationData?.refundedCount ?? 0}): ${formatCurrency(reconciliationData?.refundedRevenue ?? 0)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Đơn Thành Công & Tỷ Lệ</div>
          <div class="kpi-value">${overviewData.completedOrders} / ${reconciliationData?.totalOrders ?? overviewData.totalOrders} đơn</div>
          <div class="kpi-sub">Thành công: ${overviewData.successRate}% | Hủy đơn: ${overviewData.cancellationRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Lãi Gộp (${overviewData.grossMarginPercent ?? 0}%) & AOV</div>
          <div class="kpi-value text-primary">${formatCurrency(overviewData.grossProfit ?? 0)}</div>
          <div class="kpi-sub">Giá vốn: ${formatCurrency(overviewData.totalCostOfGoodsSold ?? 0)} | AOV: ${formatCurrency(overviewData.averageOrderValue)}</div>
        </div>
      </div>

      ${
        reconciliationData
          ? `
      <div class="section-title">Bảng Đối Soát Dòng Tiền Theo Ngày & Kênh Thanh Toán</div>
      <table class="report-table" style="font-size: 9.5px;">
        <thead>
          <tr>
            <th>Ngày</th>
            <th style="text-align: right;">Đơn</th>
            <th style="text-align: right;">DT Gộp</th>
            <th style="text-align: right;">Voucher</th>
            <th style="text-align: right;">TT VNPay</th>
            <th style="text-align: right;">TT COD</th>
            <th style="text-align: right;">Thực Thu</th>
            <th style="text-align: right;">Tạm thu VNPay</th>
            <th style="text-align: right;">Chờ COD</th>
            <th style="text-align: right;">Hủy/Lỗi</th>
            <th style="text-align: right;">Cần hoàn</th>
            <th style="text-align: right;">Đã hoàn</th>
            <th style="text-align: right;">Tỷ lệ</th>
          </tr>
        </thead>
        <tbody>
          ${reconRowsHtml || '<tr><td colspan="13" style="text-align: center;">Không có giao dịch trong kỳ</td></tr>'}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td>TỔNG CỘNG</td>
            <td style="text-align: right;">${reconciliationData.totalOrders}</td>
            <td style="text-align: right;">${formatCurrency(reconciliationData.grossRevenue)}</td>
            <td style="text-align: right;">${formatCurrency(reconciliationData.totalDiscountAmount)}</td>
            <td style="text-align: right; color: #1d4ed8;">${formatCurrency(reconciliationData.vnpayCollectedRevenue)}</td>
            <td style="text-align: right;">${formatCurrency(reconciliationData.codCollectedRevenue)}</td>
            <td style="text-align: right; color: #15803d;">${formatCurrency(reconciliationData.netCollectedRevenue)}</td>
            <td style="text-align: right; color: #0e7490;">${formatCurrency(reconciliationData.vnpayPrepaidPendingRevenue)}</td>
            <td style="text-align: right; color: #b45309;">${formatCurrency(reconciliationData.pendingReconciliationRevenue)}</td>
            <td style="text-align: right;">${formatCurrency((reconciliationData.cancelledUnpaidRevenue || 0) + (reconciliationData.paymentFailedRevenue || 0))}</td>
            <td style="text-align: right; color: #be123c;">${formatCurrency(reconciliationData.pendingRefundRevenue)}</td>
            <td style="text-align: right; color: #4338ca;">${formatCurrency(reconciliationData.refundedRevenue)}</td>
            <td style="text-align: right;">${reconciliationData.collectionRate.toFixed(1)}%</td>
          </tr>
        </tfoot>
      </table>
      ${reconExceptionsHtml}
      `
          : ''
      }

      <div class="section-title" style="margin-top: 18px;">Chi Tiết Biến Động Doanh Thu & Đơn Hàng Theo Thời Gian</div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th style="width: 100px;">Ngày</th>
            <th>Kỳ / Nhãn</th>
            <th style="width: 130px; text-align: right;">Doanh Thu</th>
            <th style="width: 80px; text-align: center;">Tổng Đơn</th>
            <th style="width: 80px; text-align: center;">Thành Công</th>
            <th style="width: 70px; text-align: center;">Bị Hủy</th>
          </tr>
        </thead>
        <tbody>
          ${timeRowsHtml || '<tr><td colspan="7" style="text-align: center;">Không có dữ liệu trong kỳ</td></tr>'}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td colspan="3" style="text-align: right; text-transform: uppercase;">Tổng cộng:</td>
            <td style="text-align: right; color: #0284c7; font-size: 13px;">${formatCurrency(overviewData.totalDeliveredRevenue)}</td>
            <td style="text-align: center;">${overviewData.totalOrders}</td>
            <td style="text-align: center; color: #16a34a;">${overviewData.completedOrders}</td>
            <td style="text-align: center; color: #dc2626;">${overviewData.cancelledOrders}</td>
          </tr>
        </tfoot>
      </table>
    `;
  } else if (activeTab === 'staff') {
    const staffRowsHtml = staffPerformance
      .map(
        (s, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${s.employeeCode}</td>
          <td>
            <div style="font-weight: bold; color: #0f172a;">${s.staffName}</div>
            <div style="font-size: 10px; color: #64748b;">${s.staffEmail}</div>
          </td>
          <td style="text-align: center;">${s.totalHandledOrders}</td>
          <td style="text-align: center; font-weight: bold; color: #16a34a;">${s.completedOrders}</td>
          <td style="text-align: center; font-weight: 600;">${s.successRate}%</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(s.deliveredRevenue)}</td>
          <td style="text-align: right; color: #ea580c; font-weight: bold;">${formatCurrency(s.estimatedCommission)}</td>
          <td style="text-align: right; color: #16a34a; font-weight: bold;">${formatCurrency(s.kpiBonus)}</td>
          <td style="text-align: right; font-weight: 900; color: #0f172a;">${formatCurrency(s.totalEstimatedEarnings)}</td>
        </tr>
      `
      )
      .join('');

    const sumHandled = staffPerformance.reduce((acc, s) => acc + (s.totalHandledOrders || 0), 0);
    const sumCompleted = staffPerformance.reduce((acc, s) => acc + (s.completedOrders || 0), 0);
    const sumRevenue = staffPerformance.reduce((acc, s) => acc + (s.deliveredRevenue || 0), 0);
    const sumCommission = staffPerformance.reduce((acc, s) => acc + (s.estimatedCommission || 0), 0);
    const sumBonus = staffPerformance.reduce((acc, s) => acc + (s.kpiBonus || 0), 0);
    const sumEarnings = staffPerformance.reduce((acc, s) => acc + (s.totalEstimatedEarnings || 0), 0);

    contentHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tổng Nhân Sự Hoạt Động</div>
          <div class="kpi-value">${staffPerformance.length} nhân viên</div>
          <div class="kpi-sub">Đội ngũ bán hàng trực tiếp</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tổng Doanh Số Đạt Được</div>
          <div class="kpi-value text-primary">${formatCurrency(sumRevenue)}</div>
          <div class="kpi-sub">Hoàn tất giao nhận</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tổng Hoa Hồng Ước Tính</div>
          <div class="kpi-value" style="color: #ea580c;">${formatCurrency(sumCommission)}</div>
          <div class="kpi-sub">Chi trả định kỳ theo doanh số</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tổng Thưởng KPI & Lương Thưởng</div>
          <div class="kpi-value text-success">${formatCurrency(sumBonus)}</div>
          <div class="kpi-sub">Tổng thu nhập dự kiến: ${formatCurrency(sumEarnings)}</div>
        </div>
      </div>

      <div class="section-title">Bảng Xếp Hạng Hiệu Suất Và Thu Nhập Nhân Viên</div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">Hạng</th>
            <th style="width: 75px;">Mã NV</th>
            <th>Họ Và Tên</th>
            <th style="width: 60px; text-align: center;">Tiếp Nhận</th>
            <th style="width: 65px; text-align: center;">Hoàn Tất</th>
            <th style="width: 65px; text-align: center;">Tỷ Lệ</th>
            <th style="width: 110px; text-align: right;">Doanh Số</th>
            <th style="width: 95px; text-align: right;">Hoa Hồng</th>
            <th style="width: 85px; text-align: right;">Thưởng KPI</th>
            <th style="width: 105px; text-align: right;">Tổng Thu Nhập</th>
          </tr>
        </thead>
        <tbody>
          ${staffRowsHtml || '<tr><td colspan="10" style="text-align: center;">Không có dữ liệu nhân viên</td></tr>'}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold;">
            <td colspan="3" style="text-align: right; text-transform: uppercase;">Toàn công ty:</td>
            <td style="text-align: center;">${sumHandled}</td>
            <td style="text-align: center; color: #16a34a;">${sumCompleted}</td>
            <td style="text-align: center;">---</td>
            <td style="text-align: right;">${formatCurrency(sumRevenue)}</td>
            <td style="text-align: right; color: #ea580c;">${formatCurrency(sumCommission)}</td>
            <td style="text-align: right; color: #16a34a;">${formatCurrency(sumBonus)}</td>
            <td style="text-align: right; font-size: 13px;">${formatCurrency(sumEarnings)}</td>
          </tr>
        </tfoot>
      </table>
    `;
  } else if (activeTab === 'warehouse' && warehouseData) {
    const netFlow =
      (warehouseData.inboundQuantityInPeriod || 0) - (warehouseData.outboundQuantityInPeriod || 0);

    const variantRowsHtml = (warehouseData.lowStockVariants || [])
      .map(
        (v, idx) => `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="font-family: monospace; font-weight: bold;">${v.sku}</td>
          <td>
            <div style="font-weight: bold; color: #0f172a;">${v.productName}</div>
            <div style="font-size: 10px; color: #64748b;">Size: ${v.size || 'Mặc định'} | Màu: ${v.color || 'Mặc định'}</div>
          </td>
          <td style="text-align: center; font-weight: 900; color: ${v.stockQuantity === 0 ? '#dc2626' : '#ea580c'}; font-size: 13px;">
            ${v.stockQuantity}
          </td>
          <td style="text-align: right;">${formatCurrency(v.costPrice || 0)}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(v.price)}</td>
          <td style="text-align: center;">
            <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; ${
              v.stockQuantity === 0
                ? 'background: #fee2e2; color: #b91c1c;'
                : 'background: #ffedd5; color: #c2410c;'
            }">
              ${v.stockQuantity === 0 ? 'HẾT HÀNG' : 'SẮP HẾT'}
            </span>
          </td>
        </tr>
      `
      )
      .join('');

    contentHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Tổng Giá Trị Vốn Tồn Kho</div>
          <div class="kpi-value text-primary">${formatCurrency(warehouseData.totalInventoryValue)}</div>
          <div class="kpi-sub">Tổng lượng hàng tồn: ${warehouseData.totalStockQuantity?.toLocaleString('vi-VN')} SP</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Nhập Kho Trong Kỳ (PNK)</div>
          <div class="kpi-value text-success">+${(warehouseData.inboundQuantityInPeriod || 0).toLocaleString('vi-VN')} SP</div>
          <div class="kpi-sub">Lưu thông nhập hàng từ nhà cung cấp</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tổng Lượng Xuất Kho</div>
          <div class="kpi-value" style="color: #dc2626;">-${(warehouseData.outboundQuantityInPeriod || 0).toLocaleString('vi-VN')} SP</div>
          <div class="kpi-sub">Đơn GHN: ${(warehouseData.orderOutboundQuantity || 0).toLocaleString('vi-VN')} | PXK: ${(warehouseData.manualOutboundQuantity || 0).toLocaleString('vi-VN')}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Cảnh Báo Thiếu Hụt Tồn Kho</div>
          <div class="kpi-value" style="color: #ea580c;">${warehouseData.lowStockVariantCount + warehouseData.outOfStockVariantCount} SKU</div>
          <div class="kpi-sub">Hết sạch: ${warehouseData.outOfStockVariantCount} SKU | Sắp hết: ${warehouseData.lowStockVariantCount} SKU</div>
        </div>
      </div>

      <div class="section-title">Danh Sách Biến Thể Cần Tái Nhập Hàng Gấp (Low & Out Of Stock)</div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th style="width: 120px;">Mã SKU</th>
            <th>Tên Sản Phẩm & Phân Loại</th>
            <th style="width: 75px; text-align: center;">Tồn Kho</th>
            <th style="width: 100px; text-align: right;">Giá Vốn</th>
            <th style="width: 100px; text-align: right;">Giá Bán</th>
            <th style="width: 85px; text-align: center;">Tình Trạng</th>
          </tr>
        </thead>
        <tbody>
          ${variantRowsHtml || '<tr><td colspan="7" style="text-align: center; color: #16a34a; font-weight: bold; padding: 15px;">Kho vận an toàn - Hiện tại không có SKU nào bị cảnh báo thiếu hụt</td></tr>'}
        </tbody>
      </table>
    `;
  } else if (activeTab === 'merchandise' && merchandiseData) {
    const topProdRowsHtml = (merchandiseData.topProducts || [])
      .map(
        (p, idx) => `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td style="font-weight: bold; color: #0f172a;">${p.productName}</td>
          <td style="font-family: monospace; font-size: 10px; color: #64748b;">${p.slug}</td>
          <td style="text-align: center; font-weight: bold; font-size: 13px;">${p.totalQuantitySold.toLocaleString('vi-VN')}</td>
          <td style="text-align: right; font-weight: bold; color: #0284c7;">${formatCurrency(p.totalRevenue)}</td>
        </tr>
      `
      )
      .join('');

    const catRowsHtml = (merchandiseData.categoryBreakdown || [])
      .map(
        (c, idx) => `
        <tr>
          <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
          <td style="font-weight: bold; color: #0f172a;">${c.categoryName}</td>
          <td style="text-align: center; font-weight: 600;">${c.totalQuantitySold.toLocaleString('vi-VN')}</td>
          <td style="text-align: right; font-weight: bold;">${formatCurrency(c.totalRevenue)}</td>
          <td style="text-align: center; font-weight: bold; color: #ea580c;">${c.percentage}%</td>
        </tr>
      `
      )
      .join('');

    contentHtml = `
      <div class="section-title">Top 10 Sản Phẩm Bán Chạy Nhất Toàn Hệ Thống</div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">Hạng</th>
            <th>Tên Sản Phẩm</th>
            <th style="width: 150px;">Đường Dẫn Slug</th>
            <th style="width: 100px; text-align: center;">Số Lượng Bán</th>
            <th style="width: 140px; text-align: right;">Doanh Thu Đạt Được</th>
          </tr>
        </thead>
        <tbody>
          ${topProdRowsHtml || '<tr><td colspan="5" style="text-align: center;">Chưa có dữ liệu</td></tr>'}
        </tbody>
      </table>

      <div style="margin-top: 25px;" class="section-title">Cơ Cấu Doanh Thu Theo Danh Mục Ngành Hàng</div>
      <table class="report-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th>Tên Danh Mục Ngành Hàng</th>
            <th style="width: 120px; text-align: center;">Số Lượng Bán (SP)</th>
            <th style="width: 150px; text-align: right;">Doanh Thu</th>
            <th style="width: 90px; text-align: center;">Tỷ Trọng (%)</th>
          </tr>
        </thead>
        <tbody>
          ${catRowsHtml || '<tr><td colspan="5" style="text-align: center;">Chưa có dữ liệu</td></tr>'}
        </tbody>
      </table>
    `;
  }

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>${title} - ${reportCode}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 12mm 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #ffffff !important;
          color: #0f172a !important;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.45;
        }
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .brand-title {
          font-size: 17px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #0f172a;
          margin: 0;
        }
        .brand-subtitle {
          font-size: 9.5px;
          font-weight: 800;
          color: #ea580c;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 1px;
        }
        .brand-contact {
          font-size: 9.5px;
          color: #475569;
          margin-top: 2px;
        }
        .report-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 800;
          font-size: 11px;
          color: #0284c7;
        }
        .title-block {
          text-align: center;
          margin-bottom: 14px;
        }
        .title-block h1 {
          font-size: 18px;
          font-weight: 900;
          text-transform: uppercase;
          color: #0f172a;
          margin: 0 0 3px 0;
          letter-spacing: -0.3px;
        }
        .title-block .meta {
          font-size: 10.5px;
          color: #475569;
          margin: 0;
        }
        .kpi-grid {
          display: table;
          width: 100%;
          table-layout: fixed;
          margin-bottom: 16px;
          border-collapse: separate;
          border-spacing: 8px 0;
        }
        .kpi-card {
          display: table-cell;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 10px;
          vertical-align: top;
        }
        .kpi-label {
          font-size: 9.5px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .kpi-value {
          font-size: 14px;
          font-weight: 900;
          color: #0f172a;
        }
        .kpi-sub {
          font-size: 9px;
          color: #64748b;
          margin-top: 2px;
        }
        .text-primary { color: #0284c7 !important; }
        .text-success { color: #16a34a !important; }

        .section-title {
          font-size: 11.5px;
          font-weight: 800;
          color: #1e293b;
          text-transform: uppercase;
          border-left: 3px solid #0284c7;
          padding-left: 6px;
          margin-bottom: 8px;
        }
        table.report-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 10.5px;
        }
        table.report-table th {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          font-weight: 800;
          text-transform: uppercase;
          color: #334155;
          text-align: left;
          font-size: 9.5px;
        }
        table.report-table td {
          border: 1px solid #e2e8f0;
          padding: 5px 8px;
        }
        table.report-table tbody tr:nth-child(even) {
          background: #fafafa;
        }
        .signature-table {
          width: 100%;
          margin-top: 30px;
          border-collapse: collapse;
          page-break-inside: avoid;
        }
        .signature-col {
          width: 33.33%;
          text-align: center;
          vertical-align: top;
        }
        .signature-title {
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          color: #0f172a;
        }
        .signature-sub {
          font-size: 9.5px;
          color: #94a3b8;
          font-style: italic;
        }
        .signature-placeholder {
          height: 55px;
        }
        .signature-name {
          font-weight: 700;
          font-size: 11px;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div>
          <h2 class="brand-title">CÔNG TY TNHH THỂ THAO AP SPORTS</h2>
          <div class="brand-subtitle">Hệ Thống Báo Cáo Quản Trị Doanh Nghiệp</div>
          <div class="brand-contact">Hotline: 1900-6868 • Email: enterprise@apsports.com • Website: apsports.vn</div>
        </div>
        <div style="text-align: right;">
          <div class="report-badge">${reportCode}</div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 3px;">Thời gian in: ${printDateStr}</div>
        </div>
      </div>

      <div class="title-block">
        <h1>${title}</h1>
        <p class="meta">Kỳ báo cáo: <strong>${timeRangeText}</strong> | Người lập biểu: <strong>${currentUserName}</strong></p>
      </div>

      ${contentHtml}

      <table class="signature-table">
        <tr>
          <td class="signature-col">
            <div class="signature-title">Người Lập Biểu</div>
            <div class="signature-sub">(Ký & ghi rõ họ tên)</div>
            <div class="signature-placeholder"></div>
            <div class="signature-name">${currentUserName}</div>
          </td>
          <td class="signature-col">
            <div class="signature-title">Kế Toán Trưởng</div>
            <div class="signature-sub">(Ký & ghi rõ họ tên)</div>
            <div class="signature-placeholder"></div>
            <div class="signature-name" style="color: #94a3b8; font-weight: normal; font-style: italic;">Xác nhận số liệu</div>
          </td>
          <td class="signature-col">
            <div class="signature-title">Giám Đốc Doanh Nghiệp</div>
            <div class="signature-sub">(Ký, đóng dấu & ghi rõ họ tên)</div>
            <div class="signature-placeholder"></div>
            <div class="signature-name" style="color: #94a3b8; font-weight: normal; font-style: italic;">Phê duyệt báo cáo</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Tạo iframe cô lập để in
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(printDocumentHtml);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Lỗi khi kích hoạt lệnh in báo cáo qua iframe:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 250);
}

// ============================================================================
// 4. IN BẢNG KÊ THU NHẬP & HIỆU SUẤT CÁ NHÂN CỦA NHÂN VIÊN
// ============================================================================
export function printStaffPersonalReportDocument(params: StaffPersonalExportParams): void {
  if (typeof window === 'undefined') return;

  const {
    timeRange,
    performance,
    revenue,
    myOrders,
    staffName = 'Nhân viên kinh doanh',
  } = params;

  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange);
  const printDateStr = formatDate(now);
  const reportCode = `STAFF-${performance?.employeeCode || 'NV'}-${now.toISOString().slice(0, 10)}`;

  const orderRowsHtml = myOrders
    .map(
      (o, idx) => `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
        <td style="font-family: monospace; font-weight: bold;">${o.orderCode || o.id}</td>
        <td>
          <div style="font-weight: 600;">${o.customerName || 'Khách lẻ'}</div>
          <div style="font-size: 9.5px; color: #64748b;">${o.customerPhone || ''}</div>
        </td>
        <td style="text-align: center;">${o.paymentMethod || 'COD'}</td>
        <td style="text-align: center; font-weight: 600;">${o.status || '---'}</td>
        <td style="text-align: right; font-weight: bold; color: #0284c7;">${formatCurrency(o.finalAmount)}</td>
        <td style="text-align: center; font-size: 10px;">${o.createdAt ? formatDate(o.createdAt) : '---'}</td>
      </tr>
    `
    )
    .join('');

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>Bảng Kê Cá Nhân - ${staffName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 12mm 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #ffffff !important;
          color: #0f172a !important;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.45;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 10px;
          margin-bottom: 14px;
        }
        .company-title {
          font-size: 16px;
          font-weight: 900;
          margin: 0;
        }
        .badge {
          padding: 3px 8px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 800;
          font-size: 11px;
          color: #ea580c;
        }
        .title-block {
          text-align: center;
          margin-bottom: 16px;
        }
        .title-block h1 {
          font-size: 17px;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0 0 3px 0;
        }
        .kpi-grid {
          display: table;
          width: 100%;
          table-layout: fixed;
          margin-bottom: 16px;
          border-collapse: separate;
          border-spacing: 8px 0;
        }
        .kpi-card {
          display: table-cell;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 8px 10px;
        }
        .kpi-label {
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .kpi-value {
          font-size: 13.5px;
          font-weight: 900;
          color: #0f172a;
        }
        table.data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
          font-size: 10.5px;
        }
        table.data-table th {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 6px 8px;
          font-weight: 800;
          text-align: left;
          font-size: 9.5px;
        }
        table.data-table td {
          border: 1px solid #e2e8f0;
          padding: 5px 8px;
        }
        .signature-table {
          width: 100%;
          margin-top: 30px;
          border-collapse: collapse;
        }
        .sig-col {
          width: 50%;
          text-align: center;
          vertical-align: top;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2 class="company-title">CÔNG TY TNHH THỂ THAO AP SPORTS</h2>
          <div style="font-size: 10px; color: #ea580c; font-weight: bold; text-transform: uppercase;">Bảng Kê Thu Nhập & Hiệu Suất Cá Nhân</div>
        </div>
        <div style="text-align: right;">
          <div class="badge">${reportCode}</div>
          <div style="font-size: 9.5px; color: #64748b; margin-top: 2px;">Ngày in: ${printDateStr}</div>
        </div>
      </div>

      <div class="title-block">
        <h1>BẢNG KÊ THU NHẬP & HIỆU QUẢ CÔNG TÁC BÁN HÀNG</h1>
        <p style="font-size: 10.5px; color: #475569; margin: 0;">
          Nhân viên: <strong>${staffName}</strong> (Mã NV: <strong>${performance?.employeeCode || 'NV'}</strong>) • Kỳ: <strong>${timeRangeText}</strong>
        </p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Đơn Phụ Trách</div>
          <div class="kpi-value">${performance?.totalHandledOrders || 0} đơn</div>
          <div style="font-size: 9px; color: #16a34a;">Thành công: ${performance?.completedOrders || 0} (${performance?.successRate || 0}%)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Doanh Số Mang Lại</div>
          <div class="kpi-value" style="color: #0284c7;">${formatCurrency(performance?.deliveredRevenue)}</div>
          <div style="font-size: 9px; color: #64748b;">AOV: ${formatCurrency(performance?.averageOrderValue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Hoa Hồng (${performance?.commissionRate || 0}%)</div>
          <div class="kpi-value" style="color: #ea580c;">${formatCurrency(performance?.estimatedCommission)}</div>
          <div style="font-size: 9px; color: #16a34a;">Thưởng KPI: ${formatCurrency(performance?.kpiBonus)}</div>
        </div>
        <div class="kpi-card" style="background: #eff6ff; border-color: #bfdbfe;">
          <div class="kpi-label" style="color: #1e40af;">TỔNG THU NHẬP DỰ KIẾN</div>
          <div class="kpi-value" style="color: #1d4ed8; font-size: 15px;">${formatCurrency(performance?.totalEstimatedEarnings)}</div>
          <div style="font-size: 9px; color: #1e40af; font-weight: bold;">Xếp loại: ${performance?.performanceBadge || 'STANDARD'}</div>
        </div>
      </div>

      <div style="font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Danh Sách Đơn Hàng Phụ Trách Gần Nhất</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 35px; text-align: center;">STT</th>
            <th style="width: 100px;">Mã Đơn</th>
            <th>Khách Hàng</th>
            <th style="width: 60px; text-align: center;">PTTT</th>
            <th style="width: 80px; text-align: center;">Trạng Thái</th>
            <th style="width: 110px; text-align: right;">Số Tiền</th>
            <th style="width: 90px; text-align: center;">Ngày Đặt</th>
          </tr>
        </thead>
        <tbody>
          ${orderRowsHtml || '<tr><td colspan="7" style="text-align: center;">Chưa có đơn hàng nào</td></tr>'}
        </tbody>
      </table>

      <table class="signature-table">
        <tr>
          <td class="sig-col">
            <div style="font-weight: bold; text-transform: uppercase;">Nhân Viên Bán Hàng</div>
            <div style="font-size: 9.5px; color: #94a3b8;">(Ký & ghi rõ họ tên)</div>
            <div style="height: 50px;"></div>
            <div style="font-weight: bold;">${staffName}</div>
          </td>
          <td class="sig-col">
            <div style="font-weight: bold; text-transform: uppercase;">Quản Lý Bán Hàng / Admin</div>
            <div style="font-size: 9.5px; color: #94a3b8;">(Ký xác nhận)</div>
            <div style="height: 50px;"></div>
            <div style="color: #94a3b8; font-style: italic;">Xác nhận thu nhập</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) return;

  iframeDoc.open();
  iframeDoc.write(printDocumentHtml);
  iframeDoc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Lỗi in bảng kê nhân viên:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 250);
}
