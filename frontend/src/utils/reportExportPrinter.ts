import {
  ReportTabType,
  RevenueOverviewReportResponse,
  StaffPerformanceReportResponse,
  TimeRangePreset,
  TopMerchandiseReportResponse,
  WarehouseReportResponse,
} from '@/types/report';
import { AdminOrderDetail } from '@/types/admin-order';
import { formatCurrency, formatDate } from '@/utils/formatters';

export interface EnterpriseReportExportParams {
  activeTab: ReportTabType;
  timeRange: TimeRangePreset;
  startDate?: string;
  endDate?: string;
  overviewData: RevenueOverviewReportResponse | null;
  staffPerformance: StaffPerformanceReportResponse[];
  warehouseData: WarehouseReportResponse | null;
  merchandiseData: TopMerchandiseReportResponse | null;
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
// 1. XUẤT CSV BÁO CÁO QUẢN TRỊ ADMIN (ĐẦY ĐỦ THÔNG SỐ VÀ KHÔNG LỖI FONT TIẾNG VIỆT)
// ============================================================================
export function exportEnterpriseReportToCSV({
  activeTab,
  timeRange,
  startDate,
  endDate,
  overviewData,
  staffPerformance,
  warehouseData,
  merchandiseData,
  currentUserName = 'Quản trị viên',
}: EnterpriseReportExportParams): void {
  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange, startDate, endDate);
  const title = getReportTabTitle(activeTab);
  const exportDateStr = formatDate(now);

  const lines: string[] = [];

  // Metadata Header chung
  lines.push('CÔNG TY TNHH THỂ THAO AP SPORTS - HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP');
  lines.push(title);
  lines.push(`Kỳ báo cáo:,${escapeCsv(timeRangeText)}`);
  lines.push(`Thời gian trích xuất:,${escapeCsv(exportDateStr)}`);
  lines.push(`Người lập báo cáo:,${escapeCsv(currentUserName)}`);
  lines.push(''); // Dòng trống

