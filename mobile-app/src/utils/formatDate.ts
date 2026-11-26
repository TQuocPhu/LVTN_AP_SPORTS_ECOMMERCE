/**
 * Tiện ích định dạng ngày tháng năm chuẩn Việt Nam (dd/mm/yyyy) cho Mobile App.
 * Dùng hàm bóc tách ngày/tháng/năm trực tiếp thay vì phụ thuộc toLocaleDateString('vi-VN'),
 * đảm bảo không bao giờ bị hiển thị ngược thành mm/dd/yyyy trên máy ảo Android/iOS tiếng Anh.
 */

export function formatDateVi(dateInput?: string | Date | null, fallback = '---'): string {
  if (!dateInput) return fallback;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDateTimeVi(dateInput?: string | Date | null, fallback = '---'): string {
  if (!dateInput) return fallback;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
