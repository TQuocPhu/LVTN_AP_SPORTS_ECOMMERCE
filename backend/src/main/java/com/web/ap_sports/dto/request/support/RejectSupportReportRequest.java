package com.web.ap_sports.dto.request.support;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request bác bỏ báo cáo vi phạm khách hàng dành cho Admin.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectSupportReportRequest {

    /**
     * Lý do bác bỏ báo cáo từ phía Admin (ví dụ: Không đủ chứng cứ, khách hàng hiểu lầm...)
     */
    @NotBlank(message = "Lý do bác bỏ báo cáo không được để trống")
    private String adminNote;
}

