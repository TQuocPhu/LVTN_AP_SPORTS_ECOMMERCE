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
public class UserSessionResponse {
    private Long id;
    private String deviceToken;
    private String deviceName;
    private String osType;
    private String lastIp;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
    private boolean currentDevice;
}
