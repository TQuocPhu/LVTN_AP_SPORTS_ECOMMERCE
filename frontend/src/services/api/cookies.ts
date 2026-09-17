/**
 * Hàm đọc Cookie an toàn trên phía Client trình duyệt
 * (TUYỆT ĐỐI KHÔNG DÙNG localStorage THEO QUY TẮC BẢO MẬT DỰ ÁN)
 * 
 * @param {string} name - Tên của Cookie cần đọc (Ví dụ: 'accessToken')
 * @returns {string | null} Giá trị của Cookie hoặc null nếu không tìm thấy
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Hàm ghi Cookie phía Client trình duyệt với thời hạn sinh sống (Expiration)
 * 
 * @param {string} name - Tên Cookie
 * @param {string} value - Giá trị Cookie
 * @param {number} days - Số ngày tồn tại (Mặc định: 7 ngày)
 */
export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value || ''}${expires}; path=/; SameSite=Lax${secureFlag}`;
}

/**
 * Hàm xóa Cookie phía Client
 * 
 * @param {string} name - Tên Cookie cần xóa
 */
export function eraseCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
}
