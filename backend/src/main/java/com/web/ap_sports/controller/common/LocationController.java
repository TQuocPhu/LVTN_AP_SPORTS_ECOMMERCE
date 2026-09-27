package com.web.ap_sports.controller.common;

import com.web.ap_sports.constant.StoreLocationConstants;
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

import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import com.web.ap_sports.service.common.geocoding.GeoCoordinate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;

/**
 * LocationController - Proxy API dữ liệu địa lý từ GHN (Giao Hàng Nhanh).
 * Cung cấp danh sách Tỉnh/Thành, Quận/Huyện, Phường/Xã để tích hợp Dropdown địa chỉ giao hàng.
 * Endpoint công khai (không cần xác thực) vì dữ liệu địa lý không nhạy cảm.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    @Value("${app.shipping.ghn.api-url}")
    private String ghnApiUrl;

    @Value("${app.shipping.ghn.token}")
    private String ghnToken;

    @Value("${app.shipping.ghn.shop-id:}")
    private String ghnShopId;

    private final GeocodingCascadeService geocodingCascadeService;
    private final RestTemplate restTemplate = createRestTemplate();

    private static RestTemplate createRestTemplate() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(5000);
        return new RestTemplate(factory);
    }

    private static Object cachedProvinces = null;
    private static final Map<Integer, Object> cachedDistricts = new java.util.concurrent.ConcurrentHashMap<>();
    private static final Map<Integer, Object> cachedWards = new java.util.concurrent.ConcurrentHashMap<>();

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

        Optional<GeoCoordinate> result = geocodingCascadeService.geocode(query);
        if (result.isPresent()) {
            Map<String, Object> resMap = new HashMap<>();
            resMap.put("lat", String.valueOf(result.get().latitude()));
            resMap.put("lon", String.valueOf(result.get().longitude()));
            resMap.put("display_name", query);
            return ResponseEntity.ok(ApiResponse.success("Forward geocode thành công.", resMap));
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
            @RequestParam(required = false, defaultValue = "500") Integer weight,
            @RequestParam(required = false) Integer insuranceValue) {
        try {
            String feeUrl = getGhnBaseUrl() + "shipping-order/fee";
            HttpHeaders headers = buildHeaders();
            if (ghnShopId != null && !ghnShopId.isBlank()) {
                headers.set("ShopId", ghnShopId);
            }

            // 1. Tra cứu Dịch vụ Vận chuyển (available-services) khả dụng cho tuyến đường từ kho tới toDistrictId
            Integer matchedServiceId = null;
            Integer matchedServiceTypeId = 2; // Default Chuẩn GHN Express
            try {
                String availUrl = getGhnBaseUrl() + "shipping-order/available-services";
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
                log.warn("Không tra cứu được available-services GHN: {}, sử dụng service_type_id mặc định = 2", e.getMessage());
            }

            int finalWeight = (weight != null && weight > 0) ? weight : 500;
            int boxLength = finalWeight > 3000 ? 30 : (finalWeight > 1000 ? 20 : 15);
            int boxWidth = finalWeight > 3000 ? 20 : (finalWeight > 1000 ? 15 : 10);
            int boxHeight = finalWeight > 3000 ? 15 : 10;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("from_district_id", StoreLocationConstants.STORE_DISTRICT_ID); // Kho chính AP Sports (ĐHCT, Ninh Kiều, Cần Thơ)
            requestBody.put("from_ward_code", StoreLocationConstants.STORE_WARD_CODE);
            if (matchedServiceId != null) {
                requestBody.put("service_id", matchedServiceId);
            }
            requestBody.put("service_type_id", matchedServiceTypeId);
            requestBody.put("to_district_id", toDistrictId);
            requestBody.put("to_ward_code", toWardCode);
            requestBody.put("height", boxHeight);
            requestBody.put("length", boxLength);
            requestBody.put("weight", finalWeight);
            requestBody.put("width", boxWidth);

            if (insuranceValue != null && insuranceValue > 0) {
                requestBody.put("insurance_value", Math.min(insuranceValue, 5000000));
            }

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

    /**
     * Tra cứu danh sách Bưu cục / Chi cục kho GHN tại vị trí Quận/Huyện hoặc Phường/Xã.
     */
    @GetMapping("/ghn-stations")
    @SuppressWarnings("rawtypes")
    public ResponseEntity<ApiResponse<Object>> getGhnStations(
            @RequestParam Integer districtId,
            @RequestParam(required = false) String wardCode) {
        try {
            String url = getGhnBaseUrl() + "station/get";
            HttpHeaders headers = buildHeaders();

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("district_id", districtId);
            if (wardCode != null && !wardCode.isBlank()) {
                requestBody.put("ward_code", wardCode);
            }

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object data = response.getBody().get("data");
                if (data != null) {
                    return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bưu cục kho GHN thành công.", data));
                }
            }
        } catch (Exception e) {
            log.warn("Lỗi tra cứu bưu cục kho GHN (districtId={}): {}", districtId, e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Chưa tìm thấy bưu cục GHN phù hợp.", java.util.Collections.emptyList()));
    }

    private String cleanAdminPrefix(String input) {
        if (input == null) return "";
        return input.trim()
                .replaceAll("(?i)^(Tỉnh|Thành phố|TP\\.|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\\s+", "")
                .trim();
    }

    private String getGhnBaseUrl() {
        String base = (ghnApiUrl != null && !ghnApiUrl.isBlank()) ? ghnApiUrl.trim() : "https://online-gateway.ghn.vn/shiip/public-api/v2";
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
