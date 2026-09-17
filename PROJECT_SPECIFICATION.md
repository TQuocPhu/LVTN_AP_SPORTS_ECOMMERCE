# 📘 BẢN THIẾT KẾ VÀ YÊU CẦU DỰ ÁN (PROJECT SPECIFICATION)
## WEBSITE THƯƠNG MẠI ĐIỆN TỬ BÁN DỤNG CỤ BÓNG ĐÁ & THỂ THAO ENTERPRISE (PRODUCTION READY)
**Đề tài Luận văn Tốt nghiệp & Hệ thống Thực tế Chuẩn Production cho Doanh Nghiệp Thể Thao**

> ⚠️ **NGUYÊN TẮC BẮT BUỘC KHÔNG THAY ĐỔI**:
> 1. Bảo tồn **100% tất cả các trường (columns) gốc** từ 21 Laravel Migrations của FreshHome. Mọi tính năng Enterprise được triển khai theo hướng **BỔ SUNG THÊM (Add-on)** trường/bảng mới, tuyệt đối **KHÔNG XÓA** bất kỳ trường nào của hệ thống CSDL gốc.
> 2. **QUY TẮC PHÁT TRIỂN DÀNH CHO AI**: AI **BẮT BUỘC** phải đọc qua các tệp tài liệu (`.docx`, `.md`, `PROJECT_SPECIFICATION.md`, `rules/`) trước khi đọc hay can thiệp vào tệp mã nguồn. Khi chưa có lệnh yêu cầu viết code trực tiếp từ người dùng, AI **CHỈ GIẢI THÍCH VÀ LÊN KẾ HOẠCH**, tuyệt đối **KHÔNG TỰ Ý SỬA/VIẾT CODE**.
> 3. **QUY TẮC BẢO MẬT TOKEN CLIENT & ĐỊNH DẠNG REFRESH TOKEN**:
>    - **TUYỆT ĐỐI CẤM `localStorage` / `sessionStorage`** trong toàn bộ dự án. Tất cả JWT Tokens (`accessToken`, `refreshToken`) và dữ liệu lưu trữ phía Client **BẮT BUỘC CHỈ ĐƯỢC DÙNG COOKIES** (`HttpOnly Cookies` từ Backend hoặc Secure Client Cookies).
>    - **BẢO MẬT REFRESH TOKEN BẰNG HMAC-SHA256**: `refreshToken` lưu trong CSDL/Redis **BẮT BUỘC ĐƯỢC BĂM HASH BẰNG HMAC-SHA256** với khóa bí mật `JWT_REFRESH_SECRET` cấu hình trong `.env`. Phía Client giữ Token gốc qua Cookie HttpOnly. Khi gửi lên Refresh, Backend băm Token gốc bằng HMAC-SHA256 với secret key rồi so sánh với `token_hash` trong CSDL nhằm chống rò rỉ CSDL.
> 4. **QUY TẮC CLEAN PAGE VÀ COMPONENT FRONTEND**: Tệp trang Router (`src/app/.../page.tsx`) **CHỈ ĐƯỢC PHÉP KHAI BÁO METADATA/SEO VÀ GỌI COMPONENT UI TUÂN THỦ CLEAN ARCHITECTURE**, tuyệt đối **KHÔNG VIẾT LOGIC HOẶC GIAO DIỆN PHỨC TẠP TRỰC TIẾP TRONG FILE PAGE.TSX**.
> 5. **QUY TẮC QUẢN LÝ GIT & COMMENT CODE**: AI thực hiện `git add` và `git commit` chia theo **TỪNG CỤM TÍNH NĂNG LOGIC**, với **Commit Message bằng TIẾNG VIỆT** chuẩn Conventional Commits. Mã nguồn Java & TypeScript **BẮT BUỘC PHẢI VIẾT COMMENT GIẢI THÍCH ĐẦY ĐỦ, RÕ RÀNG (JSDoc / JavaDoc)**. AI **TUYỆT ĐỐI KHÔNG THỰC HIỆN LỆNH `git push`** (Người dùng sẽ tự thực hiện push).

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
├── seed/                       # Class nạp dữ liệu CSDL ban đầu (DataInitializer.java)
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
    ├── admin/                  # Interfaces dành riêng cho Admin Management
    │   └── impl/               # Class triển khai (AdminServiceImpl)
    ├── staff/                  # Interfaces dành riêng cho Staff Operations
    │   └── impl/               # Class triển khai (StaffServiceImpl)
    ├── warehouse/              # Interfaces đặc thù cho Kho (Nhập/Xuất/Tồn)
    │   └── impl/               # Class triển khai (WarehouseServiceImpl)
    ├── customer/               # Interfaces phục vụ Khách mua hàng
    │   └── impl/               # Class triển khai (CustomerAuthServiceImpl)
    └── common/                 # Core shared Interfaces (AuthService, EmailService)
        └── impl/               # Class triển khai (EmailServiceImpl)
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
10. **`product_images`** *(Giữ nguyên 100% gốc + Bổ sung 2 trường)*:
    - `id`: BIGINT (Primary Key)
    - `product_id`: BIGINT (FK -> `products.id` ON DELETE CASCADE) *(Gốc)*
    - `variant_id`: BIGINT (Nullable - FK -> `product_variants.id` ON DELETE CASCADE cho bộ ảnh riêng theo biến thể) `[Bổ sung thêm]`
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

