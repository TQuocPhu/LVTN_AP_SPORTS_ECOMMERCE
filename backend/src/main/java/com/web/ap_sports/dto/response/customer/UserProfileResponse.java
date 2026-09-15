package com.web.ap_sports.dto.response.customer;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String phoneNumber;
    private String avatar;
    private String address;
    private String role;
    private String status;
    private LocalDateTime createdAt;
}
