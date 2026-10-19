/**
 * Thư viện sinh mã vạch chuẩn quốc tế Code 128 dạng SVG thuần (Pure SVG Code 128 Generator).
 * - Không phụ thuộc thư viện bên ngoài.
 * - Chuẩn mã hóa Code 128 Subset B: Hỗ trợ đầy đủ tất cả ký tự chữ, số và dấu gạch (SKU & EAN).
 * - Tương thích 100% với tất cả máy quét Barcode laser và Camera điện thoại (Barcode to PC, Zalo, Google Lens...).
 */

const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"                                // 100-106
];

export interface BarcodeOptions {
  height?: number;
  barWidth?: number;
  showText?: boolean;
  fontSize?: number;
}

/**
 * Mã hóa chuỗi text thành chuỗi SVG hoàn chỉnh
 */
export function generateBarcodeSvg(text: string, options?: BarcodeOptions): string {
  const safeText = (text || 'AP-SPORTS').trim();
  const height = options?.height ?? 36;
  const barWidth = options?.barWidth ?? 1.5;
  const showText = options?.showText ?? true;
  const fontSize = options?.fontSize ?? 9;

  // Lọc ký tự hợp lệ Code 128B (ASCII 32 - 126)
  const codes: number[] = [];
  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      codes.push(charCode - 32);
    } else {
      codes.push(0); // Fallback khoảng trắng nếu ký tự lạ
    }
  }

  // Tính Checksum Code 128
  let sum = 104; // Start Code B
  for (let i = 0; i < codes.length; i++) {
    sum += codes[i] * (i + 1);
  }
  const checkDigit = sum % 103;

  // Ghép chuỗi pattern: Start (104) + Data + Checksum + Stop (106)
  const allPatterns = [
    CODE128_PATTERNS[104],
    ...codes.map((c) => CODE128_PATTERNS[c]),
    CODE128_PATTERNS[checkDigit],
    CODE128_PATTERNS[106],
  ].join('');

  // Vẽ các vạch đen
  let currentX = 8; // Margin lề trái
  let rects = '';
  let isBar = true; // Bắt đầu bằng vạch đen

  for (let i = 0; i < allPatterns.length; i++) {
    const widthUnit = parseInt(allPatterns[i], 10);
    const pixelWidth = widthUnit * barWidth;

    if (isBar) {
      rects += `<rect x="${currentX}" y="2" width="${pixelWidth}" height="${height}" fill="#000000" />`;
    }
    currentX += pixelWidth;
    isBar = !isBar; // Đổi xen kẽ giữa vạch và khoảng trắng
  }

  const totalWidth = currentX + 8; // Thêm margin phải
  const totalHeight = showText ? height + fontSize + 4 : height + 4;

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${totalHeight - 2}" text-anchor="middle" font-family="monospace, monospace" font-size="${fontSize}" font-weight="bold" fill="#000000" letter-spacing="1">${safeText}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}" style="display: block; background: #ffffff;">${rects}${textElement}</svg>`;
}