### 🌗 4.8. Hệ Thống Chuyển Đổi Giao Diện Sáng / Tối (Light / Dark Mode Engine & UI Guidelines)
- **Quản lý State & Persistent**: Tích hợp `ThemeContext` lưu cấu hình giao diện `light` / `dark` vào **Cookie client 30 ngày**, khởi tạo đồng bộ giữa SSR và CSR.
- **Quy tắc Media Protection**: Vùng Slider Banner trang chủ, các khung Media truyền thông và các Nút hành động chính (`bg-orange-500`) **bắt buộc duy trì lớp phủ tối (Dark Overlay)** và chữ màu trắng tương phản sắc nét ở cả 2 chế độ Sáng và Tối.
- **Biến Đổi Màu Nhận Diện Brand**: Dải màu logo chữ `AP SPORTS` được tính toán chuyển từ dải màu sáng (`from-white via-slate-100 to-orange-400`) ở Dark Mode sang dải màu xám đậm tương phản (`from-slate-900 via-slate-800 to-orange-600`) ở Light Mode để không bị chìm trên nền header trắng mờ.

### 🔌 4.9. Định Hướng & Ứng Dụng WebSocket Real-time (Roadmap Tích Hợp)
- **Hạ tầng hiện tại**: Backend đã dựng sẵn `WebSocketConfig.java` (`/ws` endpoint STOMP, SockJS) và `WebSocketAuthInterceptor.java` (JWT STOMP Handshake).
- **Các kịch bản ứng dụng sắp triển khai**:
  1. **Push Notifications Real-time (Ưu tiên P1)**: Tải thông báo đơn hàng mới cho Admin/Staff (`/topic/admin/orders`) và thông báo chuyển trạng thái đơn hàng tới Khách hàng (`/topic/notifications/{userId}`) mà không cần F5.
  2. **Live Chat CSKH 1-1 (Ưu tiên P2)**: Hỗ trợ chat trực tiếp giữa Khách hàng và Staff online (`/queue/chat/{sessionId}`), kèm Typing Indicator và Read Receipt.
  3. **Order Tracking Real-time**: Cập nhật trạng thái đơn & tọa độ GPS vận chuyển trực tiếp trên UI Timeline chi tiết đơn hàng.
  4. **Tồn Kho & Cảnh Báo Cháy Hàng Real-time**: Nhảy số tồn kho ngay khi phát sinh đơn trên Dashboard Kho & hiển thị "Out of Stock" tức thì ở Storefront.
  5. **Admin Dashboard Live Analytics**: Tự động nhảy số Doanh thu & Tổng đơn hôm nay trên các biểu đồ Recharts khi có giao dịch thành công.

