# ☕ Quy Tắc Code Backend Spring Boot 3.x & Java 21 (AI Rules)

Dành cho AI khi đọc, sinh hoặc refactor mã nguồn Spring Boot trong dự án `backend`.

---

## 🏗️ 1. Quy Định Cấu Trúc Thư Mục (Package Structure)

Mọi module nghiệp vụ trong `src/main/java/com/web/ap_sports/` phải phân chia theo gói:

```
com.web.ap_sports/
├── config/             # Các class cấu hình Spring Security, Redis, WebSocket, CORS
├── controller/         # REST Controllers (Xử lý HTTP requests)
├── dto/                # Data Transfer Objects (Request/Response payload)
│   ├── request/        # Request Body DTOs có validation annotations
│   └── response/       # Response DTOs chuẩn hóa
├── exception/          # Custom Exceptions & Global Exception Handler (@ControllerAdvice)
├── entity/             # JPA Entities (Entities đại diện bảng Database)
├── repository/         # Spring Data JPA Repositories
├── service/            # Interfaces định nghĩa logic nghiệp vụ
│   └── impl/           # Implementations của Service Interfaces
└── util/               # Helper/Utility static classes
```

---

## 🔑 2. Quy Tắc Viết Code Spring Boot Bắt Bắt Phải Tuân Thủ

### A. Dependency Injection (Tiêm phụ thuộc)
- **KHÔNG** dùng `@Autowired` trực tiếp lên field.
- **BẮT BUỘC** dùng Constructor Injection (hoặc `@RequiredArgsConstructor` của Lombok với biến `private final`):

```java
// ✅ ĐÚNG CHUẨN CLEAN ARCHITECTURE
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
```

---

### B. Validation & Input Sanitation
- Tất cả các Request DTO nhận từ client **PHẢI** được gắn thuộc tính validate (`@NotNull`, `@NotBlank`, `@Size`, `@Email`) và gắn `@Valid` tại Controller:

```java
public record CreateUserRequest(
    @NotBlank(message = "Tên không được để trống")
    String fullName,

    @Email(message = "Email không hợp lệ")
    @NotBlank(message = "Email không được để trống")
    String email
) {}
```

---

### C. Quản Lý Ngoại Lệ Tập Trung (Global Exception Handler)
- Không try-catch rải rác ở Controller. Để ngoại lệ bắn về `GlobalExceptionHandler` xử lý chuẩn hóa JSON response:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
}
```

---

### D. Chuẩn Hóa Phản Hồi REST API (API Response Wrapper)
- Mọi API trả về cho Frontend phải được đóng gói trong một class chuẩn chung `ApiResponse<T>` chứa status code, message và data:

```java
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data, LocalDateTime.now());
    }
}
```
