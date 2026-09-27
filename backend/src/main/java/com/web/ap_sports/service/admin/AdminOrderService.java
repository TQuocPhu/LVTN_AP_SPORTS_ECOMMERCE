package com.web.ap_sports.service.admin;

import com.web.ap_sports.dto.request.admin.AdminOrderFilterRequest;
import com.web.ap_sports.dto.request.admin.CancelOrderRequest;
import com.web.ap_sports.dto.request.admin.UpdateOrderStatusRequest;
import com.web.ap_sports.dto.response.admin.AdminOrderDetailResponse;
import com.web.ap_sports.dto.response.admin.AdminOrderSummaryResponse;
import org.springframework.data.domain.Page;

public interface AdminOrderService {
    Page<AdminOrderDetailResponse> getAdminOrders(AdminOrderFilterRequest filterRequest);
    AdminOrderSummaryResponse getOrderSummary();
    AdminOrderDetailResponse getAdminOrderById(Long id);
    AdminOrderDetailResponse getAdminOrderByCode(String orderCode);
    AdminOrderDetailResponse confirmOrder(Long id, String staffEmail);
    AdminOrderDetailResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request, String staffEmail);
    AdminOrderDetailResponse cancelOrder(Long id, CancelOrderRequest request, String staffEmail);
}