### 🛡️ 4.10. Quản Lý Cookie Tập Trung, Seamless Token Revocation & AOP Rate Limiting
- **CookieUtils Manager**: Đồng bộ 100% thuộc tính an toàn `HttpOnly=true`, `SameSite=Lax`, `Path=/`, `Max-Age` (30 phút cho `accessToken`, 7 ngày cho `refreshToken`) dùng chung cho cả Login, Refresh, Logout và Change Password.
- **Seamless Token Revocation khi Đổi Mật Khẩu**:
  - Thực thi `@Transactional` bảo toàn giao dịch.
  - Vô hiệu hóa toàn bộ Refresh Token cũ (`revoked = true`) để ngắt kết nối lập tức các thiết bị lạ/tiệm net khác.
  - Sinh ngay cặp Access Token & Refresh Token mới đính kèm Cookie HttpOnly cho thiết bị hiện tại ➡️ Trải nghiệm Seamless UX, người dùng không bị văng ra ngoài, không cần gõ lại mật khẩu.
- **Spring AOP + Redis Rate Limiting**:
  - Khai báo Custom Annotation `@RateLimit(key, maxRequests, windowSeconds)`.
  - Tự động kiểm tra lượt qua Redis key `lvtn:rate:<key>:<userOrIp>` kèm TTL.
  - Tích hợp Fallback In-Memory (`ConcurrentHashMap`) đảm bảo zero-downtime nếu Redis gián đoạn.
  - Áp dụng `@RateLimit` cho `/change-password` (3 lần/15 phút) và `/avatar` (5 lần/10 phút), trả về `HTTP 429 Too Many Requests`.


---

### 🐛 4.11. Phiên Đăng Nhập — Lịch Sử Lỗi & Quyết Định Kiến Trúc (Session Management Bug History)

> **Trạng thái:** ✅ Đã giải quyết hoàn toàn (15/09/2026)

#### Vấn đề: Bị Đăng Xuất Tự Động Sau 30 Phút Dù `refreshToken` Chưa Hết Hạn

**Triệu chứng quan sát được:**
- Người dùng đăng nhập bình thường → sau hơn 30 phút bị văng ra ngoài.
- Kiểm tra `refresh_tokens` DB: `revoked = false` → Refresh Token **hoàn toàn còn hiệu lực**.
- Lỗi xuất hiện tại: `useAddresses.ts`, `useProfile.ts` với thông báo *"Chưa đăng nhập hoặc phiên làm việc hết hạn"*.

**3 Nguyên Nhân Gốc Rễ Được Xác Định:**

| # | Lỗi | Vị Trí | Mô Tả |
|---|-----|--------|--------|
| 1 | `fetchCurrentUser()` ≠ Refresh | `AuthContext.tsx` | Interval & focus listener gọi `/auth/me` (chỉ đọc token) thay vì `/auth/refresh` (cấp lại token). Khi tab bị ẩn, browser throttle setInterval → interval 15p không chạy đúng giờ. |
| 2 | Không refresh trước khi khởi động | `AuthContext.tsx` | Khi page load sau idle, `fetchCurrentUser()` gọi `/auth/me` với token đã hết hạn → race condition trong retry mechanism |
| 3 | `/auth/me` là `permitAll()` + tự kiểm tra cookie | `SecurityConfig.java` + `CustomerAuthServiceImpl.java` | Service tự đọc cookie bỏ qua SecurityContext → thiết kế không nhất quán, dễ sai, khó debug |

**Giải Pháp Kiến Trúc Production Cuối Cùng:**

1. **`initialize()` trong `AuthContext`**: Chỉ gọi `fetchCurrentUser()` (`GET /auth/me`) khi app boot. Không ép buộc `/auth/refresh` mù quáng.
   - Nếu Access Token còn hạn → trả 200 OK ngay (0 overhead refresh, 0 ghi DB).
   - Nếu Access Token hết hạn → `apiClient` tự động bắt 401 và Silent Refresh 1 lần duy nhất an toàn.
   - Nếu là Khách / Incognito → trả 401, dừng ngay lập tức, `user = null`, `loading = false` → web tải mượt không bị đơ/treo.

2. **`proactiveRefresh()`**: Hàm làm mới phiên ngầm, bọc bảo vệ bởi `if (!user) return;` (chỉ dành cho user đã đăng nhập), có debounce 60s:
   - `visibilitychange` (khi quay lại tab) → `proactiveRefresh()` (nếu `user !== null`).
   - `setInterval` 20 phút → `proactiveRefresh()` (nếu `user !== null`).

