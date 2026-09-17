# 🌗 DARK / LIGHT MODE — RULES & CONVENTIONS

> Áp dụng toàn bộ frontend Next.js của dự án **AP Sports**.  
> Cập nhật lần cuối: 2026-09-17

---

## 1. NỀN TẢNG KỸ THUẬT

### 1.1 Tailwind CSS v4 — Class-Based Dark Mode

Dự án dùng **Tailwind v4** với `@variant dark` thay vì file config:

```css
/* globals.css */
@import "tailwindcss";
@variant dark (&:where(.dark, .dark *));
```

**Quy tắc:** Tailwind `dark:` prefix **CHỈ hoạt động** khi element hoặc ancestor có class `dark`.

---

### 1.2 ThemeContext — Toggle class `dark` trên `<html>`

```tsx
// context/ThemeContext.tsx
function applyTheme(t: ThemeMode) {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');       // ✅ ĐÚNG
  } else {
    root.classList.remove('dark');    // ✅ ĐÚNG
  }
}
```

**KHÔNG dùng:**
```tsx
// ❌ SAI — Tailwind dark: prefix không nhận class 'light'
root.classList.add('light');
root.classList.remove('dark');
```

---

### 1.3 SSR Default — `<html>` bắt đầu với class `dark`

```tsx
// app/layout.tsx
<html lang="vi" className={`${geistSans.variable} ... dark`} suppressHydrationWarning>
```

- Dark mode là **giao diện mặc định** của AP Sports.
- `suppressHydrationWarning` bắt buộc để tránh hydration mismatch khi ThemeContext đọc cookie.

---

## 2. CSS CUSTOM PROPERTIES (DESIGN TOKENS)

Tất cả màu sắc semantic được khai báo trong `app/globals.css` bằng CSS variables:

```css
/* Light mode — no .dark class */
:root {
  --bg-page:       #f1f5f9;
  --bg-surface:    #ffffff;
  --bg-surface-2:  #f8fafc;
  --text-primary:  #0f172a;
  --text-secondary: #334155;
  --text-muted:    #64748b;
  --text-faint:    #94a3b8;
  --bg-border:     #e2e8f0;
  /* ... */
}

/* Dark mode */
.dark {
  --bg-page:       #090d16;
  --bg-surface:    #0f172a;
  --bg-surface-2:  #1e293b;
  --text-primary:  #f8fafc;
  --text-secondary: #e2e8f0;
  --text-muted:    #94a3b8;
  --text-faint:    #64748b;
  --bg-border:     #1e293b;
  /* ... */
}
```

### 2.1 Khi nào dùng CSS vars, khi nào dùng `dark:` prefix?

| Tình huống | Cách dùng | Ví dụ |
|------------|-----------|-------|
| Component dùng **inline style** hoặc **CSS class riêng** | CSS vars | `style={{ background: 'var(--bg-surface)' }}` |
| Component dùng **Tailwind class** trực tiếp | `dark:` prefix | `className="bg-white dark:bg-slate-900"` |
| **Layout shell** (Navbar, Footer, ServiceFeatures) | CSS class semantic | `.ap-navbar { background: var(--nav-bg) }` |
| Component **overlay/modal** luôn dark | Hardcode slate | `bg-slate-950` không cần dark: |

---

## 3. NAMING CONVENTION — CSS CLASSES

Các component layout shell dùng CSS class có prefix `ap-`:

```css
/* globals.css */
header.ap-navbar         → Navbar header
.nav-icon-btn            → Icon buttons trong navbar
.nav-dropdown            → Dropdown menu
.ap-searchbar            → Thanh tìm kiếm
.ap-service-bar          → Service features bar
.ap-service-card         → Từng card cam kết dịch vụ
.ap-product-card         → Card sản phẩm
.ap-product-card-img-bg  → Vùng ảnh sản phẩm
.ap-footer               → Footer
.ap-hero-banner          → Hero banner (luôn dark)
.ap-page-banner          → Page header banner (luôn dark)
.ap-membership-section   → Section hội viên
```

**Quy tắc đặt tên:**
- Prefix `ap-` cho component-level semantic classes
- Không dùng prefix `ap-` cho utility classes thông thường
- Luôn khai báo trong `globals.css`, không inline

---

## 4. QUY TẮC THEO TỪNG LOẠI ELEMENT

### 4.1 ✅ PHẢI linh hoạt theo theme (đổi màu khi toggle)

| Element | Light | Dark |
|---------|-------|------|
| Page background | `#f1f5f9` | `#090d16` |
| Surface cards/panels | `#ffffff` | `#0f172a` |
| Text chính | `#0f172a` | `#f8fafc` |
| Text phụ | `#334155` | `#e2e8f0` |
| Text muted | `#64748b` | `#94a3b8` |
| Border | `#e2e8f0` | `#1e293b` |
| Input background | `#f8fafc` | `#020617` |
| Navbar background | `rgba(255,255,255,0.95)` | `rgba(9,13,22,0.92)` |
| Footer background | `#ffffff` | `#020617` |

### 4.2 ❌ KHÔNG đổi màu theo theme (giữ dark cố định)

Các phần sau **luôn dark** bất kể theme, vì có ảnh phủ lên:

- **Hero Banner Slider** (`#hero-banner-slider`) — có ảnh background full
- **Page Header Banner** (`#page-header-banner`) — ảnh full width
- **Category Grid Cards** — ảnh cover với gradient overlay tối
- **Membership VIP Card** (phần ảnh background)
- **MiniCart Drawer** — overlay panel (UX convention)
- **Login/Register page** — thiết kế chủ ý dark

### 4.3 🟠 Brand Orange — KHÔNG thay đổi theo theme

