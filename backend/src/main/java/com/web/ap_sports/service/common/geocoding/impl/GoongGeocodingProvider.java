package com.web.ap_sports.service.common.geocoding.impl;

import com.web.ap_sports.service.common.geocoding.GeoCoordinate;
import com.web.ap_sports.service.common.geocoding.GeocodingProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Slf4j
public class GoongGeocodingProvider implements GeocodingProvider {

    @Value("${app.geocoding.goong.enabled:false}")
    private boolean enabled;

    @Value("${app.geocoding.goong.api-key:}")
    private String apiKey;

    @Override
    public Optional<GeoCoordinate> geocode(String address) {
        // TODO: implement khi tài khoản Goong được kích hoạt
        return Optional.empty();
    }

    @Override
    public String getProviderName() {
        return "Goong";
    }

    @Override
    public boolean isEnabled() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}
