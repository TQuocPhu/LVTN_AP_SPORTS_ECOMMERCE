package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.support.ProcessSupportReportRequest;
import com.web.ap_sports.dto.request.support.RejectSupportReportRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.support.SupportReportResponse;
import com.web.ap_sports.service.admin.AdminSupportReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller cung cấp các API Quản lý và Phê duyệt Báo cáo Vi phạm Khách hàng dành cho Admin.
 */
@RestController
@RequestMapping("/api/v1/admin/support-reports")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN') or hasRole('ADMIN')")
public class AdminSupportReportController {

    private final AdminSupportReportService adminSupportReportService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<SupportReportResponse>>> getPendingReports() {
        List<SupportReportResponse> list = adminSupportReportService.getPendingReports();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách báo cáo vi phạm chờ duyệt thành công", list));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SupportReportResponse>>> getReports(
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            @PageableDefault(size = 10) Pageable pageable
    ) {
        Page<SupportReportResponse> page = adminSupportReportService.getReports(status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách báo cáo vi phạm thành công", page));
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<ApiResponse<SupportReportResponse>> getPendingReportByConversation(
            @PathVariable Long conversationId
    ) {
        SupportReportResponse report = adminSupportReportService.getPendingReportByConversation(conversationId);
        return ResponseEntity.ok(ApiResponse.success("Lấy báo cáo vi phạm của ca hỗ trợ thành công", report));
    }

    @PostMapping("/{id}/process")
    public ResponseEntity<ApiResponse<SupportReportResponse>> processReport(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody(required = false) ProcessSupportReportRequest request
    ) {
        SupportReportResponse response = adminSupportReportService.processReport(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã phê duyệt báo cáo vi phạm và xử lý tài khoản thành công", response));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<SupportReportResponse>> rejectReport(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody RejectSupportReportRequest request
    ) {
        SupportReportResponse response = adminSupportReportService.rejectReport(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Đã bác bỏ báo cáo vi phạm thành công", response));
    }
}

