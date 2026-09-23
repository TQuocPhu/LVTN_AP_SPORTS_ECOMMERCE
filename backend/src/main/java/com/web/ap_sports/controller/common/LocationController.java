package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * LocationController - Proxy API dữ liệu địa lý từ GHN (Giao Hàng Nhanh).
 * Cung cấp danh sách Tỉnh/Thành, Quận/Huyện, Phường/Xã để tích hợp Dropdown địa chỉ giao hàng.
 * Endpoint công khai (không cần xác thực) vì dữ liệu địa lý không nhạy cảm.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {

    @Value("${app.shipping.ghn.api-url}")
    private String ghnApiUrl;

    @Value("${app.shipping.ghn.token}")
    private String ghnToken;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Lấy danh sách tất cả Tỉnh/Thành phố từ GHN.
     */
    @GetMapping("/provinces")
    public ResponseEntity<ApiResponse<Object>> getProvinces() {
        try {
            String url = getMasterDataUrl("province");
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Tỉnh/Thành thành công.", data));
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Không thể lấy danh sách Tỉnh/Thành từ GHN."));
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Tỉnh/Thành từ GHN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Lỗi kết nối GHN: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách Quận/Huyện theo Tỉnh/Thành (provinceId).
     */
    @GetMapping("/districts")
    public ResponseEntity<ApiResponse<Object>> getDistricts(@RequestParam Integer provinceId) {
        try {
            String url = getMasterDataUrl("district?province_id=" + provinceId);
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Quận/Huyện thành công.", data));
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Không thể lấy danh sách Quận/Huyện từ GHN."));
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Quận/Huyện từ GHN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Lỗi kết nối GHN: " + e.getMessage()));
        }
    }

    /**
     * Lấy danh sách Phường/Xã theo Quận/Huyện (districtId).
     */
    @GetMapping("/wards")
    public ResponseEntity<ApiResponse<Object>> getWards(@RequestParam Integer districtId) {
        try {
            String url = getMasterDataUrl("ward?district_id=" + districtId);
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Phường/Xã thành công.", data));
            }
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Không thể lấy danh sách Phường/Xã từ GHN."));
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Phường/Xã từ GHN: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ApiResponse.error(502, "Lỗi kết nối GHN: " + e.getMessage()));
        }
    }

    private String getMasterDataUrl(String path) {
        String base = ghnApiUrl;
        if (base.contains("dev-online-gateway.ghn.vn")) {
            base = base.replace("dev-online-gateway.ghn.vn", "online-gateway.ghn.vn");
        }
        if (base.endsWith("/v2")) {
            base = base.substring(0, base.length() - 3);
        } else if (base.endsWith("/v2/")) {
            base = base.substring(0, base.length() - 4);
        }
        if (!base.endsWith("/")) {
            base = base + "/";
        }
        return base + "master-data/" + path;
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String token = (ghnToken != null && !ghnToken.isBlank()) ? ghnToken : "d0a9140d-3489-46a2-962c-72706c832f51";
        headers.set("Token", token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
