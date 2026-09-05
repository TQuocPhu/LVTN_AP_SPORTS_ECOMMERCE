# ☕ Backend Service - Website Thể Thao Enterprise

Hệ thống Backend REST API & Realtime Gateway được phát triển với **Spring Boot 3.3.5** và **Java 21**.

---

## 🛠️ Công Nghệ & Thành Phần Chính

- **Framework**: Spring Boot 3.3.5, Java 21, Spring Data JPA, Spring Security.
- **Database**: PostgreSQL (CSDL chính `ap_sports_ecommerce`), H2 (Testing).
- **Authentication**: JWT Access Token (30m) + Refresh Token (7d) + Kích hoạt Email (`activation_token`).
- **Caching & Session**: Redis (`REDIS_HOST:REDIS_PORT`).
- **Realtime**: WebSocket STOMP Gateway cho Live Chat CSKH & Thông báo Admin Broadcast.
- **Tích Hợp Bên Thứ Ba**: Cổng thanh toán **VNPay Sandbox**, **PayPal SDK**, Đơn vị vận chuyển **GHN / GHTK API**, Cloud Storage **Cloudinary / MinIO**.

---

## ⚡ Hướng Dẫn Chạy Backend

```bash
# Biên dịch và kiểm tra
./gradlew compileJava

# Chạy ứng dụng
./gradlew bootRun
```

Cấu hình biến môi trường tại tệp `.env` (tham khảo `.env.example`).
