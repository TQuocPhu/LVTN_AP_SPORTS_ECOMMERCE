package com.web.ap_sports.dto.request.customer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
    @Size(max = 255, message = "Tên người nhận không được vượt quá 255 ký tự")
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^(0|\\+84)[3|5|7|8|9][0-9]{8}$", message = "Số điện thoại người nhận không hợp lệ")
    private String phone;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    @Size(max = 500, message = "Địa chỉ chi tiết không được vượt quá 500 ký tự")
    private String address;

    @NotBlank(message = "Tỉnh/Thành phố, Quận/Huyện không được để trống")
    @Size(max = 255, message = "Tỉnh/Thành phố không được vượt quá 255 ký tự")
    private String city;

    @Min(value = 1, message = "ID tỉnh/thành phố phải lớn hơn 0")
    private Integer provinceId;

    @Min(value = 1, message = "ID quận/huyện phải lớn hơn 0")
    private Integer districtId;

    private String wardCode;

    private Boolean isDefault;
}
