# AP Sports - Customer Mobile App 📱

Ứng dụng di động mua sắm thiết bị & trang phục thể thao chính hãng dành cho khách hàng của **AP Sports**, được xây dựng bằng **React Native (Expo SDK 58 TypeScript)**.

---

## 🌟 Tính Năng Nổi Bật

1. **Trang Chủ & Danh Mục Môn Thể Thao**:
   - Banner ưu đãi thể thao sinh động (Bóng đá, Cầu lông, Võ thuật...).
   - Danh mục môn thể thao & nhãn hàng đối tác.
   - Lưới sản phẩm nổi bật, hiển thị giá ưu đãi và badge giảm giá.
2. **Khám Phá & Bộ Lọc Nhanh (Catalog)**:
   - Tìm kiếm từ khóa theo thời gian thực.
   - Lọc nhanh theo danh mục dạng pills trượt ngang.
3. **Chi Tiết Sản Phẩm Đỉnh Cao (Product Detail)**:
   - Thư viện ảnh sản phẩm trượt ngang.
   - Chọn Size & Màu sắc linh hoạt với kiểm tra tồn kho trực tiếp.
   - Bảng tra cứu số đo chân / vòng ngực trực quan giúp chọn chuẩn size, giảm tỷ lệ hoàn trả.
   - Tính năng **"Nhận thông báo khi có hàng"** tự động lưu đăng ký Restock Notification khi size giày hết hàng.
4. **Giỏ Hàng Đa Năng (Cart)**:
   - Tăng/giảm số lượng món hàng mượt mà kèm hiệu ứng rung haptic (`expo-haptics`).
   - Lưu trữ giỏ hàng offline với `@react-native-async-storage/async-storage`.
5. **Thanh Toán & Đặt Hàng (Checkout)**:
   - Quản lý địa chỉ giao hàng (chọn địa chỉ mặc định hoặc thêm nhanh địa chỉ mới).
   - Hỗ trợ phương thức thanh toán linh hoạt: **COD (Tiền mặt khi nhận hàng)** và **Cổng VNPAY**.
   - Nhập mã ưu đãi Voucher & ghi chú dặn dò shipper.
   - Miễn phí vận chuyển thông minh cho đơn từ 500,000 VND.
6. **Quản Lý Đơn Hàng & Niêm Phong Barcode**:
   - Bộ lọc trạng thái đơn: Chờ xử lý, Đã xác nhận, Đang giao, Đã giao, Đã hủy.
   - Hiển thị mã vận đơn GHN và huy hiệu **"Đã quét kiểm đếm Barcode niêm phong an toàn"**.
   - Nút xác nhận nhận hàng và hủy đơn trực tiếp.
7. **Chụp Ảnh Thực Tế & Đánh Giá Sản Phẩm (Create Review)**:
   - Tích hợp `expo-image-picker` mở máy ảnh chụp ngay form giày / bóng trên tay hoặc tải ảnh từ thư viện.
   - Đánh giá sao từ 1 đến 5 sao và chia sẻ cảm nhận thực tế.
8. **Hệ Thống Đăng Nhập & Bảo Mật**:
   - Lưu trữ JWT an toàn bằng `expo-secure-store`.
   - Header nhận diện riêng `X-Client-Type: mobile`.
   - Nút đăng nhập nhanh 1 chạm bằng tài khoản mẫu thử nghiệm.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Bước 1: Kiểm tra IP máy tính của bạn
Mở terminal PowerShell và chạy:
```powershell
ipconfig
```
Tìm dòng `IPv4 Address` (ví dụ: `192.168.1.15`).

Mở file `src/config/api.config.ts` và đảm bảo biến `LOCAL_IP` khớp với IP mạng WiFi của bạn:
```typescript
const LOCAL_IP = '192.168.1.15'; // Đổi thành IP máy tính bạn
```

### Bước 2: Khởi động Backend Spring Boot
Đảm bảo Backend đang chạy ở cổng `8080`:
```powershell
cd d:\LVTN\backend
./gradlew bootRun
```

### Bước 3: Chạy ứng dụng Mobile với Expo
```powershell
cd d:\LVTN\mobile-app
npx expo start
```

### Bước 4: Trải nghiệm trên điện thoại
1. Tải ứng dụng **Expo Go** trên App Store (iOS) hoặc Google Play Store (Android).
2. Đảm bảo điện thoại và máy tính kết nối **chung 1 mạng WiFi**.
3. Mở camera điện thoại (trên iOS) hoặc app Expo Go (trên Android) và quét **mã QR** hiển thị trên terminal.
