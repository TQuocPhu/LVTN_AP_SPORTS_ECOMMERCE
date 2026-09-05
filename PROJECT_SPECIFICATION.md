# 📘 BẢN THIẾT KẾ VÀ YÊU CẦU DỰ ÁN (PROJECT SPECIFICATION)
## WEBSITE THƯƠNG MẠI ĐIỆN TỬ BÁN DỤNG CỤ BÓNG ĐÁ & THỂ THAO ENTERPRISE (PRODUCTION READY)
**Đề tài Luận văn Tốt nghiệp & Hệ thống Thực tế Chuẩn Production cho Doanh Nghiệp Thể Thao**

> ⚠️ **NGUYÊN TẮC BẮT BUỘC KHÔNG THAY ĐỔI**:
> 1. Bảo tồn **100% tất cả các trường (columns) gốc** từ 21 Laravel Migrations của FreshHome. Mọi tính năng Enterprise được triển khai theo hướng **BỔ SUNG THÊM (Add-on)** trường/bảng mới, tuyệt đối **KHÔNG XÓA** bất kỳ trường nào của hệ thống CSDL gốc.
> 2. **QUY TẮC PHÁT TRIỂN DÀNH CHO AI**: AI **BẮT BUỘC** phải đọc qua các tệp tài liệu (`.docx`, `.md`, `PROJECT_SPECIFICATION.md`, `rules/`) trước khi đọc hay can thiệp vào tệp mã nguồn. Khi chưa có lệnh yêu cầu viết code trực tiếp từ người dùng, AI **CHỈ GIẢI THÍCH VÀ LÊN KẾ HOẠCH**, tuyệt đối **KHÔNG TỰ Ý SỬA/VIẾT CODE**.
> 3. **QUY TẮC BẢO MẬT TOKEN CLIENT**: **TUYỆT ĐỐI CẤM `localStorage` / `sessionStorage`** trong toàn bộ dự án. Tất cả JWT Tokens (`accessToken`, `refreshToken`) và dữ liệu lưu trữ phía Client **BẮT BUỘC CHỈ ĐƯỢC DÙNG COOKIES** (`HttpOnly Cookies` từ Backend hoặc Secure Client Cookies).

---

## 🎯 1. TỔNG QUAN & MỤC TIÊU DỰ ÁN

### 1.1. Mục Tiêu Dự Án
- Xây dựng một hệ thống thương mại điện tử **chuẩn Production Enterprise**, có khả năng vận hành thực tế cho doanh nghiệp thể thao vừa và nhỏ.
- Kế thừa và mở rộng toàn bộ **Cơ sở dữ liệu gốc từ 21 Laravel Migrations (FreshHome)** thành hệ thống **Full-Stack Clean Architecture**:
  - **Backend**: Spring Boot 3.3.5 (Java 21), Spring Data JPA, Spring Security (JWT Access/Refresh Tokens + Email Activation), Spring Mail, Redis, Cloudinary/MinIO Storage.
  - **Frontend**: Next.js 16/14 (App Router, TypeScript, Tailwind/Vanilla CSS), Recharts, Redux Toolkit/Zustand, Lucide Icons.

### 1.2. Phân Quyền Hệ Thống & Kiểm Soát Phạm Vi Thống Kê (Scoped RBAC)
1. **Khách Hàng (CUSTOMER)**: Mua hàng, chọn danh mục (đơn hoặc đa danh mục), chọn size số / size chữ, thanh toán VNPay/PayPal/COD, theo dõi đơn giao hàng GPS GHN/GHTK, chat trực tiếp với Nhân viên online, nhận thông báo có URL chuyển hướng.
2. **Nhân Viên Bán Hàng / CSKH (STAFF)**: Xử lý đơn hàng, phản hồi 1-1 cho từng `review_id`, phản hồi Liên hệ qua Email, tiếp nhận Chat trực tiếp với khách hàng, **chỉ xem được Thống kê Doanh số của CHÍNH MÌNH** theo các khoảng thời gian.
3. **Quản Lý Kho (WAREHOUSE_MANAGER)**: Lập phiếu nhập/xuất kho từ nhà cung cấp, kiểm kê hàng hóa, **xem báo cáo Quản lý kho chi tiết theo khoảng thời gian** (Hôm nay, 7 ngày, Tháng này, Năm nay, Tùy chỉnh).
4. **Quản Trị Viên (ADMIN)**: Phân quyền RBAC, cấu hình hệ thống, **xem Báo cáo Thống kê Tổng thể toàn bộ doanh nghiệp VÀ xem thống kê chi tiết theo TỪNG NHÂN VIÊN**.

