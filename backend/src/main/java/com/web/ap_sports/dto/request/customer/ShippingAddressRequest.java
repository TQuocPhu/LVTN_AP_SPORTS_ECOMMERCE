package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại người nhận không hợp lệ")
    private String phone;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String address;

    @NotBlank(message = "Tỉnh/Thành phố, Quận/Huyện không được để trống")
    private String city;

    private Integer provinceId;

    private Integer districtId;

    private String wardCode;

    private Boolean isDefault;
}