3. **`SecurityConfig`**: Tách `/auth/me` khỏi wildcard `permitAll()`, chuyển sang `hasRole("CUSTOMER")` → Spring Security xử lý 401 chuẩn qua `AuthenticationEntryPoint`.

4. **`CustomerAuthServiceImpl.getCurrentUser()`**: Đọc từ `SecurityContextHolder` thay vì tự parse cookie thủ công — nhất quán với kiến trúc Filter → SecurityContext → Service.

**Quy tắc bất biến rút ra (áp dụng cho toàn dự án):**
- ✅ **Lazy Refresh qua Interceptor** — Để `apiClient` 401 interceptor xử lý refresh tự động khi cần; không ép buộc refresh trên mọi F5 / boot app để tránh xoay token quá mức.
- ✅ **Bảo vệ guest flow** — Kiểm tra `if (!user) return;` trước mọi hành động refresh ngầm, tránh gây 401 liên tục cho người dùng ẩn danh/chưa đăng nhập.
- ✅ **Không tự validate token trong Service** — Để Spring Security và `JwtAuthenticationFilter` làm việc đó; Service chỉ đọc `SecurityContext`.
- ✅ **`permitAll()` chỉ dành cho endpoints không cần auth** — Login, Register, Activate, Logout, Refresh là public; `/auth/me` phải `hasRole`.
- ✅ **Không tin vào `setInterval` cho mục đích bảo mật** — Browser có thể suspend hoặc throttle background tabs; phải kết hợp cả `visibilitychange` + interval.

---

### 🔒 4.12. Quy Trình Quên & Đặt Lại Mật Khẩu (Forgot & Reset Password Flow)

> **Trạng thái:** ✅ Đã hoàn thành 100% (15/09/2026)

**Đặc tả Kiến trúc:**
1. **Quên Mật Khẩu (`POST /customer/auth/forgot-password`)**:
   - Yêu cầu Email -> Kiểm tra tồn tại trong DB.
   - Sinh token ngẫu nhiên 64 ký tự -> Lưu vào bảng `password_reset_tokens` (TTL 15 phút).
   - Gửi HTML Email qua SMTP Server -> Chứa nút bấm và link `http://localhost:3000/reset-password?token=...&email=...`.
   - Bảo vệ Rate Limit: **3 lần / 10 phút** per IP.

2. **Đặt Lại Mật Khẩu (`POST /customer/auth/reset-password`)**:
   - Kiểm tra Token & Email hợp lệ trong CSDL & chưa hết hạn 15 phút.
   - Kiểm tra Mật khẩu mới khớp với Xác nhận mật khẩu & đạt độ mạnh (min 8 ký tự, có chữ & số).
   - Mã hóa BCrypt mật khẩu mới -> Cập nhật `User`.
   - Xóa token khỏi `password_reset_tokens` -> Thu hồi tất cả Refresh Token cũ của user (`revoked = true`).
   - Bảo vệ Rate Limit: **5 lần / 10 phút** per IP.

3. **Frontend Clean Architecture & Custom Hooks**:
   - Tách biệt 100% Logic ra `useForgotPassword.ts` và `useResetPassword.ts`.
   - Components `ForgotPasswordForm.tsx` & `ResetPasswordForm.tsx` là Pure UI Component.
   - Routes: `/forgot-password` và `/reset-password` (bọc `<Suspense>`).

### 👑 4.13. Hệ Thống Quản Trị Admin Portal & Quản Lý Sản Phẩm Wizard 4 Bước

> **Trạng thái:** ✅ Đã hoàn thành 100% (16/09/2026 - Day 03)

**Đặc tả Kiến trúc & Giao diện:**
1. **Trang Đăng Nhập Quản Trị (`/admin/login`) & Scoped RBAC**:
   - Endpoint `POST /api/v1/admin/auth/login`: Xác thực các vai trò quản trị (`ADMIN`, `STAFF`, `WAREHOUSE_MANAGER`).
   - Cấp cặp Token an toàn qua `HttpOnly Cookies` (`accessToken` RS256, `refreshToken` HMAC-SHA256).
   - Tích hợp với Edge Middleware (`src/middleware.ts`) bảo mật tuyến trang `/admin/**`.