---

## 🏗️ 2. KIẾN TRÚC THƯ MỤC BACKEND ENTERPRISE (LAYER-FIRST PHÂN SUB-PACKAGES THEO ROLE/SCOPE)

Để đáp ứng hệ thống phình to ra trong thực tế không bị ngập file (`folder overcrowding`), Backend áp dụng kiến trúc **Layer-First với Sub-packages phân chia theo Role/Phạm vi**:

```
com.web.ap_sports/
├── config/                     # Class cấu hình (Security, Redis, WebSocket, Storage)
├── entity/                     # 25 JPA Entities dùng chung đại diện các bảng DB
├── repository/                 # Spring Data JPA Repositories dùng chung
├── exception/                  # Global Exception Handler (@ControllerAdvice)
├── enums/                      # Các Java Enums (UserRole, UserStatus, PaymentMethod...)
│
├── dto/
│   ├── request/
│   │   ├── admin/              # Request DTOs đặc thù cho Admin Portal
│   │   ├── staff/              # Request DTOs đặc thù cho Staff Operations
│   │   ├── warehouse/          # Request DTOs đặc thù cho Quản lý kho
│   │   └── customer/           # Request DTOs dành cho Khách mua hàng Storefront
│   └── response/
│       ├── admin/
│       ├── staff/
│       ├── warehouse/
│       └── customer/
│
├── controller/
│   ├── admin/                  # Admin Controllers (/api/v1/admin/...)
│   ├── staff/                  # Staff Controllers (/api/v1/staff/...)
│   ├── warehouse/              # Warehouse Controllers (/api/v1/warehouse/...)
│   └── customer/               # Storefront Customer Controllers (/api/v1/customer/...)
│
└── service/
    ├── admin/                  # Business logic dành riêng cho Admin Management
    ├── staff/                  # Business logic dành riêng cho Staff Operations
    ├── warehouse/              # Business logic đặc thù cho Kho (Nhập/Xuất/Tồn)
    ├── customer/               # Business logic phục vụ Khách mua hàng
    └── common/                 # Core shared services (AuthService, CloudStorageService)
```

---

## 🗄️ 3. CHI TIẾT TỔNG THỂ CƠ SỞ DỮ LIỆU (BẢO TỒN 100% CẢ TRƯỜNG GỐC FRESHHOME & BỔ SUNG CÁC TRƯỜNG ENTERPRISE)

Dưới đây là chi tiết toàn bộ 25 bảng CSDL. Tất cả các trường gốc của FreshHome được **GIỮ NGUYÊN HOÀN TOÀN**, các trường bổ sung Enterprise được ghi chú rõ `[Bổ sung thêm]`:

### 3.1. Nhóm Phân Quyền, Người Dùng & JWT Refresh Tokens
1. **`roles`** *(Giữ nguyên 100% gốc)*:
   - `id`: BIGINT (Primary Key, Auto Increment)
   - `name`: VARCHAR(255) (Unique: `ADMIN`, `STAFF`, `WAREHOUSE_MANAGER`, `CUSTOMER`)
   - `created_at`, `updated_at`: TIMESTAMP
2. **`permissions`** *(Giữ nguyên 100% gốc)*:
   - `id`: BIGINT (Primary Key)
   - `name`: VARCHAR(255) (Unique)
   - `created_at`, `updated_at`: TIMESTAMP
3. **`role_permissions`** *(Giữ nguyên 100% gốc - JPA Entity `RolePermission.java` + `@EmbeddedId RolePermissionId.java`)*:
   - `role_id`: BIGINT (FK -> `roles.id` ON DELETE CASCADE)
   - `permission_id`: BIGINT (FK -> `permissions.id` ON DELETE CASCADE)
   - Composite Primary Key (`role_id`, `permission_id`)
   - `created_at`, `updated_at`: TIMESTAMP
