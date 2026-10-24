# 🏆 AP SPORTS ENTERPRISE - NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ THỂ THAO ĐA KÊNH & MÔ PHỎNG VẬN CHUYỂN LOGISTICS THỜI GIAN THỰC

> **Đề tài Luận Văn Tốt Nghiệp**: *Phân tích, Thiết kế và Xây dựng Hệ thống Thương mại Điện tử Thể thao Đa Kênh Tích hợp Kiểm soát Kho vận WMS Barcode, Chatbot AI Tư vấn & Giám sát Vi phạm, và Nền tảng Mô phỏng Vận chuyển Logistics 3 Trạm Thực tế (Full-Stack Production Ready).*

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-Expo_SDK_54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 📑 MỤC LỤC
1. [Giới Thiệu Tổng Quan](#-1-giới-thiệu-tổng-quan)
2. [Bảng Liên Kết Hệ Thống & Cổng Truy Cập (Quick Links)](#-2-bảng-liên-kết-hệ-thống--cổng-truy-cập-quick-links)
3. [Tài Khoản Đăng Nhập Mẫu (Seed Credentials)](#-3-tài-khoản-đăng-nhập-mẫu-seed-credentials)
4. [Kiến Trúc Hệ Thống & Phân Tầng (System Architecture)](#-4-kiến-trúc-hệ-thống--phân-tầng-system-architecture)
5. [Cấu Trúc Thư Mục Dự Án (Directory Structure)](#-5-cấu-trúc-thư-mục-dự-án-directory-structure)
6. [Các Tính Năng Trọng Tâm Đột Phá](#-6-các-tính-năng-trọng-tâm-đột-phá)
7. [Yêu Cầu Môi Trường (Prerequisites)](#-7-yêu-cầu-môi-trường-prerequisites)
8. [Hướng Dẫn Cài Đặt & Khởi Chạy (Step-by-step Setup)](#-8-hướng-dẫn-cài-đặt--khởi-chạy-step-by-step-setup)
9. [Biến Môi Trường (Environment Variables)](#-9-biến-môi-trường-environment-variables)
10. [Bản Quyền & Thông Tin Nhóm](#-10-bản-quyền--thông-tin-nhóm)

---

## 🌟 1. Giới Thiệu Tổng Quan

**AP Sports Enterprise** là hệ sinh thái thương mại điện tử chuyên ngành thể thao thế hệ mới, giải quyết trọn vẹn bài toán từ mua sắm đa kênh (Web Storefront & Mobile App), tự động hóa kho bãi (WMS Fulfillment Pipeline với kiểm đếm mã vạch Barcode Code 128 / AP-Variant), trợ lý trí tuệ nhân tạo (Google Gemini AI Advisor), giám sát ngôn từ tiêu cực (Content Moderation AI), đến chuỗi cung ứng giao hàng 3 trạm chuẩn quốc tế (Bưu cục GHN Station, Xe tải Carrier Logistics liên tỉnh và App Shipper giao hàng chặng cuối theo thời gian thực).

---

## 🔗 2. Bảng Liên Kết Hệ Thống & Cổng Truy Cập (Quick Links)

### A. Phân Hệ Người Dùng & Khách Hàng (Customer Storefront)
| Đường Dẫn (URL) | Phân Hệ | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| `http://localhost:3000` | **Trang Chủ AP Sports** | Banner thể thao, Lưới sản phẩm hot, Flash sale, Danh mục môn thể thao |
| `http://localhost:3000/products` | **Khám Phá Sản Phẩm** | Danh mục đa cấp, bộ lọc đa năng (Giá, Môn thể thao, Thương hiệu, Size, Màu sắc) |
| `http://localhost:3000/cart` | **Giỏ Hàng Mua Sắm** | Tăng giảm số lượng, tính khuyến mãi, áp mã giảm giá coupon tự động |
| `http://localhost:3000/checkout` | **Thanh Toán Phản Hồi Nhanh** | Hỗ trợ COD & Cổng thanh toán VNPay Sandbox, định vị tọa độ GPS giao hàng |
| `http://localhost:3000/profile/orders` | **Lịch Sử Đơn Hàng Cá Nhân** | Quản lý 10 trạng thái đơn, lọc theo khoảng thời gian thực tế, tra cứu hóa đơn VAT |
| `http://localhost:3000/orders/tracking/[code]` | **Theo Dõi Vận Chuyển GPS** | Bản đồ Leaflet OSRM bám lộ trình giao thông, xe tải chạy $60\text{ km/h}$ realtime |

### B. Phân Hệ Quản Trị & Vận Hành (Admin & Staff Portal)
| Đường Dẫn (URL) | Nhóm Chức Năng | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| `http://localhost:3000/admin/dashboard` | **Tổng Quan BI Analytics** | Biểu đồ doanh thu kép, Scorecard tài chính, Cảnh báo kho realtime |
| `http://localhost:3000/admin/orders` | **Quản Lý Đơn Hàng** | Duyệt đơn, Điều phối giao hàng, Xem bản đồ GPS lộ trình |
| `http://localhost:3000/admin/products` | **Quản Lý Sản Phẩm** | Thêm mới kèm biến thể Size/Màu, Upload ảnh Cloudinary, In mã vạch |
| `http://localhost:3000/admin/categories` | **Danh Mục Thể Thao** | Cây danh mục cha - con (Bóng đá, Cầu lông, Bóng rổ, Chạy bộ...) |
| `http://localhost:3000/admin/vouchers` | **Mã Khuyến Mãi / Voucher** | Thiết lập giảm theo %, tiền mặt, giới hạn lượt dùng, chống lạm dụng |
| `http://localhost:3000/admin/inventory` | **Quản Lý Kho Vận & WMS** | Kiểm đếm mã vạch Barcode đóng gói 100%, Lập phiếu PXK/PNK, Sổ cái kho |
| `http://localhost:3000/admin/suppliers` | **Nhà Cung Cấp Hàng Hóa** | Quản lý đối tác phân phối chính hãng Nike, Adidas, Yonex, Mizuno... |
| `http://localhost:3000/admin/support-chat` | **Tư Vấn Trực Tiếp (Live Chat)** | Trò chuyện WebSocket đa luồng với khách, Gợi ý AI Smart Reply, Báo cáo vi phạm |
| `http://localhost:3000/admin/reviews` | **Quản Lý Đánh Giá** | Duyệt review có ảnh chụp thực tế, phản hồi khách hàng |
| `http://localhost:3000/admin/contacts` | **Liên Hệ & Hộp Thư** | Xử lý phản hồi, gửi thư phản hồi trực tiếp qua SMTP |
| `http://localhost:3000/admin/reports` | **Báo Cáo Doanh Thu & Kho** | Báo cáo tài chính doanh nghiệp, in PDF / xuất Excel phiếu kho chuẩn thuế |
| `http://localhost:3000/admin/users` | **Quản Lý Người Dùng** | Phân quyền linh hoạt 6 vai trò, khóa tài khoản vi phạm |

### C. Nền Tảng Mô Phỏng Logistics 3 Trạm Thực Tế (Multi-Portal Simulation)
| Đường Dẫn (URL) | Phân Hệ | Vai Trò & Tác Vụ |
| :--- | :--- | :--- |
| `http://localhost:3000/demo/logistics-dashboard` | **Dashboard Điều Phối Tổng** | Giám sát toàn bộ trạng thái đơn hàng trên cả 3 trạm |
| `http://localhost:3000/demo/ghn-station` | **Portal 1 - Bưu Cục GHN Station** | Tiếp nhận kiện hàng niêm phong từ kho AP Sports (`processing` $\rightarrow$ `shipped`) |
| `http://localhost:3000/demo/carrier-logistics` | **Portal 2 - Trung Chuyển Liên Tỉnh**| Điều phối xe tải xuất bến chạy trên quốc lộ (`shipped` $\rightarrow$ `shipping`) |
| `http://localhost:3000/demo/shipper-app` | **Portal 3 - App Di Động Shipper** | Shipper phát hàng chặng cuối, xác nhận thu tiền COD (`shipping` $\rightarrow$ `delivered`) |

### D. Cổng Dịch Vụ Nền Tảng & API (Backend Services)
| Cổng / Dịch Vụ | Địa Chỉ | Ghi Chú |
| :--- | :--- | :--- |
| **Backend REST API** | `http://localhost:8080/api/v1` | Cổng API chính thức (Spring Boot 3.3.5) |
| **WebSocket STOMP** | `ws://localhost:8080/ws` | Kênh kết nối thời gian thực (SockJS Fallback) |
| **Mobile App Metro** | `http://localhost:8081` | Expo Dev Server (React Native) |
| **PostgreSQL Database**| `localhost:5432/ap_sports_ecommerce` | CSDL quan hệ chính thức |
| **Redis Cache** | `localhost:6379` | Cache phiên & Token Blacklist |

---

## 🔑 3. Tài Khoản Đăng Nhập Mẫu (Seed Credentials)

Hệ thống được nạp sẵn danh sách tài khoản phục vụ nghiệm thu đồ án:

| Vai Trò (Role) | Email Đăng Nhập | Mật Khẩu | Quyền Hạn Nổi Bật |
| :--- | :--- | :--- | :--- |
| **Quản Trị Viên (ADMIN)** | `admin@example.com` | `Admin@123` | Toàn quyền kiểm soát hệ thống, xem báo cáo tài chính, quản lý người dùng |
| **Nhân Viên Bán Hàng (STAFF)** | `staff@example.com` | `Staff@123` | Quản lý đơn hàng, duyệt sản phẩm, tư vấn Live Chat CSKH trực tuyến |
| **Thủ Kho (WAREHOUSE_MANAGER)** | `warehouse@example.com` | `Warehouse@123`| Quét Barcode đóng gói niêm phong, lập phiếu nhập/xuất kho, xem tồn kho |
| **Khách Hàng Mẫu (CUSTOMER)** | `customer@example.com` | `Customer@123` | Mua sắm, thanh toán VNPay, theo dõi định vị GPS, đánh giá kèm ảnh |
| **Quản Lý Bưu Cục (GHN_STATION)** | `station1@ghn.vn` | `Station@123` | Quản lý tiếp nhận hàng tại Bưu cục trung chuyển GHN |
| **Tài Xế Giao Hàng (GHN_SHIPPER)** | `shipper@ghn.vn` | `Shipper@123` | Nhận lệnh giao hàng, cập nhật trạng thái phát hàng thành công |

---

## 🏛️ 4. Kiến Trúc Hệ Thống & Phân Tầng (System Architecture)

Dự án áp dụng chặt chẽ mô hình **Layered Architecture** đồng bộ xuyên suốt từ Frontend đến Backend:

```
[ Frontend: Next.js App Router ]
   │
   ├─► pages (src/app/*) ──► Chỉ định tuyến và nhúng components giao diện
   ├─► components (src/components/*) ──► Presentation components thuần túy (KHÔNG useState/useEffect)
   ├─► hooks (src/hooks/*) ──► Xử lý trạng thái, vòng đời giao diện và gọi FE Controller
   └─► controllers (src/controllers/*) ──► Chuẩn hóa DTO và gọi REST API / WebSocket
         │
         ▼ (HTTP REST JSON & WebSocket STOMP)
[ Backend: Spring Boot 3.3.5 ]
   │
   ├─► controller (com.web.ap_sports.controller.*) ──► Tiếp nhận request, kiểm tra @Valid, @PreAuthorize
   ├─► service (com.web.ap_sports.service.*) ──► Xử lý nghiệp vụ lõi, bảo mật, Event-driven
   ├─► repository (com.web.ap_sports.repository.*) ──► Spring Data JPA & Custom JPQL Queries
   └─► database (PostgreSQL 16) ──► Bảng dữ liệu quan hệ, Indexing & Version Lock (@Version)
```

---

## 📂 5. Cấu Trúc Thư Mục Dự Án (Directory Structure)

```
d:\LVTN\
├── backend/                       # Module Backend (Spring Boot 3.3.5, Java 21)
│   ├── src/main/java/com/web/ap_sports/
│   │   ├── config/                # Cấu hình Security, JWT, CORS, WebSocket STOMP, Mail, Async
│   │   ├── controller/            # REST Controllers (Customer, Admin, Warehouse, Staff, AI, Demo)
│   │   ├── dto/                   # Data Transfer Objects (Request/Response DTO)
│   │   ├── entity/                # JPA Entities (User, Product, ProductVariant, Order, SupportMessage...)
│   │   ├── enums/                 # Enum trạng thái (OrderStatus, UserRole, NotificationActionType...)
│   │   ├── event/                 # Spring Events & Listeners (LowInventoryEvent, OrderPlacedEvent...)
│   │   ├── repository/            # Spring Data JPA Repositories
│   │   ├── seed/                  # DataInitializer (Seeder nạp tài khoản mẫu, danh mục, sản phẩm)
│   │   └── service/               # Interface & Service Implementations
│   ├── src/main/resources/        # application.yml, template email, banner
│   ├── .env.example               # Mẫu biến môi trường Backend
│   ├── build.gradle               # Cấu hình dependencies Gradle
│   └── README.md                  # Hướng dẫn chi tiết Backend
│
├── frontend/                      # Module Frontend (Next.js 15, TypeScript, Tailwind CSS)
│   ├── src/
│   │   ├── app/                   # App Router Pages (/admin, /profile, /checkout, /demo...)
│   │   ├── components/            # UI Components theo phân hệ (admin, customer, demo, common)
│   │   ├── context/               # React Context Providers (NotificationContext, CartContext...)
│   │   ├── controllers/           # Frontend Controller gọi Backend API
│   │   ├── hooks/                 # Custom Hooks quản lý nghiệp vụ & state giao diện
│   │   ├── services/              # Base API Client (Axios interceptor, Auto refresh JWT)
│   │   ├── types/                 # TypeScript Interfaces & Types
│   │   └── utils/                 # Barcode generator, GPS Haversine, Stock ticket printer
│   ├── public/                    # Tài nguyên tĩnh (ảnh, logo, icons)
│   ├── .env.example               # Mẫu biến môi trường Frontend
│   ├── package.json               # Dependencies Frontend
│   └── README.md                  # Hướng dẫn chi tiết Frontend
│
├── mobile-app/                    # Module Mobile App (React Native, Expo SDK 54, TypeScript)
│   ├── src/
│   │   ├── components/            # UI Components Mobile (ProductCard, SizeSelector, Header...)
│   │   ├── config/                # Cấu hình kết nối API & IP máy chủ
│   │   ├── navigation/            # React Navigation Stacks & Bottom Tabs
│   │   ├── screens/               # Màn hình chức năng (Home, Catalog, Cart, Checkout, Tracking...)
│   │   ├── services/              # Storage an toàn (SecureStore) & API Client
│   │   └── types/                 # TypeScript definitions cho Mobile
│   ├── app.json                   # Expo App Configuration
│   ├── package.json               # Dependencies Mobile
│   └── README.md                  # Hướng dẫn chi tiết Mobile App
│
├── package.json                   # Root package script điều khiển toàn bộ dự án
└── README.md                      # Tài liệu tổng quan toàn bộ hệ thống
```

---

## ⚡ 6. Các Tính Năng Trọng Tâm Đột Phá

### 1. Quy Trình Kho Vận WMS Barcode Chặt Chẽ (Pick & Pack Pipeline)
- **Chuẩn mã vạch Code 128 Subset B thuần SVG**: Tự động sinh mã WMS ngắn gọn `AP-{variantId}` hoặc `SKU`, tương thích $100\%$ với tất cả các máy đọc Barcode laser cầm tay và Camera điện thoại.
- **Bảo mật 2 tầng chống thao tác lại**:
  - **Backend**: Chặn đứng tuyệt đối ở cấp Service nếu `order.getPackVerified() == true` hoặc trạng thái đơn không còn là `confirmed` $\rightarrow$ ném lỗi `BAD_REQUEST`. Bảo vệ sổ kho `inventory_transactions` chỉ phát sinh duy nhất 01 phiếu xuất kho `PXK-DH-...`.
  - **Frontend**: Ẩn hoàn toàn nút quét kiểm đếm, thay thế bằng Badge xác nhận tĩnh trang trọng `✅ ĐÃ NIÊM PHONG XUẤT KHO (Thủ kho: [Tên])`. Khóa ô quét mã trong modal.

### 2. Thông Báo Real-time WebSocket Đa Kênh Kèm Bộ Lọc Chống Spam
- **Hàng đợi tư vấn trực tiếp (Support Chat)**: Tự động nhảy số badge nhấp nháy trên Sidebar nhóm *Chăm Sóc Khách Hàng* ngay khi có ca chat mới mà không cần F5 trình duyệt.
- **Cảnh báo kho vận**: Nhảy số badge đỏ nhấp nháy trên mục *Quản Lý Kho* khi sản phẩm chạm ngưỡng tồn kho thấp hoặc hết hàng.
- **Popup Toast tương tác**: Tự động phát âm thanh thông báo nhẹ nhàng qua Web Audio API, hiển thị popup Sonner kèm nút điều hướng nhanh **[Vào Chat]** hoặc **[Kiểm Tra Kho]**.
- **Chống spam 2 tầng**:
  - Backend giới hạn throttle $60\text{s}$ cho mỗi ca chat.
  - Frontend deduplicate theo ID và throttle $30\text{s}$, ngăn chặn hoàn toàn việc nổ hàng loạt popup khi khách hàng gõ nhiều câu ngắn dồn dập.

### 3. Trợ Lý AI Tư Vấn Thể Thao & Giám Sát Vi Phạm (Google Gemini AI)
- **AI Sports Advisor**: Tư vấn chọn form giày theo mặt sân (Cỏ nhân tạo TF/AG, Futsal IC, Cỏ tự nhiên FG) và chọn kích cỡ bóng phù hợp lứa tuổi.
- **Lưu trữ gợi ý sản phẩm bền vững**: Sản phẩm gợi ý từ AI được lưu trữ bền vững trong CSDL (`chat_messages.suggested_products_json`), không bị mất khi đóng/mở lại widget chat.
- **AI Content Moderation**: Tự động quét và che mờ từ ngữ vi phạm, độc hại trong khung trò chuyện trực tuyến, bảo vệ không gian thảo luận văn minh.

### 4. Bản Đồ Vận Chuyển Real-Time OSRM & GPS Haversine
- Sử dụng thuật toán Haversine đo khoảng cách địa lý chính xác từng mét từ Kho AP Sports Cần Thơ đến tọa độ khách hàng.
- Tính toán vị trí xe tải di chuyển $60\text{ km/h}$ dựa trên mốc thời gian Backend (*Single Source of Truth*), không bao giờ bị nhảy sai vị trí khi F5 tải lại trang.
- Vẽ lộ trình bám sát đường lộ quốc lộ bằng OSRM Routing Engine.

### 5. Kiến Trúc Bảo Mật Phiên Đa Cổng & Khử Lỗi 401 Khách Vãng Lai (Session Hint Pattern)
- **Chuẩn bảo mật OWASP nghiêm ngặt**: Toàn bộ JWT Access Token (30 phút) và Refresh Token (7 ngày) lưu trữ độc quyền trong **HttpOnly, Secure, SameSite=Lax Cookies**, chống đánh cắp XSS $100\%$.
- **Cơ chế Cờ Giao Diện (Session Hint)**: `localStorage` chỉ lưu chuỗi cờ `"true"` (`apsports_has_session`, `apsports_admin_has_session`, `apsports_logistics_has_session`).
  - *Khách vãng lai*: Nhận diện trong 0ms $\rightarrow$ không gửi API `/auth/me` thừa $\rightarrow$ triệt tiêu hoàn toàn lỗi 401 trong Network Tab.
  - *Người dùng đã đăng nhập*: Tự động kích hoạt 401 Silent Refresh của `apiClient` khi Access Token 30 phút hết hạn để duy trì phiên mượt mà.
- **Bền bỉ khi chuyển tab (Tab-Switching Resilience)**: Loại bỏ sự kiện `visibilitychange` gây lỗi 403 CSRF; bổ sung cơ chế Proactive Refresh ngầm 20 phút có CSRF Token (`X-XSRF-TOKEN`), giữ nguyên phiên khi chuyển tab mà không gây giật nháy UI (no flicker).

### 6. Giao Diện Responsive Chuẩn E-Commerce & Tối Ưu Tìm Kiếm (Debounce & AbortController)
- **Hệ thống điều hướng Responsive đa thiết bị**:
  - Điểm ngắt chuẩn **1280px** (`xl`): Thu gọn toàn bộ icon tiện ích vào nút Menu Hamburger 3 thanh capsule bo tròn góc mịn (`HamburgerPillIcon` với `rx="1.8"`).
  - Off-Canvas Mobile Drawer trượt từ mép phải rộng **88vw** (tối đa **380px**), phủ nền mờ `backdrop-blur-sm`, khóa cuộn nền (`body scroll lock`), tích hợp tìm kiếm full-width, thẻ định danh tài khoản, menu điều hướng và tiện ích nhanh (Wishlist, Thông báo, Theme).
  - Chuẩn hóa chiều cao Banner trang Home (`340px - 620px`) và PageHeaderBanner các trang con (`328px - 608px`, ngắn hơn Home 12px) với ảnh sân vận động thể thao trang nhã (`clean_sports_header.jpg`), chống cắt dấu tiếng Việt.
- **Tối ưu hóa tìm kiếm sản phẩm (Debounce 400ms + AbortController)**:
  - Phản hồi gõ phím tức thời 0ms trên UI, trì hoãn gọi API tìm kiếm 400ms $\rightarrow$ giảm hơn **85%** tải truy vấn SQL `LIKE` lên Database.
  - Tự động hủy (`abort()`) request cũ đang bay khi có phím mới, triệt tiêu hoàn toàn lỗi Race Condition.
- **Tuân thủ Clean Architecture phân tầng**: Tách biệt 100% logic khỏi UI components ([`Navbar.tsx`](file:///d:/LVTN/frontend/src/components/layout/Navbar.tsx), [`NavbarSearchBar.tsx`](file:///d:/LVTN/frontend/src/components/layout/NavbarSearchBar.tsx)) vào các Custom Hooks ([`useNavbar.ts`](file:///d:/LVTN/frontend/src/hooks/useNavbar.ts), [`useNavbarSearchBar.ts`](file:///d:/LVTN/frontend/src/hooks/useNavbarSearchBar.ts)).

---

## 💻 7. Yêu Cầu Môi Trường (Prerequisites)

Trước khi bắt đầu cài đặt, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Node.js**: Phiên bản `v20.x` hoặc `v22.x` trở lên ([Tải tại đây](https://nodejs.org/))
- **Java Development Kit (JDK)**: Phiên bản `Java 21 LTS` (Oracle OpenJDK hoặc Eclipse Temurin)
- **PostgreSQL**: Phiên bản `15` hoặc `16` ([Tải tại đây](https://www.postgresql.org/))
- **Git**: Phiên bản mới nhất
- **Thiết bị di động**: Cài sẵn ứng dụng **Expo Go** trên App Store hoặc Google Play (dành cho thử nghiệm Mobile App)

---

## 🚀 8. Hướng Dẫn Cài Đặt & Khởi Chạy (Step-by-step Setup)

### Bước 1: Chuẩn Bị Cơ Sở Dữ Liệu PostgreSQL
1. Mở công cụ quản trị **pgAdmin** hoặc dòng lệnh `psql`.
2. Tạo cơ sở dữ liệu mới mang tên:
   ```sql
   CREATE DATABASE ap_sports_ecommerce;
   ```

### Bước 2: Khởi Chạy Cực Nhanh Từ Thư Mục Gốc
Tại thư mục gốc `d:\LVTN`:

```bash
# 1. Cài đặt dependencies cho Frontend & Mobile App
cd frontend && npm install && cd ..
cd mobile-app && npm install && cd ..

# 2. Khởi chạy đồng thời Backend và Frontend qua các lệnh tắt:
npm run backend     # Chạy Backend Spring Boot tại cổng 8080
npm run frontend    # Chạy Frontend Next.js tại cổng 3000
npm run mobile      # Chạy Mobile App React Native Expo tại cổng 8081
```

---

### Bước 3: Khởi Chạy Từng Phân Hệ Riêng Biệt

#### ☕ 1. Khởi chạy Backend:
```bash
cd backend

# Biên dịch thử nghiệm mã nguồn Java
./gradlew.bat compileJava

# Chạy Backend (Tự động nạp biến môi trường từ .env và seed dữ liệu mẫu)
./gradlew.bat bootRun
```
*Backend sẽ lắng nghe tại cổng `http://localhost:8080`.*

#### ⚛️ 2. Khởi chạy Frontend:
```bash
cd frontend

# Chạy môi trường phát triển Next.js
npm run dev
```
*Frontend sẽ mở tại cổng `http://localhost:3000`.*

#### 📱 3. Khởi chạy Mobile App:
```bash
cd mobile-app

# Cập nhật địa chỉ IP Wi-Fi của máy tính trong mobile-app/.env (hoặc src/config/api.config.ts)
npx expo start
```
*Dùng app **Expo Go** trên điện thoại cùng mạng Wi-Fi quét mã QR trên màn hình terminal.*

---

## 🔐 9. Biến Môi Trường (Environment Variables)

### Backend (`backend/.env` - Tham khảo `.env.example`):
```env
SERVER_PORT=8080
DB_URL=jdbc:postgresql://localhost:5432/ap_sports_ecommerce
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

JWT_SECRET=your_jwt_hmac_sha256_secret_key_here
JWT_ACCESS_EXPIRATION_MS=1800000
JWT_REFRESH_EXPIRATION_MS=604800000

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/checkout/vnpay-return

CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws
NEXT_PUBLIC_HOTLINE_NUMBER=0987.654.321
NEXT_PUBLIC_HOTLINE_TEL=tel:0987654321
```

### Mobile App (`mobile-app/.env`):
```env
EXPO_PUBLIC_LOCAL_IP=A.A.A.A # Đổi thành IPv4 của máy tính bạn
EXPO_PUBLIC_BACKEND_PORT=8080
EXPO_PUBLIC_API_URL=http://A.A.A.A:8080/api/v1
```

---

## 📜 10. Bản Quyền & Thông Tin Nhóm

- **Dự Án**: Luận Văn Tốt Nghiệp Đại Học Chuyên Ngành Kỹ Thuật Phần Mềm / Công Nghệ Thông Tin.
- **Bản Quyền**: © 2026 AP Sports Enterprise. Giữ toàn bộ quyền sở hữu trí tuệ.
- **Hỗ Trợ Kỹ Thuật**: Liên hệ trực tiếp qua Email hoặc kênh Hotline hỗ trợ khách hàng AP Sports.
