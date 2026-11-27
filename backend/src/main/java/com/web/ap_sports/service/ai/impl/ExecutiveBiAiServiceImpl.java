package com.web.ap_sports.service.ai.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.ap_sports.dto.response.admin.AdminDashboardResponse;
import com.web.ap_sports.dto.response.ai.AiBusinessAdvisorResponse;
import com.web.ap_sports.dto.response.report.FinancialReconciliationResponse;
import com.web.ap_sports.dto.response.report.RevenueOverviewReportResponse;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.service.admin.AdminDashboardService;
import com.web.ap_sports.service.admin.AdminReportService;
import com.web.ap_sports.service.ai.ExecutiveBiAiService;
import com.web.ap_sports.service.ai.GeminiRestClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Triển khai nghiệp vụ cho Agent 3: AI Executive Business Advisor.
 * Phân tích số liệu Dashboard thời gian thực, đánh giá sức khỏe doanh nghiệp và đề xuất chiến lược cho Ban Giám Đốc.
 * Tích hợp bộ nhớ đệm In-Memory Cache 30 phút để tối ưu chi phí và tốc độ.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExecutiveBiAiServiceImpl implements ExecutiveBiAiService {

    private final AdminDashboardService adminDashboardService;
    private final AdminReportService adminReportService;
    private final GeminiRestClient geminiRestClient;
    private final ObjectMapper objectMapper;

    // Cache kết quả phân tích trong 30 phút để tránh gọi API lặp lại khi F5 Dashboard
    private static final Map<String, CacheEntry> BI_CACHE = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 30 * 60 * 1000L;

    private record CacheEntry(AiBusinessAdvisorResponse data, long timestamp) {}

    @Override
    public AiBusinessAdvisorResponse getExecutiveInsights(User currentUser) {
        // 1. Kiểm tra cache
        String roleName = (currentUser != null && currentUser.getRole() != null) ? currentUser.getRole().getName() : "ADMIN";
        String cacheKey = "BI_INSIGHTS_" + roleName;
        CacheEntry cached = BI_CACHE.get(cacheKey);
        if (cached != null && (System.currentTimeMillis() - cached.timestamp()) < CACHE_TTL_MS) {
            log.info("Trả về báo cáo Executive BI từ bộ nhớ đệm Cache (tiết kiệm token)");
            return cached.data();
        }

        // 2. Thu thập số liệu kinh doanh thực tế từ AdminDashboardService & Báo cáo Tài chính / Đối soát tháng hiện tại
        AdminDashboardResponse dashboardData = adminDashboardService.getDashboardData(currentUser);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        RevenueOverviewReportResponse monthlyReport = adminReportService.getRevenueOverview(monthStart, now, null);
        FinancialReconciliationResponse reconciliation = adminReportService.getFinancialReconciliation(monthStart, now, "ALL", null);

        // 3. Xây dựng ngữ cảnh số liệu tóm tắt (Dashboard + Giá vốn/Lãi gộp + Đối soát dòng tiền)
        String summaryMetricsJson = buildMetricsJson(dashboardData, monthlyReport, reconciliation);

        // 4. System Instruction: Cố vấn tài chính & vận hành cấp cao
        String systemInstruction = """
                Bạn là Cố Vấn Trưởng Chiến Lược Kinh Doanh & Vận Hành E-commerce (Chief Business Advisor) của Ban Giám Đốc AP Sports.
                Dưới đây là số liệu kinh doanh thực tế từ hệ thống Dashboard thời gian thực kết hợp Báo cáo Lợi nhuận gộp (Giá vốn vs Doanh thu thuần) và Sổ cái Đối soát dòng tiền (Thực thu VNPay/COD, Tạm thu VNPay chờ giao, Chờ thu COD, Đơn cần hoàn tiền).
                Nhiệm vụ của bạn là đưa ra báo cáo cố vấn sắc bén, thực tế, dựa trên số liệu cụ thể (KHÔNG BỊA ĐẶT SỐ LIỆU), có nhận định rõ về biên lãi gộp, dòng tiền đối soát và các đơn cần hoàn tiền nếu có.
                TUYỆT ĐỐI KHÔNG SỬ DỤNG KÝ TỰ SAO ĐÔI ** trong văn bản. Hãy viết văn tự nhiên, cô đọng, chuyên nghiệp.

                YÊU CẦU ĐỊNH DẠNG OUTPUT:
                Bạn PHẢI trả về duy nhất một chuỗi JSON hợp lệ (không kèm theo bất kỳ chữ nào ngoài JSON) có cấu trúc:
                {
                  "executiveSummary": "Nhận định ngắn gọn 2-3 câu về sức khỏe kinh doanh hiện tại của cửa hàng...",
                  "riskAlerts": [
                    "Cảnh báo rủi ro 1...",
                    "Cảnh báo rủi ro 2..."
                  ],
                  "recommendations": [
                    "Hành động đề xuất 1...",
                    "Hành động đề xuất 2..."
                  ]
                }
                """;

        String userPrompt = "Số liệu kinh doanh tổng hợp của AP Sports:\n" + summaryMetricsJson +
                "\nHãy phân tích và trả về báo cáo JSON cho Ban Giám Đốc.";

        // Gọi Gemini Flash với temperature thấp 0.2 để phân tích số liệu chuẩn xác
        String rawReply = geminiRestClient.generateContent(systemInstruction, userPrompt, 0.2, 1500);

        AiBusinessAdvisorResponse response = parseBiResponse(rawReply);

        // Lưu vào Cache
        BI_CACHE.put(cacheKey, new CacheEntry(response, System.currentTimeMillis()));

        return response;
    }

    private String buildMetricsJson(
            AdminDashboardResponse dashboard,
            RevenueOverviewReportResponse monthlyReport,
            FinancialReconciliationResponse reconciliation
    ) {
        try {
            Map<String, Object> summary = new LinkedHashMap<>();
            if (dashboard != null) {
                summary.put("adminScorecards", dashboard.getAdminScorecards());
                summary.put("topSellingProducts", dashboard.getTopSellingProducts());
                summary.put("lowStockAlerts", dashboard.getLowStockAlerts());
                summary.put("salesFunnel", dashboard.getSalesFunnel());
                summary.put("categoryShares", dashboard.getCategoryShares());
            }
            if (monthlyReport != null) {
                Map<String, Object> profitMetrics = new LinkedHashMap<>();
                profitMetrics.put("totalDeliveredRevenue", monthlyReport.getTotalDeliveredRevenue());
                profitMetrics.put("totalNetRevenue", monthlyReport.getTotalNetRevenue());
                profitMetrics.put("totalCostOfGoodsSold", monthlyReport.getTotalCostOfGoodsSold());
                profitMetrics.put("grossProfit", monthlyReport.getGrossProfit());
                profitMetrics.put("grossMarginPercent", monthlyReport.getGrossMarginPercent());
                profitMetrics.put("revenueGrowthPercent", monthlyReport.getRevenueGrowthPercent());
                profitMetrics.put("cancellationRate", monthlyReport.getCancellationRate());
                summary.put("monthlyProfitAndGrowth", profitMetrics);
            }
            if (reconciliation != null) {
                Map<String, Object> reconMetrics = new LinkedHashMap<>();
                reconMetrics.put("grossRevenue", reconciliation.getGrossRevenue());
                reconMetrics.put("netCollectedRevenue", reconciliation.getNetCollectedRevenue());
                reconMetrics.put("vnpayPrepaidPendingRevenue", reconciliation.getVnpayPrepaidPendingRevenue());
                reconMetrics.put("pendingReconciliationRevenue", reconciliation.getPendingReconciliationRevenue());
                reconMetrics.put("cancelledUnpaidRevenue", reconciliation.getCancelledUnpaidRevenue());
                reconMetrics.put("pendingRefundCount", reconciliation.getPendingRefundCount());
                reconMetrics.put("pendingRefundRevenue", reconciliation.getPendingRefundRevenue());
                reconMetrics.put("refundedRevenue", reconciliation.getRefundedRevenue());
                reconMetrics.put("collectionRate", reconciliation.getCollectionRate());
                summary.put("monthlyFinancialReconciliation", reconMetrics);
            }
            return objectMapper.writeValueAsString(summary);
        } catch (Exception e) {
            return "{}";
        }
    }

    private AiBusinessAdvisorResponse parseBiResponse(String rawReply) {
        try {
            String cleanedJson = rawReply.trim();
            if (cleanedJson.startsWith("```json")) {
                cleanedJson = cleanedJson.substring(7);
            }
            if (cleanedJson.startsWith("```")) {
                cleanedJson = cleanedJson.substring(3);
            }
            if (cleanedJson.endsWith("```")) {
                cleanedJson = cleanedJson.substring(0, cleanedJson.length() - 3);
            }
            cleanedJson = cleanedJson.trim();

            JsonNode node = objectMapper.readTree(cleanedJson);

            List<String> riskAlerts = new ArrayList<>();
            JsonNode risksNode = node.path("riskAlerts");
            if (risksNode.isArray()) {
                risksNode.forEach(r -> riskAlerts.add(r.asText("").replace("**", "").trim()));
            }

            List<String> recommendations = new ArrayList<>();
            JsonNode recsNode = node.path("recommendations");
            if (recsNode.isArray()) {
                recsNode.forEach(rec -> recommendations.add(rec.asText("").replace("**", "").trim()));
            }

            String summary = node.path("executiveSummary").asText("Sức khỏe kinh doanh duy trì ổn định, cần theo dõi thêm tốc độ xả hàng tồn kho.").replace("**", "").trim();

            return AiBusinessAdvisorResponse.builder()
                    .executiveSummary(summary)
                    .riskAlerts(riskAlerts.isEmpty() ? List.of("Theo dõi tỷ lệ hoàn trả của các mặt hàng quần áo.") : riskAlerts)
                    .recommendations(recommendations.isEmpty() ? List.of("Đẩy mạnh quảng bá các mặt hàng bán chạy.") : recommendations)
                    .generatedAt(LocalDateTime.now())
                    .build();
        } catch (Exception ex) {
            log.warn("Không thể parse JSON từ phản hồi BI của AI: {}", ex.getMessage());
            return AiBusinessAdvisorResponse.builder()
                    .executiveSummary("Hệ thống kinh doanh hoạt động bình thường theo các chỉ số ghi nhận trên Dashboard.")
                    .riskAlerts(List.of("Kiểm soát chặt chẽ tỷ lệ hàng hoàn và tồn kho trên 45 ngày."))
                    .recommendations(List.of("Tối ưu hóa các chiến dịch tiếp thị cho danh mục có biên lợi nhuận cao."))
                    .generatedAt(LocalDateTime.now())
                    .build();
        }
    }
}
