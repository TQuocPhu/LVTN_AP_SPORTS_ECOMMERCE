package com.web.ap_sports.service.common;

import com.web.ap_sports.entity.Order;
import java.util.Map;

public interface VNPayService {
    /**
     * Sinh URL thanh toán VNPay cho đơn hàng
     */
    String generatePaymentUrl(Order order, String clientIp);

    /**
     * Xác thực chữ ký checksum IPN/Callback từ VNPay
     */
    boolean verifyChecksum(Map<String, String> queryParams);
}