4. **`users`** *(Giữ nguyên tất cả 11 trường gốc + Bổ sung 2 trường)*:
   - `id`: BIGINT (Primary Key)
   - `name`: VARCHAR(255) *(Gốc)*
   - `email`: VARCHAR(255) (Unique) *(Gốc)*
   - `password`: VARCHAR(255) (BCrypt Hashed) *(Gốc)*
   - `status`: ENUM (`pending`, `active`, `banned`, `deleted`) DEFAULT `pending` (Java Enum `UserStatus`) *(Gốc)*
   - `phone_number`: VARCHAR(50) (Nullable) *(Gốc)*
   - `avatar`: VARCHAR(500) (Nullable - Cloudinary/MinIO URL) *(Gốc)*
   - `address`: TEXT (Nullable) *(Gốc)*
   - `role_id`: BIGINT (FK -> `roles.id`) *(Gốc)*
   - `activation_token`: VARCHAR(255) (Nullable) *(Gốc)*
   - `google_id`: VARCHAR(255) (Nullable) *(Gốc)*
   - `email_verified_at`: TIMESTAMP (Nullable) `[Bổ sung thêm]`
   - `employee_code`: VARCHAR(50) (Nullable - Mã nhân viên) `[Bổ sung thêm]`
   - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
5. **`refresh_tokens`** `[BẢNG MỚI NÂNG CẤP JWT]`:
   - `id`: BIGINT (Primary Key)
   - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE)
   - `token`: VARCHAR(500) (Unique)
   - `expires_at`: TIMESTAMP
   - `revoked`: BOOLEAN DEFAULT FALSE
   - `created_at`: TIMESTAMP

### 3.2. Nhóm Danh Mục, Sản Phẩm & Biến Thể Dynamic (Đa - Đa)
6. **`categories`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 1 trường)*:
   - `id`: BIGINT (Primary Key)
   - `name`: VARCHAR(255) (Unique) *(Gốc)*
   - `slug`: VARCHAR(255) (Unique) *(Gốc)*
   - `description`: TEXT (Nullable) *(Gốc)*
   - `image`: VARCHAR(500) (Nullable) *(Gốc)*
   - `parent_id`: BIGINT (Nullable - FK -> `categories.id` cho Danh mục cha-con) `[Bổ sung thêm]`
   - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
7. **`products`** *(Giữ nguyên tất cả 9 trường gốc + Bổ sung 1 trường)*:
   - `id`: BIGINT (Primary Key)
   - `name`: VARCHAR(255) *(Gốc)*
   - `slug`: VARCHAR(255) (Unique) *(Gốc)*
   - `category_id`: BIGINT (FK -> `categories.id` ON DELETE CASCADE - Danh mục chính gốc) *(Gốc)*
   - `description`: TEXT (Nullable) *(Gốc)*
   - `price`: DECIMAL(10, 2) (Giá bán niêm yết cơ sở) *(Gốc)*
   - `stock`: INT DEFAULT 0 (Tổng tồn kho sản phẩm) *(Gốc)*
   - `status`: VARCHAR(50) DEFAULT `in_stock` (`in_stock`, `out_of_stock`, `discontinued`) *(Gốc)*
   - `unit`: VARCHAR(50) (Nullable - Đôi, Bộ, Chiếc, Bánh, Quả...) *(Gốc)*
   - `specifications`: JSON / TEXT (Thuộc tính linh hoạt: Mặt sân FG/TF/AG, Trọng lượng, Chất liệu, Xuất xứ...) `[Bổ sung thêm]`
   - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
8. **`product_categories`** `[BẢNG TRUNG GIẢN NÂNG CẤP NHIỀU - NHIỀU (JPA Entity ProductCategory.java + @EmbeddedId ProductCategoryId.java)]`:
   - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE)
   - `category_id`: BIGINT (FK -> `categories.id` ON DELETE CASCADE)
   - Composite Primary Key (`product_id`, `category_id`)
   - `created_at`, `updated_at`: TIMESTAMP
9. **`product_variants`** `[BẢNG MỚI ENTERPRISE]`:
   - `id`: BIGINT (Primary Key)
   - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE)
   - `sku`: VARCHAR(100) (Unique)
   - `size`: VARCHAR(50) (Size số: `38..43` cho Giày/Găng; Size chữ: `S..XXL` cho Quần Áo)
   - `color`: VARCHAR(50) (Nullable)
   - `price`: DECIMAL(10, 2) (Giá bán riêng của biến thể)
   - `cost_price`: DECIMAL(10, 2) (Giá vốn nhập kho)
   - `stock_quantity`: INT DEFAULT 0
   - `version`: BIGINT DEFAULT 0 (JPA `@Version` Optimistic Lock)
   - `created_at`, `updated_at`: TIMESTAMP
