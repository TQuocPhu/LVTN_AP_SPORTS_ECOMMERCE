# ⚛️ Frontend Web App - Website Thể Thao Enterprise

Giao diện Bán hàng (Storefront) & Trang Quản trị (Admin/Staff Portal) phát triển bằng **Next.js 16 App Router** và **TypeScript**.

---

## 🎨 Tính Năng Giao Diện & UX/UI

- **Storefront**: Xem chi tiết sản phẩm thể thao, chọn size số (38..43) hoặc size chữ (S..XXL), lọc nhiều danh mục, đọc thông số JSON kỹ thuật linh hoạt.
- **Thanh Toán**: Đặt hàng và thanh toán VNPay Sandbox, PayPal, COD.
- **Theo Dõi Đơn Hàng**: GPS Tracking tiến trình vận chuyển GHN / GHTK trực quan.
- **Admin SEO Dashboard**: Thống kê Doanh thu, Chi phí, Lợi nhuận, Báo cáo Doanh số theo Nhân viên với bộ lọc thời gian linh hoạt (Hôm nay, 7 ngày, Tháng này, Năm nay, Custom Date Range).
- **Tương Tác Realtime**: Header Notification Center có Redirect URL, Live Chat CSKH trực tiếp với Nhân viên.

---

## 🚀 Hướng Dẫn Chạy Frontend

```bash
# Cài đặt thư viện
npm install

# Chạy môi trường phát triển
npm run dev

# Build sản phẩm Production
npm run build
```

Cấu hình API URL tại `.env.local` (`NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`).
