package com.web.ap_sports.search;

import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Class tiện ích tiền xử lý và tách từ (Tokenization) dành riêng cho tiếng Việt.
 * Nhiệm vụ:
 * 1. Loại bỏ dấu tiếng Việt (Ví dụ: "áo bóng đá" -> "ao bong da").
 * 2. Làm sạch các ký tự đặc biệt, đưa tất cả về chữ thường (Lowercase).
 * 3. Tách chuỗi văn bản thành danh sách từ (Tokens).
 * 4. Loại bỏ các từ dừng (Stop-words) không mang nhiều giá trị tìm kiếm (Ví dụ: "và", "của", "cho",...).
 */
public class VietnameseTokenizer {

    // Pattern nhận diện các ký tự dấu tiếng Việt kết hợp theo chuẩn Unicode Normalizer NFD
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    
    // Danh sách các từ dừng (Stop-words) và từ hội thoại/ý định mua sắm tiếng Việt (như: tui, muốn, mua, cần, tìm...)
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
        "va", "cua", "cho", "voi", "cac", "nhung", "la", "nay", "trong", "duoc",
        "ra", "khi", "de", "tu", "theo", "sau", "ve", "cung", "nhu", "tren",
        "tui", "toi", "minh", "muon", "mua", "can", "tim", "shop", "ban", "co", "xem" 
    ));

    /**
     * Hàm loại bỏ hoàn toàn dấu tiếng Việt và chuyển đổi chữ 'Đ', 'đ' thành 'D', 'd'.
     * @param text Chuỗi đầu vào có dấu
     * @return Chuỗi không dấu tương ứng
     */
    public static String stripAccents(String text) {
        if (text == null) return "";
        // Chuyển đổi văn bản sang dạng Unicode NFD (Tách riêng chữ cái và dấu)
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        // Dùng Regex xóa toàn bộ các ký tự dấu NFD vừa bóc tách
        String stripped = DIACRITICS_PATTERN.matcher(normalized).replaceAll("");
        // Xử lý thủ công trường hợp chữ Đ/đ vì Unicode NFD không bóc tách chữ Đ thành D + dấu được
        return stripped.replace('đ', 'd').replace('Đ', 'D');
    }

    /**
     * Hàm tiền xử lý văn bản tổng thể: Chuyển chữ thường -> Bỏ dấu tiếng Việt -> Loại bỏ ký tự đặc biệt.
     * @param text Văn bản thô
     * @return Chuỗi văn bản đã làm sạch chuẩn hóa
     */
    public static String normalizeText(String text) {
        if (text == null || text.isBlank()) return "";
        // 1. Chuyển toàn bộ về chữ thường
        String lower = text.toLowerCase(Locale.ROOT);
        // 2. Bỏ dấu tiếng Việt
        String noAccents = stripAccents(lower);
        // 3. Thay thế tất cả ký tự không phải chữ cái a-z và số 0-9 bằng khoảng trắng
        // 4. Thu gọn nhiều khoảng trắng liên tiếp thành 1 khoảng trắng duy nhất
        return noAccents.replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();
    }

    /**
     * Hàm bóc tách chuỗi thành danh sách các từ độc lập (Tokens) và lọc bỏ Stop-words.
     * @param text Chuỗi văn bản đầu vào
     * @return Danh sách các token tiếng Việt đã được làm sạch
     */
    public static List<String> tokenize(String text) {
        // Chuẩn hóa văn bản trước khi bóc tách
        String normalized = normalizeText(text);
        if (normalized.isEmpty()) return Collections.emptyList();

        // Tách chuỗi theo dấu khoảng trắng
        String[] rawTokens = normalized.split("\\s+");
        List<String> tokens = new ArrayList<>();

        for (String token : rawTokens) {
            // Chỉ giữ lại các token có độ dài >= 1 và KHÔNG nằm trong danh sách Stop-words
            if (token.length() >= 1 && !STOP_WORDS.contains(token)) {
                tokens.add(token);
            }
        }
        return tokens;
    }
}
