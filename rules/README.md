# 📜 Bộ Quy Tắc Code Dành Cho AI (AI Rules Index)

Thư mục `rules/` này chứa toàn bộ các quy chuẩn mã nguồn, kiến trúc và nguyên tắc mà mọi AI (Gemini, Cursor, Copilot, Claude, GPT) hoặc lập trình viên phải tuân thủ nghiêm ngặt trong dự án.

> ⚠️ **QUY TẮC LÀM VIỆC TỐI CAO DÀNH CHO AI**:
> 1. **BẮT BUỘC ĐỌC DOCS TRƯỚC**: AI **BẮT BUỘC** phải đọc các tệp tài liệu (`.docx`, `.md`, `PROJECT_SPECIFICATION.md`, `rules/`) trước khi xem hoặc can thiệp vào mã nguồn.
> 2. **CHỈ CODE KHI CÓ YÊU CẦU CỤ THỂ**: Khi chưa có lệnh yêu cầu viết code trực tiếp từ người dùng, AI **CHỈ GIẢI THÍCH VÀ LÊN KẾ HOẠCH**, tuyệt đối **KHÔNG TỰ Ý SỬA HOẶC VIẾT CODE**.
> 3. **QUY TẮC BẢO MẬT TOKEN CLIENT**: **TUYỆT ĐỐI CẤM `localStorage`** trong toàn bộ dự án. Tất cả JWT Tokens (`accessToken`, `refreshToken`) và dữ liệu lưu trữ phía Client **BẮT BUỘC CHỈ ĐƯỢC DÙNG COOKIES** (`HttpOnly Cookies` từ Backend hoặc Secure Client Cookies).
> 4. **QUY TẮC QUẢN LÝ GIT**: Thực hiện `git add` và `git commit` chia theo **TỪNG CỤM TÍNH NĂNG LOGIC**, với **Commit Message bằng TIẾNG VIỆT** chuẩn Conventional Commits (VD: `docs: cập nhật tài liệu...`, `feat(backend): bổ sung cấu hình...`). **TUYỆT ĐỐI KHÔNG THỰC HIỆN LỆNH `git push`**.

---

## 🗂️ Danh Sách Các File Quy Tắc Detail

| File Quy Tắc | Phạm Vi Áp Dụng | Nội Dung Chính |
| :--- | :--- | :--- |
| 🏗️ **[ARCHITECTURE_RULES.md](file:///d:/LVTN/rules/ARCHITECTURE_RULES.md)** | Full-stack (Backend & Frontend) | Clean Architecture 3 lớp, Nguyên tắc SOLID, Clean Code & DRY |
| 🗄️ **[DATABASE_ACID_RULES.md](file:///d:/LVTN/rules/DATABASE_ACID_RULES.md)** | Backend (Spring Data JPA) | Quy tắc xử lý DB chuẩn ACID (Atomicity, Consistency, Isolation, Durability) |
| ☕ **[BACKEND_CLEAN_CODE.md](file:///d:/LVTN/rules/BACKEND_CLEAN_CODE.md)** | Backend (Spring Boot 3.3.5, Java 21) | Cấu trúc package sub-packages theo Role/Scope, DTO, Exception Handler |
| ⚛️ **[FRONTEND_CLEAN_CODE.md](file:///d:/LVTN/rules/FRONTEND_CLEAN_CODE.md)** | Frontend (Next.js App Router, TS, Tailwind) | Cấu trúc thư mục `src/`, Server vs Client Components, API Service Layer, Dashboard chuẩn SEO |
| 🔴 **[REDIS_AND_CACHE_RULES.md](file:///d:/LVTN/rules/REDIS_AND_CACHE_RULES.md)** | Redis & Caching Strategy | Quy chuẩn đặt tên Redis Key (`app:env:module:entity:id`), Cấu hình TTL, Chống Cache Penetration / Avalanche |

---

## 🔗 Liên Kết Nhanh Trong Dự Án
- **Tài liệu Thiết kế Dự án**: [PROJECT_SPECIFICATION.md](file:///d:/LVTN/PROJECT_SPECIFICATION.md)
- **Tài liệu Backend**: [backend/doc/MODULES.md](file:///d:/LVTN/backend/doc/MODULES.md)
- **Tài liệu Frontend**: [frontend/doc/MODULES.md](file:///d:/LVTN/frontend/doc/MODULES.md)
