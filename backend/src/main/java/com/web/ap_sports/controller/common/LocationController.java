package com.web.ap_sports.controller.common;

import com.web.ap_sports.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

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

    @Value("${app.shipping.ghn.shop-id:}")
    private String ghnShopId;

    private final RestTemplate restTemplate;
    private static Object cachedProvinces = null;
    private static final Map<Integer, Object> cachedDistricts = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Map<Integer, Object> cachedWards = new java.util.concurrent.ConcurrentHashMap<>();

    public LocationController() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Lấy danh sách tất cả Tỉnh/Thành phố từ GHN.
     */
    @GetMapping("/provinces")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> getProvinces() {
        try {
            String url = getMasterDataUrl("province");
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data != null) {
                    cachedProvinces = data;
                    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Tỉnh/Thành thành công.", data));
                }
            }
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Tỉnh/Thành từ GHN: {}", e.getMessage());
        }

        if (cachedProvinces != null) {
            log.info("Dùng danh sách Tỉnh/Thành từ Cache do GHN API tạm thời chậm/timeout.");
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Tỉnh/Thành từ Cache.", cachedProvinces));
        }

        return ResponseEntity.ok(ApiResponse.success("Tạm thời chưa có dữ liệu Tỉnh/Thành.", java.util.Collections.emptyList()));
    }

    /**
     * Lấy danh sách Quận/Huyện theo Tỉnh/Thành (provinceId).
     */
    @GetMapping("/districts")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> getDistricts(@RequestParam Integer provinceId) {
        try {
            String url = getMasterDataUrl("district?province_id=" + provinceId);
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data != null) {
                    cachedDistricts.put(provinceId, data);
                    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Quận/Huyện thành công.", data));
                }
            }
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Quận/Huyện từ GHN: {}", e.getMessage());
        }

        if (cachedDistricts.containsKey(provinceId)) {
            log.info("Dùng danh sách Quận/Huyện từ Cache cho provinceId={}", provinceId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Quận/Huyện từ Cache.", cachedDistricts.get(provinceId)));
        }

        return ResponseEntity.ok(ApiResponse.success("Tạm thời chưa có dữ liệu Quận/Huyện.", java.util.Collections.emptyList()));
    }

    /**
     * Lấy danh sách Phường/Xã theo Quận/Huyện (districtId).
     */
    @GetMapping("/wards")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> getWards(@RequestParam Integer districtId) {
        try {
            String url = getMasterDataUrl("ward?district_id=" + districtId);
            HttpHeaders headers = buildHeaders();
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data != null) {
                    cachedWards.put(districtId, data);
                    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Phường/Xã thành công.", data));
                }
            }
        } catch (Exception e) {
            log.error("Lỗi lấy danh sách Phường/Xã từ GHN: {}", e.getMessage());
        }

        if (cachedWards.containsKey(districtId)) {
            log.info("Dùng danh sách Phường/Xã từ Cache cho districtId={}", districtId);
            return ResponseEntity.ok(ApiResponse.success("Lấy danh sách Phường/Xã từ Cache.", cachedWards.get(districtId)));
        }

        return ResponseEntity.ok(ApiResponse.success("Tạm thời chưa có dữ liệu Phường/Xã.", java.util.Collections.emptyList()));
    }

    /**
     * Proxy Reverse Geocoding (lat/lon -> địa danh).
     * Ưu tiên Nominatim OpenStreetMap, tự động fallback sang BigDataCloud API nếu bị rate-limit hoặc chặn HTTP.
     */
    @GetMapping("/reverse-geocode")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> reverseGeocode(@RequestParam Double lat, @RequestParam Double lon) {
        // 1. Thử Nominatim OpenStreetMap
        try {
            URI uri = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/reverse")
                    .queryParam("format", "json")
                    .queryParam("lat", lat)
                    .queryParam("lon", lon)
                    .queryParam("accept-language", "vi")
                    .build()
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "AP-Sports-Ecommerce/1.0 (contact@apsports.com)");
            headers.set("Accept-Language", "vi");

            ResponseEntity<Map> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().containsKey("display_name")) {
                return ResponseEntity.ok(ApiResponse.success("Reverse geocode (Nominatim) thành công.", response.getBody()));
            }
        } catch (Exception e) {
            log.warn("Reverse geocode Nominatim thất bại: {}, chuyển sang BigDataCloud fallback...", e.getMessage());
        }

        // 2. Fallback sang BigDataCloud API (Free, không cần API key, không bị rate-limit)
        try {
            URI bdcUri = UriComponentsBuilder.fromHttpUrl("https://api.bigdatacloud.net/data/reverse-geocode-client")
                    .queryParam("latitude", lat)
                    .queryParam("longitude", lon)
                    .queryParam("localityLanguage", "vi")
                    .build()
                    .toUri();

            ResponseEntity<Map> bdcResponse = restTemplate.getForEntity(bdcUri, Map.class);
            if (bdcResponse.getStatusCode().is2xxSuccessful() && bdcResponse.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> body = bdcResponse.getBody();

                String state = (String) body.getOrDefault("principalSubdivision", "");
                String locality = (String) body.getOrDefault("locality", "");
                String city = (String) body.getOrDefault("city", "");

                String ward = "";
                if (body.get("localityInfo") instanceof Map) {
                    Map<?, ?> localityInfo = (Map<?, ?>) body.get("localityInfo");
                    if (localityInfo.get("administrative") instanceof List) {
                        List<?> adminList = (List<?>) localityInfo.get("administrative");
                        for (Object item : adminList) {
                            if (item instanceof Map) {
                                Map<?, ?> adminMap = (Map<?, ?>) item;
                                Object orderObj = adminMap.get("order");
                                String name = (String) adminMap.get("name");
                                if (orderObj instanceof Number && ((Number) orderObj).intValue() == 4) {
                                    ward = name;
                                }
                            }
                        }
                    }
                }

                String displayName = Stream.of(ward, locality, city, state, "Việt Nam")
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining(", "));

                Map<String, Object> addressObj = new HashMap<>();
                addressObj.put("state", state);
                addressObj.put("district", locality);
                addressObj.put("ward", ward);

                Map<String, Object> finalResult = new HashMap<>();
                finalResult.put("display_name", displayName);
                finalResult.put("address", addressObj);

                return ResponseEntity.ok(ApiResponse.success("Reverse geocode (BigDataCloud) thành công.", finalResult));
            }
        } catch (Exception e) {
            log.error("Lỗi reverse geocode BigDataCloud: {}", e.getMessage(), e);
        }

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.error(503, "Không thể giải mã vị trí GPS hiện tại."));
    }

    /**
     * Proxy Forward Geocoding via Nominatim (tên địa danh -> lat/lon).
     * Tự động loại bỏ tiền tố hành chính (Quận, Phường, Thành phố...) và fallback cấp địa danh nếu tên đường không có trong OSM.
     */
    @GetMapping("/forward-geocode")
    public ResponseEntity<ApiResponse<Object>> forwardGeocode(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success("Chuỗi tìm kiếm rỗng.", null));
        }

        // 1. Chuẩn hóa & tách các cấp từ chuỗi địa chỉ
        String[] rawParts = query.split(",");
        String[] cleanParts = new String[rawParts.length];
        for (int i = 0; i < rawParts.length; i++) {
            cleanParts[i] = cleanAdminPrefix(rawParts[i]);
        }

        // 2. Thử tìm kiếm theo 2 vòng: Vòng 1 với chuỗi đã làm sạch tiền tố (Ninh Kiều, Cần Thơ), Vòng 2 với chuỗi gốc
        String[][] attempts = new String[][]{ cleanParts, rawParts };

        for (String[] parts : attempts) {
            for (int i = 0; i < parts.length; i++) {
                StringBuilder searchBuilder = new StringBuilder();
                for (int j = i; j < parts.length; j++) {
                    String part = parts[j].trim();
                    if (part.isBlank()) continue;
                    if (searchBuilder.length() > 0) searchBuilder.append(", ");
                    searchBuilder.append(part);
                }

                String currentSearch = searchBuilder.toString().trim();
                if (currentSearch.isBlank()) continue;

                if (!currentSearch.toLowerCase().contains("việt nam") && !currentSearch.toLowerCase().contains("vietnam")) {
                    currentSearch += ", Việt Nam";
                }

                try {
                    URI uri = UriComponentsBuilder.fromHttpUrl("https://nominatim.openstreetmap.org/search")
                            .queryParam("format", "json")
                            .queryParam("q", currentSearch)
                            .queryParam("limit", 1)
                            .queryParam("countrycodes", "vn")
                            .queryParam("accept-language", "vi")
                            .build()
                            .toUri();

                    HttpHeaders headers = new HttpHeaders();
                    headers.set("User-Agent", "AP-Sports-Ecommerce/1.0 (contact@apsports.com)");
                    headers.set("Accept-Language", "vi");

                    ResponseEntity<Object[]> response = restTemplate.exchange(uri, HttpMethod.GET, new HttpEntity<>(headers), Object[].class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && response.getBody().length > 0) {
                        return ResponseEntity.ok(ApiResponse.success("Forward geocode thành công.", response.getBody()[0]));
                    }
                } catch (Exception e) {
                    log.warn("Thử tìm kiếm Geocode '{}' thất bại: {}", currentSearch, e.getMessage());
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Không tìm thấy tọa độ.", null));
    }

    /**
     * Tính phí giao hàng (Shipping Fee) từ GHN API dựa trên Quận/Huyện và Phường/Xã điểm đến.
     */
    @GetMapping("/calculate-fee")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> calculateShippingFee(
            @RequestParam Integer toDistrictId,
            @RequestParam String toWardCode,
            @RequestParam(required = false, defaultValue = "500") Integer weight) {
        try {
            String feeUrl = getGhnBaseUrl() + "shipping-order/fee";
            HttpHeaders headers = buildHeaders();
            if (ghnShopId != null && !ghnShopId.isBlank()) {
                headers.set("ShopId", ghnShopId);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", 1442); // Mặc định kho hàng chính (Ninh Kiều, Cần Thơ)
            requestBody.put("from_ward_code", "21211");
            requestBody.put("service_type_id", 2); // Chuẩn GHN Express
            requestBody.put("to_district_id", toDistrictId);
            requestBody.put("to_ward_code", toWardCode);
            requestBody.put("height", 10);
            requestBody.put("length", 15);
            requestBody.put("weight", weight != null ? weight : 500);
            requestBody.put("width", 10);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(feeUrl, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data instanceof Map) {
                    Map dataMap = (Map) data;
                    Object totalFee = dataMap.get("total");
                    if (totalFee != null) {
                        Map<String, Object> result = new HashMap<>();
                        result.put("shippingFee", totalFee);
                        result.put("details", dataMap);
                        return ResponseEntity.ok(ApiResponse.success("Tính phí giao hàng GHN thành công.", result));
                    }
                }
            }
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Lỗi HTTP từ GHN API khi tính phí (Code {}): {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Lỗi tính phí giao hàng từ GHN API: {}", e.getMessage());
        }

        Map<String, Object> fallbackResult = new HashMap<>();
        fallbackResult.put("shippingFee", 30000);
        fallbackResult.put("isFallback", true);
        return ResponseEntity.ok(ApiResponse.success("Áp dụng phí giao hàng tiêu chuẩn.", fallbackResult));
    }

    private String cleanAdminPrefix(String input) {
        if (input == null) return "";
        return input.trim()
                .replaceAll("(?i)^(Tỉnh|Thành phố|TP\\.|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\\s+", "")
                .trim();
    }

    private String getGhnBaseUrl() {
        String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl : "https://online-gateway.ghn.vn/shiip/public-api/v2";
        if (base.contains("dev-online-gateway.ghn.vn")) {
            base = base.replace("dev-online-gateway.ghn.vn", "online-gateway.ghn.vn");
        }
        if (!base.endsWith("/")) {
            base = base + "/";
        }
        return base;
    }

    private String getMasterDataUrl(String path) {
        String base = getGhnBaseUrl();
        if (base.endsWith("v2/")) {
            base = base.substring(0, base.length() - 3);
        }
        return base + "master-data/" + path;
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        if (ghnToken != null && !ghnToken.isBlank()) {
            headers.set("Token", ghnToken);
        }
        if (ghnShopId != null && !ghnShopId.isBlank()) {
            headers.set("ShopId", ghnShopId);
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