  if (activeTab === 'overview' && overviewData) {
    // 1. Khối KPI cốt lõi
    lines.push('--- I. BẢNG TỔNG HỢP CHỈ SỐ DOANH THU & DÒNG TIỀN ---');
    lines.push(`Tổng doanh thu hoàn thành (VND):,${overviewData.totalDeliveredRevenue}`);
    lines.push(`Tổng doanh thu gộp (VND):,${overviewData.totalGrossRevenue}`);
    lines.push(`Doanh thu thuần (Trừ Voucher - VND):,${overviewData.totalNetRevenue}`);
    lines.push(`Tổng giá trị Voucher giảm giá (VND):,${overviewData.totalDiscountAmount}`);
    lines.push(`Tổng phí vận chuyển thu hộ (VND):,${overviewData.totalShippingFee}`);
    lines.push(`Tổng số đơn hàng phát sinh:,${overviewData.totalOrders}`);
    lines.push(`Số đơn hàng hoàn thành thành công:,${overviewData.completedOrders}`);
    lines.push(`Số đơn hàng đang trên đường giao:,${overviewData.deliveringOrders}`);
    lines.push(`Số đơn hàng đã bị hủy:,${overviewData.cancelledOrders}`);
    lines.push(`Số đơn hàng trả hàng/hoàn tiền:,${overviewData.returnedOrders}`);
    lines.push(`Tỷ lệ giao hàng thành công:,${overviewData.successRate}%`);
    lines.push(`Tỷ lệ hủy đơn hàng:,${overviewData.cancellationRate}%`);
    lines.push(`Giá trị đơn hàng trung bình (AOV - VND):,${overviewData.averageOrderValue}`);
    lines.push(`Dòng tiền mặt thu hộ (COD - VND):,${overviewData.cashPaymentRevenue}`);
    lines.push(`Dòng tiền trực tuyến cổng VNPay (VND):,${overviewData.vnpayPaymentRevenue}`);
    lines.push('');

    // 2. Bảng chuỗi thời gian chi tiết
    lines.push('--- II. BẢNG CHI TIẾT THEO CHUỖI THỜI GIAN ---');
    lines.push('STT,Ngày,Nhãn Thời Gian,Doanh Thu Hoàn Thành (VND),Tổng Đơn Phát Sinh,Đơn Hoàn Thành,Đơn Bị Hủy');

    let sumRevenue = 0;
    let sumTotalOrders = 0;
    let sumCompleted = 0;
    let sumCancelled = 0;

    (overviewData.timeSeries || []).forEach((pt, idx) => {
      sumRevenue += pt.revenue || 0;
      sumTotalOrders += pt.orderCount || 0;
      sumCompleted += pt.completedCount || 0;
      sumCancelled += pt.cancelledCount || 0;

      lines.push(
        [
          idx + 1,
          escapeCsv(pt.date),
          escapeCsv(pt.label),
          pt.revenue || 0,
          pt.orderCount || 0,
          pt.completedCount || 0,
          pt.cancelledCount || 0,
        ].join(',')
      );
    });

    lines.push(`TỔNG CỘNG,---,---,${sumRevenue},${sumTotalOrders},${sumCompleted},${sumCancelled}`);
  } else if (activeTab === 'staff') {
    lines.push('--- I. BẢNG XẾP HẠNG DOANH SỐ & HIỆU SUẤT NHÂN VIÊN ---');
    lines.push(
      'Thứ Hạng,Mã Nhân Viên,Họ Và Tên,Email,Vai Trò,Đơn Tiếp Nhận,Đơn Thành Công,Đơn Đang Giao,Đơn Bị Hủy,Tỷ Lệ Thành Công (%),Tỷ Lệ Hủy (%),Doanh Thu Mang Lại (VND),AOV (VND),Tỷ Lệ Hoa Hồng (%),Hoa Hồng Ước Tính (VND),Thưởng KPI (VND),Tổng Thu Nhập Dự Kiến (VND),Xếp Loại Năng Lực'
    );

    let totalHandledAll = 0;
    let totalCompletedAll = 0;
    let totalDeliveredRevenueAll = 0;
    let totalCommissionAll = 0;
    let totalKpiBonusAll = 0;
    let totalEarningsAll = 0;

    staffPerformance.forEach((s, idx) => {
      totalHandledAll += s.totalHandledOrders || 0;
      totalCompletedAll += s.completedOrders || 0;
      totalDeliveredRevenueAll += s.deliveredRevenue || 0;
      totalCommissionAll += s.estimatedCommission || 0;
      totalKpiBonusAll += s.kpiBonus || 0;
      totalEarningsAll += s.totalEstimatedEarnings || 0;

      lines.push(
        [
          idx + 1,
          escapeCsv(s.employeeCode),
          escapeCsv(s.staffName),
          escapeCsv(s.staffEmail),
          escapeCsv(s.staffRole),
          s.totalHandledOrders || 0,
          s.completedOrders || 0,
          s.deliveringOrders || 0,
          s.cancelledOrders || 0,
          `${s.successRate || 0}%`,
          `${s.cancellationRate || 0}%`,
          s.deliveredRevenue || 0,
          s.averageOrderValue || 0,
          `${s.commissionRate || 0}%`,
          s.estimatedCommission || 0,
          s.kpiBonus || 0,
          s.totalEstimatedEarnings || 0,
          escapeCsv(s.performanceBadge || 'STANDARD'),
        ].join(',')
      );
    });

    lines.push(
      `TỔNG CỘNG,---,${staffPerformance.length} Nhân viên,---,---,${totalHandledAll},${totalCompletedAll},---,---,---,---,${totalDeliveredRevenueAll},---,---,${totalCommissionAll},${totalKpiBonusAll},${totalEarningsAll},---`
    );
  } else if (activeTab === 'warehouse' && warehouseData) {
    // 1. Chỉ số tồn kho
    lines.push('--- I. TỔNG QUAN TỒN KHO & GIÁ TRỊ VỐN ---');
    lines.push(`Tổng giá trị vốn tồn kho (VND):,${warehouseData.totalInventoryValue || 0}`);
    lines.push(`Tổng số lượng tồn kho (Sản phẩm):,${warehouseData.totalStockQuantity || 0}`);
    lines.push(`Số biến thể sắp hết hàng (<10 cái):,${warehouseData.lowStockVariantCount || 0}`);
    lines.push(`Số biến thể đã hết hàng (=0 cái):,${warehouseData.outOfStockVariantCount || 0}`);
    lines.push('');

    // 2. Cân đối xuất nhập
    lines.push('--- II. CÂN ĐỐI LƯU THÔNG NHẬP - XUẤT KHO TRONG KỲ ---');
    lines.push(`Tổng số lượng nhập kho (Phiếu PNK):,${warehouseData.inboundQuantityInPeriod || 0}`);
    lines.push(`Tổng số lượng xuất kho toàn bộ:,${warehouseData.outboundQuantityInPeriod || 0}`);
    lines.push(`Xuất bán đơn hàng (GHN Logistics):,${warehouseData.orderOutboundQuantity || 0}`);
    lines.push(`Xuất nội bộ / Xuất kho thủ công (Phiếu PXK):,${warehouseData.manualOutboundQuantity || 0}`);
    const netFlow =
      (warehouseData.inboundQuantityInPeriod || 0) - (warehouseData.outboundQuantityInPeriod || 0);
    lines.push(`Chênh lệch luân chuyển ròng (Nhập - Xuất):,${netFlow}`);
    lines.push('');

    // 3. Danh sách cảnh báo hàng tồn
    lines.push('--- III. DANH SÁCH BIẾN THỂ CẦN BỔ SUNG GẤP (SẮP HẾT & HẾT HÀNG) ---');
    lines.push('STT,Mã SKU,Tên Sản Phẩm,Kích Cỡ,Màu Sắc,Tồn Kho Hiện Tại,Giá Bán Niêm Yết (VND),Giá Vốn Nhập (VND),Tổng Giá Trị Vốn Tồn (VND),Tình Trạng');

    (warehouseData.lowStockVariants || []).forEach((v, idx) => {
      const variantCostTotal = (v.stockQuantity || 0) * (v.costPrice || 0);
      const statusText = v.stockQuantity === 0 ? 'HẾT HÀNG' : 'SẮP HẾT HÀNG';
      lines.push(
        [
          idx + 1,
          escapeCsv(v.sku),
          escapeCsv(v.productName),
          escapeCsv(v.size || 'Mặc định'),
          escapeCsv(v.color || 'Mặc định'),
          v.stockQuantity || 0,
          v.price || 0,
          v.costPrice || 0,
          variantCostTotal,
          escapeCsv(statusText),
        ].join(',')
      );
    });
  } else if (activeTab === 'merchandise' && merchandiseData) {
    // 1. Top sản phẩm
    lines.push('--- I. TOP 10 SẢN PHẨM BÁN CHẠY NHẤT ---');
    lines.push('Thứ Hạng,Mã SP,Tên Sản Phẩm,Đường Dẫn Slug,Số Lượng Bán (Cái),Doanh Thu Mang Lại (VND),Đơn Giá Bán Trung Bình (VND)');

    let topSoldTotal = 0;
    let topRevTotal = 0;

    (merchandiseData.topProducts || []).forEach((p, idx) => {
      topSoldTotal += p.totalQuantitySold || 0;
      topRevTotal += p.totalRevenue || 0;
      const avgPrice = p.totalQuantitySold > 0 ? Math.round(p.totalRevenue / p.totalQuantitySold) : 0;

      lines.push(
        [
          idx + 1,
          p.productId,
          escapeCsv(p.productName),
          escapeCsv(p.slug),
          p.totalQuantitySold || 0,
          p.totalRevenue || 0,
          avgPrice,
        ].join(',')
      );
    });

    lines.push(`TỔNG CỘNG TOP 10,---,---,---,${topSoldTotal},${topRevTotal},---`);
    lines.push('');

    // 2. Cơ cấu danh mục
    lines.push('--- II. CƠ CẤU DOANH THU THEO DANH MỤC NGÀNH HÀNG ---');
    lines.push('STT,Mã Danh Mục,Tên Ngành Hàng,Số Lượng Đã Bán (Cái),Doanh Thu (VND),Tỷ Trọng (%)');

    let catSoldTotal = 0;
    let catRevTotal = 0;

    (merchandiseData.categoryBreakdown || []).forEach((c, idx) => {
      catSoldTotal += c.totalQuantitySold || 0;
      catRevTotal += c.totalRevenue || 0;

      lines.push(
        [
          idx + 1,
          c.categoryId,
          escapeCsv(c.categoryName),
          c.totalQuantitySold || 0,
          c.totalRevenue || 0,
          `${c.percentage || 0}%`,
        ].join(',')
      );
    });

    lines.push(`TỔNG CỘNG TẤT CẢ DANH MỤC,---,---,${catSoldTotal},${catRevTotal},100%`);
  }

