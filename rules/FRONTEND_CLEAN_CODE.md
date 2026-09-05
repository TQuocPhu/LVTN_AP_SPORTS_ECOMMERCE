# ⚛️ Quy Tắc Code Frontend Next.js App Router & TypeScript (AI Rules)

Dành cho AI khi phát triển, thiết kế UI/UX hoặc tổ chức mã nguồn trong dự án Next.js `frontend`.

> ⚠️ **QUY TẮC BẢO MẬT LƯU TRỮ TẠI CLIENT**:
> **TUYỆT ĐỐI CẤM SỬ DỤNG `localStorage` HOẶC `sessionStorage`** trong toàn bộ dự án. Mọi token đăng nhập (`accessToken`, `refreshToken`) và dữ liệu lưu trữ phía Client **BẮT BUỘC KHÔNG NGOẠI LỆ PHẢI SỬ DỤNG COOKIES** (`HttpOnly Cookies` từ Backend hoặc Secure Client Cookies).

---

## 🏗️ 1. Cấu Trúc Kiến Trúc Frontend (Clean Architecture Layering)

Tổ chức thư mục `src/` theo nguyên tắc phân chia trách nhiệm:

```
src/
├── app/                        # App Router Pages & Layouts (Routing layer)
│   ├── (auth)/                 # Route Group cho Authentication (Login, Register)
│   ├── dashboard/              # Trang Dashboard (SEO & Responsive)
│   ├── sitemap.ts              # SEO Sitemap generator
│   └── robots.ts               # SEO Robots generator
├── components/                 # UI Components (ui/ & features/)
├── hooks/                      # Custom React Hooks (useAuth, useFetch)
├── services/                   # API Service Layer (api-client.ts sử dụng COOKIES)
├── types/                      # TypeScript Interfaces & DTO Types
└── utils/                      # Helper functions (Formatters, Validators)
```

---

## 🔒 2. Quy Tắc Bảo Mật Token & Lưu Trữ Client (CHỈ DÙNG COOKIES)

1. **Cấm `localStorage` / `sessionStorage`**:
   - Tất cả các lệnh `localStorage.setItem()`, `localStorage.getItem()` đều bị **CẤM HOÀN TOÀN**.
2. **Sử dụng Cookies**:
   - Mọi thao tác lưu và đọc token tại Client phải sử dụng `document.cookie` (thông qua hàm helper `getCookie`, `setCookie` trong `src/services/api-client.ts`) hoặc nhận `HttpOnly Cookie` tự động từ Spring Boot Backend.
3. **Cấu hình `credentials: 'include'`**:
   - Tất cả các request `fetch()` gửi đi từ `apiClient` phải cài đặt `credentials: 'include'` để tự động truyền nhận Cookies hai chiều giữa Next.js và Spring Boot.

---

## ⚡ 3. Quy Tắc Phân Chia Server Components vs Client Components

Next.js App Router coi **mọi component mặc định là React Server Component (RSC)**.

### A. Khi nào dùng Server Component (Mặc định)?
- Fetch dữ liệu trực tiếp trên server (Tốc độ cực nhanh, không lộ API keys, tối ưu SEO).
- Trang tĩnh hoặc các phần giao diện chỉ để hiển thị đọc dữ liệu (Read-only UI).
- Trang chứa các thẻ Meta SEO nặng hoặc Schema.org JSON-LD.

### B. Khi nào dùng Client Component (`"use client"`)?
- Chỉ gắn `"use client"` ở ngọn cây component cần tương tác.
- Component có sự kiện người dùng: `onClick`, `onChange`, `onSubmit`.
- Component có quản lý state: `useState`, `useEffect`, `useContext`, `useReducer`.

---

## 🌐 4. Quy Tắc Tích Hợp API Service Layer

**KHÔNG** gọi hàm `fetch()` hay `axios` trực tiếp rải rác bên trong UI Component. Bắt buộc phải viết thông qua API Service layer trong `src/services/api-client.ts`:

---

## 📊 5. Quy Chuẩn Thiết Kế Giao Diện Dashboard Chuẩn SEO

1. **Heading Hierarchy**: Trang có đúng **1 thẻ `<h1>`** tiêu đề chính của Dashboard. Các mục con dùng `<h2>`, `<h3>`.
2. **Semantic Shell**: Bao bọc bởi `<main className="...">`, dùng `<section>` cho từng Widget/Stats Card.
3. **Core Web Vitals**: Sử dụng phông chữ tối ưu qua `next/font`, xử lý Skeleton Loading State khi fetch client-side.
4. **Unique ID**: Tất cả button, input, thẻ hành động phải gắn `id="..."` độc nhất.
