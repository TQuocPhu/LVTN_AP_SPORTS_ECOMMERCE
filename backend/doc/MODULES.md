# 🛠️ Nhật Ký Cấu Trúc Module Backend (Spring Boot 3.3.5)

---

## 🌳 Cấu Trúc Thư Mục Backend (Tree Structure)

```
d:\LVTN\backend\
├── .env                                        # [Config] File chứa các biến môi trường thực tế
├── .env.example                                # [Config] File mẫu biến môi trường
├── build.gradle                                # [Build] Cấu hình dependencies (Web, JPA, Redis, Security, Drivers)
├── settings.gradle
├── gradlew & gradlew.bat
└── src/
    └── main/
        ├── java/com/web/ap_sports/
        │   ├── config/                         # [Config] SecurityConfig.java, WebSocketConfig.java
        │   ├── controller/                     # [Controller] UserController.java, HelloController.java
        │   ├── dto/                            # [DTO] Data Transfer Objects
        │   │   ├── request/                    # [DTO Request] UserCreateRequest.java
        │   │   └── response/                   # [DTO Response] UserResponse.java (Không chứa Password), ApiResponse.java
        │   ├── entity/                         # [Entity JPA] User.java, Product.java, Order.java (25 JPA Entities)
        │   ├── enums/                          # [Enum] UserRole.java, UserStatus.java
        │   ├── exception/                      # [Exception] GlobalExceptionHandler.java (Trả về JSON chuẩn), ResourceNotFoundException.java
        │   ├── repository/                     # [Repository] UserRepository.java, ProductRepository.java
        │   └── service/                        # [Service] UserService.java, ProductService.java
        │       └── impl/                       # [Service Impl] UserServiceImpl.java, ProductServiceImpl.java
        └── resources/
            └── application.yml                 # Cấu hình nạp biến môi trường từ .env
```
