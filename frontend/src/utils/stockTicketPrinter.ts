import { InventoryTransaction } from '@/types/inventory';
import { getTicketSummary } from '@/hooks/useWarehouseInventory';

/**
 * Clean isolated iframe printer for Inventory Stock Tickets.
 * Guarantees 100% pure A4 paper printout without any background admin dashboard elements or leaks.
 */
export function printStockTicketDocument(transaction: InventoryTransaction): void {
  if (typeof window === 'undefined' || !transaction) return;

  const {
    ticketTitle,
    formattedDate,
    itemsToRender,
    formattedTotalTicketValue,
  } = getTicketSummary(transaction);

  const supplierInfo = transaction.supplierName
    ? `${transaction.supplierName} (${transaction.supplierCode || ''})`
    : '---';

  const itemsHtml = itemsToRender
    .map(
      (item, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
      <td style="font-family: monospace; font-weight: bold;">${item.variantSku}</td>
      <td>
        <div style="font-weight: bold; color: #0f172a;">${item.productName}</div>
        <div style="font-size: 11px; color: #64748b;">Size: ${item.variantSize || 'Mặc định'} | Màu: ${item.variantColor || 'Mặc định'}</div>
      </td>
      <td style="text-align: center; font-weight: bold;">${item.quantity > 0 ? `+${item.quantity}` : item.quantity}</td>
      <td style="text-align: right;">${item.formattedUnitCost}</td>
      <td style="text-align: right; font-weight: bold; color: #ea580c;">${item.formattedTotalAmount}</td>
    </tr>
  `
    )
    .join('');

  const printDocumentHtml = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>In Phiếu Kho - ${transaction.code || transaction.ticketNumber}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: #ffffff !important;
          color: #0f172a !important;
          margin: 0;
          padding: 0;
          font-size: 12px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #0f172a;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .company-title {
          font-size: 18px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin: 0;
          color: #0f172a;
        }
        .subtitle {
          font-size: 10px;
          font-weight: 800;
          color: #f97316;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .contact-info {
          font-size: 10px;
          color: #64748b;
          margin-top: 2px;
        }
        .ticket-code-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-family: monospace;
          font-weight: 800;
          font-size: 13px;
          color: #ea580c;
        }
        .title-section {
          text-align: center;
          margin-bottom: 20px;
        }
        .title-section h1 {
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          margin: 0;
          color: #0f172a;
        }
        .title-section p {
          font-size: 11px;
          color: #64748b;
          margin: 2px 0 0 0;
          font-style: italic;
        }
        .meta-box {
          display: table;
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 20px;
        }
        .meta-row {
          display: table-row;
        }
        .meta-cell {
          display: table-cell;
          padding: 3px 6px;
          font-size: 12px;
        }
        .meta-cell strong {
          color: #0f172a;
        }
        table.items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        table.items-table th {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          padding: 8px 10px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: #334155;
          text-align: left;
        }
        table.items-table td {
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          font-size: 12px;
        }
        .total-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff7ed;
          border: 1px solid #ffedd5;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 30px;
        }
        .total-box .amount {
          font-size: 16px;
          color: #ea580c;
        }
        .signature-grid {
          display: table;
          width: 100%;
          margin-top: 40px;
        }
        .signature-col {
          display: table-cell;
          width: 33.33%;
          text-align: center;
          vertical-align: top;
        }
        .signature-title {
          font-weight: 800;
          text-transform: uppercase;
          font-size: 12px;
          color: #0f172a;
        }
        .signature-sub {
          font-size: 10px;
          color: #94a3b8;
        }
        .signature-name {
          margin-top: 60px;
          font-weight: 700;
          color: #0f172a;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h2 class="company-title">AP SPORTS STORE</h2>
          <div class="subtitle">Enterprise Inventory System</div>
          <div class="contact-info">Hotline: 0988-XXX-XXX • Email: warehouse@apsports.com</div>
        </div>
        <div style="text-align: right;">
          <div class="ticket-code-badge">${transaction.code || transaction.ticketNumber}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Thời gian: ${formattedDate}</div>
        </div>
      </div>

      <div class="title-section">
        <h1>${ticketTitle}</h1>
        <p>(Chứng từ xác nhận xuất nhập kho hệ thống AP Sports)</p>
      </div>

      <div class="meta-box">
        <div class="meta-row">
          <div class="meta-cell">Người lập phiếu: <strong>${transaction.createdByUserName || 'Quản lý kho'}</strong></div>
          <div class="meta-cell" style="text-align: right;">Loại phiếu: <strong>${transaction.type}</strong></div>
        </div>
        <div class="meta-row">
          <div class="meta-cell">Nhà cung cấp: <strong>${supplierInfo}</strong></div>
          <div class="meta-cell" style="text-align: right;">${transaction.note ? `Ghi chú: <em>"${transaction.note}"</em>` : ''}</div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">STT</th>
            <th style="width: 130px;">Mã SKU</th>
            <th>Tên Sản Phẩm & Biến Thể</th>
            <th style="width: 70px; text-align: center;">Số Lượng</th>
            <th style="width: 110px; text-align: right;">Đơn Giá Vốn</th>
            <th style="width: 120px; text-align: right;">Thành Tiền</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="total-box">
        <span>TỔNG GIÁ TRỊ PHIẾU GIAO DỊCH:</span>
        <span class="amount">${formattedTotalTicketValue}</span>
      </div>

      <div class="signature-grid">
        <div class="signature-col">
          <div class="signature-title">Người Lập Phiếu</div>
          <div class="signature-sub">(Ký & ghi rõ họ tên)</div>
          <div class="signature-name">${transaction.createdByUserName || 'Nhân viên'}</div>
        </div>
        <div class="signature-col">
          <div class="signature-title">Thủ Kho AP Sports</div>
          <div class="signature-sub">(Ký & ghi rõ họ tên)</div>
          <div class="signature-name" style="color: #94a3b8; font-style: italic; font-weight: normal;">Xác nhận xuất/nhập</div>
        </div>
        <div class="signature-col">
          <div class="signature-title">Đại Diện Giao Nhận</div>
          <div class="signature-sub">(Ký & ghi rõ họ tên)</div>
          <div class="signature-name" style="color: #94a3b8; font-style: italic; font-weight: normal;">Bên nhận / giao hàng</div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create isolated iframe
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

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('Error triggering iframe print:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  }, 200);
}
