import ExcelJS from 'exceljs';
import { formatDate } from '@/utils/formatters';

function formatDateTimeVi(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type ExcelColumnType = 'text' | 'currency' | 'number' | 'percent' | 'date' | 'datetime';

export interface ExcelColumnDef<T = Record<string, unknown>> {
  header: string;
  key: string;
  type?: ExcelColumnType;
  width?: number;
  valueGetter?: (row: T, index: number) => unknown;
}

export interface ExcelSummaryRow {
  label: string;
  value: string | number;
  type?: ExcelColumnType;
}

export interface ExcelSheetConfig<T = any> {
  sheetName: string;
  title: string;
  filterSummary?: string;
  exportedBy?: string;
  summaryRows?: ExcelSummaryRow[];
  columns: ExcelColumnDef<T>[];
  rows: T[];
}

/**
 * Chuẩn hóa chuỗi đầu vào để chống lỗ hổng Excel/CSV Formula Injection (CWE-1236).
 * Bỏ qua các chuỗi giữ chỗ an toàn ('---', '--', '—') và số âm thuần túy để không bị biến thành "'---",
 * chỉ thêm dấu nháy đơn phía trước khi chuỗi thực sự có nguy cơ thực thi công thức (=, +, @, tab, CR, hoặc - theo sau bởi ký tự không phải số/dấu gạch).
 */
export function sanitizeExcelText(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const trimmed = str.trim();
  if (trimmed === '---' || trimmed === '--' || trimmed === '—' || /^-?\d+([.,]\d+)?$/.test(trimmed)) {
    return str;
  }
  if (/^[=+@\t\r]/.test(str) || /^-[^\d\-]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Làm sạch tên Sheet hợp lệ theo giới hạn của Microsoft Excel (tối đa 31 ký tự, không chứa ký tự đặc biệt).
 */
function sanitizeSheetName(name: string, index: number): string {
  const cleaned = (name || `Sheet${index + 1}`).replace(/[\\/*?:[\]]/g, ' ').trim();
  return (cleaned || `Sheet${index + 1}`).slice(0, 31);
}

/**
 * Định dạng giá trị ô theo loại dữ liệu để kế toán/quản lý có thể SUM và lọc trực tiếp trên Excel.
 */
function formatCellValue(raw: unknown, type: ExcelColumnType = 'text'): string | number {
  if (raw === null || raw === undefined || raw === '') {
    return type === 'currency' || type === 'number' || type === 'percent' ? 0 : '';
  }

  switch (type) {
    case 'currency':
    case 'number':
    case 'percent': {
      const num = typeof raw === 'number' ? raw : Number(raw);
      return Number.isFinite(num) ? num : 0;
    }
    case 'date':
      return sanitizeExcelText(formatDate(String(raw)));
    case 'datetime':
      return sanitizeExcelText(formatDateTimeVi(String(raw)));
    default:
      return sanitizeExcelText(raw);
  }
}

/**
 * Tạo và tải xuống file Excel (.xlsx) chuyên nghiệp nhiều Sheet từ cấu hình chuẩn.
 */
export async function downloadStyledExcelWorkbook(
  fileName: string,
  sheets: ExcelSheetConfig[]
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AP Sports Enterprise Admin';
  workbook.created = new Date();

  const usedSheetNames = new Set<string>();

  sheets.forEach((sheetCfg, sheetIdx) => {
    let sheetName = sanitizeSheetName(sheetCfg.sheetName, sheetIdx);
    if (usedSheetNames.has(sheetName)) {
      sheetName = `${sheetName.slice(0, 28)}_${sheetIdx + 1}`;
    }
    usedSheetNames.add(sheetName);

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', ySplit: 0 }],
    });

    const colCount = Math.max(sheetCfg.columns.length, 4);
    const lastColLetter = worksheet.getColumn(colCount).letter;

    // 1. Khối tiêu đề doanh nghiệp & metadata đầu trang
    const companyRow = worksheet.addRow(['CÔNG TY TNHH THỂ THAO AP SPORTS - HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP']);
    worksheet.mergeCells(`A1:${lastColLetter}1`);
    companyRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFEA580C' } };
    companyRow.alignment = { vertical: 'middle', horizontal: 'left' };
    companyRow.height = 20;

    const titleRow = worksheet.addRow([sanitizeExcelText(sheetCfg.title)]);
    worksheet.mergeCells(`A2:${lastColLetter}2`);
    titleRow.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FF0F172A' } };
    titleRow.alignment = { vertical: 'middle', horizontal: 'left' };
    titleRow.height = 26;

    let currentRowIdx = 3;

    if (sheetCfg.filterSummary) {
      const filterRow = worksheet.addRow([`Bộ lọc áp dụng: ${sanitizeExcelText(sheetCfg.filterSummary)}`]);
      worksheet.mergeCells(`A${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
      filterRow.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF475569' } };
      currentRowIdx++;
    }

    const metaText = `Thời gian xuất: ${formatDateTimeVi(new Date())}  |  Người xuất: ${sanitizeExcelText(
      sheetCfg.exportedBy || 'Quản trị viên'
    )}  |  Tổng số dòng: ${sheetCfg.rows.length.toLocaleString('vi-VN')}`;
    const metaRow = worksheet.addRow([metaText]);
    worksheet.mergeCells(`A${currentRowIdx}:${lastColLetter}${currentRowIdx}`);
    metaRow.font = { name: 'Calibri', size: 10, color: { argb: 'FF64748B' } };
    currentRowIdx++;

    worksheet.addRow([]);
    currentRowIdx++;

    // 2. Bảng tóm tắt KPI đầu Sheet (nếu có)
    if (sheetCfg.summaryRows && sheetCfg.summaryRows.length > 0) {
      sheetCfg.summaryRows.forEach((item) => {
        const sRow = worksheet.addRow([
          sanitizeExcelText(item.label),
          formatCellValue(item.value, item.type || 'text'),
        ]);
        sRow.getCell(1).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF334155' } };
        sRow.getCell(2).font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
        if (item.type === 'currency') {
          sRow.getCell(2).numFmt = '#,##0" ₫"';
        } else if (item.type === 'number') {
          sRow.getCell(2).numFmt = '#,##0';
        } else if (item.type === 'percent') {
          sRow.getCell(2).numFmt = '0.0"%"';
        }
        sRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };
        });
        currentRowIdx++;
      });
      worksheet.addRow([]);
      currentRowIdx++;
    }

    // 3. Hàng tiêu đề bảng dữ liệu chính
    if (sheetCfg.columns.length > 0) {
      const headerRowNumber = currentRowIdx;
      const headerRow = worksheet.addRow(sheetCfg.columns.map((c) => c.header));
      headerRow.height = 24;
      headerRow.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF0F172A' } },
          bottom: { style: 'thin', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FF334155' } },
          right: { style: 'thin', color: { argb: 'FF334155' } },
        };
      });

      // Chỉ cố định dòng tiêu đề (Freeze Panes) khi phía trên không có khối KPI dài (<= 8 dòng),
      // tránh tình trạng khóa cứng quá nhiều dòng khiến màn hình nhỏ khó cuộn xem bảng bên dưới.
      if (headerRowNumber <= 8) {
        worksheet.views = [{ state: 'frozen', ySplit: headerRowNumber }];
      } else {
        worksheet.views = [{ state: 'normal' }];
      }
      worksheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: headerRowNumber, column: sheetCfg.columns.length },
      };

      // Theo dõi độ dài tối đa từng cột để auto-fit
      const maxLengths = sheetCfg.columns.map((c) => c.header.length + 4);

      // 4. Đổ từng dòng dữ liệu đã sanitize
      sheetCfg.rows.forEach((rowObj, rIdx) => {
        const values = sheetCfg.columns.map((col, cIdx) => {
          const raw = col.valueGetter
            ? col.valueGetter(rowObj, rIdx)
            : (rowObj as Record<string, unknown>)[col.key];
          const formatted = formatCellValue(raw, col.type || 'text');
          const displayLen = String(formatted).length + (col.type === 'currency' ? 5 : 2);
          if (displayLen > maxLengths[cIdx]) {
            maxLengths[cIdx] = displayLen;
          }
          return formatted;
        });

        const dataRow = worksheet.addRow(values);
        const isEven = rIdx % 2 === 1;

        dataRow.eachCell((cell, colNumber) => {
          const colDef = sheetCfg.columns[colNumber - 1];
          const type = colDef?.type || 'text';

          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF1E293B' } };
          if (isEven) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          };

          if (type === 'currency') {
            cell.numFmt = '#,##0" ₫"';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (type === 'number') {
            cell.numFmt = '#,##0';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (type === 'percent') {
            cell.numFmt = '0.0"%"';
            cell.alignment = { vertical: 'middle', horizontal: 'right' };
          } else if (type === 'date' || type === 'datetime') {
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
          } else {
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
          }
        });
      });

      // Tự động giãn độ rộng cột trong ngưỡng hợp lý [12, 48]
      sheetCfg.columns.forEach((col, cIdx) => {
        const computedWidth = col.width ?? Math.min(48, Math.max(12, maxLengths[cIdx]));
        worksheet.getColumn(cIdx + 1).width = computedWidth;
      });
    }
  });

  // 5. Xuất buffer nhị phân .xlsx và kích hoạt tải về trình duyệt
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
