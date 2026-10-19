package com.web.ap_sports.service.warehouse;

import com.web.ap_sports.dto.request.warehouse.VerifyOrderPackRequest;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;

import java.util.List;

/**
 * Service quản lý quy trình kiểm đếm Barcode và đóng gói xuất kho đơn hàng (WMS Fulfillment).
 */
public interface WarehouseFulfillmentService {

    /**
     * Xác thực kiểm đếm Barcode 100% các mặt hàng trong đơn hàng trước khi đóng gói xuất kho.
     *
     * @param orderId ID đơn hàng
     * @param request Dữ liệu các mặt hàng đã quét barcode
     * @param staffEmail Email của thủ kho / nhân viên thực hiện
     * @return Chi tiết đơn hàng sau khi xác nhận kiểm đếm thành công
     */
    AdminOrderDetailResponse verifyOrderPack(Long orderId, VerifyOrderPackRequest request, String staffEmail);

    /**
     * Lấy danh sách các đơn hàng đã duyệt (confirmed) đang chờ bộ phận kho đóng gói và xuất kho.
     */
    List<AdminOrderDetailResponse> getOrdersPendingPacking();
}
