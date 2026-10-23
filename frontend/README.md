# ⚛️ AP SPORTS FRONTEND WEB APP - NEXT.JS ENTERPRISE STOREFRONT & ADMIN PORTAL

> **Mô tả**: Ứng dụng Web giao diện người dùng của nền tảng **AP Sports Enterprise**, bao gồm Cổng mua sắm khách hàng (Customer Storefront), Cổng điều hành quản trị đa năng (Admin & Staff Operations Portal), và Hệ thống mô phỏng vận chuyển logistics 3 trạm thời gian thực. Phát triển trên nền tảng **Next.js 15 App Router** và **TypeScript**.

[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GPS_Map-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 📑 MỤC LỤC
1. [Kiến Trúc Phân Tầng Giao Diện (Frontend Architecture)](#-1-kiến-trúc-phân-tầng-giao-diện-frontend-architecture)
2. [Cấu Trúc Thư Mục Chi Tiết (Directory Layout)](#-2-cấu-trúc-thư-mục-chi-tiết-directory-layout)
3. [Các Phân Hệ Giao Diện Chính](#-3-các-phân-hệ-giao-diện-chính)
4. [Hệ Thống WebSocket Thời Gian Thực & Badge Tự Động](#-4-hệ-thống-websocket-thời-gian-thực--badge-tự-động)
5. [Cấu Hình Biến Môi Trường (Environment Configuration)](#-5-cấu-hình-biến-môi-trường-environment-configuration)
6. [Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart)](#-6-hướng-dẫn-cài-đặt--khởi-chạy-quickstart)
7. [Tiêu Chuẩn Kiểm Thử & Kiểm Soát Kiểu (Type Checking)](#-7-tiêu-chuẩn-kiểm-thử--kiểm-soát-kiểu-type-checking)

---

## 🏛️ 1. Kiến Trúc Phân Tầng Giao Diện (Frontend Architecture)

Dự án áp dụng chặt chẽ quy chuẩn **Clean Layered Architecture** cho Next.js App Router:

```
[ Router: src/app/* ]
       │  (Chỉ khai báo Route, Page metadata, nhúng Presentation Component)
       ▼
[ Presentation Components: src/components/* ]
       │  (Component hiển thị thuần túy, TUYỆT ĐỐI KHÔNG DÙNG useState, useEffect)
       │  (Chỉ nhận Props và phát sự kiện qua Callbacks)
       ▼
[ Hooks Layer: src/hooks/* ]
       │  (Chịu trách nhiệm quản lý State, Vòng đời hiển thị, Lắng nghe Socket)
       │  (Gọi các hàm xử lý từ Frontend Controller)
       ▼
[ Controller Layer: src/controllers/* ]
       │  (Chuẩn hóa Payload DTO, xử lý mapping dữ liệu trước khi gửi/nhận)
       │  (Gọi Base API Client)
       ▼
[ Services & API Client: src/services/api/client.ts ]
          (Axios Interceptor tự động đính kèm Token, Silent Refresh khi Access Token hết hạn)
```

---

## 📂 2. Cấu Trúc Thư Mục Chi Tiết (Directory Layout)

```
frontend/
├── src/
│   ├── app/                           # Next.js 15 App Router
│   │   ├── (auth)/                    # Đăng nhập, đăng ký, kích hoạt tài khoản
│   │   ├── admin/                     # Cổng quản trị (/admin/orders, /admin/inventory, /admin/support-chat...)
│   │   ├── checkout/                  # Màn hình đặt hàng & kết quả VNPay Return
│   │   ├── demo/                      # 3 Portal mô phỏng logistics (GHN Station, Carrier, Shipper)
│   │   ├── orders/                    # Theo dõi GPS lộ trình đơn hàng (/orders/tracking/[code])
│   │   ├── profile/                   # Quản lý tài khoản cá nhân & đơn hàng (/profile/orders)
│   │   └── layout.tsx                 # Root Layout với NotificationProvider & Sonner Toaster
│   ├── components/                    # Pure Presentation Components
│   │   ├── admin/                     # Layout Admin (AdminSidebar, AdminHeader, LogisticsControlPanel...)
│   │   ├── customer/                  # Giao diện khách hàng (ProductCard, CartDrawer, OrderHistory...)
│   │   ├── demo/                      # Giao diện cho 3 Portal mô phỏng vận chuyển
│   │   └── common/                    # Component dùng chung (BarcodeVisual, Modal, PageBanner...)
│   ├── context/                       # React Context Providers (NotificationContext, CartContext...)
│   ├── controllers/                   # Frontend Controllers
│   │   ├── admin-order-controller.ts
│   │   ├── customer-order-controller.ts
│   │   ├── warehouse-fulfillment-controller.ts
│   │   ├── support-chat-controller.ts
│   │   └── warehouse-inventory-controller.ts
│   ├── hooks/                         # Custom Hooks quản lý nghiệp vụ và state
│   │   ├── useWebSocket.ts            # Quản lý kết nối STOMP/SockJS toàn cục & chống spam
│   │   ├── useAdminSidebar.ts         # Quản lý badge số ca chờ chat & cảnh báo kho
│   │   ├── useOrderPackingScanner.ts  # Máy quét kiểm đếm Barcode Code 128
│   │   └── useStaffSupportChat.ts     # Xử lý phòng chat tư vấn trực tuyến
│   ├── services/                      # Axios Client với cơ chế Silent Refresh
│   ├── types/                         # Định nghĩa kiểu dữ liệu TypeScript
│   └── utils/                         # Barcode SVG generator, GPS Haversine, Print templates
├── public/                            # Ảnh tĩnh, logo, font chữ
├── .env.example                       # Tệp mẫu biến môi trường
├── package.json                       # Dependencies & Scripts
└── README.md                          # Tài liệu kỹ thuật Frontend
```

---

## 🎨 3. Các Phân Hệ Giao Diện Chính

### A. Cổng Mua Sắm Khách Hàng (Customer Storefront)
- **Trang chủ & Danh mục thể thao**: Banner ưu đãi, phân loại môn thể thao (Bóng đá, Cầu lông, Bóng rổ, Võ thuật...), lưới sản phẩm nổi bật.
- **Trang sản phẩm & Biến thể**: Hỗ trợ chọn Size số (38..43) hoặc Size chữ (S..XXL), Màu sắc trực quan; tự động kiểm tra tồn kho theo từng biến thể. Đăng ký thông báo khi có hàng (*Restock Notification*).
- **Giỏ hàng & Đặt hàng nhanh (<150ms)**: Áp dụng mã giảm giá Voucher tức thì, tính toán cước vận chuyển thông minh.
- **Quản lý đơn hàng cá nhân (`/profile/orders`)**: 10 tab trạng thái đơn hàng được dàn đều cân đối, lọc theo khoảng ngày cụ thể (Từ ngày $\rightarrow$ Đến ngày), xem hóa đơn điện tử VAT.
- **Theo dõi định vị GPS thời gian thực (`/orders/tracking/[code]`)**: Bản đồ Leaflet OSRM tự động vẽ tuyến đường quốc lộ và mô phỏng xe tải chạy $60\text{ km/h}$ mượt mà.

### B. Cổng Quản Trị & Vận Hành Doanh Nghiệp (Admin & Staff Portal)
- **Bảng điều phối logistics đơn hàng (`LogisticsControlPanel`)**:
  - Chuyển tiếp trạng thái đơn hàng theo đúng chu trình chuẩn.
  - Tự động ẩn nút đóng gói khi đơn đã được niêm phong, hiển thị huy hiệu `✅ Đã Đóng Gói Niêm Phong (Tên thủ kho phụ trách)`.
- **Máy quét Barcode WMS (`OrderPackingScannerModal`)**:
  - Hỗ trợ máy bắn mã vạch chuyên dụng và camera điện thoại.
  - Nhận diện linh hoạt mã ngắn `AP-{variantId}`, `SKU` và mã vạch riêng biệt của biến thể.
  - Kiểm đếm đủ $100\%$ mới mở khóa nút niêm phong và tự động sinh phiếu xuất kho.
- **Phòng tư vấn trực tuyến (`/admin/support-chat`)**:
  - Kết nối WebSocket realtime, hỗ trợ đa tab ca chờ, ca đang phụ trách và lịch sử.
  - Tích hợp gợi ý câu trả lời thông minh (AI Smart Reply) và lọc ngôn từ độc hại tự động.

---

## 🔔 4. Hệ Thống WebSocket Thời Gian Thực & Badge Tự Động

- **Kết nối toàn cục qua [useWebSocket.ts](file:///d:/LVTN/frontend/src/hooks/useWebSocket.ts)**:
  - Tự động bắt tay Handshake qua SockJS có kèm HttpOnly Cookie xác thực.
  - Lắng nghe kênh thông báo cá nhân `/user/queue/notifications` và kênh hàng đợi `/topic/support-queue`.
- **Cơ chế Chống Spam (Throttling & Deduplication)**:
  - Deduplicate theo ID thông báo tránh hiển thị lại.
  - Giới hạn tối thiểu $30\text{s}$ giữa 2 lần hiển thị popup toast cho cùng một ca chat hoặc cùng một cảnh báo kho.
- **Popup Toast Sonner kèm âm thanh**:
  - Sử dụng Web Audio API phát tiếng bíp thông báo nhẹ nhàng.
  - Nút bấm hành động nhanh **[Vào Chat]** hoặc **[Kiểm Tra Kho]** giúp thao tác ngay mà không cần tìm kiếm trên menu.
- **Badge nhấp nháy trên Sidebar ([AdminSidebar.tsx](file:///d:/LVTN/frontend/src/components/admin/layout/AdminSidebar.tsx))**:
  - Tự động cập nhật số lượng ca chờ hỗ trợ (`waitingSupportCount`) và số sản phẩm sắp hết hàng (`lowStockCount`) theo thời gian thực mà không cần tải lại trang.

---

## 🔐 5. Cấu Hình Biến Môi Trường (Environment Configuration)

Tạo tệp `.env.local` tại thư mục `frontend/` (tham khảo `.env.example`):

```env
# URL cổng Backend REST API (Spring Boot)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# URL cổng kết nối WebSocket STOMP
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws

# Thông tin đường dây nóng hỗ trợ khách hàng
NEXT_PUBLIC_HOTLINE_NUMBER=0987.654.321
NEXT_PUBLIC_HOTLINE_TEL=tel:0987654321
```

---

## 🚀 6. Hướng Dẫn Cài Đặt & Khởi Chạy (Quickstart)

```bash
# Di chuyển vào thư mục frontend
cd frontend

# 1. Cài đặt các thư viện phụ thuộc
npm install

# 2. Khởi chạy môi trường phát triển (Mặc định cổng 3000)
npm run dev

# 3. Biên dịch bản đóng gói Production
npm run build

# 4. Chạy bản đóng gói Production
npm run start
```

Mở trình duyệt và truy cập: [http://localhost:3000](http://localhost:3000).

---

## ✅ 7. Tiêu Chuẩn Kiểm Thử & Kiểm Soát Kiểu (Type Checking)

Để đảm bảo tính toàn vẹn và không xảy ra lỗi cú pháp hoặc sai lệch kiểu dữ liệu:
```bash
# Kiểm tra toàn bộ mã nguồn TypeScript không có lỗi biên dịch
npx tsc --noEmit
```
*Lệnh này phải trả về `Exit code 0` trước khi tiến hành đóng gói hoặc commit lên kho mã nguồn.*