10. **`product_images`** *(Giữ nguyên 100% gốc + Bổ sung 1 trường)*:
    - `id`: BIGINT (Primary Key)
    - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE) *(Gốc)*
    - `image_path`: VARCHAR(500) (Cloudinary/MinIO Image URL) *(Gốc)*
    - `is_primary`: BOOLEAN DEFAULT FALSE `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*

### 3.3. Nhóm Quản Lý Kho & Nhà Cung Cấp
11. **`suppliers`** `[BẢNG MỚI ENTERPRISE]`:
    - `id`: BIGINT (Primary Key)
    - `name`: VARCHAR(255) (Nike, Adidas, Kamito, Puma...)
    - `code`: VARCHAR(50) (Unique)
    - `phone`: VARCHAR(50), `email`: VARCHAR(255), `address`: TEXT
    - `created_at`, `updated_at`: TIMESTAMP
12. **`inventory_transactions`** `[BẢNG MỚI ENTERPRISE]`:
    - `id`: BIGINT (Primary Key)
    - `variant_id`: BIGINT (FK -> `product_variants.id`)
    - `supplier_id`: BIGINT (Nullable - FK -> `suppliers.id`)
    - `type`: ENUM (`IMPORT`, `EXPORT`, `ADJUSTMENT`)
    - `quantity`: INT
    - `unit_cost`: DECIMAL(10, 2) (Giá vốn khi nhập)
    - `note`: TEXT
    - `created_by_user_id`: BIGINT (FK -> `users.id`)
    - `created_at`: TIMESTAMP

### 3.4. Nhóm Đơn Hàng & Vận Chuyển GPS
13. **`shipping_addresses`** *(Giữ nguyên tất cả 7 trường gốc + Bổ sung 3 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `full_name`: VARCHAR(255) *(Gốc)*
    - `phone`: VARCHAR(50) *(Gốc)*
    - `address`: VARCHAR(255) *(Gốc)*
    - `city`: VARCHAR(100) *(Gốc)*
    - `default`: BOOLEAN DEFAULT FALSE *(Gốc)*
    - `province_id`: INT (Nullable - Mã Tỉnh/Thành GHN/GHTK) `[Bổ sung thêm]`
    - `district_id`: INT (Nullable - Mã Quận/Huyện GHN/GHTK) `[Bổ sung thêm]`
    - `ward_code`: VARCHAR(50) (Nullable - Mã Phường/Xã GHN/GHTK) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
14. **`orders`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 8 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `total_price`: DECIMAL(10, 2) *(Gốc)*
    - `status`: VARCHAR(50) DEFAULT `pending` (`pending`, `confirmed`, `processing`, `shipping`, `delivered`, `canceled`, `returned`) *(Gốc)*
    - `shipping_address_id`: BIGINT (FK -> `shipping_addresses.id` ON DELETE CASCADE) *(Gốc)*
    - `coupon_id`: BIGINT (Nullable - FK -> `coupons.id`) *(Gốc)*
    - `order_code`: VARCHAR(50) (Unique - Mã đơn VD: `ORD-2026-9900`) `[Bổ sung thêm]`
    - `processed_by_staff_id`: BIGINT (Nullable - FK -> `users.id` - Ghi nhận Nhân viên xử lý đơn) `[Bổ sung thêm]`
    - `shipping_fee`: DECIMAL(10, 2) DEFAULT 0 `[Bổ sung thêm]`
    - `discount_amount`: DECIMAL(10, 2) DEFAULT 0 `[Bổ sung thêm]`
    - `final_amount`: DECIMAL(10, 2) `[Bổ sung thêm]`
    - `shipping_provider`: VARCHAR(50) DEFAULT `GHN` (`GHN`, `GHTK`, `INTERNAL`) `[Bổ sung thêm]`
    - `tracking_code`: VARCHAR(100) (Nullable - Mã vận đơn) `[Bổ sung thêm]`
    - `gps_latitude`: DOUBLE (Nullable - Vị trí GPS đơn hàng), `gps_longitude`: DOUBLE `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
15. **`order_items`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 2 trường)*:
    - `id`: BIGINT (Primary Key)
    - `order_id`: BIGINT (FK -> `orders.id` ON DELETE CASCADE) *(Gốc)*
    - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE) *(Gốc)*
    - `quantity`: INT *(Gốc)*
    - `price`: DECIMAL(10, 2) *(Gốc)*
    - `variant_id`: BIGINT (Nullable - FK -> `product_variants.id`) `[Bổ sung thêm]`
    - `cost_price`: DECIMAL(10, 2) (Giá vốn tại thời điểm bán) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
