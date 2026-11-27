package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.AdminDeliveryReviewFilterRequest;
import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewResponse;
import com.web.ap_sports.dto.response.admin.AdminDeliveryReviewSummaryResponse;
import com.web.ap_sports.service.admin.AdminDeliveryReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller Quản lý Đánh giá giao hàng / Shipper thuộc mục Chăm Sóc Khách Hàng (ADMIN, STAFF).
 */
@RestController
@RequestMapping("/api/v1/admin/delivery-reviews")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminDeliveryReviewController {

    private final AdminDeliveryReviewService adminDeliveryReviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminDeliveryReviewResponse>>> getDeliveryReviews(
            @ModelAttribute AdminDeliveryReviewFilterRequest filterRequest) {
        Page<AdminDeliveryReviewResponse> page = adminDeliveryReviewService.getDeliveryReviews(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá giao hàng thành công.", page));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AdminDeliveryReviewSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thống kê đánh giá giao hàng thành công.",
                adminDeliveryReviewService.getSummary()
        ));
    }

    @PutMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<AdminDeliveryReviewResponse>> replyDeliveryReview(
            @PathVariable("id") Long id,
            Authentication authentication,
            @Valid @RequestBody AdminReplyReviewRequest request) {
        AdminDeliveryReviewResponse updated = adminDeliveryReviewService.replyDeliveryReview(
                id,
                authentication.getName(),
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Gửi phản hồi đánh giá giao hàng thành công.", updated));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<AdminDeliveryReviewResponse>> toggleStatus(
            @PathVariable("id") Long id) {
        AdminDeliveryReviewResponse updated = adminDeliveryReviewService.toggleDeliveryReviewStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đánh giá giao hàng thành công.", updated));
    }
}
