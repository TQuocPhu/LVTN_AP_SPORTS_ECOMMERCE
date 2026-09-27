package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface CustomerOrderService {
    OrderResponse createOrder(String email, CreateOrderRequest request, String clientIp);
    OrderResponse processVNPayReturn(Map<String, String> queryParams);
    OrderResponse retryVNPayPayment(String email, String orderCode, String clientIp);
    OrderResponse getOrderByCode(String email, String orderCode);
    Page<OrderResponse> getMyOrders(String email, String status, String keyword, String sortBy, String sortDir, Pageable pageable);
    OrderResponse cancelMyOrder(String email, String orderCode, String reason);
    OrderResponse returnMyOrder(String email, String orderCode, String reason);
}