16. **`order_status_history`** *(Giữ nguyên tất cả các trường gốc + Bổ sung 1 trường)*:
    - `id`: BIGINT (Primary Key)
    - `order_id`: BIGINT (FK -> `orders.id` ON DELETE CASCADE) *(Gốc)*
    - `status`: VARCHAR(50) *(Gốc)*
    - `note`: TEXT (Nullable) *(Gốc)*
    - `changed_by_user_id`: BIGINT (Nullable - FK -> `users.id`) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*

### 3.5. Nhóm Thanh Toán Multi-Gate (VNPay, PayPal, COD)
17. **`payments`** *(Giữ nguyên tất cả 8 trường gốc + Bổ sung 2 trường)*:
    - `id`: BIGINT (Primary Key)
    - `order_id`: BIGINT (FK -> `orders.id` ON DELETE CASCADE) *(Gốc)*
    - `payment_method`: ENUM (`cash`, `paypal`, `momo`, `vnpay`, `bank_transfer`) *(Mở rộng ENUM từ gốc)*
    - `transaction_id`: VARCHAR(255) (Nullable) *(Gốc)*
    - `amount`: DECIMAL(10, 2) *(Gốc)*
    - `status`: ENUM (`pending`, `completed`, `failed`, `refunded`) DEFAULT `pending` *(Mở rộng ENUM từ gốc)*
    - `paid_at`: TIMESTAMP (Nullable) *(Gốc)*
    - `vnp_txn_ref`: VARCHAR(100) (Nullable - Mã tham chiếu VNPay) `[Bổ sung thêm]`
    - `vnp_response_code`: VARCHAR(10) (Nullable - Mã `00` là thành công) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*

### 3.6. Nhóm Tương Tác, Review 1-1, Live Chat Staff, Contacts & Notifications
18. **`reviews`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 4 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE) *(Gốc)*
    - `rating`: TINYINT UNSIGNED (1-5 sao) *(Gốc)*
    - `comment`: TEXT (Nullable) *(Gốc)*
    - `admin_reply`: TEXT (Nullable - Phản hồi 1-1 trực tiếp cho duy nhất `review_id` này) `[Bổ sung thêm]`
    - `replied_by_user_id`: BIGINT (Nullable - FK -> `users.id`) `[Bổ sung thêm]`
    - `replied_at`: TIMESTAMP (Nullable) `[Bổ sung thêm]`
    - `status`: VARCHAR(50) DEFAULT `approved` (`pending`, `approved`, `hidden`) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
19. **`chat_messages`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 2 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (Nullable - FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `guest_token`: VARCHAR(100) (Nullable, Index) *(Gốc)*
    - `sender`: ENUM (`user`, `bot`, `staff`) DEFAULT `user` *(Mở rộng ENUM từ gốc)*
    - `message`: TEXT *(Gốc)*
    - `staff_id`: BIGINT (Nullable - FK -> `users.id` - Nhân viên đang hỗ trợ trực tuyến) `[Bổ sung thêm]`
    - `is_read`: BOOLEAN DEFAULT FALSE `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
20. **`notifications`** *(Giữ nguyên tất cả 4 trường gốc + Bổ sung 3 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `title`: VARCHAR(255) `[Bổ sung thêm]`
    - `message`: TEXT *(Gốc)*
    - `is_read`: BOOLEAN DEFAULT FALSE `[Bổ sung thêm]`
    - `target_url`: VARCHAR(500) (Chứa đường dẫn FE để khi bấm vào sẽ Redirect trực tiếp: VD `/orders/ORD-2026-9900`) `[Bổ sung thêm]`
    - `action_type`: VARCHAR(100) (`ORDER_UPDATED`, `REVIEW_REPLIED`, `CONTACT_RECEIVED`, `NEW_ORDER_BROADCAST`) `[Bổ sung thêm]`
    - `payload`: JSON / TEXT `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
21. **`contacts`** *(Giữ nguyên tất cả 5 trường gốc + Bổ sung 3 trường)*:
    - `id`: BIGINT (Primary Key)
    - `name`: VARCHAR(255) *(Gốc)*
    - `email`: VARCHAR(255) *(Gốc)*
    - `phone`: VARCHAR(50) *(Gốc)*
    - `message`: TEXT *(Gốc)*
    - `status`: VARCHAR(50) DEFAULT `pending` (`pending`, `replied`) *(Gốc)*
    - `reply_message`: TEXT (Nội dung câu trả lời từ Staff qua Email) `[Bổ sung thêm]`
    - `replied_by_user_id`: BIGINT (Nullable - FK -> `users.id`) `[Bổ sung thêm]`
    - `replied_at`: TIMESTAMP (Nullable) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
22. **`cart_items`** *(Giữ nguyên tất cả 4 trường gốc + Bổ sung 1 trường)*:
    - `id`: BIGINT (Primary Key)
    - `user_id`: BIGINT (FK -> `users.id` ON DELETE CASCADE) *(Gốc)*
    - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE) *(Gốc)*
    - `quantity`: INT *(Gốc)*
    - `variant_id`: BIGINT (Nullable - FK -> `product_variants.id`) `[Bổ sung thêm]`
    - `created_at`, `updated_at`: TIMESTAMP *(Gốc)*
