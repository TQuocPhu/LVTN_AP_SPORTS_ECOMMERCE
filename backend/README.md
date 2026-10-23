# ☕ AP SPORTS BACKEND SERVICE - ENTERPRISE REST API & REALTIME GATEWAY

> **Mô tả**: Dịch vụ Backend cốt lõi của nền tảng thương mại điện tử thể thao **AP Sports Enterprise**, được phát triển dựa trên nền tảng **Spring Boot 3.3.5** và **Java 21 LTS**, tích hợp bảo mật phân quyền đa tầng, WebSocket STOMP thời gian thực và mô phỏng chuỗi cung ứng logistics 3 trạm.

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

---

## 📑 MỤC LỤC
1. [Kiến Trúc Phân Tầng (Backend Architecture)](#-1-kiến-trúc-phân-tầng-backend-architecture)
2. [Ngăn Xếp Công Nghệ (Technology Stack)](#-2-ngăn-xếp-công-nghệ-technology-stack)
3. [Cấu Trúc Thư Mục Module (Directory Layout)](#-3-cấu-trúc-thư-mục-module-directory-layout)
4. [Cấu Hình Biến Môi Trường (Environment Configuration)](#-4-cấu-hình-biến-môi-trường-environment-configuration)
5. [Cơ Sở Dữ Liệu & Data Seeder Tự Động](#-5-cơ-sở-dữ-liệu--data-seeder-tự-động)
6. [Danh Mục API Chính Thức (API Endpoints Overview)](#-6-danh-mục-api-chính-thức-api-endpoints-overview)
7. [Hướng Dẫn Biên Dịch & Vận Hành (Build & Run Guide)](#-7-hướng-dẫn-biên-dịch--vận-hành-build--run-guide)
8. [Quy Tắc Đóng Gói Kho & Bảo Mật Nghiệp Vụ](#-8-quy-tắc-đóng-gói-kho--bảo-mật-nghiệp-vụ)

---

## 🏛️ 1. Kiến Trúc Phân Tầng (Backend Architecture)

Hệ thống tuân thủ nghiêm ngặt mô hình **Layered Architecture** kết hợp **Event-Driven Architecture**:

```
[ Client Request ]
       │
       ▼
1. Security & Filters: JwtAuthenticationFilter -> HttpOnly Cookie & Authorization Header
       │
       ▼
2. Controller Layer (com.web.ap_sports.controller.*)
   - Tiếp nhận HTTP Request & WebSocket Handshake
   - Kiểm tra DTO Validation (@Valid)
   - Phân quyền theo vai trò (@PreAuthorize)
       │
       ▼
3. Service Layer (com.web.ap_sports.service.*)
   - Xử lý nghiệp vụ lõi (Business Logic & Transactions)
   - Throttling & Anti-spam kiểm soát tần suất
   - Phát sự kiện nội bộ Spring Events (ApplicationEventPublisher)
       │
       ▼
4. Repository Layer (com.web.ap_sports.repository.*)
   - Spring Data JPA Repositories
   - Tối ưu truy vấn bằng JPQL / Native SQL với JPA Specification
       │
       ▼
5. Database Layer (PostgreSQL 16)
   - Bảng quan hệ với ràng buộc khóa ngoại, Unique Index và Optimistic Lock (@Version)
```

---

## 🛠️ 2. Ngăn Xếp Công Nghệ (Technology Stack)

| Thành phần | Công nghệ / Thư viện | Vai trò kỹ thuật |
| :--- | :--- | :--- |
| **Core Framework** | Spring Boot 3.3.5 | Nền tảng micro-service / monolithic enterprise |
| **Ngôn ngữ** | Java 21 LTS | Hỗ trợ Virtual Threads, Pattern Matching, Record |
| **Bảo mật & Auth** | Spring Security 6 & JJWT 0.12.5 | JWT Dual-Token (Access 30m, Refresh 7d) & HttpOnly Cookie |
| **CSDL Quan hệ** | PostgreSQL 16 & Hibernate ORM | Lưu trữ dữ liệu đơn hàng, sản phẩm, biến thể, giao dịch |
| **Realtime Gateway** | Spring WebSocket & STOMP | Kênh giao tiếp thời gian thực cho Live Chat và Thông báo |
| **Cache & Session** | Spring Data Redis | Lưu Blacklist Token và Caching danh mục sản phẩm |
| **AI Integration** | Google Gemini API Client | Trợ lý tư vấn chọn form giày/bóng & Giám sát ngôn từ vi phạm |
| **Thanh toán** | VNPay SDK, PayPal SDK | Tích hợp cổng thanh toán trực tuyến bảo mật SHA512 |
| **Email Service** | Spring Boot Starter Mail & Thymeleaf | Gửi email xác thực tài khoản và hóa đơn VAT dạng bất đồng bộ (`@Async`) |
| **File Storage** | Cloudinary API / MinIO | Quản lý tải lên hình ảnh sản phẩm thể thao và ảnh review |

---

## 📂 3. Cấu Trúc Thư Mục Module (Directory Layout)

```
backend/
├── src/main/java/com/web/ap_sports/
│   ├── config/               # Cấu hình SecurityConfig, WebSocketConfig, CorsConfig, MailConfig
│   ├── controller/           # REST Controllers
│   │   ├── admin/            # Quản trị viên (AdminOrder, AdminProduct, AdminUser, AdminReport...)
│   │   ├── customer/         # Khách hàng (CustomerOrder, CustomerProduct, CustomerSupportChat...)
│   │   ├── staff/            # Nhân viên (StaffSupportChat, StaffReport...)
│   │   ├── warehouse/        # Thủ kho (WarehouseFulfillment, WarehouseInventory...)
│   │   └── common/           # Phân hệ chung & Demo Logistics Portals
│   ├── dto/                  # Data Transfer Objects
│   │   ├── request/          # DTO nhận vào từ Client (@Valid)
│   │   └── response/         # DTO chuẩn hóa trả về (@Builder)
│   ├── entity/               # JPA Entities (@Entity, @Table, @Version)
│   ├── enums/                # Enum hệ thống (OrderStatus, NotificationActionType, UserRole...)
│   ├── event/                # Spring Events & Asynchronous Listeners
│   ├── exception/            # GlobalExceptionHandler & AppException (@ControllerAdvice)
│   ├── repository/           # Spring Data JPA Repositories
│   ├── seed/                 # DataInitializer (Khởi tạo tài khoản mẫu & quyền hạn mặc định)
│   └── service/              # Tầng nghiệp vụ xử lý logic
│       ├── admin/
│       ├── customer/
│       ├── staff/
│       ├── warehouse/
│       ├── ai/               # AI Advisor & Content Moderation Service
│       └── common/           # EmailService, NotificationService, GeocodingService
├── src/main/resources/
│   ├── application.yml       # Cấu hình thuộc tính Spring Boot
│   └── templates/            # Giao diện Email HTML Thymeleaf
├── build.gradle              # Khai báo thư viện và Gradle Plugins
└── README.md                 # Tài liệu kỹ thuật Backend
```

---

## 🔐 4. Cấu Hình Biến Môi Trường (Environment Configuration)

Tạo tệp `.env` trong thư mục `backend/` dựa trên mẫu sau (hoặc tham khảo `.env.example`).
> **Lưu ý quan trọng**: Không commit thông tin mật hoặc API Key thực tế lên kho mã nguồn công khai.

```env
# 1. Cấu hình máy chủ
SERVER_PORT=8080

# 2. Cơ sở dữ liệu PostgreSQL
DB_URL=jdbc:postgresql://localhost:5432/ap_sports_ecommerce
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DIALECT=org.hibernate.dialect.PostgreSQLDialect

# 3. Redis Cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# 4. Bảo mật JWT Token (HMAC SHA-256)
JWT_SECRET=your_jwt_access_token_secret_key_here
JWT_ACCESS_EXPIRATION_MS=1800000
JWT_REFRESH_SECRET=your_jwt_refresh_token_secret_key_here
JWT_REFRESH_EXPIRATION_MS=604800000
JWT_REFRESH_ABSOLUTE_MAX_DAYS=30

# 5. Cấu hình gửi Mail SMTP (Gmail App Password)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password

# 6. Dịch vụ lưu trữ hình ảnh Cloudinary
STORAGE_TYPE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# 7. Cổng thanh toán VNPay Sandbox
VNP_TMN_CODE=your_vnpay_tmn_code
VNP_HASH_SECRET=your_vnpay_hash_secret
VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/checkout/vnpay-return

# 8. Cấu hình CORS Whitelist
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 🗄️ 5. Cơ Sở Dữ Liệu & Data Seeder Tự Động

Khi khởi động lần đầu với `DataInitializer`:
1. **Roles & Permissions**: Tự động tạo 6 vai trò: `ADMIN`, `STAFF`, `WAREHOUSE_MANAGER`, `CUSTOMER`, `GHN_STATION`, `GHN_SHIPPER` cùng danh sách quyền chi tiết (`SUPPORT_LIVE_CHAT`, `MANAGE_INVENTORY`, `MANAGE_ORDERS`, `MANAGE_PRODUCTS`...).
2. **Tài khoản mặc định thử nghiệm**:
   - `admin@example.com` / `Admin@123` (Admin toàn quyền)
   - `staff@example.com` / `Staff@123` (Nhân viên bán hàng & CSKH)
   - `warehouse@example.com` / `Warehouse@123` (Thủ kho kiểm đếm Barcode)
   - `customer@example.com` / `Customer@123` (Khách hàng mẫu)
   - `station1@ghn.vn` / `Station@123` (Trạm trung chuyển GHN)
   - `shipper@ghn.vn` / `Shipper@123` (Tài xế giao hàng chặng cuối)

---

## 📡 6. Danh Mục API Chính Thức (API Endpoints Overview)

### A. Xác thực & Tài khoản (`/api/v1/auth/**`)
- `POST /api/v1/auth/login`: Đăng nhập, cấp phát Access Token và HttpOnly Refresh Token
- `POST /api/v1/auth/register`: Đăng ký tài khoản khách hàng, gửi mã kích hoạt email
- `POST /api/v1/auth/refresh-token`: Cấp mới Access Token bằng Refresh Token
- `POST /api/v1/auth/logout`: Đăng xuất và đưa Refresh Token vào danh sách hủy

### B. Kho Vận & Đóng Gói WMS (`/api/v1/warehouse/**`)
- `POST /api/v1/warehouse/fulfillment/orders/{id}/verify-pack`: Xác thực kiểm đếm Barcode 100% và đóng gói niêm phong đơn hàng. Tự động sinh phiếu xuất kho `PXK-DH-...`.
- `GET /api/v1/warehouse/fulfillment/orders/pending-packing`: Lấy danh sách các đơn hàng chờ đóng gói.
- `GET /api/v1/warehouse/inventory/low-stock`: Lấy danh sách sản phẩm chạm ngưỡng tồn kho tối thiểu.
- `POST /api/v1/warehouse/inventory/transactions`: Lập phiếu nhập kho (`IMPORT`) hoặc phiếu xuất kho thủ công (`EXPORT`).

### C. Tư Vấn Trực Tuyến & Giám Sát AI (`/api/v1/support-chat/**`)
- `POST /api/v1/customer/support-chat/conversations`: Khách hàng mở ca hỗ trợ trực tuyến
- `POST /api/v1/customer/support-chat/conversations/{id}/messages`: Gửi tin nhắn kèm AI lọc nội dung độc hại
- `GET /api/v1/staff/support-chat/queue`: Nhân viên lấy danh sách ca chờ tư vấn
- `POST /api/v1/staff/support-chat/conversations/{id}/accept`: Nhân viên tiếp nhận ca hỗ trợ

### D. Mô Phỏng Logistics 3 Trạm (`/api/v1/demo/logistics/**`)
- `GET /api/v1/demo/logistics/orders`: Lấy danh sách đơn hàng mô phỏng
- `PATCH /api/v1/demo/logistics/orders/{id}/status`: Chuyển trạng thái đơn qua từng trạm vận chuyển (`confirmed` $\rightarrow$ `processing` $\rightarrow$ `shipped` $\rightarrow$ `shipping` $\rightarrow$ `delivered`)

---

## 🚀 7. Hướng Dẫn Biên Dịch & Vận Hành (Build & Run Guide)

### Yêu cầu:
- Đã cài đặt JDK 21 LTS (`java -version`).
- PostgreSQL đang hoạt động và database `ap_sports_ecommerce` đã được tạo.

### Các lệnh thực thi chính thức:
```bash
# Di chuyển vào thư mục backend
cd backend

# 1. Kiểm tra biên dịch mã nguồn Java
./gradlew.bat compileJava

# 2. Chạy ứng dụng Spring Boot (Cổng 8080)
./gradlew.bat bootRun

# 3. Chạy toàn bộ Unit Tests & Integration Tests
./gradlew.bat test

# 4. Đóng gói file JAR chạy Production
./gradlew.bat bootJar
```
*File thực thi production sẽ được lưu tại: `build/libs/ap_sports-0.0.1-SNAPSHOT.jar`.*

---

## 🛡️ 8. Quy Tắc Đóng Gói Kho & Bảo Mật Nghiệp Vụ

1. **Chống đóng gói lại (Idempotency Protection)**:
   - Một đơn hàng khi đã được kiểm đếm barcode đủ 100% (`packVerified == true`), nếu gửi yêu cầu kiểm đếm lần 2 sẽ bị Service chặn đứng và trả về lỗi:
     `"Đơn hàng #... đã được kiểm đếm barcode và xuất kho niêm phong trước đó. Nghiệp vụ đóng gói đã hoàn tất, không được phép thao tác lại!" (HttpStatus.BAD_REQUEST)`.
2. **Phân quyền nghiêm ngặt**:
   - Nghiệp vụ đóng gói kho chỉ dành cho Thủ kho (`WAREHOUSE_MANAGER`) và Quản trị viên (`ADMIN`). Nhân viên bán hàng (`STAFF`) bị chặn ở mức `HttpStatus.FORBIDDEN`.
3. **Throttling chống spam thông báo ca chat**:
   - Áp dụng kiểm soát tần suất tối đa 1 thông báo/60 giây cho mỗi ca chat đang chờ, bảo vệ CSDL và hạ tầng mạng STOMP.