```css
/* Giữ nguyên trong cả hai mode */
--brand-orange:       #ea580c;  /* Light */
--brand-orange:       #f97316;  /* Dark  */
```

Các button CTA, accent colors cam/amber giữ nguyên.

---

## 5. PATTERN CHUẨN CHO COMPONENT

### 5.1 Component thông thường — dùng `dark:` prefix

```tsx
// ✅ ĐÚNG — card với dark: prefix
<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
  <h2 className="text-slate-900 dark:text-white font-bold">Tiêu đề</h2>
  <p className="text-slate-600 dark:text-slate-400 text-sm">Nội dung</p>
</div>
```

```tsx
// ✅ ĐÚNG — input với dark: prefix
<input
  className="w-full px-4 py-3 rounded-xl border
    bg-white dark:bg-slate-950
    border-slate-300 dark:border-slate-800
    text-slate-900 dark:text-slate-100
    placeholder-slate-400 dark:placeholder-slate-500
    focus:outline-none focus:border-orange-500"
/>
```

### 5.2 Layout Shell component — dùng CSS vars

```tsx
// ✅ ĐÚNG — Navbar dùng ap-navbar class
<header className="ap-navbar sticky top-0 z-40 border-b shadow-xl">
  <button className="nav-icon-btn p-2.5 rounded-xl border transition-colors">
    ...
  </button>
</header>
```

### 5.3 Component tĩnh (banner, ảnh) — hardcode dark

```tsx
// ✅ ĐÚNG — Banner luôn dark vì có ảnh phủ
<section className="ap-hero-banner relative w-full h-[600px] bg-slate-950 overflow-hidden">
  <Image src="..." fill className="object-cover opacity-80" />
  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-transparent" />
  {/* Text luôn trắng vì có ảnh tối phía sau */}
  <h1 className="text-white font-black">...</h1>
</section>
```

---

## 6. LỖI PHỔ BIẾN CẦN TRÁNH

### ❌ Lỗi 1: Quên thêm `dark:` prefix cho text

```tsx
// ❌ SAI — text-white sẽ bị invisible ở light mode nếu bg cũng trắng
<p className="text-white">Nội dung</p>

// ✅ ĐÚNG
<p className="text-slate-900 dark:text-white">Nội dung</p>
```

### ❌ Lỗi 2: Chỉ style dark, quên light

```tsx
// ❌ SAI — bg-slate-900 tối ở cả hai mode
<div className="bg-slate-900">...</div>

// ✅ ĐÚNG
<div className="bg-white dark:bg-slate-900">...</div>
```

### ❌ Lỗi 3: Toggle class 'light' thay vì xóa class 'dark'

```ts
// ❌ SAI — Tailwind không hiểu class 'light'
document.documentElement.classList.add('light');

// ✅ ĐÚNG
document.documentElement.classList.remove('dark');
```

### ❌ Lỗi 4: Dùng `!important` override trong globals.css

```css
/* ❌ SAI — brittle, khó maintain, thứ tự ưu tiên khó kiểm soát */
html.light .bg-slate-900 {
  background-color: #ffffff !important;
}

/* ✅ ĐÚNG — dùng CSS vars hoặc dark: prefix Tailwind */
.ap-surface {
  background-color: var(--bg-surface);
}
```

### ❌ Lỗi 5: Placeholder text không đổi màu

```tsx
// ❌ SAI — placeholder slate-500 tối ở cả hai mode
<input className="placeholder-slate-500" />

// ✅ ĐÚNG
<input className="placeholder-slate-400 dark:placeholder-slate-500" />
```

---

## 7. CHECKLIST KHI THÊM COMPONENT MỚI

Khi tạo component mới, kiểm tra từng mục:

- [ ] **Background** — có `bg-white dark:bg-slate-9xx` chưa?
- [ ] **Border** — có `border-slate-2xx dark:border-slate-8xx` chưa?
- [ ] **Text chính** — có `text-slate-9xx dark:text-white` hoặc `dark:text-slate-1xx` chưa?
- [ ] **Text phụ** — có `text-slate-5xx dark:text-slate-4xx` chưa?
- [ ] **Placeholder** — có `placeholder-slate-4xx dark:placeholder-slate-5xx` chưa?
- [ ] **Input bg** — có `bg-white dark:bg-slate-950` chưa?
- [ ] **Hover state** — có `hover:bg-slate-1xx dark:hover:bg-slate-8xx` chưa?
- [ ] **Icon color** — có contrast đủ không ở cả hai mode?
- [ ] **Nếu có ảnh phủ** → hardcode dark, không cần dark: prefix

---

## 8. CẤU TRÚC FILE

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          ← CSS vars + @variant dark + ap-* classes
│   │   └── layout.tsx           ← <html class="dark"> mặc định
│   └── context/
│       └── ThemeContext.tsx     ← Toggle classList.add/remove("dark")
```

**Không được** tách CSS dark/light ra file riêng — tất cả phải trong `globals.css` để dễ maintain.

---

## 9. TESTING DARK/LIGHT MODE

Khi test, kiểm tra theo thứ tự:

1. **Dark mode** (mặc định): Load trang → phải thấy nền tối, chữ sáng
2. **Toggle sang Light**: Click nút ☀️ → nền sáng, chữ tối, các component đổi màu
3. **Toggle về Dark**: Click nút 🌙 → khôi phục về tối
4. **Reload trang**: Cookie lưu theme → reload phải giữ theme cũ
5. **Kiểm tra Banner**: Hero/Page header banner PHẢI luôn tối dù ở light mode
6. **Kiểm tra Text trên ảnh**: Chữ trên ảnh phải đọc được ở cả hai mode

---

*Tài liệu này là quy tắc bắt buộc cho toàn bộ frontend AP Sports.*  
*Mọi component mới hoặc refactor đều phải tuân thủ.*
