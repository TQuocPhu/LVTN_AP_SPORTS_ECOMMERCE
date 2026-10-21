/**
 * Tiện ích chuyển đổi mã HTML từ cơ sở dữ liệu sang dạng Text thuần túy có định dạng (Clean Formatted Text).
 * - Loại bỏ hoàn toàn các thẻ HTML (<p>, <div>, <span>, <h3>, <br>, <li>...)
 * - Tự động định dạng ngắt dòng tự nhiên cho các khối văn bản.
 * - Thêm bullet point '• ' cho các phần tử danh sách <li>.
 * - Giải mã toàn diện các ký tự đặc biệt HTML (&quot;, &nbsp;, &amp;, &lt;, &gt;...).
 */
export function stripHtmlToText(html?: string): string {
  if (!html) return '';

  let text = String(html);

  // 1. Loại bỏ các khối mã độc/style/script/comments
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // 2. Thay thế các thẻ ngắt dòng <br> và <br/>
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // 3. Chuyển đổi thẻ danh sách <li> thành gạch đầu dòng bullet
  text = text.replace(/<li[^>]*>/gi, '\n• ');
  text = text.replace(/<\/li>/gi, '');

  // 4. Thẻ kết thúc đoạn văn hoặc khối tiêu đề -> thêm ngắt dòng
  text = text.replace(/<\/(p|div|h[1-6]|tr|article|section)>/gi, '\n\n');

  // 5. Bỏ tất cả các thẻ HTML mở và đóng còn lại
  text = text.replace(/<[^>]+>/g, '');

  // 6. Giải mã toàn bộ HTML Entities phổ biến
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&bull;/gi, '•')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&hellip;/gi, '...')
    .replace(/&copy;/gi, '©')
    .replace(/&trade;/gi, '™')
    .replace(/&reg;/gi, '®')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec));

  // 7. Xử lý khoảng trắng thừa và gom các dòng trống liên tiếp (tối đa 2 dòng trống)
  const lines = text.split('\n').map((line) => line.trim());
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