  const csvContent = lines.join('\r\n');
  const fileName = `Bao_Cao_${activeTab.toUpperCase()}_${timeRange}_${now.toISOString().slice(0, 10)}.csv`;
  downloadCsvWithBom(csvContent, fileName);
}

// ============================================================================
// 2. XUẤT CSV BÁO CÁO CÁ NHÂN CHO NHÂN VIÊN BÁN HÀNG
// ============================================================================
export function exportStaffPersonalReportToCSV({
  timeRange,
  performance,
  revenue,
  myOrders,
  staffName = 'Nhân viên kinh doanh',
}: StaffPersonalExportParams): void {
  const now = new Date();
  const timeRangeText = getFriendlyTimeRangeLabel(timeRange);
  const exportDateStr = formatDate(now);

  const lines: string[] = [];
  lines.push('CÔNG TY TNHH THỂ THAO AP SPORTS');
  lines.push('BẢNG KÊ THU NHẬP & HIỆU SUẤT BÁN HÀNG CÁ NHÂN');
  lines.push(`Nhân viên:,${escapeCsv(staffName)} (${escapeCsv(performance?.employeeCode || 'NV')})`);
  lines.push(`Kỳ báo cáo:,${escapeCsv(timeRangeText)}`);
  lines.push(`Ngày trích xuất:,${escapeCsv(exportDateStr)}`);
  lines.push('');

  lines.push('--- I. THÔNG SỐ HIỆU SUẤT VÀ THU NHẬP DỰ KIẾN ---');
  lines.push(`Tổng số đơn hàng tiếp nhận xử lý:,${performance?.totalHandledOrders || 0}`);
  lines.push(`Số đơn hàng hoàn thành thành công:,${performance?.completedOrders || 0}`);
  lines.push(`Số đơn hàng đang giao:,${performance?.deliveringOrders || 0}`);
  lines.push(`Số đơn hàng bị hủy:,${performance?.cancelledOrders || 0}`);
  lines.push(`Tỷ lệ giao hàng thành công:,${performance?.successRate || 0}%`);
  lines.push(`Doanh thu hoàn thành mang lại (VND):,${performance?.deliveredRevenue || 0}`);
  lines.push(`Giá trị đơn hàng trung bình (AOV - VND):,${performance?.averageOrderValue || 0}`);
  lines.push(`Tỷ lệ hoa hồng cá nhân:,${performance?.commissionRate || 0}%`);
  lines.push(`Hoa hồng ước tính (VND):,${performance?.estimatedCommission || 0}`);
  lines.push(`Tiền thưởng KPI đạt chuẩn (VND):,${performance?.kpiBonus || 0}`);
  lines.push(`TỔNG THU NHẬP DỰ KIẾN (VND):,${performance?.totalEstimatedEarnings || 0}`);
  lines.push(`Xếp loại năng lực:,${escapeCsv(performance?.performanceBadge || 'STANDARD')}`);
  lines.push('');

  lines.push('--- II. DANH SÁCH ĐƠN HÀNG PHỤ TRÁCH GẦN NHẤT ---');
  lines.push('STT,Mã Đơn Hàng,Khách Hàng,Số Điện Thoại,Phương Thức,Trạng Thái Đơn,Trạng Thái TT,Tổng Tiền (VND),Ngày Đặt');

  myOrders.forEach((o, idx) => {
    lines.push(
      [
        idx + 1,
        escapeCsv(o.orderCode || o.id),
        escapeCsv(o.customerName || 'Khách lẻ'),
        escapeCsv(o.customerPhone || '---'),
        escapeCsv(o.paymentMethod || 'COD'),
        escapeCsv(o.status || '---'),
        escapeCsv(o.paymentStatus || '---'),
        o.finalAmount || 0,
        escapeCsv(o.createdAt ? formatDate(o.createdAt) : '---'),
      ].join(',')
    );
  });

  const csvContent = lines.join('\r\n');
  const fileName = `Bang_Ke_Thu_Nhap_Ca_Nhan_${performance?.employeeCode || 'Staff'}_${now.toISOString().slice(0, 10)}.csv`;
  downloadCsvWithBom(csvContent, fileName);
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

    contentHtml = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-label">Doanh Thu Hoàn Thành</div>
          <div class="kpi-value text-primary">${formatCurrency(overviewData.totalDeliveredRevenue)}</div>
          <div class="kpi-sub">Doanh thu thuần: ${formatCurrency(overviewData.totalNetRevenue)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Tổng Số Đơn Hàng</div>
          <div class="kpi-value">${overviewData.totalOrders.toLocaleString('vi-VN')} đơn</div>
          <div class="kpi-sub">Giao thành công: ${overviewData.completedOrders} đơn (${overviewData.successRate}%)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Giá Trị Đơn TB (AOV)</div>
          <div class="kpi-value">${formatCurrency(overviewData.averageOrderValue)}</div>
          <div class="kpi-sub">Tỷ lệ hủy: ${overviewData.cancellationRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Cơ Cấu Dòng Tiền</div>
          <div class="kpi-value text-success">${formatCurrency(overviewData.cashPaymentRevenue)} <span style="font-size:10px; color:#64748b;">(COD)</span></div>
          <div class="kpi-sub">VNPay trực tuyến: ${formatCurrency(overviewData.vnpayPaymentRevenue)}</div>
        </div>
      </div>

      <div class="section-title">Chi Tiết Biến Động Doanh Thu & Đơn Hàng Theo Thời Gian</div>
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
