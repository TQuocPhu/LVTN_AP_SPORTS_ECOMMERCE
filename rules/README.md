# 📜 Bộ Quy Tắc Code Dành Cho AI (AI Rules Index)

Thư mục `rules/` này chứa toàn bộ các quy chuẩn mã nguồn, kiến trúc và nguyên tắc mà mọi AI (Gemini, Cursor, Copilot, Claude, GPT) hoặc lập trình viên phải tuân thủ nghiêm ngặt trong dự án.

---

## 🗂️ Danh Sách Các File Quy Tắc Detail

| File Quy Tắc | Phạm Vi Áp Dụng | Nội Dung Chính |
| :--- | :--- | :--- |
| 🏗️ **[ARCHITECTURE_RULES.md](file:///d:/LVTN/rules/ARCHITECTURE_RULES.md)** | Full-stack (Backend & Frontend) | Clean Architecture 3 lớp, Nguyên tắc SOLID, Clean Code & DRY |
| 🗄️ **[DATABASE_ACID_RULES.md](file:///d:/LVTN/rules/DATABASE_ACID_RULES.md)** | Backend (Spring Data JPA) | Quy tắc xử lý DB chuẩn ACID (Atomicity, Consistency, Isolation, Durability) |
| ☕ **[BACKEND_CLEAN_CODE.md](file:///d:/LVTN/rules/BACKEND_CLEAN_CODE.md)** | Backend (Spring Boot 3.3.5, Java 21) | Cấu trúc package, Constructor Injection, Validation DTO, Global Exception Handler, REST ApiResponse Wrapper |
| ⚛️ **[FRONTEND_CLEAN_CODE.md](file:///d:/LVTN/rules/FRONTEND_CLEAN_CODE.md)** | Frontend (Next.js App Router, TS, Tailwind) | Cấu trúc thư mục `src/`, Server vs Client Components, API Service Layer, Dashboard chuẩn SEO |
| 🔴 **[REDIS_AND_CACHE_RULES.md](file:///d:/LVTN/rules/REDIS_AND_CACHE_RULES.md)** | Redis & Caching Strategy | Quy chuẩn đặt tên Redis Key (`app:env:module:entity:id`), Cấu hình TTL, Chống Cache Penetration / Avalanche |

---

## 🔗 Liên Kết Nhanh Trong Dự Án
- **Tài liệu Backend**: [backend/doc/MODULES.md](file:///d:/LVTN/backend/doc/MODULES.md)
- **Tài liệu Frontend**: [frontend/doc/MODULES.md](file:///d:/LVTN/frontend/doc/MODULES.md)
- **Kỹ năng SEO & UI Frontend**: [frontend/doc/SEO_UI_GUIDELINES.md](file:///d:/LVTN/frontend/doc/SEO_UI_GUIDELINES.md)
