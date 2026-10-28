/**
 * Helper tiện ích chuyên định dạng và phân giải thuộc tính biến thể thể thao
 * Tách biệt hoàn toàn logic xử lý chuỗi/JSON ra khỏi tầng Components
 */

export interface ParsedAttribute {
  name: string;
  value: string;
}

/**
 * Phân giải chuỗi thuộc tính biến thể (JSON hoặc chuỗi ngăn cách dạng "Key: Value") thành danh sách thuộc tính chuẩn hóa
 * Tự động bóc tách cặp Key - Value (ví dụ "Loại sân: Sân cỏ nhân tạo"), loại bỏ hoàn toàn nhãn cứng "Thuộc tính"
 */
export function parseVariantAttributes(
  attributes?: string | null,
  color?: string | null,
  size?: string | null
): ParsedAttribute[] {
  if (attributes && attributes.trim()) {
    const raw = attributes.trim();

    // 1. Phân giải nếu là JSON Map: {"Loại sân":"Sân cỏ nhân tạo", "Kích thước":"5"}
    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          const list = Object.entries(parsed)
            .filter(([k, v]) => k && v !== undefined && v !== null && String(v).trim())
            .map(([name, value]) => ({
              name: name.trim(),
              value: String(value).trim(),
            }));
          if (list.length > 0) return list;
        }
      } catch {
        // Fallback sang phân giải chuỗi
      }
    }

    // 2. Phân giải chuỗi ngăn cách bởi dấu | hoặc ; hoặc dấu phẩy
    // Ví dụ: "Loại sân: Sân cỏ nhân tạo | Trọng lượng: 4U" hoặc "Loại sân: Sân cỏ nhân tạo"
    const delimiter = raw.includes('|') ? '|' : raw.includes(';') ? ';' : raw.includes(',') ? ',' : null;
    const parts = delimiter ? raw.split(delimiter) : [raw];

    const parsedPairs: ParsedAttribute[] = [];
    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        const key = trimmed.slice(0, colonIdx).trim();
        const val = trimmed.slice(colonIdx + 1).trim();
        if (key && val) {
          parsedPairs.push({ name: key, value: val });
          continue;
        }
      }

      // Nếu không có dấu :, thử dấu gạch ngang " - "
      const dashIdx = trimmed.indexOf(' - ');
      if (dashIdx > 0) {
        const key = trimmed.slice(0, dashIdx).trim();
        const val = trimmed.slice(dashIdx + 3).trim();
        if (key && val) {
          parsedPairs.push({ name: key, value: val });
          continue;
        }
      }

      // Nếu không có nhãn phân tách, chỉ hiển thị giá trị, không thêm chữ "Thuộc tính"
      parsedPairs.push({ name: '', value: trimmed });
    }

    if (parsedPairs.length > 0) {
      return parsedPairs;
    }
  }

  // 3. Fallback sang color và size riêng lẻ nếu attributes trống
  const list: ParsedAttribute[] = [];
  if (color && color.trim()) {
    list.push({ name: 'Màu sắc', value: color.trim() });
  }
  if (size && size.trim()) {
    list.push({ name: 'Kích thước / Size', value: size.trim() });
  }

  return list;
}

/**
 * Định dạng ngày giờ chuẩn hiển thị tiếng Việt
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

/**
 * Chuyển đổi thuộc tính biến thể thành chuỗi hiển thị gọn gàng, thân thiện với người dùng
 * Tuyệt đối không bao giờ hiển thị chuỗi JSON thô như {"Màu sắc":"xanh lá",...}
 */
export function formatVariantDisplay(
  attributes?: string | null,
  variantName?: string | null,
  color?: string | null,
  size?: string | null
): string {
  if (variantName && !variantName.trim().startsWith('{')) {
    return variantName.trim();
  }

  const parsed = parseVariantAttributes(attributes || variantName, color, size);
  if (parsed.length === 0) return 'Biến thể tiêu chuẩn';

  return parsed.map((p) => (p.name ? `${p.name}: ${p.value}` : p.value)).join(' | ');
}

