# 📱 AP SPORTS MOBILE APP - REACT NATIVE & EXPO CUSTOMER STOREFRONT

> **Mô tả**: Ứng dụng di động mua sắm thiết bị và trang phục thể thao chính hãng dành cho khách hàng của **AP Sports Enterprise**, được xây dựng trên nền tảng **React Native (Expo SDK 54 & TypeScript)**, tối ưu hóa trải nghiệm vuốt chạm mượt mà trên cả hai hệ điều hành iOS và Android.

[![React Native](https://img.shields.io/badge/React_Native-0.76-00D8FF?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-black?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📑 MỤC LỤC
1. [Tính Năng Nổi Bật Trên Ứng Dụng Di Động](#-1-tính-năng-nổi-bật-trên-ứng-dụng-di-động)
2. [Ngăn Xếp Công Nghệ & Thư Viện Chính](#-2-ngăn-xếp-công-nghệ--thư-viện-chính)
3. [Cấu Trúc Thư Mục Module (Directory Layout)](#-3-cấu-trúc-thư-mục-module-directory-layout)
4. [Cấu Hình Kết Nối API & Mạng Nội Bộ (Network Setup)](#-4-cấu-hình-kết-nối-api--mạng-nội-bộ-network-setup)
5. [Hướng Dẫn Cài Đặt & Trải Nghiệm Ứng Dụng (Quickstart)](#-5-hướng-dẫn-cài-đặt--trải-nghiệm-ứng-dụng-quickstart)
6. [Bảo Mật Lưu Trữ & Định Danh Client](#-6-bảo-mật-lưu-trữ--định-danh-client)

---

## 🌟 1. Tính Năng Nổi Bật Trên Ứng Dụng Di Động

1. **Trang Chủ Sinh Động & Danh Mục Môn Thể Thao**:
   - Banner ưu đãi thể thao tương tác đa chiều (Bóng đá, Cầu lông, Bóng rổ, Võ thuật...).
   - Lưới sản phẩm hot hiển thị giá ưu đãi và huy hiệu giảm giá.
2. **Khám Phá & Bộ Lọc Nhanh (Catalog)**:
   - Tìm kiếm sản phẩm theo từ khóa thời gian thực.
   - Lọc nhanh theo danh mục dạng pills trượt ngang tiện lợi.
3. **Chi Tiết Sản Phẩm Chuẩn Thể Thao (Product Detail)**:
   - Thư viện ảnh sản phẩm trượt ngang mượt mà.
   - Chọn Size & Màu sắc linh hoạt với kiểm tra tồn kho tức thì.
   - Bảng tra cứu số đo chân / vòng ngực trực quan giúp khách chọn đúng size, giảm thiểu tối đa tỷ lệ hoàn hàng.
   - Tính năng **"Nhận thông báo khi có hàng"** tự động lưu đăng ký Restock Notification khi size giày hoặc trang phục hết hàng.
4. **Giỏ Hàng Tương Tác Haptic (Cart)**:
   - Tăng/giảm số lượng món hàng kèm hiệu ứng rung xúc giác chân thực (`expo-haptics`).
   - Lưu trữ dữ liệu giỏ hàng offline an toàn với `@react-native-async-storage/async-storage`.
5. **Thanh Toán & Đặt Hàng Thuận Tiện (Checkout)**:
   - Quản lý sổ địa chỉ giao hàng (chọn địa chỉ mặc định hoặc thêm nhanh địa chỉ mới).
   - Hỗ trợ phương thức thanh toán: **Tiền mặt khi nhận hàng (COD)** và **Cổng VNPAY**.
   - Tự động miễn phí vận chuyển cho đơn hàng đạt ngưỡng ưu đãi.
6. **Theo Dõi Đơn Hàng & Huy Hiệu Niêm Phong Barcode**:
   - Theo dõi tiến trình 5 giai đoạn: Chờ xử lý, Đã xác nhận, Đang giao, Đã giao, Đã hủy.
   - Hiển thị mã vận đơn bưu cục GHN và huy hiệu: `✅ Đã quét kiểm đếm Barcode niêm phong an toàn`.
7. **Chụp Ảnh Thực Tế & Đánh Giá Sản Phẩm (Review with Camera)**:
   - Tích hợp `expo-image-picker` mở máy ảnh chụp ngay form giày hoặc bóng trên tay và tải lên đánh giá chất lượng.
8. **Đăng Nhập An Toàn & Đăng Nhập Nhanh**:
   - Lưu trữ JWT an toàn bằng `expo-secure-store`.
   - Nút đăng nhập nhanh 1 chạm bằng tài khoản khách hàng mẫu phục vụ nghiệm thu đồ án.

---

## 🛠️ 2. Ngăn Xếp Công Nghệ & Thư Viện Chính

| Thư viện | Phiên bản | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Expo SDK** | ~54.x | Nền tảng phát triển ứng dụng di động đa nền tảng |
| **React Navigation** | ^7.x | Quản lý ngăn xếp điều hướng (Stack & Bottom Tabs) |
| **Expo Haptics** | ~14.x | Tạo hiệu ứng rung phản hồi xúc giác khi thao tác giỏ hàng |
| **Expo Image Picker** | ~16.x | Chụp ảnh thực tế từ camera hoặc tải ảnh từ bộ sưu tập |
| **Expo Secure Store** | ~14.x | Mã hóa lưu trữ Access Token và Refresh Token trên thiết bị |
| **Async Storage** | ^2.x | Lưu trữ bộ đệm giỏ hàng và lịch sử tìm kiếm offline |
| **Lucide React Native**| ^0.x | Hệ thống icon thể thao hiện đại, tối giản |

---

## 📂 3. Cấu Trúc Thư Mục Module (Directory Layout)

```
mobile-app/
├── src/
│   ├── components/            # UI Components (ProductCard, SizeSelector, Header, Button...)
│   ├── config/                # Cấu hình API Endpoint và IP máy chủ (api.config.ts)
│   ├── navigation/            # Root Navigator, MainTabNavigator, AuthNavigator
│   ├── screens/               # Màn hình chức năng
│   │   ├── auth/              # LoginScreen, RegisterScreen
│   │   ├── catalog/           # CatalogScreen, ProductDetailScreen
│   │   ├── cart/              # CartScreen, CheckoutScreen
│   │   ├── orders/            # OrderHistoryScreen, OrderDetailScreen, ReviewScreen
│   │   └── profile/           # ProfileScreen, AddressScreen
│   ├── services/              # API Client (Axios) và AuthStorage (SecureStore)
│   ├── types/                 # Type definitions TypeScript
│   └── utils/                 # Format tiền tệ VND, Ngày tháng, Validation
├── app.json                   # Cấu hình Expo Project
├── package.json               # Dependencies & Scripts
└── README.md                  # Tài liệu kỹ thuật Mobile App
```

---

## 🌐 4. Cấu Hình Kết Nối API & Mạng Nội Bộ (Network Setup)

Để ứng dụng di động trên điện thoại thật có thể kết nối đến Backend Spring Boot đang chạy trên máy tính:

### Bước 1: Tra cứu địa chỉ IPv4 máy tính
Mở terminal PowerShell và thực hiện lệnh:
```powershell
ipconfig
```
Tìm dòng `IPv4 Address` thuộc card mạng Wi-Fi (Ví dụ: `192.168.1.18`).

### Bước 2: Cập nhật tệp cấu hình `.env` của Mobile App
Tạo hoặc mở file `mobile-app/.env` (hoặc cấu hình tại `src/config/api.config.ts`):
```env
EXPO_PUBLIC_LOCAL_IP=<YOUR_LOCAL_IP> # Đổi thành IP máy tính của bạn (Ví dụ: 192.168.1.18)
EXPO_PUBLIC_BACKEND_PORT=8080
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:8080/api/v1
```

---

## 🚀 5. Hướng Dẫn Cài Đặt & Trải Nghiệm Ứng Dụng (Quickstart)

### Điều kiện tiên quyết:
- Máy tính và điện thoại thông minh cùng kết nối vào **chung một mạng Wi-Fi**.
- Đã cài đặt ứng dụng **Expo Go** trên điện thoại (tải miễn phí trên iOS App Store hoặc Android Google Play).
- Backend Spring Boot đã được khởi động tại cổng `8080`.

### Các bước khởi chạy:
```bash
# 1. Di chuyển vào thư mục mobile-app
cd mobile-app

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy Expo Dev Server
npx expo start

# Hoặc chạy với chế độ Tunnel nếu Wi-Fi bị chặn cách ly client:
npx expo start --tunnel
```

### Quét mã trải nghiệm:
1. Mở ứng dụng **Camera** (trên iPhone/iPad) hoặc mở app **Expo Go** (trên Android).
2. Quét **mã QR Code** xuất hiện trên terminal của máy tính.
3. Ứng dụng sẽ tự động tải bundle JavaScript và hiển thị ngay trên điện thoại của bạn.

---

## 🔐 6. Bảo Mật Lưu Trữ & Định Danh Client

- **Định danh Client**: Mọi lệnh gọi API từ ứng dụng di động đều được đính kèm header nhận diện riêng:
  ```http
  X-Client-Type: mobile
  ```
  Giúp Backend phân biệt chính xác luồng xác thực giữa trình duyệt Web và ứng dụng Di động.
- **Mã hóa Token**: Access Token và Refresh Token được mã hóa phần cứng qua `Expo SecureStore` (sử dụng Keychain trên iOS và Keystore trên Android), không bị rò rỉ dữ liệu khi điện thoại bị trích xuất bộ nhớ.
