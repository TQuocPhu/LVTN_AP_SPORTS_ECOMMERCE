# ⚽ Website Bán Dụng Cụ Bóng Đá & Thể Thao Enterprise

Đề tài Phân tích, Thiết kế và Xây dựng Website Thương mại Điện tử Bán Dụng Cụ Thể Thao (Full-stack Production Ready cho Doanh Nghiệp Vừa & Nhỏ).

---

## 📌 1. Cấu Trúc Thư Mục Dự Án

- **`backend/`**: Hệ thống Backend xây dựng trên nền tảng **Spring Boot 3.3.5 (Java 21)**, Spring Data JPA, Spring Security (JWT Access/Refresh Tokens + Email Activation), Redis, PostgreSQL, WebSocket STOMP.
- **`frontend/`**: Giao diện Client & Admin Portal xây dựng trên nền tảng **Next.js 14 (App Router, TypeScript, Tailwind/Vanilla CSS)**.
- **`rules/`**: Thư mục chứa các quy chuẩn mã nguồn Clean Architecture, ACID, Caching Strategy & SEO UI Guidelines.
- **`PROJECT_SPECIFICATION.md`**: Bản thiết kế kỹ thuật chính thức chứa toàn bộ 25 bảng CSDL và mô tả phân hệ chức năng chi tiết.

---

## 🚀 2. Các Lệnh Khởi Chạy Siêu Dễ Nhớ

### Cách 1: Sử dụng npm ở thư mục gốc (`d:\LVTN`):
```bash
# Khởi chạy Backend Spring Boot
npm run backend

# Khởi chạy Frontend Next.js
npm run frontend
```

### Cách 2: Sử dụng file lệnh ngắn trong thư mục `backend/`:
```bash
cd backend
.\run
```

---

*Tài liệu chi tiết sẽ được cập nhật bổ sung trong quá trình hoàn thiện dự án.*
