/**
 * Utility functions cho định dạng tiền tệ VND và thời gian
 */

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Helper định dạng Date thành chuỗi 'YYYY-MM-DDTHH:mm' theo đúng MÚI GIỜ ĐỊA PHƯƠNG của Trình duyệt (không bị lệch UTC -7h).
 */
export function formatToLocalDatetimeInput(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Helper thuần định dạng thông tin phân loại sản phẩm từ variantSummary hoặc attributes JSON.
 */
export function formatVariantSummary(
  variantSummary?: string | null,
  attributes?: string | null,
  fallbackColor?: string | null,
  fallbackSize?: string | null
): string {
  if (variantSummary && variantSummary.trim()) {
    return variantSummary.trim();
  }

  if (attributes && attributes.trim()) {
    try {
      const parsed = JSON.parse(attributes.trim());
      if (typeof parsed === 'object' && parsed !== null) {
        const parts = Object.entries(parsed)
          .map(([k, v]) => `${k}: ${v}`)
          .filter(Boolean);
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch {
      return attributes.trim();
    }
  }

  const fallbacks: string[] = [];
  if (fallbackColor && fallbackColor.trim()) fallbacks.push(`Màu: ${fallbackColor.trim()}`);
  if (fallbackSize && fallbackSize.trim()) fallbacks.push(`Size: ${fallbackSize.trim()}`);
  return fallbacks.join(' • ');
}

