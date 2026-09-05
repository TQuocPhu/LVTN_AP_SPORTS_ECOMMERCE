# 🔴 Quy Tắc Tối Ưu Caching & Redis Strategy (Redis Rules for AI)

Tài liệu này quy định chiến lược sử dụng Redis cho Caching, Session Management, Realtime Pub/Sub và Rate Limiting trong dự án.

---

## 📌 1. Quy Đặt Tên Redis Keys (Key Naming Convention)

Mọi Key lưu trữ trên Redis **BẮT BUỘC** phải tuân theo cấu trúc phân cấp bằng dấu hai chấm `:`.

### Cấu trúc chuẩn:
`app_name:environment:module:entity_type:id_or_parameter`

### Ví dụ cụ thể:
- **User Profile Cache**: `lvtn:dev:user:profile:1001`
- **User Session / Token**: `lvtn:dev:auth:token:jwt_xyz123`
- **Product Details**: `lvtn:dev:catalog:product:50`
- **OTP Verification**: `lvtn:dev:otp:email:user@example.com`
- **Rate Limiting Counter**: `lvtn:dev:ratelimit:ip:192.168.1.1`

---

## ⏳ 2. Quy Định TTL (Time-To-Live / Hạn Xuất Hiện)

**TUYỆT ĐỐI KHÔNG** lưu các key vĩnh viễn (Key không có TTL) trừ các dữ liệu cấu hình hệ thống cố định. Mọi key cache phải cài đặt thời gian sống phù hợp:

| Loại Dữ Liệu | Thời Gian TTL Khuyên Dùng | Mô Tả |
| :--- | :--- | :--- |
| **OTP / Password Reset Token** | `5 - 10 phút` | Tự động xóa để đảm bảo an toàn |
| **User Session / Auth Token** | `24 giờ - 7 ngày` | Khớp với thời gian hết hạn JWT |
| **Bản tin Hot / Dashboard Cache**| `5 - 15 phút` | Giảm tải cho DB với data truy cập cao |
| **Danh mục Tĩnh (Categories)** | `12 - 24 giờ` | Dữ liệu ít thay đổi |
| **Rate Limit Counters** | `1 phút` | Giới hạn số request/phút |

---

## ⚡ 3. Chiến Lược Caching Tránh Lỗi Thường Gặp

### A. Chống Thủng Cache (Cache Penetration)
- Khi truy vấn một ID không tồn tại trong DB, hãy lưu giá trị null tạm thời vào Redis với TTL ngắn (khoảng 1-2 phút) để tránh việc vô số request cố tình truy vấn ID rác làm sập DB.

### B. Chống Tuyết Lở Cache (Cache Avalanche)
- Khi nạp lượng lớn dữ liệu vào Redis cùng lúc, **KHÔNG** đặt TTL giống hệt nhau cho tất cả các key. Hãy cộng thêm một khoảng thời gian ngẫu nhiên (Jitter: +/- 1-5 phút) để các key không bị hết hạn đồng loạt.

### C. Sử dụng Spring Cache Annotations Đúng Cách
- Sử dụng `@Cacheable`, `@CachePut`, `@CacheEvict` ở lớp Service:

```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    // Nạp từ Redis nếu có, nếu chưa có thì query DB và lưu vào Redis
    @Override
    @Cacheable(value = "products", key = "'lvtn:dev:product:' + #id", unless = "#result == null")
    public ProductDto getProductById(Long id) {
        return productRepository.findById(id)
                .map(productMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    // Khi cập nhật thông tin -> Cập nhật DB và XÓA Cache cũ
    @Override
    @CacheEvict(value = "products", key = "'lvtn:dev:product:' + #id")
    public ProductDto updateProduct(Long id, UpdateProductRequest request) {
        // Update logic...
    }
}
```
