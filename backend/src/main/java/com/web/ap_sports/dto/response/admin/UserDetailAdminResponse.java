package com.web.ap_sports.dto.response.admin;

import com.web.ap_sports.dto.response.customer.ShippingAddressResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailAdminResponse {
    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String address;
    private String role;
    private String status;
    private String employeeCode;
    private String activationToken;
    private LocalDateTime emailVerifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ShippingAddressResponse> addresses;
}
