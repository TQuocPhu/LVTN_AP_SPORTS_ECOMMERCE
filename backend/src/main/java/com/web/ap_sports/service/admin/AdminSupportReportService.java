package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.support.ProcessSupportReportRequest;
import com.web.ap_sports.dto.request.support.RejectSupportReportRequest;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service quản lý và xử lý báo cáo vi phạm khách hàng dành riêng cho Quản trị viên (Admin).
 */
public interface AdminSupportReportService {

    /**
     * Lấy danh sách báo cáo vi phạm đang chờ Admin duyệt (status = PENDING)
     */
    List<SupportReportResponse> getPendingReports();

    /**
     * Lấy danh sách báo cáo vi phạm phân trang theo trạng thái (PENDING, PROCESSED, REJECTED)
     */
    Page<SupportReportResponse> getReports(String status, Pageable pageable);

    /**
     * Lấy báo cáo vi phạm đang chờ xử lý của một ca trò chuyện cụ thể
     */
    SupportReportResponse getPendingReportByConversation(Long conversationId);

    /**
     * Phê duyệt báo cáo vi phạm và thực hiện khóa tài khoản khách hàng (UserStatus.banned)
     */
    SupportReportResponse processReport(String adminEmail, Long reportId, ProcessSupportReportRequest request);

    /**
     * Bác bỏ báo cáo vi phạm của nhân viên (giữ nguyên tài khoản khách hàng hoạt động bình thường)
     */
    SupportReportResponse rejectReport(String adminEmail, Long reportId, RejectSupportReportRequest request);
}