2. **Trang Quản Trị Nền (Admin Shell Layout & Dashboard)**:
   - Sidebar Navigation tập trung, Header Bar hiển thị thông tin Admin và công tắc đổi giao diện Sáng/Tối.
   - Dashboard (`/admin/page.tsx`) hiển thị các thẻ KPI thống kê tổng quan doanh thu, đơn hàng, tồn kho và sản phẩm.

3. **Hệ Thống Quản Lý Sản Phẩm Wizard 4 Bước (`/admin/products`)**:
   - **Clean Page Architecture**: Tách 100% logic khỏi `page.tsx`, đóng gói vào Custom Hook `useProductForm.ts` và 10 Component chuyên biệt nằm tại `src/components/admin/product/`.
   - **Bước 1 - Basic Step**: Tên sản phẩm, Ô Slug SEO khóa read-only tự sinh (UID + Timestamp), Giá niêm yết, Chọn đa danh mục và Trạng thái.
   - **Bước 2 - Description Step**: Soạn thảo mô tả HTML bằng `RichTextEditor` native (Font size 10px-48px, Bold, Italic, Underline, Bullet/Numbered List, chèn ảnh từ máy tính lên Cloudinary folder `ap-sports-e-commerce/products`) và Quản lý thông số kỹ thuật động (Specs Key-Value).
   - **Bước 3 - Variant Step**: Quản lý nhóm thuộc tính (`VariantAttributeManager`), tự động sinh ma trận tổ hợp biến thể Cartesian Product N chiều, upload nhiều ảnh cho biến thể, tự động tính tổng tồn kho (`sum(stockQuantity)`).
   - **Bước 4 - Review Step**: Tổng quan thông tin sản phẩm và danh sách biến thể trước khi gửi API.
   - **Quản lý Danh sách Sản phẩm (`ProductTable.tsx`)**: Đa danh mục badge, tổng tồn kho cảnh báo màu sắc, nút "Xem mô tả" (`ProductDescriptionModal.tsx`), nút mở Drawer biến thể mở rộng `max-w-3xl` (`ProductVariantDrawer.tsx`), công tắc đổi trạng thái nhanh và phân trang linh hoạt (`ProductPagination.tsx`).
   - **Tự động xuống hàng mượt mà**: Thiết lập `break-words` cho Tên sản phẩm và `break-all` cho Slug, đảm bảo thông tin hiển thị 100% đầy đủ không bị đứt đoạn bằng dấu `...`.
   - **Khắc phục Lỗi CSDL PostgreSQL**: Nâng cấp kiểu dữ liệu cột `product_images.image_path` thành `TEXT` tại `DataInitializer.java`, xử lý triệt để lỗi `value too long for type character varying(500)`.

### 🌳 4.14. Chức Năng Quản Lý Danh Mục Sản Phẩm Cây Phân Cấp (Hierarchical Category Management)

> **Trạng thái:** ✅ Đã hoàn thành 100% (17/09/2026 - Day 04)

**Đặc tả Kiến trúc & Quy tắc Nghiệp vụ:**
1. **RBAC & Seed Quyền Hạn**:
   - Khởi tạo 3 Permissions mới: `MANAGE_CATEGORIES` (chỉ dành riêng cho `ADMIN`), `MANAGE_REVIEWS` (`ADMIN` & `STAFF`), `MANAGE_CONTACTS` (`ADMIN` & `STAFF`).
2. **Cây Phân Cấp Đa Tầng & Giới Hạn Tối Đa 3 Cấp**:
   - **Phân tầng tối đa 3 cấp**: Gốc Cấp 1 ➔ Cấp 2 ➔ Cấp 3. Thuật toán `getCategoryDepth()` trên Backend tự động ngăn cấm việc tạo thêm danh mục con cho các danh mục đã ở Cấp 3.
   - **Quy tắc Hình ảnh đại diện**: CHỈ tải/lưu hình ảnh cho **Danh mục gốc (Cấp 1)** lên thư mục Cloudinary `ap-sports-e-commerce/categories`. Danh mục con (Cấp 2 & 3) tự động ẩn ô upload ảnh.
   - **Quy tắc Ràng buộc Unique & Slug**: Tên danh mục unique 100% trong CSDL PostgreSQL (`existsByName`). Slug tự sinh đính kèm 5 ký tự UUID ngẫu nhiên (`base-slug-[5_char_uuid]`) chống trùng lặp, duy trì 100% slug cũ khi sửa tên để đảm bảo chuẩn SEO Google.
   - **Chặn Xóa An Toàn 2 Lớp**: Từ chối xóa danh mục nếu đang chứa **danh mục con** hoặc đang có **sản phẩm thuộc danh mục** (`existsByCategoryId` hoặc `existsByCategoriesId`).
