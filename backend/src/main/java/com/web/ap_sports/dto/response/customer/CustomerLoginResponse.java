package com.web.ap_sports.dto.response.customer;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Phản hồi chuẩn hóa cho Đăng nhập Khách hàng.
 * Đối với Web: field `tokens` = null (HttpOnly Cookie) và không serialized ra JSON.
 * Đối với Mobile: field `tokens` chứa AccessToken & RefreshToken.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CustomerLoginResponse {

    private UserResponse user;
    private TokenResponse tokens;
}
