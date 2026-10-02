# ⚡ AP SPORTS ENTERPRISE - E-COMMERCE & MULTI-PORTAL LOGISTICS SIMULATION PLATFORM

Đề tài Luận Văn Tốt Nghiệp: **Phân Tích, Thiết Kế Và Xây Dựng Hệ Thống Thương Mại Điện Tử Thể Thao Tích Hợp Mô Phỏng Vận Chuyển Logistics 3 Trạm Thực Tế (Full-Stack Production Ready)**.

---

## 📌 1. Cấu Trúc Thư Mục Dự Án & Clean Architecture

Dự án được xây dựng tuân thủ nghiêm ngặt mô hình **Clean Architecture 7-Layer Pattern**:

```
d:\LVTN\
├── backend/                  # Spring Boot 3.3.5 (Java 21)
│   └── src/main/java/com/web/ap_sports/
│       ├── config/           # SecurityConfig (JWT, CORS, Async Mail)
│       ├── controller/       # REST API Controllers (Customer, Admin, Demo Logistics)
│       ├── dto/              # Request & Response Data Transfer Objects
│       ├── entity/           # JPA Entities (Order, Product, Variant, Coupon, Payment)
│       ├── enums/            # OrderStatus, PaymentStatus, PaymentMethod
│       ├── repository/       # Spring Data JPA Repositories
│       └── service/          # Business Logic Layer (Order, Email, Geocoding)
├── frontend/                 # Next.js 14 App Router (TypeScript, Tailwind, Leaflet)
│   ├── src/app/              # Next.js Page Routes (/checkout, /admin/orders, /demo/*)
│   ├── src/components/       # Pure UI Components (Admin, Customer, Map, Demo Portals)
│   ├── src/controllers/      # Frontend API Controllers
│   ├── src/hooks/            # Custom Hooks (State & Business Logic isolation)
│   ├── src/types/            # TypeScript Interfaces & Types
│   └── src/utils/            # Geo Distance (Haversine), Logistics Real-time Sync
├── diary/plan/               # Kế hoạch & Kiến trúc hệ thống
└── README.md                 # Tài liệu hướng dẫn sử dụng chính thức
```

---

## 🔥 2. Các Điểm Nổi Bật Về Kỹ Thuật (Key Technical Features)

### ⚡ 1. Tối Ưu Hóa Tốc Độ Đặt Hàng Phản Hồi Tức Thì (< 150ms)
- **Non-blocking Async Email**: Kích hoạt `@EnableAsync` và `@Async` cho `EmailServiceImpl`. Việc kết nối gửi mail xác nhận đơn hàng qua SMTP được đẩy hoàn toàn sang luồng ngầm (Background Worker Thread), triệt tiêu hoàn toàn độ trễ 2s chờ mạng.
- **Pre-geocoded Coordinates**: Tọa độ GPS khách hàng được gán sẵn khi tạo địa chỉ, loại bỏ các lệnh gọi Geocode tuần tự lúc đặt hàng.

### 📦 2. Quản Lý Tồn Kho Kép & Mã Giảm Giá Đảm Bảo Toàn Vẹn
- **Trừ kho kép khi đặt hàng**: Khấu trừ đồng thời tồn kho tổng `Product.stock` và tồn kho biến thể `ProductVariant.stockQuantity`. Tự động chuyển trạng thái `out_of_stock` nếu tồn kho chạm mốc 0.
- **Hoàn kho & Hoàn lượt dùng Coupon khi Hủy đơn**: Khi đơn bị hủy (bởi Khách hàng, Admin hoặc thanh toán VNPay thất bại), hệ thống tự động:
  1. Phục hồi tồn kho sản phẩm và biến thể (`in_stock`).
  2. Tự động giảm `coupon.usedCount` đi 1 đơn vị, trả lại lượt sử dụng mã giảm giá chính xác cho khách hàng.