3. **Clean Page Architecture & Hierarchical Tree Table UI**:
   - Route `src/app/admin/categories/page.tsx` là Pure Wrapper Page.
   - `CategoryTable.tsx`: Bảng hiển thị dạng **Cây Phân Cấp Mở Rộng / Thu Gọn (Expandable Tree View)** với đường gióng thụt lề trực quan, Badge phân cấp màu sắc, Cột riêng hiển thị Mô tả danh mục, và nút bấm tạo nhanh *"➕ Thêm Cấp X"*.

---

### 🛍️ 4.15. Trang Danh Mục Sản Phẩm Người Dùng (Customer Product Catalog & Interactive Filters)

> **Trạng thái:** ✅ Đã hoàn thành 100% (17/09/2026 - Day 04)

**Đặc tả Kiến trúc & Giao diện:**
1. **Public APIs RESTful (`CustomerProductController.java` & `CustomerProductServiceImpl.java`)**:
   - `/api/v1/products`: Lấy danh sách sản phẩm công khai theo bộ lọc đa tiêu chí (từ khóa `keyword`, danh mục `categoryId`, giá `minPrice`/`maxPrice`, đa size `variantSize`, trạng thái mặc định `in_stock`, phân trang `page`/`size`, sắp xếp `sortBy`/`sortDir`).
   - `/api/v1/products/{slug}`: Lấy chi tiết sản phẩm theo slug SEO (hoặc ID).
2. **Bộ Lọc Đa Size & Đếm Sản Phẩm Đệ Quy Theo Cây Danh Mục**:
   - **Bộ lọc Multi-Size**: Hỗ trợ chọn đồng thời nhiều kích thước (ví dụ `S,M,L`), Backend truy vấn bằng `Specification` với subquery JPA Criteria `variant.size IN (:sizes)`.
   - **Đếm sản phẩm đệ quy (Recursive Product Counting)**: Backend tự động tính toán tổng số lượng sản phẩm của từng danh mục theo cơ chế cộng dồn từ dưới lên (từ danh mục cháu/con tới danh mục cha/gốc) và hiển thị trên từng nút cây danh mục.
3. **Cấu Trúc Thư Mục Clean Architecture & Đồng Bộ Giao Diện**:
   - Quy hoạch đồng bộ toàn bộ component phía người dùng tại `src/components/customer/` (`home`, `profile`, `product`).
   - **Header Banner Thống Nhất**: Dùng chung component `PageHeaderBanner.tsx` đồng bộ 100% giữa trang Sản phẩm, Profile và Đăng nhập.
   - **Card Sản Phẩm Chuẩn Hoá (CustomerProductCard.tsx)**: Dùng chung thẻ sản phẩm duy nhất cho cả Trang chủ và Trang danh mục, hiển thị tag danh mục mờ, điểm đánh giá sao, icon Trái tim Wishlist (`<Heart />`) khi hover, và nút *"Thêm vào giỏ"*.
   - **Nới Rộng Layout Max-W [1536px] & Lưới 4 Cột**: Mở rộng giao diện tối đa 1536px, giới hạn 4 cột sản phẩm/dòng giúp thẻ sản phẩm thoáng đẹp, rộng rãi và tối ưu trên màn hình lớn.

---

### 📱 4.16. Mở Rộng Ứng Dụng Di Động React Native & Kiến Trúc Bảo Mật Auth Đa Nền Tảng (Cross-Platform Auth Security)

> **Trạng thái:** ✅ Đã nâng cấp hạ tầng Backend & Frontend Web (17/09/2026 - Day 04)

