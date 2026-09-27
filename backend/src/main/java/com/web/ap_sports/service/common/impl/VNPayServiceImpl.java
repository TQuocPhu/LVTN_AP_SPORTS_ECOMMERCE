package com.web.ap_sports.service.common.impl;

import com.web.ap_sports.config.VNPayConfig;
import com.web.ap_sports.entity.Order;
import com.web.ap_sports.service.common.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;

    @Override
    public String generatePaymentUrl(Order order, String clientIp) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", vnPayConfig.getVnpTmnCode());

            long amount = order.getFinalAmount() != null
                    ? order.getFinalAmount().setScale(2, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).longValue()
                    : 0L;
            vnpParams.put("vnp_Amount", String.valueOf(amount));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", order.getOrderCode());
            vnpParams.put("vnp_OrderInfo", "Thanh toan don hang AP Sports #" + order.getOrderCode());
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());

            String ip = (clientIp != null && !clientIp.isBlank() && !"0:0:0:0:0:0:0:1".equals(clientIp)) ? clientIp : "127.0.0.1";
            vnpParams.put("vnp_IpAddr", ip);

            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            vnpParams.put("vnp_CreateDate", now.format(formatter));
            vnpParams.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

            return vnPayConfig.buildPaymentUrl(vnpParams);
        } catch (Exception e) {
            log.error("Lỗi khởi tạo URL thanh toán VNPay cho đơn hàng #{}: {}", order.getOrderCode(), e.getMessage(), e);
            throw new com.web.ap_sports.exception.AppException("Không thể tạo liên kết thanh toán VNPay: " + e.getMessage(), org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public boolean verifyChecksum(Map<String, String> queryParams) {
        if (queryParams == null || queryParams.isEmpty()) return false;
        String vnpSecureHash = queryParams.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) return false;

        Map<String, String> fields = new HashMap<>(queryParams);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String hashData = vnPayConfig.hashAllFields(fields);
        return vnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData).equalsIgnoreCase(vnpSecureHash);
    }
}
