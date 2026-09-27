package com.web.ap_sports.service.customer.impl;

import com.web.ap_sports.dto.request.customer.ShippingAddressRequest;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import com.web.ap_sports.entity.ShippingAddress;
import com.web.ap_sports.entity.User;
import com.web.ap_sports.repository.OrderRepository;
import com.web.ap_sports.repository.ShippingAddressRepository;
import com.web.ap_sports.repository.UserRepository;
import com.web.ap_sports.service.customer.ShippingAddressService;
import com.web.ap_sports.service.common.geocoding.GeocodingCascadeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Triển khai logic nghiệp vụ quản lý Địa chỉ Giao hàng của Khách hàng.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ShippingAddressServiceImpl implements ShippingAddressService {

    private final ShippingAddressRepository shippingAddressRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final GeocodingCascadeService geocodingCascadeService;

    @Override
    @Transactional(readOnly = true)
    public List<ShippingAddressResponse> getAddresses(String email) {
        User user = getUserByEmail(email);
        List<ShippingAddress> list = shippingAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ShippingAddressResponse createAddress(String email, ShippingAddressRequest request) {
        User user = getUserByEmail(email);

        long count = shippingAddressRepository.countByUserId(user.getId());
        boolean shouldBeDefault = (count == 0) || (Boolean.TRUE.equals(request.getIsDefault()));

        if (shouldBeDefault && count > 0) {
            shippingAddressRepository.resetDefaultAddressByUserId(user.getId());
        }

        ShippingAddress newAddress = ShippingAddress.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .city(request.getCity())
                .provinceId(request.getProvinceId())
                .districtId(request.getDistrictId())
                .wardCode(request.getWardCode())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(shouldBeDefault)
                .build();

        ShippingAddress saved = shippingAddressRepository.save(newAddress);
        log.info("Tạo địa chỉ giao hàng mới ID: {} cho user ID: {}", saved.getId(), user.getId());

        ensureGeocodedIfMissing(saved);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public ShippingAddressResponse updateAddress(String email, Long addressId, ShippingAddressRequest request) {
        User user = getUserByEmail(email);
        ShippingAddress shippingAddress = getAddressByIdAndUser(addressId, user.getId());

        if (Boolean.TRUE.equals(request.getIsDefault()) && !shippingAddress.isDefault()) {
            shippingAddressRepository.resetDefaultAddressByUserId(user.getId());
            shippingAddress.setDefault(true);
        }

        boolean addressTextChanged =
                !safeEquals(shippingAddress.getAddress(), request.getAddress())
                || !safeEquals(shippingAddress.getWardCode(), request.getWardCode())
                || !safeEquals(shippingAddress.getDistrictId(), request.getDistrictId())
                || !safeEquals(shippingAddress.getCity(), request.getCity());

        shippingAddress.setFullName(request.getFullName());
        shippingAddress.setPhone(request.getPhone());
        shippingAddress.setAddress(request.getAddress());
        shippingAddress.setCity(request.getCity());
        if (request.getProvinceId() != null) shippingAddress.setProvinceId(request.getProvinceId());
        if (request.getDistrictId() != null) shippingAddress.setDistrictId(request.getDistrictId());
        if (request.getWardCode() != null) shippingAddress.setWardCode(request.getWardCode());

        if (request.getLatitude() != null) shippingAddress.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) shippingAddress.setLongitude(request.getLongitude());

        ShippingAddress updated = shippingAddressRepository.save(shippingAddress);
        log.info("Cập nhật địa chỉ giao hàng ID: {} cho user ID: {}", updated.getId(), user.getId());

        if (addressTextChanged && request.getLatitude() == null && request.getLongitude() == null) {
            log.info("Địa chỉ ID: {} đã đổi nội dung địa lý → geocode lại tọa độ.", updated.getId());
            updated.setLatitude(null);
            updated.setLongitude(null);
            ensureGeocodedIfMissing(updated);
        } else {
            ensureGeocodedIfMissing(updated);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        ShippingAddress shippingAddress = getAddressByIdAndUser(addressId, user.getId());

        if (orderRepository.existsByShippingAddressId(addressId)) {
            throw new IllegalArgumentException("Địa chỉ này đã từng được sử dụng để đặt hàng nên không thể xóa.");
        }

        boolean wasDefault = shippingAddress.isDefault();
        shippingAddressRepository.delete(shippingAddress);
        log.info("Xóa địa chỉ giao hàng ID: {} thành công.", addressId);

        // Nếu xóa địa chỉ mặc định, tự động gán địa chỉ còn lại sớm nhất làm mặc định
        if (wasDefault) {
            List<ShippingAddress> remaining = shippingAddressRepository.findByUserIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                ShippingAddress first = remaining.get(0);
                first.setDefault(true);
                shippingAddressRepository.save(first);
            }
        }
    }

    @Override
    @Transactional
    public ShippingAddressResponse setDefaultAddress(String email, Long addressId) {
        User user = getUserByEmail(email);
        ShippingAddress shippingAddress = getAddressByIdAndUser(addressId, user.getId());

        if (!shippingAddress.isDefault()) {
            shippingAddressRepository.resetDefaultAddressByUserId(user.getId());
            shippingAddress.setDefault(true);
            shippingAddressRepository.save(shippingAddress);
            log.info("Đặt địa chỉ ID: {} làm mặc định cho user ID: {}", addressId, user.getId());
        }

        return mapToResponse(shippingAddress);
    }

    @Override
    @Transactional
    public void ensureGeocodedIfMissing(ShippingAddress address) {
        boolean hasValidCoords = address.getLatitude() != null && address.getLatitude() != 0.0
                && address.getLongitude() != null && address.getLongitude() != 0.0;

        if (hasValidCoords) {
            return;
        }

        String fullAddressString = buildFullAddressString(address);
        log.info("[ShippingAddress Geocode] Địa chỉ ID: {} chưa có tọa độ, tiến hành geocode: '{}'",
                address.getId(), fullAddressString);

        geocodingCascadeService.geocode(fullAddressString).ifPresentOrElse(
            coord -> {
                address.setLatitude(coord.latitude());
                address.setLongitude(coord.longitude());
                shippingAddressRepository.save(address);
                log.info("[ShippingAddress Geocode] ✅ Địa chỉ ID: {} đã có tọa độ: lat={}, lng={}",
                        address.getId(), coord.latitude(), coord.longitude());
            },
            () -> log.warn("[ShippingAddress Geocode] ❌ Không geocode được địa chỉ ID: {} — cần xử lý thủ công.",
                    address.getId())
        );
    }

    private String buildFullAddressString(ShippingAddress address) {
        StringBuilder sb = new StringBuilder();
        if (address.getAddress() != null && !address.getAddress().isBlank()) {
            sb.append(address.getAddress());
        }
        if (address.getCity() != null && !address.getCity().isBlank()) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(address.getCity());
        }
        sb.append(", Việt Nam");
        return sb.toString();
    }

    private boolean safeEquals(Object a, Object b) {
        if (a == null) return b == null;
        return a.equals(b);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản người dùng."));
    }

    private ShippingAddress getAddressByIdAndUser(Long addressId, Long userId) {
        return shippingAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ giao hàng yêu cầu."));
    }

    private ShippingAddressResponse mapToResponse(ShippingAddress entity) {
        return ShippingAddressResponse.builder()
                .id(entity.getId())
                .fullName(entity.getFullName())
                .phone(entity.getPhone())
                .address(entity.getAddress())
                .city(entity.getCity())
                .provinceId(entity.getProvinceId())
                .districtId(entity.getDistrictId())
                .wardCode(entity.getWardCode())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .isDefault(entity.isDefault())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
