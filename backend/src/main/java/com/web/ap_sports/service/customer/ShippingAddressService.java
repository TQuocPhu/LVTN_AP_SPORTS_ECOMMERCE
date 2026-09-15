package com.web.ap_sports.service.customer;

import com.web.ap_sports.dto.request.customer.ShippingAddressRequest;
import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;

import java.util.List;

/**
 * Interface dịch vụ quản lý Danh sách Địa chỉ Giao hàng của Khách hàng.
 */
public interface ShippingAddressService {

    /**
     * Lấy danh sách địa chỉ giao hàng của người dùng.
     */
    List<ShippingAddressResponse> getAddresses(String email);

    /**
     * Thêm mới địa chỉ giao hàng.
     */
    ShippingAddressResponse createAddress(String email, ShippingAddressRequest request);

    /**
     * Cập nhật địa chỉ giao hàng hiện có.
     */
    ShippingAddressResponse updateAddress(String email, Long addressId, ShippingAddressRequest request);

    /**
     * Xóa địa chỉ giao hàng.
     */
    void deleteAddress(String email, Long addressId);

    /**
     * Đặt địa chỉ làm mặc định.
     */
    ShippingAddressResponse setDefaultAddress(String email, Long addressId);
}
