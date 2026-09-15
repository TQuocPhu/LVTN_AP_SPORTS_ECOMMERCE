package com.web.ap_sports.dto.response.customer;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddressResponse {

    private Long id;
    private String fullName;
    private String phone;
    private String address;
    private String city;
    private Integer provinceId;
    private Integer districtId;
    private String wardCode;

    @JsonProperty("isDefault")
    private boolean isDefault;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
