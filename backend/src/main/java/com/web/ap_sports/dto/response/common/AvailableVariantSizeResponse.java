package com.web.ap_sports.dto.response.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO phản hồi danh sách các kích thước / quy cách biến thể thực tế đang tồn tại
 * của các sản phẩm trên cửa hàng (trích xuất trực tiếp từ từng sản phẩm & biến thể,
 * hỗ trợ mọi định dạng như XS..3XL, 38..44, 8oz..14oz, 160..190, 3U/4U, Số 4/Số 5...).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableVariantSizeResponse {

    /**
     * Danh sách các tùy chọn kích thước / thông số biến thể đã được khử trùng lặp
     * và sắp xếp tự nhiên (Natural Alphanumeric Sort).
     */
    private List<VariantSizeOption> options;

    /**
     * Tổng số lượng giá trị kích thước / quy cách khác nhau tìm thấy.
     */
    private int totalDistinctOptions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantSizeOption {
        /**
         * Giá trị hiển thị và dùng để lọc (VD: "42", "XL", "8oz", "190", "4U", "Số 5").
         */
        private String value;

        /**
         * Nhãn nhóm thuộc tính gốc định nghĩa trên sản phẩm (VD: "Kích thước / Size", "Trọng lượng", "Loại sân").
         */
        private String dimensionLabel;

        /**
         * Số lượng sản phẩm khác nhau đang sở hữu biến thể mang giá trị này.
         */
        private long productCount;
    }
}
