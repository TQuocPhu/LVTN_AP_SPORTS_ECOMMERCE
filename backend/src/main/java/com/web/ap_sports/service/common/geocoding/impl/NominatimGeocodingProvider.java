package com.web.ap_sports.service.common.geocoding.impl;

import com.web.ap_sports.service.common.geocoding.GeoCoordinate;
import com.web.ap_sports.service.common.geocoding.GeocodingProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class NominatimGeocodingProvider implements GeocodingProvider {

    @Override
    public Optional<GeoCoordinate> geocode(String address) {
        if (address == null || address.isBlank()) return Optional.empty();

        List<String> searchQueries = buildSearchQueries(address);

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(4000);
        factory.setReadTimeout(4000);
        RestTemplate restTemplate = new RestTemplate(factory);

        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", "AP-Sports-Ecommerce/1.0 (tqphu240804@gmail.com)");
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        for (String query : searchQueries) {
            try {
                String encodedAddr = URLEncoder.encode(query, StandardCharsets.UTF_8);
                String url = "https://nominatim.openstreetmap.org/search?q=" + encodedAddr
                        + "&format=json&addressdetails=0&limit=1&countrycodes=vn";

                @SuppressWarnings("rawtypes")
                ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null && !response.getBody().isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> result = (Map<String, Object>) response.getBody().get(0);
                    Object lat = result.get("lat");
                    Object lon = result.get("lon");
                    if (lat != null && lon != null) {
                        double latitude = Double.parseDouble(lat.toString());
                        double longitude = Double.parseDouble(lon.toString());
                        log.info("[Nominatim] ✅ Geocode thành công: '{}' → lat={}, lng={}", query, latitude, longitude);
                        return Optional.of(new GeoCoordinate(latitude, longitude));
                    }
                }
            } catch (Exception e) {
                log.warn("[Nominatim] Thử nghiệm thất bại cho '{}': {}", query, e.getMessage());
            }
        }
        return Optional.empty();
    }

    @Override
    public String getProviderName() {
        return "Nominatim";
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    private List<String> buildSearchQueries(String address) {
        List<String> queries = new ArrayList<>();
        queries.add(address.trim());
        String cleaned = address
                .replaceAll("(?i)^Bưu cục GHN[\\s\\-–]+", "")
                .replaceAll("(?i)^GHN[\\s\\-–]+", "")
                .replaceAll("(?i)\\b(Thành Phố|Thành phố|TP\\.|Quận|Huyện|Thị xã|Phường|Xã|Thị trấn)\\b", "")
                .replaceAll("\\s+", " ")
                .trim();
        if (!cleaned.equalsIgnoreCase(address.trim()) && !cleaned.isBlank()) {
            queries.add(cleaned);
        }
        return queries;
    }
}
