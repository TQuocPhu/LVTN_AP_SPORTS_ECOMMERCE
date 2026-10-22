package com.web.ap_sports.dto.response.ai;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO phản hồi báo cáo cố vấn chiến lược BI cho Ban Giám Đốc (Super Admin).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiBusinessAdvisorResponse {

    // Nhận định tổng quan tình hình kinh doanh
    private String executiveSummary;

    // Các cảnh báo rủi ro (tồn kho lâu, hủy đơn, giảm tốc độ bán)
    private List<String> riskAlerts;

    // Các hành động đề xuất cụ thể (khuyến mãi xả hàng, nhập thêm hàng hot)
    private List<String> recommendations;

    // Thời điểm báo cáo được sinh ra
    private LocalDateTime generatedAt;
}
