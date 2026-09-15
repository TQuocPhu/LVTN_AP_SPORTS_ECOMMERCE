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

## 📄 1.1. Quy Tắc Clean Page (Routing Pages vs UI Components)

- Tệp trang Router (`src/app/.../page.tsx`) **CHỈ ĐƯỢC PHÉP KHAI BÁO METADATA/SEO VÀ KHỞI TẠO ROUTE**, sau đó gọi duy nhất Component UI chính tương ứng (ví dụ: `<RegisterForm />` hoặc `<LoginPage />`).
- **CẤM HOÀN TOÀN**:
  - Không viết trực tiếp JSX giao diện Form/Layout dài dòng trong `page.tsx`.
  - Không khai báo `useState`, `useEffect` hay gọi API handler trực tiếp trong `page.tsx`. Mọi logic tương tác người dùng phải đưa vào Component UI (`src/components/`) hoặc Custom Hook (`src/hooks/`).

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

---

## 🎨 6. Quy Tắc Phối Màu & Tính Toán Dark / Light Mode (Color & Theme Calculation Rules)

1. **Phải Tính Toán Cả 2 Chế Độ Light/Dark Trước Khi Định Mã Màu**:
   - Trước khi khai báo mã màu sắc cụ thể (Hex, RGB, Gradient hay các Utility class Tailwind như `from-white`, `text-white`, `bg-slate-950`), **BẮT BUỘC PHẢI ĐỌC QUA VÀ TÍNH TOÁN ĐỘ TƯƠNG PHẢN & HÀI HOÀ Ở CẢ 2 CHẾ ĐỘ SÁNG (LIGHT MODE) VÀ TỐI (DARK MODE)**.
   - Không được gắn cứng mã màu sáng/tối lên phần tử dùng chung nếu chưa tính toán xem khi chuyển sang chế độ ngược lại có bị tàng hình chữ, lóa hình hay mất dải màu thương hiệu hay không.

2. **Cách Ly Vùng Media, Slider & Lớp Phủ Banner (Media Protection)**:
   - Các vùng chứa ảnh Slider, Banner quảng cáo và các Nút bấm nổi bật (`bg-orange-500`) bắt buộc phải duy trì lớp phủ tối (Dark Overlay) và chữ màu trắng tương phản cao ở CẢ 2 CHẾ ĐỘ để đảm bảo hình ảnh và nội dung truyền thông không bị mờ hay lóa lún.

3. **Tính Toán Màu Sắc Thương Hiệu & Logo Text (Brand Logo Calculation)**:
   - Các phần tử nhận diện thương hiệu dạng chữ (như dải gradient logo `AP SPORTS`) phải được tính toán riêng ở Light Mode (chuyển sang dải gradient từ xám đậm sang cam `#0f172a` -> `#ea580c`) để nổi bật tuyệt đối trên nền header trắng mờ.

4. **Đồng Bộ Nền Card, Văn Bản & Icon**:
   - **Nền trang & Thẻ Card**: Chuyển từ xám đen Slate-950 / Slate-900 sang phông trắng sáng kem (`#f8fafc` & `#ffffff`) với đường viền mảnh dịu nhẹ (`#e2e8f0`).
   - **Chữ văn bản**: Chuyển từ chữ trắng Slate-100 sang xám đậm tương phản cao (`#0f172a` & `#334155`), giữ sắc nét tuyệt đối trên nền sáng.

