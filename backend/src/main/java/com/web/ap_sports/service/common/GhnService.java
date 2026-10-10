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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GhnService {

    @Value("${ghn.api-url:https://dev-online-gateway.ghn.vn/shiip/public-api/v2}")
    private String ghnApiUrl;

    @Value("${ghn.token:}")
    private String ghnToken;

    @Value("${ghn.shop-id:}")
    private String ghnShopId;

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
