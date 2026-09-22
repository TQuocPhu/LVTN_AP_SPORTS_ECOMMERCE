package com.web.ap_sports.dto.request.admin;

import lombok.*;

/**
 * DTO chứa tham số tìm kiếm, lọc, sắp xếp đa tiêu chí và phân trang cho danh sách Voucher Admin.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherFilterRequest {

    /**
     * Từ khóa tìm kiếm theo Mã voucher hoặc Tên voucher
     */
    private String keyword;

    /**
     * Lọc theo Loại voucher (ALL, FIXED, PERCENT, FREESHIP)
     */
    private String type;

    /**
     * Lọc theo Trạng thái (ALL, active, scheduled, expired, disabled)
     */
    private String status;

    /**
     * Lọc theo Phân loại áp dụng (ALL, FREESHIP, FASHION, APPAREL, SHOES)
     */
    private String categoryScope;

    /**
     * Trường sắp xếp (createdAt, expiresAt, usedCount, value, code, name)
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
    private int page = 0;

    /**
     * Số lượng phần tử mỗi trang
     */
    @Builder.Default
    private int size = 10;
}
