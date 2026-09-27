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
public class EsriArcGisGeocodingProvider implements GeocodingProvider {

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
                String encodedAddr = URLEncoder.encode(query.endsWith(", Vietnam") || query.endsWith(", Việt Nam") ? query : query + ", Vietnam", StandardCharsets.UTF_8);
                String url = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?f=json&singleLine=" + encodedAddr + "&maxLocations=1";

                @SuppressWarnings("rawtypes")
                ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    @SuppressWarnings("rawtypes")
                    List candidates = (List) response.getBody().get("candidates");
                    if (candidates != null && !candidates.isEmpty()) {
                        @SuppressWarnings("rawtypes")
                        Map first = (Map) candidates.get(0);
                        @SuppressWarnings("rawtypes")
                        Map location = (Map) first.get("location");
                        if (location != null && location.get("x") != null && location.get("y") != null) {
                            double longitude = Double.parseDouble(location.get("x").toString());
                            double latitude = Double.parseDouble(location.get("y").toString());
                            log.info("[ESRI ArcGIS] ✅ Geocode thành công: '{}' → lat={}, lng={}", query, latitude, longitude);
                            return Optional.of(new GeoCoordinate(latitude, longitude));
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[ESRI ArcGIS] Thử nghiệm thất bại cho '{}': {}", query, e.getMessage());
            }
        }
        return Optional.empty();
    }

    @Override
    public String getProviderName() {
        return "Esri";
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
