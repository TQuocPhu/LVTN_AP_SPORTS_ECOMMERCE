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
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

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
        return VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData).equalsIgnoreCase(vnpSecureHash);
    }

    @Override
    public boolean refundPayment(com.web.ap_sports.entity.Payment payment, Order order, String clientIp, String createBy) {
        try {
            String vnp_RequestId = UUID.randomUUID().toString().replace("-", "");
            String vnp_Version = "2.1.0";
            String vnp_Command = "refund";
            String vnp_TmnCode = vnPayConfig.getVnpTmnCode();
            String vnp_TransactionType = "02"; // 02 for Full Refund
            String vnp_TxnRef = payment.getVnpTxnRef();
            long amount = payment.getAmount().setScale(2, java.math.RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).longValue();
            String vnp_Amount = String.valueOf(amount);
            String vnp_OrderInfo = "Hoan tien don hang " + vnp_TxnRef;
            String vnp_TransactionNo = payment.getTransactionId();
            if (vnp_TransactionNo == null || vnp_TransactionNo.isBlank()) {
                throw new com.web.ap_sports.exception.AppException("Không có mã giao dịch VNPay (TransactionNo).", HttpStatus.BAD_REQUEST);
            }
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            String vnp_TransactionDate = payment.getVnpPayDate();
            if (vnp_TransactionDate == null || vnp_TransactionDate.isBlank()) {
                vnp_TransactionDate = payment.getPaidAt() != null ? payment.getPaidAt().format(formatter) : LocalDateTime.now().format(formatter);
            }
            String vnp_CreateBy = (createBy != null && !createBy.isBlank()) ? createBy : "System";
            String vnp_CreateDate = LocalDateTime.now().format(formatter);
            String vnp_IpAddr = (clientIp != null && !clientIp.isBlank() && !"0:0:0:0:0:0:0:1".equals(clientIp)) ? clientIp : "127.0.0.1";

            String hashData = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + 
                              vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + 
                              vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

            String vnp_SecureHash = VNPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData);

            Map<String, String> requestData = new HashMap<>();
            requestData.put("vnp_RequestId", vnp_RequestId);
            requestData.put("vnp_Version", vnp_Version);
            requestData.put("vnp_Command", vnp_Command);
            requestData.put("vnp_TmnCode", vnp_TmnCode);
            requestData.put("vnp_TransactionType", vnp_TransactionType);
            requestData.put("vnp_TxnRef", vnp_TxnRef);
            requestData.put("vnp_Amount", vnp_Amount);
            requestData.put("vnp_OrderInfo", vnp_OrderInfo);
            requestData.put("vnp_TransactionNo", vnp_TransactionNo);
            requestData.put("vnp_TransactionDate", vnp_TransactionDate);
            requestData.put("vnp_CreateBy", vnp_CreateBy);
            requestData.put("vnp_CreateDate", vnp_CreateDate);
            requestData.put("vnp_IpAddr", vnp_IpAddr);
            requestData.put("vnp_SecureHash", vnp_SecureHash);

            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10000);
            factory.setReadTimeout(10000);
            RestTemplate restTemplate = new RestTemplate(factory);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestData, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(vnPayConfig.getVnpApiUrl(), requestEntity, Map.class);
            Map<String, String> responseBody = response.getBody();

            if (responseBody != null && "00".equals(responseBody.get("vnp_ResponseCode"))) {
                log.info("Hoàn tiền thành công cho đơn hàng: {}", vnp_TxnRef);
                return true;
            } else {
                String msg = responseBody != null ? responseBody.get("vnp_Message") : "Unknown Error";
                log.error("Hoàn tiền thất bại cho đơn hàng: {}. Lỗi từ VNPay: {}", vnp_TxnRef, msg);
                throw new com.web.ap_sports.exception.AppException("Lỗi hoàn tiền VNPay: " + msg, HttpStatus.BAD_REQUEST);
            }
        } catch (com.web.ap_sports.exception.AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Có lỗi xảy ra khi gọi API hoàn tiền VNPay cho đơn hàng #{}: {}", order.getOrderCode(), e.getMessage());
            throw new com.web.ap_sports.exception.AppException("Không thể kết nối đến VNPay để hoàn tiền.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
