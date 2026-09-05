# 🏗️ Quy Tắc Cấu Trúc Mã Nguồn & Luồng Dữ Liệu (Clean Architecture Rules for AI)

Tài liệu này quy định cấu trúc thư mục, luồng dữ liệu bắt buộc, nguyên tắc bảo mật DTO và quy định lưu trữ Token client dành cho AI khi phát triển dự án Full-stack này.

---

## 🔄 1. Luồng Dữ Liệu Bắt Buộc (Strict Data Flow)

Mọi tính năng tương tác từ Frontend xuống Backend và Database **BẮT BUỘC** phải tuân thủ đúng 7 bước sau:

```
[Page] ➔ [Component] ➔ [Hook] ➔ [FE Controller] ➔ [BE Controller] ➔ [BE Service] ➔ [BE Repository] ➔ [Database]
```

### Chi tiết vai trò từng tầng:
1. **Page (`src/app/...`)**: Điều hướng route, nhúng các Component UI.
2. **Component (`src/components/...`)**: Hiển thị giao diện UI, bắt sự kiện người dùng và gọi Custom Hook.
3. **Hook (`src/hooks/...`)**: Quản lý React State (`useState`, `useEffect`), gọi FE Controller.
4. **FE Controller (`src/controllers/...`)**: Tầng xử lý logic client & gọi REST API qua `fetch`/`axios` từ `.env.local` (`NEXT_PUBLIC_API_URL`).
5. **BE Controller (`com.web.ap_sports.controller`)**: Nhận HTTP Request (gắn `@Valid` DTO), trả về `ApiResponse<T>` chuẩn JSON.
6. **BE Service (`com.web.ap_sports.service`)**: Xử lý logic nghiệp vụ, quản lý Transaction `@Transactional`, mapper Entity ⇄ DTO.
7. **BE Repository (`com.web.ap_sports.repository`)**: Thực hiện các truy vấn JPA / H2 / PostgreSQL / Redis.
8. **Database**: Nơi lưu trữ dữ liệu bền vững.

---

## 🛡️ 2. Quy Tắc Bảo Mật DTO (TUYỆT ĐỐI KHÔNG TRẢ ENTITY / PASSWORD CHO FRONTEND)

1. **Cấm dùng trực tiếp Entity**:
   - Controller **KHÔNG ĐƯỢC PHÉP** nhận hoặc trả về trực tiếp JPA Entity.
   - Mọi request gửi lên phải dùng **Request DTO** (`UserCreateRequest`).
   - Mọi response gửi về Frontend phải dùng **Response DTO** (`UserResponse`).

2. **Cấm rò rỉ dữ liệu nhạy cảm (Password/Secrets)**:
   - Các trường như `password`, `tokenSecret`, `salt` trong Database **TUYỆT ĐỐI KHÔNG BỎ VÀO RESPONSE DTO**.
   - DTO trả về cho Frontend chỉ chứa các thông tin công khai an toàn (ví dụ: `id`, `username`, `email`, `fullName`, `role`, `status` mà không trả lại các trường nhạy cảm như `password`).

---

## 🍪 3. Quy Tắc Bảo Mật Token Client (TUYỆT ĐỐI CẤM localStorage / CHỈ DÙNG COOKIES)

1. **CẤM `localStorage`**:
   - **TUYỆT ĐỐI KHÔNG** lưu JWT Tokens (`accessToken`, `refreshToken`) hoặc bất kỳ thông tin nhạy cảm nào vào `localStorage`.
2. **CHỈ DÙNG COOKIES**:
   - Mọi lưu trữ và trích xuất token tại Client **BẮT BUỘC SỬ DỤNG COOKIES** (`HttpOnly Cookies` từ Backend hoặc Secure Cookies từ helper `getCookie`/`setCookie` trong `api-client.ts`).
   - Tất cả các request `fetch` phải có `credentials: 'include'`.

---

## 📁 4. File Môi Trường (.env & .env.example)

- **Backend**: `backend/.env` & `backend/.env.example`
- **Frontend**: `frontend/.env.local` & `frontend/.env.example`