### 🚚 3. Nền Tảng Mô Phỏng Vận Chuyển Logistics 3 Trạm Thực Tế (Multi-Portal Logistics)
Tách biệt hoàn toàn vai trò quản lý, không để 1 nhân viên shop làm hết mọi việc:
- **Portal 1: GHN Station (`/demo/ghn-station`)**: Bưu cục tiếp nhận đơn hàng (`processing` $\rightarrow$ `shipped`).
- **Portal 2: Carrier Logistics (`/demo/carrier-logistics`)**: Trung tâm trung chuyển xe tải xuất phát (`shipped` $\rightarrow$ `shipping`).
- **Portal 3: Shipper App Mobile (`/demo/shipper-app`)**: Giao diện ứng dụng di động dành cho Shipper xác nhận đã giao hàng & thu tiền COD (`shipping` $\rightarrow$ `delivered`).

### 🗺️ 4. Bản Đồ Leaflet OSRM & Tính Tiến Trình Real-Time 60 km/h Xuyên Trình Duyệt
- **Backend Timestamp Math**: Sử dụng mốc thời gian `updatedAt` từ PostgreSQL làm *Single Source of Truth* để tính toán tiến trình xe di chuyển $60 \text{ km/h}$ chính xác từng giây mà không sợ F5 tải lại trang.
- **Công thức Haversine GPS Động (`geo-distance.ts`)**: Tự động đo khoảng cách địa lý thực tế từ Kho AP Sports Cần Thơ đến địa chỉ riêng của từng đơn hàng.
- **OSRM Road Routing Engine**: Tự động vẽ đường lộ thực tế ôm sát tuyến đường giao thông quốc lộ thay cho đường thẳng đứt đoạn.
- **BroadcastChannel API**: Đồng bộ vị trí xe tải real-time giữa tất cả các Tab trình duyệt (Khách hàng, Admin, Shipper).

---

## 🚀 3. Hướng Dẫn Khởi Chạy (Quickstart)

### Bước 1: Khởi chạy Backend Spring Boot (Cổng 8080)
Mở terminal tại thư mục gốc `d:\LVTN`:
```bash
npm run backend
```
*Hoặc khởi chạy trực tiếp trong thư mục `backend/`:*
```bash
cd backend
./gradlew.bat bootRun
```

### Bước 2: Khởi chạy Frontend Next.js (Cổng 3000)
Mở một terminal khác tại thư mục gốc `d:\LVTN`:
```bash
npm run frontend
```
*Hoặc khởi chạy trực tiếp trong thư mục `frontend/`:*
```bash
cd frontend
npm run dev
```

---

## 🌐 4. Danh Sách Đường Dẫn Demo Hệ Thống (Demo Endpoints)

| Phân Hệ | Đường Dẫn Portal | Mô Tả Chức Năng |
|---|---|---|
| **Khách Hàng** | [http://localhost:3000](http://localhost:3000) | Trang chủ mua sắm, xem sản phẩm, giỏ hàng |
| **Đặt Hàng** | [http://localhost:3000/checkout](http://localhost:3000/checkout) | Đặt hàng phản hồi nhanh <150ms (COD & VNPay) |
| **Theo Dõi Đơn** | [http://localhost:3000/orders/tracking/[orderCode]](http://localhost:3000/orders/tracking) | Bản đồ Leaflet OSRM xe tải chạy 60km/h real-time |
| **Admin Quản Trị** | [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders) | Dashboard quản lý đơn hàng, duyệt đơn, xem bản đồ GPS |
| **Trạm GHN Demo** | [http://localhost:3000/demo/ghn-station](http://localhost:3000/demo/ghn-station) | Portal Bưu cục GHN duyệt đóng gói & bàn giao |
| **Trung Chuyển Demo** | [http://localhost:3000/demo/carrier-logistics](http://localhost:3000/demo/carrier-logistics) | Portal Xe tải xuất phát giao hàng liên tỉnh |
| **App Shipper Demo** | [http://localhost:3000/demo/shipper-app](http://localhost:3000/demo/shipper-app) | Portal Ứng dụng di động Shipper xác nhận hoàn tất giao hàng |

---

© 2026 AP Sports Enterprise. All rights reserved.
