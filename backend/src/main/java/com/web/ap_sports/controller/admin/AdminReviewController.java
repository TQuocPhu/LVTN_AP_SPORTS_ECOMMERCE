package com.web.ap_sports.controller.admin;

import com.web.ap_sports.dto.request.admin.AdminReplyReviewRequest;
import com.web.ap_sports.dto.request.admin.AdminReviewFilterRequest;
import com.web.ap_sports.dto.response.ApiResponse;
import com.web.ap_sports.dto.response.admin.AdminReviewDetailResponse;
import com.web.ap_sports.service.admin.AdminReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/reviews")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    /**
     * Lấy danh sách đánh giá phân trang với các bộ lọc (ADMIN, STAFF)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminReviewDetailResponse>>> getAdminReviews(
            @ModelAttribute AdminReviewFilterRequest filterRequest) {
        Page<AdminReviewDetailResponse> page = adminReviewService.getAdminReviews(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách quản lý đánh giá thành công.", page));
    }

    /**
     * Phản hồi chính thức 1-1 từ Admin/Shop cho đánh giá của khách hàng (ADMIN, STAFF)
     */
    @PutMapping("/{id}/reply")
    public ResponseEntity<ApiResponse<AdminReviewDetailResponse>> replyReview(
            @PathVariable("id") Long id,
            Authentication authentication,
            @Valid @RequestBody AdminReplyReviewRequest request) {
        String adminEmail = authentication.getName();
        AdminReviewDetailResponse updated = adminReviewService.replyReview(id, adminEmail, request);
        return ResponseEntity.ok(ApiResponse.success("Gửi phản hồi đánh giá thành công.", updated));
    }

    /**
     * Ẩn hoặc Phê duyệt lại bài đánh giá (ADMIN, STAFF)
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ApiResponse<AdminReviewDetailResponse>> toggleReviewStatus(
            @PathVariable("id") Long id) {
        AdminReviewDetailResponse updated = adminReviewService.toggleReviewStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái bài đánh giá thành công.", updated));
    }
}
