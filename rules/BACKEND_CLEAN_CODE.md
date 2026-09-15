# ☕ Quy Tắc Code Backend Spring Boot 3.x & Java 21 (AI Rules)

Dành cho AI khi đọc, sinh hoặc refactor mã nguồn Spring Boot trong dự án `backend`.

> ⚠️ **QUY TẮC LÀM VIỆC DÀNH CHO AI**:
> 1. AI **BẮT BUỘC** phải đọc các tệp tài liệu (`.docx`, `.md`, `PROJECT_SPECIFICATION.md`, `rules/`) trước khi đọc hay can thiệp vào các tệp mã nguồn.
> 2. Khi chưa có lệnh yêu cầu viết code trực tiếp từ người dùng, AI **CHỈ GIẢI THÍCH VÀ LÊN KẾ HOẠCH**, tuyệt đối **KHÔNG TỰ Ý SỬA/VIẾT CODE**.

---

## 🏗️ 1. Quy Định Cấu Trúc Thư Mục Enterprise (Sub-packages theo Role/Scope)

Mọi module nghiệp vụ trong `src/main/java/com/web/ap_sports/` phải phân chia theo cấu trúc Layer-First kết hợp Sub-packages theo Role/Scope:

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
    ├── admin/                  # Business logic dành riêng cho Admin Management
    ├── staff/                  # Business logic dành riêng cho Staff Operations
    ├── warehouse/              # Business logic đặc thù cho Kho (Nhập/Xuất/Tồn)
    ├── customer/               # Business logic phục vụ Khách mua hàng
    └── common/                 # Core shared services (AuthService, CloudStorageService)
```

---

## 🏛️ 1.1. Quy Tắc Tách Interface Và Impl Cho Tầng Service (Service Layer Architecture)

- **Bắt buộc áp dụng Interface cho Tầng Service**:
  - Mọi tệp trong `service/common/`, `service/customer/`, `service/admin/`, `service/staff/`, `service/warehouse/` **CHỈ ĐƯỢC LÀ INTERFACE** định nghĩa danh sách hàm và JavaDoc (Ví dụ: `CustomerAuthService.java`, `EmailService.java`).
  - Toàn bộ mã nguồn triển khai thực tế (Class xử lý logic nghiệp vụ) **BẮT BUỘC ĐẶT NẰM TRONG THƯ MỤC CON `impl/` TƯƠNG ỨNG** và đặt tên kết thúc bằng `ServiceImpl` (Ví dụ: `service/customer/impl/CustomerAuthServiceImpl.java`, `service/common/impl/EmailServiceImpl.java`).
  - Lớp Impl được gắn `@Service` và `@RequiredArgsConstructor`, implement trực tiếp Interface tương ứng.

---

## 🔑 2. Quy Tắc Viết Code Spring Boot Bắt Buộc Tuân Thủ

### A. Dependency Injection (Tiêm phụ thuộc)
- **KHÔNG** dùng `@Autowired` trực tiếp lên field.
- **BẮT BUỘC** dùng Constructor Injection (hoặc `@RequiredArgsConstructor` của Lombok với biến `private final`).

### B. Validation & Input Sanitation
- Tất cả các Request DTO nhận từ client **PHẢI** được gắn thuộc tính validate (`@NotNull`, `@NotBlank`, `@Size`, `@Email`) và gắn `@Valid` tại Controller.

### C. Quản Lý Ngoại Lệ Tập Trung (Global Exception Handler)
- Không try-catch rải rác ở Controller. Để ngoại lệ bắn về `GlobalExceptionHandler` xử lý chuẩn hóa JSON response.

### D. Chuẩn Hóa Phản Hồi REST API (API Response Wrapper)
- Mọi API trả về cho Frontend phải được đóng gói trong một class chuẩn chung `ApiResponse<T>` chứa status code, message và data.
