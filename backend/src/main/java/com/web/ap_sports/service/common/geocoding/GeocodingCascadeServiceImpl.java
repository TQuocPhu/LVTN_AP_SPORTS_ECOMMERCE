package com.web.ap_sports.service.common.geocoding;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GeocodingCascadeServiceImpl implements GeocodingCascadeService {

    private final Map<String, GeocodingProvider> providersByName;

    @Value("${app.geocoding.provider-order:nominatim,esri,photon,goong}")
    private String providerOrderConfig;

    public GeocodingCascadeServiceImpl(List<GeocodingProvider> providers) {
        this.providersByName = providers.stream()
                .collect(Collectors.toMap(
                        p -> p.getProviderName().toLowerCase(),
                        p -> p
                ));
    }

    @Override
    public Optional<GeoCoordinate> geocode(String rawAddress) {
        if (rawAddress == null || rawAddress.isBlank()) {
            log.warn("[Geocode Cascade] Địa chỉ rỗng, bỏ qua.");
            return Optional.empty();
        }

        String[] order = providerOrderConfig.split(",");
        for (String key : order) {
            GeocodingProvider provider = providersByName.get(key.trim().toLowerCase());
            if (provider == null) {
                log.warn("[Geocode Cascade] Provider '{}' không tồn tại trong config, bỏ qua.", key);
                continue;
            }
            if (!provider.isEnabled()) {
                log.info("[Geocode Cascade] Provider '{}' đang bị tắt (disabled), bỏ qua.", provider.getProviderName());
                continue;
            }
            log.info("[Geocode Cascade] Đang thử provider: {} cho địa chỉ: '{}'", provider.getProviderName(), rawAddress);
            try {
                Optional<GeoCoordinate> result = provider.geocode(rawAddress);
                if (result.isPresent()) {
                    log.info("[Geocode Cascade] ✅ Thành công qua {}: lat={}, lng={}",
                            provider.getProviderName(), result.get().latitude(), result.get().longitude());
                    return result;
                }
                log.warn("[Geocode Cascade] Provider '{}' không tìm thấy kết quả.", provider.getProviderName());
            } catch (Exception e) {
                log.error("[Geocode Cascade] Provider '{}' lỗi: {}", provider.getProviderName(), e.getMessage(), e);
            }
        }

        log.warn("[Geocode Cascade] ❌ Tất cả provider đều thất bại cho địa chỉ: '{}'", rawAddress);
        return Optional.empty();
    }
}
