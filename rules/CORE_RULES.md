# 📜 BỘ QUY TẮC CỐT LÕI HỆ THỐNG AP SPORTS ENTERPRISE (CORE SYSTEM RULES)

> **Lưu ý**: Đây là văn bản quy định bắt buộc đối với mọi hoạt động lập trình, refactor, thiết kế giao diện và phát triển tính năng trên toàn bộ dự án AP Sports Enterprise.

---

## 🏛️ 1. QUY TẮC KIẾN TRÚC NGUYÊN BẢN (STRICT CLEAN ARCHITECTURE)
Tuyệt đối tuân thủ luồng phân cấp dữ liệu 7 lớp, **KHÔNG VIẾT BẤT KỲ LOGIC NGHIỆP VỤ NÀO VÀO PAGE HOẶC UI COMPONENT**:

$$\text{Pages} \longrightarrow \text{Pure UI Components} \longrightarrow \text{Custom Hooks} \longrightarrow \text{FE Controller} \longrightarrow \text{BE Controller} \longrightarrow \text{BE Service} \longrightarrow \text{BE Repository} \longrightarrow \text{Database}$$

- **Next.js Pages (`app/.../page.tsx`)**: Chỉ đóng vai trò làm điểm định tuyến (Page Router Wrapper), khai báo SEO Metadata và gọi Pure UI Component.
- **Pure UI Components (`components/.../*UI.tsx`)**: Chỉ chứa JSX thuần túy và nhận Props/Callbacks từ Hook. Không gọi API trực tiếp, không tự setState logic nghiệp vụ.
- **Custom Hooks (`hooks/use*.ts`)**: Nơi duy nhất quản lý State, Validation, Side Effects, xử lý sự kiện và gọi FE Controller.
- **FE Controllers (`controllers/*-controller.ts`)**: Nơi đóng gói các cuộc gọi REST API qua `apiClient`.
- **BE Controllers (`controller/*Controller.java`)**: Nhận HTTP Request, validate DTO `@Valid` và trả về `ResponseEntity<ApiResponse<T>>`.
- **BE Services (`service/*ServiceImpl.java`)**: Thực thi logic nghiệp vụ, quản lý Transaction `@Transactional` và bảo đảm ACID.
- **BE Repositories (`repository/*Repository.java`)**: Truy vấn dữ liệu từ PostgreSQL.

---

## 🎨 2. QUY TẮC THIẾT KẾ GIAO DIỆN & CHỦ ĐỀ (THEME & STYLING UNIFORMITY)
- **Trang Khách Hàng (Customer Portal - `/`, `/products/*`, `/checkout`, `/orders/*`)**:
  - Phải hỗ trợ chế độ **Light/Dark Mode (Sáng / Tối)** động, mượt mà qua Tailwind CSS `dark:` variant.
  - Đồng nhất về màu sắc, font chữ (Inter/Roboto), góc bo (`rounded-xl`, `rounded-2xl`) và hiệu ứng hover.
- **Trang Quản Trị (Admin & Logistics Portals - `/admin/*`, `/demo/*`)**:
  - Tuyệt đối **KHÔNG dùng Light/Dark Mode** (Không có nút chuyển đổi chủ đề).
  - Sử dụng giao diện **Pure White Enterprise Theme** tông màu trắng/xám Slate chuẩn doanh nghiệp chuyên nghiệp (`bg-white`, `border-slate-200`, `text-slate-900`).

---

## 📋 3. QUY TẮC QUY TRÌNH & DUYỆT KẾ HOẠCH (WORKFLOW & APPROVAL RULE)
- Trước khi viết code cho bất kỳ chức năng mới nào, **BẮT BUỘC** phải lên Bảng Kế Hoạch Chi Tiết chứa đầy đủ 6 thông tin:
  1. Luồng chức năng (Functional Flow)
  2. Nghiệp vụ & Validation liên quan (Business Rules & Validation)
  3. Các file thay đổi & thay đổi chi tiết những gì
  4. Các file được thêm mới (Backend & Frontend)
  5. Tình trạng hiện tại (Current Status)
  6. Kết quả mong đợi (Expected Results)
- **KHI NÀO USER CHẤP THUẬN KẾ HOẠCH THÌ MỚI ĐƯỢC PHÉP BẮT ĐẦU VIẾT CODE.**

---

© 2026 AP Sports Enterprise. Core Engineering Policy.
