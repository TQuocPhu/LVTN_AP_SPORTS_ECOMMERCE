# 📱 Quy Tắc Phát Triển Đa Nền Tảng (Cross-Platform Mobile Integration Rules for AI)

Tài liệu này quy định các nguyên tắc bắt buộc dành cho AI và Lập trình viên khi phát triển bất kỳ tính năng nào cho dự án, đảm bảo hệ thống **sẵn sàng tái sử dụng và mở rộng 100% cho ứng dụng di động React Native (Mobile App)** trong tương lai.

---

## 🎯 1. Tư Duy Phát Triển Đa Nền Tảng (Cross-Platform First Mindset)

> ⚠️ **NGUYÊN TẮC CỐT LÕI**:
> Khi phát triển bất kỳ tính năng mới nào (trên Backend Spring Boot hoặc Frontend Next.js), AI **BẮT BUỘC phải tư duy rằng hệ thống không chỉ dành cho Web duy nhất, mà sẽ được tái sử dụng và triển khai trực tiếp trên ứng dụng di động React Native Mobile App**.

1. **Không viết logic cồng kềnh phụ thuộc duy nhất vào trình duyệt**:
   - Tránh tạo ra các quy trình nghiệp vụ hoặc luồng API chỉ hoạt động được trên Web Browser.
   - Đảm bảo các DTOs, API endpoints, và business logic phía Backend đều sẵn sàng phục vụ cho cả React Native Mobile App.

2. **Tái sử dụng 100% Data Schemas & Types**:
   - Tất cả TypeScript Interfaces, DTO models (`UserResponse`, `ProductDetailResponse`, `OrderRequest`), Validation Schemas và API Constants trong `frontend/src/` phải được tổ chức mô-đun hóa sạch sẽ để ứng dụng React Native Mobile có thể dùng lại hoàn toàn mà không cần viết lại.

---

## 🔒 2. Quy Tắc Xác Thực & Bảo Mật Đa Nền Tảng (Web vs Mobile Auth)

1. **Phân biệt Client qua Header `X-Client-Type`**:
   - Request từ Web App: Gửi `X-Client-Type: web` (hoặc mặc định). Backend chỉ ghi `HttpOnly Cookies`, Response Body tuyệt đối không chứa `accessToken` hay `refreshToken` (chống rò rỉ XSS).
   - Request từ Mobile App: Gửi `X-Client-Type: mobile`. Backend đóng gói trả về `tokens: { accessToken, refreshToken }` trong JSON Body để React Native lưu vào kho lưu trữ mã hóa phần cứng (`react-native-keychain` / `expo-secure-store`).

2. **Quy tắc "Strict Mobile Request Body" (Chống giả mạo Header XSS)**:
   - Khi Mobile gọi endpoint `/api/v1/customer/auth/refresh`, **BẮT BUỘC** phải truyền `refreshToken` trong JSON Request Body (`@RequestBody RefreshTokenRequest`).
   - Backend **TUYỆT ĐỐI KHÔNG FALLBACK ĐỌC TỪ COOKIE** khi nhận request từ Mobile. Điều này ngăn chặn 100% kịch bản đoạn mã độc XSS trên trình duyệt giả mạo header `X-Client-Type: mobile` để đánh cắp Token.

3. **CORS Policy Whitelist Cụ Thể**:
   - CORS Whitelist phía Backend (`SecurityConfig.java`) chỉ áp dụng cho trình duyệt Web, nạp danh sách domain cụ thể từ `.env` (`CORS_ALLOWED_ORIGINS`).
   - Cấm dùng Wildcard `*` khi `allowCredentials = true`.

---

## 🛠️ 3. Mô-Đun Hóa Tầng API Client (`src/services/api/`)

Tầng API Client phía Frontend Web phải duy trì cấu trúc 4 mô-đun con sạch sẽ:
- `src/services/api/types.ts`: Định nghĩa types chuẩn.
- `src/services/api/cookies.ts`: Quản lý cookie client trình duyệt.
- `src/services/api/refresh-state.ts`: Quản lý silent refresh state.
- `src/services/api/client.ts`: Fetch wrapper core (tự động đính kèm `X-Client-Type: web`).
- `src/services/api-client.ts`: Re-export nguyên vẹn để đảm bảo tương thích 100% không vỡ Web.
