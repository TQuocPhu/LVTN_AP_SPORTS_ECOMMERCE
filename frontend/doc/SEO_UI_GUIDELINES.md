# 🎨 Kỹ Năng Thiết Kế Giao Diện & Tối Ưu Chuẩn SEO (AI Skill Guide)

Tài liệu này đóng vai trò là **Quy chuẩn kỹ năng (Skill Guidelines)** bắt buộc dành cho AI khi xây dựng bất kỳ trang web, giao diện hoặc component nào trong dự án Frontend Next.js này.

---

## 🎯 1. Nguyên Tắc Thẩm Mỹ & Trải Nghiệm Giao Diện (UI/UX Aesthetics)

1. **Phong Cách Hiện Đại & Sang Trọng (Premium Aesthetics)**:
   - **Bảng màu (Color Palette)**: Sử dụng các gam màu đã phối hợp hài hòa (Slate, Zinc, Indigo, Emerald) kết hợp hiệu ứng Dark Mode sâu thẳm. Tránh dùng các màu nguyên bản chói mắt (pure red, pure blue).
   - **Typography**: Đảm bảo sử dụng phông chữ hiện đại (Inter, Geist, Outfit hoặc Roboto) thay cho phông mặc định của trình duyệt. Tỷ lệ line-height và letter-spacing được tinh chỉnh rõ ràng.
   - **Gradients & Glassmorphism**: Kết hợp hiệu ứng đổ bóng mờ (`backdrop-blur-md`), viền mỏng trong suốt (`border border-slate-800/80`) và dải màu nền mượt mà (`bg-gradient-to-r`).

2. **Tương Tác Động & Micro-Animations**:
   - Sử dụng hiệu ứng rê chuột (`hover:scale-[1.02]`, `transition-all duration-200`).
   - Thêm hiệu ứng hoạt ảnh tinh tế khi loading (`animate-spin`, `animate-pulse`).
   - Đảm bảo trải nghiệm responsive mượt mà trên mọi màn hình (Mobile, Tablet, Desktop).

---

## 🔍 2. Quy Chuẩn SEO Bắt Buộc (SEO Standards & Best Practices)

Mọi trang được tạo ra trong Next.js App Router đều **PHẢI** tuân thủ các quy tắc SEO sau:

### A. Thẻ HTML5 Chuẩn Semantic
- Mỗi trang chỉ chứa **duy nhất 1 thẻ `<h1>`**.
- Sử dụng đúng cấu trúc phần tử semantic:
  - `<header>`: Chứa Navbar, thanh điều hướng.
  - `<main>`: Chứa nội dung trọng tâm của trang.
  - `<section>` / `<article>`: Chia khối nội dung có ý nghĩa logic.
  - `<footer>`: Chứa thông tin bản quyền, liên kết phụ.

### B. Metadata API trong Next.js App Router
Mỗi trang (`page.tsx`) hoặc `layout.tsx` phải export đối tượng `metadata` hoặc hàm `generateMetadata`:

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tên Trang - Thương Hiệu Của Bạn',
  description: 'Mô tả ngắn gọn, cuốn hút nội dung trang (dưới 160 ký tự) cho Google Search.',
  keywords: ['nextjs', 'spring boot', 'seo', 'fullstack'],
  authors: [{ name: 'LVTN Team' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://domain-cua-ban.com/duong-dan-trang',
  },
  openGraph: {
    title: 'Tên Trang - Viết Cho Facebook / Zalo Share',
    description: 'Mô tả hiển thị khi chia sẻ liên kết trên mạng xã hội.',
    url: 'https://domain-cua-ban.com/duong-dan-trang',
    siteName: 'LVTN Workspace',
    images: [
      {
        url: 'https://domain-cua-ban.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ảnh đại diện khi share link',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tên Trang Hiển Thị Trên Twitter',
    description: 'Mô tả hiển thị trên Twitter',
    images: ['https://domain-cua-ban.com/og-image.jpg'],
  },
};
```

---

### C. Dữ Liệu Cấu Trúc (Structured Data - JSON-LD Schema.org)
Nhúng mã JSON-LD để Google hiển thị Rich Snippets (Star rating, FAQ, Article, Organization):

```tsx
export default function Page() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Tên Trang',
    description: 'Mô tả trang',
    url: 'https://domain-cua-ban.com',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>{/* Nội dung chính */}</main>
    </>
  );
}
```

---

### D. Tối Ưu Hình Ảnh (Core Web Vitals - LCP & CLS)
- **KHÔNG** sử dụng thẻ `<img>` mặc định.
- **LUÔN** dùng `next/image` từ `next/image`.
- Bắt buộc điền thẻ `alt` mô tả chuẩn SEO cho hình ảnh.
- Với hình ảnh Banner/Hero trên cùng (Above the fold), thêm thuộc tính `priority` để tối ưu chỉ số LCP.

```tsx
import Image from 'next/image';

<Image
  src="/assets/banner.jpg"
  alt="Mô tả chi tiết ảnh chứa từ khóa SEO"
  width={1200}
  height={600}
  priority
  className="rounded-xl object-cover"
/>
```

---

### E. Định Danh Unique IDs & Tương Tác
- Tất cả phần tử có tương tác (Button, Input, Form, Link) phải có thuộc tính `id` độc nhất và mang tính mô tả để phục vụ kiểm thử tự động (Automation Test).

```tsx
<button id="btn-connect-backend" onClick={handleConnect}>
  Test Connection
</button>
```

---

### F. Sitemap Tự Động & Robots.txt

1. **File `src/app/sitemap.ts`**:
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://domain-cua-ban.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];
}
```

2. **File `src/app/robots.ts`**:
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://domain-cua-ban.com/sitemap.xml',
  };
}
```
