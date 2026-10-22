package com.web.ap_sports.service.ai;

import com.web.ap_sports.dto.response.ai.AiBusinessAdvisorResponse;
import com.web.ap_sports.entity.User;

/**
 * Interface cho Agent 3: AI Executive Business Advisor (Cố vấn chiến lược kinh doanh BI cho Ban Giám Đốc).
 */
public interface ExecutiveBiAiService {

    /**
     * Phân tích số liệu kinh doanh tổng hợp từ Dashboard và sinh báo cáo chiến lược
     */
    AiBusinessAdvisorResponse getExecutiveInsights(User currentUser);
}
