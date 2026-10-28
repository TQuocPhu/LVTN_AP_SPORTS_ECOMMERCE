package com.web.ap_sports.enums;

/**
 * Hành động xử lý kho ban đầu khi tạo sản phẩm mới:
 * NONE: Không nhập kho ban đầu, sản phẩm có số lượng tồn kho = 0.
 * DIRECT_IMPORT: Nhập kho nhanh và ghi nhận sổ cái kho ngay (Chỉ dành cho ADMIN).
 * IMPORT_REQUEST: Gửi yêu cầu nhập kho đến Quản lý kho phê duyệt (Dành cho cả ADMIN và STAFF).
 */
public enum InboundActionType {
    NONE,
    DIRECT_IMPORT,
    IMPORT_REQUEST
}
