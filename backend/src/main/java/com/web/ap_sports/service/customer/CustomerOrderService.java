package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.CreateOrderRequest;
import com.web.ap_sports.dto.response.customer.OrderResponse;
import com.web.ap_sports.dto.response.customer.VNPayIpnResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.Map;

public interface CustomerOrderService {
    OrderResponse createOrder(String email, CreateOrderRequest request, String clientIp);
    OrderResponse processVNPayReturn(Map<String, String> queryParams);
    VNPayIpnResponse processVNPayIpn(Map<String, String> queryParams);
    OrderResponse retryVNPayPayment(String email, String orderCode, String clientIp);
    OrderResponse getOrderByCode(String email, String orderCode);
    Page<OrderResponse> getMyOrders(String email, String status, String keyword, String sortBy, String sortDir, LocalDate startDate, LocalDate endDate, Pageable pageable);
    OrderResponse cancelMyOrder(String email, String orderCode, String reason);
    OrderResponse returnMyOrder(String email, String orderCode, String reason);
    OrderResponse completeMyOrder(String email, String orderCode);
}
