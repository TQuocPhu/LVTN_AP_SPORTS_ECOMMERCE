package com.web.ap_sports.dto.request.admin;

import lombok.*;

/**
 * DTO chứa tham số tìm kiếm, lọc, sắp xếp và phân trang cho danh sách Quản lý Đánh giá (Admin/Staff).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminReviewFilterRequest {

    /**
     * Lọc theo số sao đánh giá (1 - 5 sao, null/0: tất cả)
     */
    private Integer rating;

    /**
     * Trạng thái bài đánh giá (approved, hidden, ALL)
     */
    private String status;

    /**
     * Từ khóa tìm kiếm (tên sản phẩm, tên khách hàng, nội dung đánh giá)
     */
    private String keyword;

    /**
     * Trường sắp xếp (createdAt, rating, status, id)
     */
    @Builder.Default
    private String sortBy = "createdAt";

    /**
     * Hướng sắp xếp (ASC: Tăng dần, DESC: Giảm dần)
     */
    @Builder.Default
    private String sortDir = "DESC";

    /**
     * Trang hiện tại (bắt đầu từ 0)
     */
    @Builder.Default
    private Integer page = 0;

    /**
     * Số lượng phần tử mỗi trang
     */
    @Builder.Default
    private Integer size = 10;
}

