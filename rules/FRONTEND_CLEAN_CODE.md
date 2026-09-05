# ⚛️ Quy Tắc Code Frontend Next.js App Router & TypeScript (AI Rules)

Dành cho AI khi phát triển, thiết kế UI/UX hoặc tổ chức mã nguồn trong dự án Next.js `frontend`.

---

## 🏗️ 1. Cấu Trúc Kiến Trúc Frontend (Clean Architecture Layering)

Tổ chức thư mục `src/` theo nguyên tắc phân chia trách nhiệm:

```
src/
├── app/                        # App Router Pages & Layouts (Routing layer)
│   ├── (auth)/                 # Route Group cho Authentication (Login, Register)
│   ├── dashboard/              # Trang Dashboard
│   ├── sitemap.ts              # SEO Sitemap generator
│   └── robots.ts               # SEO Robots generator
├── components/                 # UI Components
│   ├── ui/                     # Common atomic components (Button, Input, Modal, Badge)
│   └── features/               # Feature-based components (UserCard, DashboardStats)
├── hooks/                      # Custom React Hooks (useAuth, useFetch, useDebounce)
├── services/                   # API Service Layer (Call Spring Boot REST Endpoints)
│   ├── api-client.ts           # Axios / Fetch base client instance với interceptors
│   └── user-service.ts         # User API endpoints
├── types/                      # TypeScript Interfaces & DTO Types
└── utils/                      # Helper functions (Formatters, Constants, Validators)
```

---

## ⚡ 2. Quy Tắc Phân Chia Server Components vs Client Components

Next.js App Router coi **mọi component mặc định là React Server Component (RSC)**.

### A. Khi nào dùng Server Component (Mặc định)?
- Fetch dữ liệu trực tiếp trên server (Tốc độ cực nhanh, không lộ API keys, tối ưu SEO).
- Trang tĩnh hoặc các phần giao diện chỉ để hiển thị đọc dữ liệu (Read-only UI).
- Trang chứa các thẻ Meta SEO nặng hoặc Schema.org JSON-LD.

### B. Khi nào dùng Client Component (`"use client"`)?
- Chỉ gắn `"use client"` ở ngọn cây component cần tương tác.
- Component có sự kiện người dùng: `onClick`, `onChange`, `onSubmit`.
- Component có quản lý state: `useState`, `useEffect`, `useContext`, `useReducer`.
- Component dùng Browser APIs (`window`, `localStorage`, `document`).

---

## 🌐 3. Quy Tắc Tích Hợp API Service Layer

**KHÔNG** gọi hàm `fetch()` hay `axios` trực tiếp rải rác bên trong UI Component. Bắt buộc phải viết thông qua API Service layer trong `src/services/`:

```typescript
// ✅ src/services/backend-api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function fetchHealthStatus() {
  const res = await fetch(`${BASE_URL}/health`, {
    cache: 'no-store', // hoặc next: { revalidate: 60 } cho ISR
  });
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  return res.json();
}
```

---

## 📊 4. Quy Chuẩn Thiết Kế Giao Diện Dashboard Chuẩn SEO

Mọi trang Dashboard mới được viết phải áp dụng các tiêu chí sau:

1. **Heading Hierarchy**: Trang có đúng **1 thẻ `<h1>`** tiêu đề chính của Dashboard. Các mục con dùng `<h2>`, `<h3>`.
2. **Semantic Shell**: Bao bọc bởi `<main className="...">`, dùng `<section>` cho từng Widget/Stats Card.
3. **Core Web Vitals**: Sử dụng phông chữ tối ưu qua `next/font`, xử lý Skeleton Loading State khi fetch client-side để không bị sụt giật layout (Prevent CLS - Cumulative Layout Shift).
4. **Unique ID**: Tất cả button, input, thẻ hành động phải gắn `id="..."` độc nhất.
