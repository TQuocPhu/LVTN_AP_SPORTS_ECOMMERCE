package com.web.ap_sports.dto.request.support;

import lombok.*;

/**
 * Request phê duyệt và xử lý báo cáo vi phạm khách hàng dành cho Admin.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcessSupportReportRequest {

    /**
     * Có khóa tài khoản khách hàng (UserStatus.banned) hay không
     */
    @Builder.Default
    private boolean banCustomer = true;

    /**
     * Ghi chú/lý do xử lý của Admin
     */
    private String adminNote;
}