23. **`wishlists`** *(Giữ nguyên 100% gốc)*:
    - `id`: BIGINT (Primary Key), `user_id`: BIGINT, `product_id`: BIGINT
    - `created_at`, `updated_at`: TIMESTAMP
24. **`coupons`** *(Giữ nguyên 100% gốc)*:
    - `id`: BIGINT (Primary Key), `code`: VARCHAR(100) (Unique), `type`: ENUM (`fixed`, `percent`), `value`: DECIMAL(10, 2)
    - `min_order_value`: DECIMAL(10, 2), `usage_limit`: INT, `used_count`: INT DEFAULT 0
    - `expires_at`: TIMESTAMP, `is_active`: BOOLEAN DEFAULT TRUE
    - `created_at`, `updated_at`: TIMESTAMP
25. **`password_reset_tokens`** *(Giữ nguyên 100% gốc)*:
    - `email`: VARCHAR(255) (Primary Key), `token`: VARCHAR(255), `created_at`: TIMESTAMP

---

## ⚡ 4. NGHIỆP VỤ & TÍNH NĂNG ĐẮC THÙ CHUẨN PRODUCTION

### 🔐 4.1. Xác Thực JWT Access / Refresh Token & Kích Hoạt Qua Email
- **Đăng ký**: Tạo tài khoản `pending`, gửi Email kích hoạt chứa `activation_token` qua Spring Mail.
- **Đăng nhập**: Trả về `accessToken` (30 phút) và `refreshToken` (7 ngày lưu DB `refresh_tokens` & Redis).

### 🖼️ 4.2. Lưu Trữ Hình Ảnh Độc Lập Qua Cloudinary / MinIO
- Tích hợp `CloudinaryService` / `MinioStorageService` lưu trữ ảnh sản phẩm, ảnh đại diện, ảnh danh mục.

### 💬 4.3. Live Chat Trực Tuyến Với Nhân Viên (Staff Online Presence)
- Khách chat với Bot hoặc gặp Nhân viên tư vấn trực tiếp qua WebSocket STOMP.

### 📧 4.4. Phản Hồi Contact Qua Email Chuẩn Chuyên Nghiệp
- Staff nhập nội dung trả lời tại Admin Portal -> Backend kích hoạt `JavaMailSender` tự động gửi Email phản hồi đến khách hàng.

### 🔔 4.5. Notifications Chuyển Hướng (Redirect URL) & Admin Realtime Broadcast
- Mọi thông báo trong bảng `notifications` có trường `target_url` để Next.js router điều hướng chính xác.
- Tự động Broadcast thông báo đến toàn bộ Admin/Staff online khi có Đơn hàng/Review/Liên hệ mới.

### 📊 4.6. Thống Kê Phân Quyền Chi Tiết & Báo Cáo Theo Khoảng Thời Gian
- **Kiểm soát Phân quyền Thống kê**:
  - **ADMIN**: Xem Thống kê Tổng VÀ Thống kê Chi tiết theo TỪNG NHÂN VIÊN.
  - **STAFF**: CHỈ XEM ĐƯỢC thống kê do CHÍNH MÌNH xử lý (`processed_by_staff_id`).
- **Bộ Lọc Thời Gian Bắt Buộc (Bán Hàng & Quản Lý Kho)**:
  - Hôm nay (Today), 7 ngày gần nhất, Tháng này, Năm nay, Khoảng thời gian tự chọn (`startDate` -> `endDate`).

### 🔴 4.7. Cấu Hình Redis Chi Tiết
- Redis Key Naming: `lvtn:prod:<module>:<entity>:<id>`
- Caching Product Catalog (bao gồm `product_categories`), Session, Refresh Tokens, Rate Limiting.

---

*Tài liệu này cam kết bảo tồn 100% các trường CSDL gốc của FreshHome và chỉ bổ sung mở rộng các trường/bảng mới cho hệ thống Production Enterprise.*