**Đặc tả Kiến trúc & Quy tắc Bảo mật Doanh nghiệp:**
1. **Định Hướng Mở Rộng Mobile App (React Native)**:
   - Phát triển ứng dụng di động cho Khách hàng (`CUSTOMER`) bằng **React Native (TypeScript)**.
   - **Tái sử dụng 100% Code & Schema**: Sử dụng trực tiếp toàn bộ DTOs, TypeScript Types/Interfaces (`UserResponse`, `Product`, `Order`), API Constants và Validation logic từ Frontend Next.js hiện tại sang React Native mà không cần viết lại.
   - **Bộ Nhớ Mã Hóa Phần Cứng (Secure Storage)**: Quản lý và lưu trữ `accessToken` & `refreshToken` trên thiết bị di động bằng `react-native-keychain` / `expo-secure-store` (tận dụng iOS KeyChain & Android KeyStore).

2. **Tái Cấu Trúc Mô-đun Frontend Web API Client (`src/services/api/`)**:
   - Mô-đun hóa `api-client.ts` thành 4 sub-modules chuyên biệt:
     - `src/services/api/types.ts`: Đóng gói `ApiResponse`, `ApiError`, `isApiError`, `ApiClientOptions`.
     - `src/services/api/cookies.ts`: Quản lý cookie phía client trình duyệt.
     - `src/services/api/refresh-state.ts`: Quản lý state silent refresh.
     - `src/services/api/client.ts`: Core fetch wrapper (tự động đính kèm `X-Client-Type: web`).
   - **Tương thích ngược 100% (Backward Compatibility)**: File `src/services/api-client.ts` gốc đóng vai trò làm Entry Point re-export nguyên vẹn toàn bộ symbol từ sub-modules. Không gây ảnh hưởng hay sửa đổi bất kỳ file import nào của Web App.

3. **Kiến Trúc Bảo Mật Auth Phân Nhánh Web/Mobile Phía Backend Spring Boot**:
   - **CORS Policy Chuẩn Sản Xuất**: Khắc phục triệt để lỗ hổng CORS Wildcard. Whitelist chính xác danh sách domain từ `CORS_ALLOWED_ORIGINS` trong `.env` (`http://localhost:3000,http://localhost:3001`), loại bỏ `*` khi `allowCredentials = true`. Bổ sung `X-Client-Type` vào `allowedHeaders`.
   - **Quy Tắc Strict Mobile Request Body (`/api/v1/customer/auth/refresh`)**:
     - Khi `X-Client-Type: mobile`: Backend **BẮT BUỘC** đọc `refreshToken` từ JSON Request Body (`@RequestBody RefreshTokenRequest`). **TUYỆT ĐỐI KHÔNG FALLBACK ĐỌC TỪ COOKIE**. Ngăn chặn 100% kịch bản giả mạo header của mã độc XSS từ trình duyệt Web.
     - Khi `X-Client-Type: web` (hoặc mặc định): Backend **CHỈ** đọc `refreshToken` từ HttpOnly Cookie. Response JSON Body tuyệt đối **KHÔNG chứa Token**.
   - **Phân Nhánh Đăng Nhập (`/api/v1/customer/auth/login`)**:
     - Web Client: CHỈ ghi cặp HttpOnly Cookie (`accessToken`, `refreshToken`), JSON Body trả về `user` (không chứa tokens).
     - Mobile Client (`X-Client-Type: mobile`): Trả về `CustomerLoginResponse` đóng gói `tokens` object (`accessToken`, `refreshToken`, `tokenType: "Bearer"`, `expiresIn`) để React Native lưu Secure Storage.
   - **Bảo Vệ Refresh Token Rotation (RTR) & Reuse Detection**: Băm băm HMAC-SHA256 Refresh Token, hỗ trợ 30s Grace Window cho các request đồng thời và tự động thu hồi toàn bộ session (`revoked = true`) nếu phát hiện RT cũ bị lạm dụng lại.

---

*Tài liệu này cam kết bảo tồn 100% các trường CSDL và chỉ bổ sung mở rộng các trường/bảng mới cho hệ thống Production Enterprise.*



