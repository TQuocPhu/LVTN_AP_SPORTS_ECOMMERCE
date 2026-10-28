package com.web.ap_sports.enums;

/**
 * Trạng thái của Yêu Cầu Nhập Kho hàng hóa (Import Request)
 * PENDING: Chờ thủ kho hoặc quản trị viên phê duyệt kiểm đếm
 * APPROVED: Đã được duyệt
 * REJECTED: Bị từ chối nhập kho (kèm lý do)
 * COMPLETED: Đã hoàn tất nhập kho và cộng dồn vào tồn kho thực tế
 */
public enum ImportRequestStatus {
    PENDING,
    APPROVED,
    REJECTED,
    COMPLETED
}
