package com.web.ap_sports.service.common.geocoding;

import java.util.Optional;

public interface GeocodingCascadeService {
    Optional<GeoCoordinate> geocode(String rawAddress);
}
