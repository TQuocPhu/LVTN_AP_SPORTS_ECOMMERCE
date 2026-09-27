package com.web.ap_sports.service.common.geocoding;

import java.util.Optional;

public interface GeocodingProvider {
    Optional<GeoCoordinate> geocode(String address);
    String getProviderName();
    boolean isEnabled();
}
