package com.web.ap_sports.service.common;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.web.ap_sports.constant.StoreLocationConstants;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GhnService {

    @Value("${app.shipping.ghn.api-url:${ghn.api-url:https://online-gateway.ghn.vn/shiip/public-api/v2}}")
    private String ghnApiUrl;

    @Value("${app.shipping.ghn.token:${ghn.token:}}")
    private String ghnToken;

    @Value("${app.shipping.ghn.shop-id:${ghn.shop-id:}}")
    private String ghnShopId;

    /**
     * Tính phí giao hàng động qua API GHN mà không tham gia vào Database Transaction (tránh HikariCP leak).
     */
    @SuppressWarnings("rawtypes")
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public BigDecimal calculateShippingFee(Integer toDistrictId, String toWardCode, Integer totalWeight, BigDecimal orderSubtotal) {
        if (toDistrictId == null || ghnToken == null || ghnToken.isBlank()) {
            return null;
        }
        try {
            String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl.trim() : "https://online-gateway.ghn.vn/shiip/public-api/v2";
            if (!base.endsWith("/")) base = base + "/";
            String url = base + "shipping-order/fee";

            org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                    new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(4000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            if (ghnShopId != null && !ghnShopId.isBlank()) {
                headers.set("ShopId", ghnShopId);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            int finalWeight = (totalWeight != null && totalWeight > 0) ? totalWeight : 500;
            int boxLength = finalWeight > 3000 ? 30 : (finalWeight > 1000 ? 20 : 15);
            int boxWidth = finalWeight > 3000 ? 20 : (finalWeight > 1000 ? 15 : 10);
            int boxHeight = finalWeight > 3000 ? 15 : 10;

            // 1. Tra cứu Dịch vụ Vận chuyển (available-services) khả dụng cho tuyến đường từ kho tới toDistrictId
            Integer matchedServiceId = null;
            Integer matchedServiceTypeId = 2; // Default Chuẩn GHN Express
            try {
                String availUrl = base + "shipping-order/available-services";
                Map<String, Object> availBody = new HashMap<>();
                if (ghnShopId != null && !ghnShopId.isBlank()) {
                    try { availBody.put("shop_id", Integer.parseInt(ghnShopId.trim())); } catch (Exception ignored) {}
                }
                availBody.put("from_district", StoreLocationConstants.STORE_DISTRICT_ID);
                availBody.put("to_district", toDistrictId);

                HttpEntity<Map<String, Object>> availEntity = new HttpEntity<>(availBody, headers);
                ResponseEntity<Map> availResp = restTemplate.exchange(availUrl, HttpMethod.POST, availEntity, Map.class);
                if (availResp.getStatusCode().is2xxSuccessful() && availResp.getBody() != null) {
                    Object availData = availResp.getBody().get("data");
                    if (availData instanceof List && !((List<?>) availData).isEmpty()) {
                        for (Object sObj : (List<?>) availData) {
                            if (sObj instanceof Map) {
                                Map<?, ?> sMap = (Map<?, ?>) sObj;
                                Object typeId = sMap.get("service_type_id");
                                Object servId = sMap.get("service_id");
                                if (typeId instanceof Number && ((Number) typeId).intValue() == 2 && servId instanceof Number) {
                                    matchedServiceId = ((Number) servId).intValue();
                                    matchedServiceTypeId = 2;
                                    break;
                                }
                            }
                        }
                        if (matchedServiceId == null) {
                            Map<?, ?> firstMap = (Map<?, ?>) ((List<?>) availData).get(0);
                            if (firstMap.get("service_id") instanceof Number) {
                                matchedServiceId = ((Number) firstMap.get("service_id")).intValue();
                            }
                            if (firstMap.get("service_type_id") instanceof Number) {
                                matchedServiceTypeId = ((Number) firstMap.get("service_type_id")).intValue();
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[GHN Fee] Không tra cứu được available-services: {}", e.getMessage());
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", StoreLocationConstants.STORE_DISTRICT_ID); // Kho chính AP Sports - ĐHCT, Ninh Kiều, Cần Thơ
            requestBody.put("from_ward_code", StoreLocationConstants.STORE_WARD_CODE); // Phường Xuân Khánh, Ninh Kiều, Cần Thơ
            if (matchedServiceId != null) {
                requestBody.put("service_id", matchedServiceId);
            }
            requestBody.put("service_type_id", matchedServiceTypeId);
            requestBody.put("to_district_id", toDistrictId);
            if (toWardCode != null && !toWardCode.isBlank()) {
                requestBody.put("to_ward_code", toWardCode.trim());
            }
            requestBody.put("height", boxHeight);
            requestBody.put("length", boxLength);
            requestBody.put("weight", finalWeight);
            requestBody.put("width", boxWidth);

            if (orderSubtotal != null && orderSubtotal.compareTo(BigDecimal.ZERO) > 0) {
                int insuranceVal = Math.min(orderSubtotal.intValue(), 5000000);
                requestBody.put("insurance_value", insuranceVal);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data instanceof Map) {
                    Object totalObj = ((Map) data).get("total");
                    if (totalObj instanceof Number) {
                        BigDecimal fee = BigDecimal.valueOf(((Number) totalObj).longValue());
                        log.info("[GHN Fee] ✅ GHN trả về phí giao hàng thành công: {} VNĐ (tới districtId={}, weight={}g)", fee, toDistrictId, finalWeight);
                        return fee;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[GHN Fee] Không tính được phí giao hàng động từ GHN (districtId={}): {}", toDistrictId, e.getMessage());
        }

        return null;
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public Map<String, Object> fetchNearestGhnStation(Integer districtId, String wardCode) {
        if (districtId == null) {
            log.warn("[GHN] Bỏ qua tra cứu trạm: districtId là null");
            return null;
        }
        if (ghnToken == null || ghnToken.isBlank()) {
            log.warn("[GHN] GHN_TOKEN chưa được cấu hình → bỏ qua tra cứu trạm GHN");
            return null;
        }

        try {
            // Build URL theo đúng ghnApiUrl cấu hình trong application.yml / env
            String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl.trim() : "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";
            if (!base.endsWith("/")) base = base + "/";
            String url = base + "station/get";

            log.info("[GHN] Gọi API tra cứu trạm: POST {}", url);

            org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                    new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(4000);
            factory.setReadTimeout(5000);
            RestTemplate restTemplate = new RestTemplate(factory);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Token", ghnToken);
            if (ghnShopId != null && !ghnShopId.isBlank()) {
                headers.set("ShopId", ghnShopId);
            }
            headers.setContentType(MediaType.APPLICATION_JSON);

            // API /station/get của GHN yêu cầu POST với JSON Body { "district_id": ..., "ward_code": ... }
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("district_id", districtId);
            if (wardCode != null && !wardCode.isBlank()) {
                requestBody.put("ward_code", wardCode.trim());
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            log.info("[GHN] Kết quả HTTP {}", response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                Object data = body.get("data");

                if (data instanceof List && !((List<?>) data).isEmpty()) {
                    Map<String, Object> firstStation = (Map<String, Object>) ((List<?>) data).get(0);
                    return firstStation;
                } else {
                    log.info("[GHN] API GHN trả về data rỗng. Không có trạm nào trong khu vực này.");
                }
            } else {
                log.warn("[GHN] Lỗi HTTP hoặc không có body. Mã lỗi: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("[GHN] Lỗi ngoại lệ khi tra cứu trạm GHN: {}", e.getMessage());
        }

        return null;
    }
}
