/**
 * Định dạng tiền tệ VND chuẩn Việt Nam
 */
export function formatCurrency(amount?: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
