import { redirect } from 'next/navigation';

/**
 * Chuyển hướng đường dẫn báo cáo cũ sang phân hệ Quản Lý Đơn Hàng (/admin/orders/reports).
 */
export default function AdminReportsRedirectPage() {
  redirect('/admin/orders/reports');
}
