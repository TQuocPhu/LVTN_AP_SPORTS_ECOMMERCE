# Hệ Thống Quản Lý Kho & Nhà Cung Cấp (Enterprise Inventory & Supplier System)

## 1. Tổng quan hệ thống (Overview)
Hệ thống Quản lý Kho (Inventory Management) và Nhà Cung Cấp (Supplier Management) dành cho Admin / Thủ kho trong dự án **AP Sports E-Commerce**. Hệ thống hỗ trợ lập phiếu kho nhiều sản phẩm (Multi-Item Stock Tickets), cảnh báo tồn kho tự động với tính năng 1-Click lập phiếu nhập nhanh, kiểm kê kho thực tế, in phiếu kho, và theo dõi chỉ số tổng tồn kho / giá trị tồn kho theo thời gian thực.

---

## 2. Các Tính Năng Chính (Core Features)

### 2.1. Quản Lý Nhà Cung Cấp (Supplier Management)
- CRUD thông tin nhà cung cấp (Mã nhà cung cấp, Tên, Số điện thoại, Email, Địa chỉ, Trạng thái hoạt động).
- Phân trang, tìm kiếm và bộ lọc trạng thái.

### 2.2. Lập Phiếu Nhập Kho / Xuất Kho Nâng Cấp (Multi-Item Import/Export Tickets)
- **Hỗ trợ chọn nhiều sản phẩm / biến thể trong cùng 1 phiếu**.
- **Searchable Combobox**: Thanh tìm kiếm sản phẩm thông minh, tự động gợi ý danh sách sản phẩm và biến thể (Kích thước, Màu sắc) tương ứng.
- **Tính toán tự động**: Tự động tính thành tiền theo từng sản phẩm và tổng tiền phiếu nhập/xuất theo thời gian thực.
- Cập nhật số lượng tồn kho tự động vào hệ thống ngay khi phiếu được xác nhận thành công.

### 2.3. Cảnh Báo Tồn Kho & Lập Phiếu Nhập 1-Click (Low Stock Alert & 1-Click Batch Restock)
- Tự động thống kê các sản phẩm / biến thể có số lượng tồn kho thấp ($\le 5$ đơn vị).
- **1-Click Batch Restock**: Nút *"Lập phiếu nhập cho tất cả"* cho phép đẩy toàn bộ các sản phẩm đang bị cảnh báo vào danh sách phiếu nhập kho ngay lập tức.

### 2.4. Kiểm Kê Kho & Điều Chỉnh Tồn Kho (Stock Audit & Adjustment)
- Cho phép đối soát giữa số lượng tồn kho trên hệ thống và số lượng thực tế trong kho.
- Tính toán chênh lệch (Tăng/Giảm) và cho phép lưu lý do điều chỉnh.

### 2.5. In Phiếu Kho (Stock Voucher Printing)
- Giao diện In phiếu kho chuyên nghiệp hỗ trợ `window.print()`.
- Hiển thị đầy đủ logo, mã phiếu, thông tin nhà cung cấp, người lập phiếu, danh sách mặt hàng và chữ ký xác nhận.

### 2.6. Thống Kê & Chỉ Số Kho (Live Inventory Metrics)
- Tổng số lượng tồn kho toàn hệ thống.
- Tổng giá trị tồn kho (tính theo Giá nhập $\times$ Số lượng tồn của tất cả biến thể).
- Thống kê phiếu nhập/xuất trong tháng.

---

## 3. Kiến Trúc Kỹ Thuật (Technical Architecture)

### Backend (Spring Boot 3)
- `WarehouseInventoryController`: REST API xử lý phiếu kho, thống kê tồn kho, cảnh báo hàng sắp hết.
- `WarehouseSupplierController`: REST API quản lý nhà cung cấp.
- `WarehouseInventoryServiceImpl`: Logic nghiệp vụ cập nhật kho, tính tổng giá trị tồn kho live, lưu lịch sử giao dịch.
- `InventoryTransactionRepository` & `SupplierRepository`: JPA Repositories.

### Frontend (Next.js 14 / TypeScript / Tailwind CSS)
- Pure White Design Theme: Giao diện nền trắng sáng, chuẩn tương phản cho Admin.
- Custom Searchable Dropdown Combobox.
- Custom Modals (`CreateImportModal`, `CreateExportModal`, `StockAdjustmentModal`, `StockTicketPrintModal`, `SupplierFormModal`).
