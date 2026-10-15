package com.web.ap_sports.dto.response.support;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportReportResponse {

    private Long id;
    private Long conversationId;
    private Long reportedCustomerId;
    private String reportedCustomerName;
    private String reportedCustomerEmail;
    private Long reportedByStaffId;
    private String reportedByStaffName;
    private String reason;
    private String evidenceImageUrls;
    private String status;
    private String adminNote;
    private Long processedByAdminId;
    private String processedByAdminName;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
}
